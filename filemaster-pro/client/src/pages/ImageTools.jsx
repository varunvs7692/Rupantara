import React, { useState } from 'react';

export default function ImageTools() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(80);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [origSize, setOrigSize] = useState(null);
  const [compSize, setCompSize] = useState(null);
  const [enhanceScale, setEnhanceScale] = useState(1.5);

  const handleFileChange = e => {
    const f = e.target.files[0];
    setFile(f);
    setOrigSize(f ? f.size : null);
    setDownloadUrl('');
    setError('');
    setCompSize(null);
  };

  const handleCompress = async e => {
    e.preventDefault();
    if (!file) return;
    setProgress(10);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('quality', quality);
    try {
      setProgress(30);
      const res = await fetch('/api/image/compress', {
        method: 'POST',
        body: formData
      });
      setProgress(70);
      if (!res.ok) throw new Error('Compression failed');
      const blob = await res.blob();
      setCompSize(blob.size);
      setDownloadUrl(URL.createObjectURL(blob));
      setProgress(100);
    } catch (err) {
      setError(err.message);
      setProgress(0);
    }
  };

  const handleEnhance = async e => {
    e.preventDefault();
    if (!file) return;
    setProgress(10);
    setError('');
    setDownloadUrl('');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('scale', enhanceScale);
    try {
      setProgress(30);
      const res = await fetch('/api/image/enhance', {
        method: 'POST',
        body: formData
      });
      setProgress(70);
      if (!res.ok) {
        const { error: apiError } = await res.json().catch(() => ({ error: 'Enhancement failed' }));
        throw new Error(apiError || 'Enhancement failed');
      }
      const blob = await res.blob();
      setDownloadUrl(URL.createObjectURL(blob));
      setCompSize(blob.size);
      setProgress(100);
    } catch (err) {
      setError(err.message);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Image Tools</h2>
      <form className="space-y-4">
        <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileChange} className="block w-full" />
        <div className="flex gap-4 items-center">
          <label>Quality:</label>
          <input type="range" min="10" max="100" value={quality} onChange={e => setQuality(e.target.value)} />
          <span>{quality}%</span>
        </div>
        <button onClick={handleCompress} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Compress Image</button>
        <div className="flex items-center gap-3 mt-2">
          <label>Enhance scale:</label>
          <input type="range" min="1" max="3" step="0.1" value={enhanceScale} onChange={e => setEnhanceScale(e.target.value)} />
          <span>{enhanceScale}x</span>
          <button onClick={handleEnhance} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Enhance</button>
        </div>
      </form>
      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded h-2 mt-4">
          <div className="bg-purple-600 h-2 rounded" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {origSize && compSize && (
        <div className="mt-4 text-sm text-gray-700 dark:text-gray-200">
          <span>Original: {(origSize/1024).toFixed(2)} KB</span> &rarr; <span>Compressed: {(compSize/1024).toFixed(2)} KB</span>
        </div>
      )}
      {downloadUrl && (
        <a href={downloadUrl} download className="block mt-4 text-green-600">Download Compressed Image</a>
      )}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}
