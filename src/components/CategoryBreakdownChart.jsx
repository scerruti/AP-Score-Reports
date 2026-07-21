import '../styles/CategoryBreakdownChart.css';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

function PieChart({ typeData }) {
  const { type, data } = typeData;
  let currentAngle = -90; // Start at top

  const slices = data.map((item, idx) => {
    const sliceAngle = (item.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate SVG arc points
    const radius = 80;
    const cx = 100;
    const cy = 100;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    // Label position
    const labelAngle = startAngle + sliceAngle / 2;
    const labelRad = (labelAngle * Math.PI) / 180;
    const labelRadius = 50;
    const labelX = cx + labelRadius * Math.cos(labelRad);
    const labelY = cy + labelRadius * Math.sin(labelRad);

    currentAngle = endAngle;

    return {
      path: pathData,
      color: COLORS[idx % COLORS.length],
      label: `${item.percentage}%`,
      labelX,
      labelY,
      name: item.name,
      percentage: item.percentage,
    };
  });

  return (
    <div className="chart-section">
      <h4>{type}</h4>
      <div className="chart-group">
        <svg viewBox="0 0 200 200" className="pie-chart">
          {slices.map((slice, idx) => (
            <g key={idx}>
              <path d={slice.path} fill={slice.color} stroke="white" strokeWidth="2" />
              <text
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pie-label"
              >
                {slice.label}
              </text>
            </g>
          ))}
        </svg>

        <div className="legend">
          {slices.map((slice, idx) => (
            <div key={idx} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: slice.color }}></span>
              <span className="legend-text">{slice.name}</span>
              <span className="legend-value">{slice.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CategoryBreakdownChart({ data }) {
  if (!data || data.length === 0) {
    return null;
  }

  console.log('CategoryBreakdownChart data:', JSON.stringify(data, null, 2));

  return (
    <div className="category-breakdown">
      <h3>Test Composition by Category</h3>
      <div className="charts-grid">
        {data.map((typeData, idx) => (
          <PieChart key={idx} typeData={typeData} />
        ))}
      </div>
    </div>
  );
}
