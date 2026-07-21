import { useState } from 'react';
import { extractPDFText, detectTestType, extractFormSections } from '../utils/pdfExtractor';
import { processFormSections } from '../utils/dataProcessor';
import ResultsTable from './ResultsTable';
import CategoryBreakdownChart from './CategoryBreakdownChart';
import '../styles/PDFAnalyzer.css';

export default function PDFAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [testType, setTestType] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Extract text from PDF
      const text = await extractPDFText(file);

      // Detect test type
      const type = detectTestType(text);
      if (!type) {
        throw new Error('Could not detect test type. Please ensure the PDF is an AP exam report.');
      }
      setTestType(type);

      // Extract form sections
      const sections = extractFormSections(text);
      if (sections.length === 0) {
        throw new Error('Could not find Multiple-Choice Performance data in the PDF.');
      }

      // Process data
      const { results: categoryResults, categoryTypeCharts } = processFormSections(sections);
      setResults({
        fileName: file.name,
        sections,
        data: categoryResults,
        categoryTypeBreakdown: categoryTypeCharts,
      });
    } catch (err) {
      setError(err.message);
      console.error('PDF Analysis Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pdf-analyzer">
      <div className="upload-section">
        <label htmlFor="pdf-input" className="upload-label">
          <input
            id="pdf-input"
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={loading}
            className="upload-input"
          />
          <span className="upload-button">
            {loading ? 'Processing...' : '📁 Choose PDF File'}
          </span>
        </label>
        <p className="upload-hint">Select an AP Exam Score Report (Principles or A)</p>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {results && (
        <div className="results-section">
          <h2>Analysis Results</h2>
          <div className="results-info">
            <p><strong>File:</strong> {results.fileName}</p>
            <p><strong>Test Type:</strong> {testType === 'principles' ? 'Computer Science Principles' : 'Computer Science A'}</p>
            <p><strong>Forms Found:</strong> {results.sections.length}</p>
          </div>
          <CategoryBreakdownChart data={results.categoryTypeBreakdown} />
          <ResultsTable data={results.data} />
        </div>
      )}

      {!results && !error && (
        <div className="empty-state">
          <p>Upload an AP Exam Score Report PDF to get started</p>
        </div>
      )}
    </div>
  );
}
