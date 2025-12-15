import React, { useState } from 'react';
import { apiFetch } from '../api';

export default function FileCompression() {
  const [file, setFile] = useState(null);
  const [level, setLevel] = useState('medium');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = e => {
    setFile(e.target.files[0]);
    setDownloadUrl('');
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) return;
    setProgress(10);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('level', level);
    try {
      setProgress(30);
      const res = await apiFetch('/api/compress', {
        method: 'POST',
        body: formData
      });
      setProgress(70);
      if (!res.ok) throw new Error('Compression failed');
      const blob = await res.blob();
      setDownloadUrl(URL.createObjectURL(blob));
      setProgress(100);
    } catch (err) {
      setError(err.message);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">File Compression</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="file" accept=".pdf,.docx,.pptx,.txt,.zip" onChange={handleFileChange} className="block w-full" />
        <div className="flex gap-4 items-center">
          <label>Compression Level:</label>
          <select value={level} onChange={e => setLevel(e.target.value)} className="border rounded px-2 py-1">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Compress</button>
      </form>
      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded h-2 mt-4">
          <div className="bg-blue-600 h-2 rounded" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {downloadUrl && (
        <a href={downloadUrl} download className="block mt-4 text-green-600">Download Compressed File</a>
      )}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}
