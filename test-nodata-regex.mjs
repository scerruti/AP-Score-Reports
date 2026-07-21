// Test the noData regex pattern directly

const testRows = [
  'PRACTICES 1: DESIGN CODE 2 <5 questions in content area',
  'PRACTICES 5: USE COMPUTERS RESPONSIBLY 2 <5 questions in content area',
  'PRACTICES 5: USE COMPUTERS RESPONSIBLY 1 <5 questions in content area',
  'UNITS 1: USING OBJECTS AND METHODS 8 1.0 6.6 6.2',
  'PRACTICES 2: DEVELOP CODE 11 3.0 8.7 8.1',
];

const noDataPattern = /^(UNITS|PRACTICES|BIG\s+IDEAS|QUESTION\s+TYPES)\s+(\d+):\s+(.+?)\s+(?:\d+\s+)?<5/i;

console.log('Testing noData regex pattern:\n');

testRows.forEach((row, idx) => {
  const match = row.match(noDataPattern);
  console.log(`[${idx}] ${row}`);
  if (match) {
    console.log(`  ✓ MATCH: Type=${match[1]}, Num=${match[2]}, Name=${match[3]}\n`);
  } else {
    console.log(`  ✗ NO MATCH\n`);
  }
});
