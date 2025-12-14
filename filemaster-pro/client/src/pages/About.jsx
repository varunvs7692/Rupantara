import React from 'react';

export default function About() {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <img src="/logo.png" alt="Rupantara Logo" className="w-24 h-24 mx-auto mb-4" />
      <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">About Rupantara</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Rupantara is a privacy-focused, modern web app for file compression, PDF conversion, and image enhancement. Built with React, Tailwind CSS, Node.js, and Express.js.
      </p>
      <ul className="text-left text-gray-700 dark:text-gray-200 list-disc list-inside mb-4">
        <li>File Compression (PDF, DOCX, PPTX, TXT, ZIP)</li>
        <li>File to PDF Converter (DOCX, PPTX, TXT, Images)</li>
        <li>Image Compression & AI Enhancement</li>
        <li>Mobile responsive, light/dark mode</li>
        <li>No login required</li>
      </ul>
      <p className="text-gray-500 dark:text-gray-400 text-sm">&copy; {new Date().getFullYear()} Rupantara</p>
    </div>
  );
}
