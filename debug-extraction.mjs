import * as pdfjsLib from 'pdfjs-dist';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs');

async function extractAndAnalyze(pdfFile) {
  const pdfPath = path.join(__dirname, pdfFile);

  console.log('Loading PDF:', pdfPath);
  const buffer = fs.readFileSync(pdfPath);
  const data = new Uint8Array(buffer);

  const pdf = await pdfjsLib.getDocument({ data }).promise;
  console.log('PDF pages:', pdf.numPages);

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }

  console.log('\n=== FULL TEXT LENGTH:', fullText.length, '===\n');

  // Find all MC sections
  const normalized = fullText.replace(/\s+/g, ' ');

  console.log('Looking for Multiple-Choice sections...\n');

  const pattern = /STUDENTS\s+TAKING\s+EXAM[\s\S]{0,500}?YOUR\s+GROUP\s+(\d+)[\s\S]*?Multiple-Choice\s+Performance([\s\S]*?)(?=STUDENTS\s+TAKING\s+EXAM|FRQ|Free\s+Response|Suggested|$)/gi;

  let match;
  let formNum = 0;

  while ((match = pattern.exec(normalized)) !== null) {
    formNum++;
    const studentCount = parseInt(match[1]);
    const mcContent = match[2].substring(0, 2000);

    console.log(`\n=== FORM ${formNum} (${studentCount} students) ===`);
    console.log('MC Content (first 2000 chars):');
    console.log(mcContent);

    // Now try to split this content
    const lines = mcContent.split(/(?=UNITS\s+\d+:|PRACTICES\s+\d+:|BIG\s+IDEAS\s+\d+:|QUESTION\s+TYPES\s+\d+:)/);

    console.log(`\nSplit into ${lines.length} segments:`);

    for (let i = 0; i < lines.length; i++) {
      let trimmed = lines[i].trim();

      if (!trimmed) {
        console.log(`  [${i}] EMPTY`);
        continue;
      }

      console.log(`  [${i}] (${trimmed.length} chars) ${trimmed.substring(0, 80)}`);

      if (trimmed.includes('<5')) {
        console.log(`       ^^^ THIS HAS <5 QUESTIONS`);
      }
    }
  }
}

// Test both PDFs
async function testBoth() {
  console.log('\n\n████████████████████████████████████████\n');
  console.log('TESTING: AP School Instructional Planning Report 2026.pdf (CS A)');
  console.log('████████████████████████████████████████\n');
  await extractAndAnalyze('AP School Instructional Planning Report 2026.pdf');
}

testBoth().catch(console.error);
