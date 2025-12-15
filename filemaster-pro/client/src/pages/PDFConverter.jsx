import React, { useState } from 'react';

export default function PDFConverter() {
  const [file, setFile] = useState(null);
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
    const officeTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    const isOffice = officeTypes.includes(file.type);
    if (isOffice) formData.append('target', 'pdf');
    try {
      setProgress(30);
      const endpoint = isOffice ? '/api/convert-libreoffice' : '/api/pdf/convert';
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      setProgress(70);
      if (!res.ok) throw new Error('Conversion failed');
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
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">File to PDF Converter</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="file" accept=".docx,.pptx,.txt,.jpg,.jpeg,.png,.webp" onChange={handleFileChange} className="block w-full" />
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Convert to PDF</button>
      </form>
      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded h-2 mt-4">
          <div className="bg-green-600 h-2 rounded" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {downloadUrl && (
        <a href={downloadUrl} download className="block mt-4 text-blue-600">Download PDF</a>
      )}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}
