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
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
        <FeatureCard
          icon={<span className="text-4xl">💾</span>}
          title="File Compression"
          desc="Reduce file size without losing quality. Supports PDF, DOCX, PPT, ZIP."
        />
        <FeatureCard
          icon={<span className="text-4xl">📄</span>}
          title="File to PDF"
          desc="Convert documents and images into high-quality PDFs in seconds."
        />
        <FeatureCard
          icon={<span className="text-4xl">🖼️</span>}
          title="Image Compression"
          desc="Compress images while keeping them sharp and clear."
        />
        <FeatureCard
          icon={<span className="text-4xl">🔵HD</span>}
          title="Image HD Enhancement"
          desc="AI-powered image upscaling for crystal clear HD images."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center text-center border border-gray-100 dark:border-gray-700">
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{desc}</p>
    </div>
  );
}
