import React, { useState } from 'react';
export default function RotatePDF() {
  const [file, setFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [angle, setAngle] = useState(90);
  const [pages, setPages] = useState('');

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
    formData.append('angle', angle);
    formData.append('pages', pages);
    try {
      const res = await fetch('/api/pdf-tools/rotate', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to rotate PDF');
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
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Rotate PDF</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="file" accept="application/pdf" onChange={handleFileChange} className="block w-full" />
        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm text-gray-700 dark:text-gray-200">
            Angle (degrees)
            <input
              type="number"
              value={angle}
              onChange={e => setAngle(e.target.value)}
              className="mt-1 w-full border rounded px-2 py-1"
            />
          </label>
          <label className="text-sm text-gray-700 dark:text-gray-200">
            Pages (blank = all)
            <input
              type="text"
              value={pages}
              onChange={e => setPages(e.target.value)}
              className="mt-1 w-full border rounded px-2 py-1"
              placeholder="e.g., 1-2,4"
            />
          </label>
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>
          {loading ? 'Processing...' : 'Rotate PDF'}
        </button>
      </form>
      {downloadUrl && (
        <a href={downloadUrl} download className="block mt-4 text-green-600">Download Rotated PDF</a>
      )}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}