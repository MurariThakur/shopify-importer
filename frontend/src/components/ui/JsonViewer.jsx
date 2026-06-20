import { useState } from 'react';

const valueColors = {
  string: 'text-green-400',
  number: 'text-blue-400',
  boolean: 'text-orange-400',
  null: 'text-red-400',
};

function JsonNode({ label, value, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const type = Array.isArray(value) ? 'array' : (value !== null && typeof value === 'object' ? 'object' : typeof value);

  if (type === 'object') {
    const entries = Object.entries(value);
    return (
      <div style={{ paddingLeft: depth > 0 ? 16 : 0 }}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-200 text-sm transition-colors cursor-pointer text-left"
        >
          {expanded ? '▾' : '▸'} {label ? <span className="text-gray-300">{label}: </span> : ''}
          <span className="text-gray-500">{'{'} {entries.length} keys {'}'}</span>
        </button>
        {expanded && (
          <div>
            {entries.map(([k, v]) => (
              <JsonNode key={k} label={k} value={v} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (type === 'array') {
    return (
      <div style={{ paddingLeft: depth > 0 ? 16 : 0 }}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-200 text-sm transition-colors cursor-pointer text-left"
        >
          {expanded ? '▾' : '▸'} {label ? <span className="text-gray-300">{label}: </span> : ''}
          <span className="text-gray-500">{'['} {value.length} items {']'}</span>
        </button>
        {expanded && (
          <div>
            {value.map((item, i) => (
              <JsonNode key={i} label={String(i)} value={item} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const displayValue = type === 'null' ? 'null' : type === 'string' ? `"${value}"` : String(value);
  const colorClass = valueColors[type] || 'text-gray-300';

  return (
    <div style={{ paddingLeft: depth > 0 ? 16 : 0 }} className="text-sm">
      {label && <span className="text-gray-300">{label}: </span>}
      <span className={colorClass}>{displayValue}</span>
    </div>
  );
}

export default function JsonViewer({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <span className="text-sm text-gray-500">No context data</span>;
  }

  return (
    <div className="font-mono">
      <JsonNode label="" value={data} depth={0} />
    </div>
  );
}
