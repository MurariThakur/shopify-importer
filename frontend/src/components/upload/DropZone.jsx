import { useRef, useState } from 'react';

export default function DropZone({ file, onFileChange, error }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const validateFile = (f) => {
    if (!f) return 'No file selected';
    if (!f.name.endsWith('.csv')) return 'Only .csv files are accepted';
    if (f.size > 10 * 1024 * 1024) return 'File must be 10 MB or smaller';
    return null;
  };

  const handleFile = (f) => {
    const validationError = validateFile(f);
    if (validationError) {
      onFileChange(null, validationError);
      return;
    }
    onFileChange(f, null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  let borderClass = 'border-gray-700 bg-gray-900';
  if (error) borderClass = 'border-red-500 bg-red-950/20';
  else if (file) borderClass = 'border-green-600 bg-green-950/20';
  else if (isDragging) borderClass = 'border-indigo-500 bg-indigo-950/20';

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-150 ${borderClass}`}
      onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {file ? (
        <div className="text-green-400">
          <p className="text-lg font-semibold">{file.name}</p>
          <p className="text-sm text-gray-400 mt-1">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      ) : (
        <div className="text-gray-400">
          <p className="text-lg">Drag & drop a CSV file here</p>
          <p className="text-sm mt-1">or click to browse (max 10 MB)</p>
        </div>
      )}
      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
    </div>
  );
}
