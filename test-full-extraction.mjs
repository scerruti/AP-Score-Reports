import * as pdfjsLib from 'pdfjs-dist';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs');

async function testExtraction() {
  const pdfPath = path.join(__dirname, 'AP School Instructional Planning Report 2026.pdf');
  const buffer = fs.readFileSync(pdfPath);
  const data = new Uint8Array(buffer);

  const pdf = await pdfjsLib.getDocument({ data }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }

  const normalized = fullText.replace(/\s+/g, ' ');
  const pattern = /STUDENTS\s+TAKING\s+EXAM[\s\S]{0,500}?YOUR\s+GROUP\s+(\d+)[\s\S]*?Multiple-Choice\s+Performance([\s\S]*?)(?=STUDENTS\s+TAKING\s+EXAM|FRQ|Free\s+Response|Suggested|$)/gi;

  let match;
  let formNum = 0;

  while ((match = pattern.exec(normalized)) !== null) {
    formNum++;
    const mcContent = match[2];
    const lines = mcContent.split(/(?=UNITS\s+\d+:|PRACTICES\s+\d+:|BIG\s+IDEAS\s+\d+:|QUESTION\s+TYPES\s+\d+:)/);

    console.log(`\n=== FORM ${formNum} ===`);
    console.log(`Total segments: ${lines.length}\n`);

    for (let i = 0; i < lines.length; i++) {
      let trimmed = lines[i].trim();
      if (!trimmed || trimmed.length < 15) continue;

      trimmed = trimmed.split(/\s+SUMMARY\s+/)[0].trim();

      if (trimmed.includes('<5')) {
        console.log(`[${i}] ${trimmed}`);

        // Test the regex
        const noDataPattern = /^(UNITS|PRACTICES|BIG\s+IDEAS|QUESTION\s+TYPES)\s+(\d+):\s+(.+?)\s+(?:\d+\s+)?<5/i;
        const match = trimmed.match(noDataPattern);

        console.log(`    Regex matches: ${match ? 'YES' : 'NO'}`);
        if (match) {
          console.log(`    Type: ${match[1]}, Num: ${match[2]}, Name: ${match[3]}`);
        }
      }
    }
  }
}

testExtraction().catch(console.error);
