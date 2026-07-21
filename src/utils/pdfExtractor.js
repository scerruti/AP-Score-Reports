import * as pdfjsLib from 'pdfjs-dist';

// Use the bundled worker file from public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/AP-Score-Reports/pdf.worker.min.js';

export async function extractPDFText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

export function detectTestType(text) {
  if (text.includes('Computer Science Principles')) {
    return 'principles';
  } else if (text.includes('Computer Science A')) {
    return 'csa';
  }
  return null;
}

export function extractStudentCount(text) {
  const match = text.match(/STUDENTS\s+TAKING\s+EXAM[\s\S]*?YOUR\s+GROUP\s+(\d+)/i);
  return match ? parseInt(match[1]) : 0;
}

export function extractFormSections(text) {
  const sections = [];

  // Normalize spaces
  const normalized = text.replace(/\s+/g, ' ');

  // Find all occurrences of student count + Multiple-Choice Performance sections
  // Pattern: STUDENTS TAKING EXAM ... YOUR GROUP (number) ... Multiple-Choice Performance ... (data) ... (next section or FRQ)

  const pattern = /STUDENTS\s+TAKING\s+EXAM[\s\S]{0,500}?YOUR\s+GROUP\s+(\d+)[\s\S]*?Multiple-Choice\s+Performance([\s\S]*?)(?=STUDENTS\s+TAKING\s+EXAM|FRQ|Free\s+Response|Suggested|$)/gi;

  let match;
  let formNumber = 0;

  while ((match = pattern.exec(normalized)) !== null) {
    formNumber++;
    const studentCount = parseInt(match[1]);
    const mcContent = match[2];

    const categories = extractCategoriesFromSection(mcContent);
    if (categories.length > 0) {
      sections.push({
        formNumber,
        studentCount,
        categories,
      });
    }
  }

  return sections;
}

function extractCategoriesFromSection(text) {
  const categories = [];

  // Normalize whitespace to single spaces
  const normalized = text.replace(/\s+/g, ' ').trim();

  // Split by category type keywords
  // This creates segments starting with each category
  const lines = normalized.split(/(?=UNITS\s+\d+:|PRACTICES\s+\d+:|BIG\s+IDEAS\s+\d+:|QUESTION\s+TYPES\s+\d+:)/);

  for (const line of lines) {
    let trimmed = line.trim();
    if (!trimmed || trimmed.length < 15) continue;

    // Some rows with "<5 questions" may have SUMMARY or other text appended
    // Extract just the category row by stopping at SUMMARY or other known delimiters
    trimmed = trimmed.split(/\s+SUMMARY\s+/)[0].trim();

    const parsed = parseTableRow(trimmed);
    if (parsed) {
      categories.push(parsed);
    }
  }
  return categories;
}

function parseTableRow(text) {
  if (!text || text.length < 15) return null;

  // Skip header and summary rows
  if (/^Type|^Reporting|^SUMMARY|^Group.*Mean|^Questions|^Notes/i.test(text)) {
    return null;
  }

  // Handle rows with <5 questions (no data available)
  if (text.includes('<5')) {
    const noDataPattern = /^(UNITS|PRACTICES|BIG\s+IDEAS|QUESTION\s+TYPES)\s+(\d+):\s+(.+?)\s+(\d+)\s+<5/i;
    const noDataMatch = text.match(noDataPattern);

    if (noDataMatch) {
      return {
        categoryType: noDataMatch[1].trim(),
        categoryName: `${noDataMatch[2]}: ${noDataMatch[3].trim()}`,
        groupMean: null,
        globalMean: null,
        questionCount: parseInt(noDataMatch[4]),
        noData: true,
      };
    }
  }

  // Main pattern: TYPE NUMBER: NAME # GROUP_MEAN CA_MEAN GLOBAL_MEAN
  // Example: "UNITS 1: USING OBJECTS AND METHODS 9 5.0 7.6 7.3"
  const pattern = /^(UNITS|PRACTICES|BIG\s+IDEAS|QUESTION\s+TYPES)\s+(\d+):\s+([^0-9<]+?)\s+(\d+)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/i;

  const match = text.match(pattern);
  if (match) {
    const categoryType = match[1].trim();
    const categoryNumber = match[2];
    const categoryName = `${categoryNumber}: ${match[3].trim()}`;
    const questionCount = parseInt(match[4]);
    const groupMean = parseFloat(match[5]);
    const globalMean = parseFloat(match[7]);

    // Validate numbers
    if (isNaN(groupMean) || isNaN(globalMean) || groupMean < 0 || groupMean > 100 || globalMean < 0 || globalMean > 100) {
      return null;
    }

    return {
      categoryType: categoryType.replace(/\s+/g, ' '),
      categoryName,
      questionCount,
      groupMean,
      globalMean,
      noData: false,
    };
  }

  return null;
}
