import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';


const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/file-compression', label: 'File Compression' },
  { to: '/pdf-converter', label: 'PDF Converter' },
  { to: '/image-tools', label: 'Image Tools' },
  { to: '/about', label: 'About' },
];

const pdfToolsMenu = [
  {
    group: 'Organize PDF',
    items: [
      { to: '/pdf/merge', label: 'Merge PDF' },
      { to: '/pdf/split', label: 'Split PDF' },
      { to: '/pdf/remove-pages', label: 'Remove Pages' },
      { to: '/pdf/extract-pages', label: 'Extract Pages' },
      { to: '/pdf/organize', label: 'Organize PDF' },
      { to: '/pdf/scan', label: 'Scan to PDF' },
    ],
  },
  {
    group: 'Optimize PDF',
    items: [
      { to: '/file-compression', label: 'Compress PDF' },
      { to: '/pdf/repair', label: 'Repair PDF' },
      { to: '/pdf/ocr', label: 'OCR PDF' },
    ],
  },
  {
    group: 'Convert To PDF',
    items: [
      { to: '/pdf-converter', label: 'JPG to PDF' },
      { to: '/pdf-converter', label: 'WORD to PDF' },
      { to: '/pdf-converter', label: 'POWERPOINT to PDF' },
      { to: '/pdf-converter', label: 'EXCEL to PDF' },
      { to: '/pdf-converter', label: 'HTML to PDF' },
    ],
  },
  {
    group: 'Convert From PDF',
    items: [
      { to: '/pdf/to-jpg', label: 'PDF to JPG' },
      { to: '/pdf/to-word', label: 'PDF to WORD' },
      { to: '/pdf/to-powerpoint', label: 'PDF to POWERPOINT' },
      { to: '/pdf/to-excel', label: 'PDF to EXCEL' },
      { to: '/pdf/to-pdfa', label: 'PDF to PDF/A' },
    ],
  },
  {
    group: 'Edit PDF',
    items: [
      { to: '/pdf/rotate', label: 'Rotate PDF' },
      { to: '/pdf/add-page-numbers', label: 'Add Page Numbers' },
      { to: '/pdf/add-watermark', label: 'Add Watermark' },
      { to: '/pdf/crop', label: 'Crop PDF' },
      { to: '/pdf/edit', label: 'Edit PDF' },
    ],
  },
  {
    group: 'PDF Security',
    items: [
      { to: '/pdf/unlock', label: 'Unlock PDF' },
      { to: '/pdf/protect', label: 'Protect PDF' },
      { to: '/pdf/sign', label: 'Sign PDF' },
      { to: '/pdf/redact', label: 'Redact PDF' },
      { to: '/pdf/compare', label: 'Compare PDF' },
    ],
  },
];

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Rupantara Logo" className="h-10 w-10" />
          <span className="font-bold text-xl text-gray-800 dark:text-white">Rupantara</span>
        </div>
        <div className="flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium ${location.pathname === link.to ? 'underline' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          {/* PDF Tools Dropdown */}
          <div className="relative group">
            <button className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium px-2 py-1 rounded focus:outline-none">
              PDF Tools ▾
            </button>
            <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50 p-4 grid grid-cols-2 gap-4">
              {pdfToolsMenu.map(section => (
                <div key={section.group}>
                  <div className="font-bold text-xs text-gray-500 dark:text-gray-400 mb-2">{section.group}</div>
                  <ul className="space-y-1">
                    {section.items.map(item => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          className="block text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setDark(d => !d)}
            className="ml-4 p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            title="Toggle light/dark mode"
          >
            {dark ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
}
