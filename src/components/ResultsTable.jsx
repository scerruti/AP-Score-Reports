import '../styles/ResultsTable.css';

export default function ResultsTable({ data }) {
  const getRatioColor = (ratio) => {
    if (ratio === null) return 'nodata';
    if (ratio > 1.05) return 'high';
    if (ratio < 0.95) return 'low';
    return 'aligned';
  };

  const formatRatio = (ratio) => {
    if (ratio === null) return 'No Data';
    return ratio.toFixed(3);
  };

  const getRatioLabel = (ratio) => {
    if (ratio === null) return '—';
    const diff = ((ratio - 1) * 100).toFixed(1);
    if (ratio > 1) {
      return `+${diff}%`;
    } else if (ratio < 1) {
      return `${diff}%`;
    }
    return 'Aligned';
  };

  return (
    <div className="results-table-container">
      <table className="results-table">
        <thead>
          <tr>
            <th>Category Type</th>
            <th>Category Name</th>
            <th>Score (1-5)</th>
            <th>vs. Global</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td className="category-type">{row.categoryType}</td>
              <td className="category-name">{row.categoryName}</td>
              <td className={`ratio ${getRatioColor(row.weightedRatio)}`}>
                {row.normalizedScore !== null ? row.normalizedScore.toFixed(2) : 'No Data'}
              </td>
              <td className="performance-label">
                {getRatioLabel(row.weightedRatio)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="legend">
        <div className="legend-item">
          <span className="legend-color high"></span>
          <span>&gt; 1.05 (Higher than Global)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color aligned"></span>
          <span>0.95 - 1.05 (Aligned with Global)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color low"></span>
          <span>&lt; 0.95 (Lower than Global)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color nodata"></span>
          <span>No Data (&lt;5 questions)</span>
        </div>
      </div>
    </div>
  );
}
