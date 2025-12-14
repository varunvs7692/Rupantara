import React from 'react';

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center bg-white dark:bg-gray-900 py-8 px-2">
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Transform your files<br />and images instantly
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-lg">
            Compress files, convert to PDF, and enhance images to HD — all in one app.
          </p>
          <div className="flex gap-4 mb-8">
            <a href="/file-compression" className="px-6 py-3 bg-blue-600 text-white rounded font-semibold shadow hover:bg-blue-700 transition">Get Started</a>
            <a href="/file-compression" className="px-6 py-3 border border-gray-400 dark:border-gray-600 text-gray-900 dark:text-white rounded font-semibold bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Upload File</a>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          {/* Illustration placeholder */}
          <img src="/logo.png" alt="Rupantara Logo" className="w-64 h-64 object-contain" />
        </div>
      </div>
      <div className="w-full max-w-5xl mt-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">All tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <ToolButton href="/file-compression" label="File Compression" />
          <ToolButton href="/pdf-converter" label="File to PDF" />
          <ToolButton href="/image-tools" label="Image Tools" />
          {/* PDF tools */}
          <ToolButton href="/pdf/remove-pages" label="Remove Pages" />
          <ToolButton href="/pdf/extract-pages" label="Extract Pages" />
          <ToolButton href="/pdf/organize" label="Organize PDF" />
          <ToolButton href="/pdf/scan" label="Scan to PDF" />
          <ToolButton href="/pdf/repair" label="Repair PDF" />
          <ToolButton href="/pdf/ocr" label="OCR PDF" />
          <ToolButton href="/pdf/to-pdfa" label="PDF to PDF/A" />
          <ToolButton href="/pdf/rotate" label="Rotate PDF" />
          <ToolButton href="/pdf/add-page-numbers" label="Add Page Numbers" />
          <ToolButton href="/pdf/add-watermark" label="Add Watermark" />
          <ToolButton href="/pdf/crop" label="Crop PDF" />
          <ToolButton href="/pdf/edit" label="Edit PDF" />
          <ToolButton href="/pdf/unlock" label="Unlock PDF" />
          <ToolButton href="/pdf/protect" label="Protect PDF" />
          <ToolButton href="/pdf/sign" label="Sign PDF" />
          <ToolButton href="/pdf/redact" label="Redact PDF" />
          <ToolButton href="/pdf/compare" label="Compare PDF" />
        </div>
      </div>
    </div>
  );
}

function ToolButton({ href, label }) {
  return (
    <a
      href={href}
      className="w-full inline-flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white shadow-sm hover:shadow-md transition"
    >
      <span className="font-semibold">{label}</span>
      <span className="text-sm text-gray-500 dark:text-gray-400">Open</span>
    </a>
  );
}
