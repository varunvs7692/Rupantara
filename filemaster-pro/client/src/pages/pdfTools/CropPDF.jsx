import React, { useState } from 'react';
import { apiFetch } from '../../api';
export default function CropPDF() {
  const [file, setFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inset, setInset] = useState(20);

  const handleFileChange = e => {
    setFile(e.target.files[0]);
    setDownloadUrl('');
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError('');
    setDownloadUrl('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('inset', inset);
    try {
      const res = await apiFetch('/api/pdf-tools/crop', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to crop PDF');
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
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Crop PDF</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="file" accept="application/pdf" onChange={handleFileChange} className="block w-full" />
        <label className="block text-sm text-gray-700 dark:text-gray-200">
          Crop inset (points)
          <input
            type="number"
            value={inset}
            onChange={e => setInset(e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </label>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>
          {loading ? 'Processing...' : 'Crop PDF'}
        </button>
      </form>
      {downloadUrl && (
        <a href={downloadUrl} download className="block mt-4 text-green-600">Download Cropped PDF</a>
      )}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}