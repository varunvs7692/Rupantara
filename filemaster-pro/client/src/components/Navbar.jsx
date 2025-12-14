import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/file-compression', label: 'File Compression' },
  { to: '/pdf-converter', label: 'PDF Converter' },
  { to: '/image-tools', label: 'Image Tools' },
  { to: '/about', label: 'About' },
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
