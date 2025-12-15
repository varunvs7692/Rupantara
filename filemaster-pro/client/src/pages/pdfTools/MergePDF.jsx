import React, { useState } from 'react';
import { apiFetch } from '../../api';

export default function MergePDF() {
  const [files, setFiles] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setFiles(Array.from(e.target.files || []));
    setDownloadUrl('');
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!files.length) return;
    setLoading(true);
    setError('');
    setDownloadUrl('');
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    try {
      const res = await apiFetch('/api/pdf-advanced/merge', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Merge failed');
      }
      const blob = await res.blob();
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Merge PDFs</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="file" accept="application/pdf" multiple onChange={handleChange} className="block w-full" />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>
          {loading ? 'Processing…' : 'Merge'}
        </button>
      </form>
      {downloadUrl && (
        <a href={downloadUrl} download className="block mt-4 text-green-600">Download Merged PDF</a>
      )}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}
