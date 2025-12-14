import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FileCompression from './pages/FileCompression';
import PDFConverter from './pages/PDFConverter';
import ImageTools from './pages/ImageTools';
import About from './pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/file-compression" element={<FileCompression />} />
            <Route path="/pdf-converter" element={<PDFConverter />} />
            <Route path="/image-tools" element={<ImageTools />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
