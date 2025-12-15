import React, { useState } from 'react';
import { apiFetch } from '../../api'; // Ensure apiFetch import (no-op if already present)
export default function ComparePDF() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = e => {
    setFiles(Array.from(e.target.files || []));
    setResult(null);
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (files.length !== 2) return setError('Please select two PDF files');
    setLoading(true);
    setError('');
    setResult(null);
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    try {
      const res = await apiFetch('/api/pdf-tools/compare', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to compare PDF');
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Compare PDF Files</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="file" accept="application/pdf" multiple onChange={handleFileChange} className="block w-full" />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>
          {loading ? 'Processing...' : 'Compare PDF'}
        </button>
      </form>
      {result && (
        <div className="mt-4 text-sm text-gray-800 dark:text-gray-200">
          <div>Pages A: {result.pagesA}</div>
          <div>Pages B: {result.pagesB}</div>
          <div>Same page count: {result.equalPages ? 'Yes' : 'No'}</div>
        </div>
      )}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}