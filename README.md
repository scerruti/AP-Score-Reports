# AP Score Analyzer

A browser-based PWA for analyzing AP exam score reports locally without uploading your PDFs.

## Features

- 📄 Upload AP exam score report PDFs
- 🔍 Automatically detects test type (Principles or Computer Science A)
- 📊 Extracts Multiple-Choice Performance data
- 🧮 Calculates weighted ratios compared to global performance
- 💾 Works entirely offline after first load (PWA)
- 🔒 PDFs never leave your machine

## Supported Reports

- AP Computer Science Principles Instructional Planning Report
- AP Computer Science A Instructional Planning Report

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## Building

```bash
npm run build
```

## Deploying to GitHub Pages

1. Build the project:
   ```bash
   npm run build
   ```

2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Deploy AP Score Analyzer"
   git push origin main
   ```

3. Enable GitHub Pages in repository settings to serve from the `dist/` directory

## How It Works

1. Upload a PDF report
2. The app extracts the Multiple-Choice Performance data for each form
3. For each category, it calculates: `Ratio = Group Mean / Global Mean`
4. Ratios are weighted by the number of students in each form
5. Results show performance compared to global benchmarks:
   - **> 1.05**: Higher than global performance
   - **0.95 - 1.05**: Aligned with global performance
   - **< 0.95**: Lower than global performance

## Privacy

All processing happens in your browser. PDFs are never uploaded to any server.
