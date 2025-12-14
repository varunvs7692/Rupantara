import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FileCompression from './pages/FileCompression';
import PDFConverter from './pages/PDFConverter';
import ImageTools from './pages/ImageTools';
import About from './pages/About';
// PDF Tools
import RemovePages from './pages/pdfTools/RemovePages';
import ExtractPages from './pages/pdfTools/ExtractPages';
import OrganizePDF from './pages/pdfTools/OrganizePDF';
import ScanToPDF from './pages/pdfTools/ScanToPDF';
import RepairPDF from './pages/pdfTools/RepairPDF';
import OCRPDF from './pages/pdfTools/OCRPDF';
import PDFToPDFA from './pages/pdfTools/PDFToPDFA';
import RotatePDF from './pages/pdfTools/RotatePDF';
import AddPageNumbers from './pages/pdfTools/AddPageNumbers';
import AddWatermark from './pages/pdfTools/AddWatermark';
import CropPDF from './pages/pdfTools/CropPDF';
import EditPDF from './pages/pdfTools/EditPDF';
import UnlockPDF from './pages/pdfTools/UnlockPDF';
import ProtectPDF from './pages/pdfTools/ProtectPDF';
import SignPDF from './pages/pdfTools/SignPDF';
import RedactPDF from './pages/pdfTools/RedactPDF';
import ComparePDF from './pages/pdfTools/ComparePDF';

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
            {/* PDF Tools */}
            <Route path="/pdf/remove-pages" element={<RemovePages />} />
            <Route path="/pdf/extract-pages" element={<ExtractPages />} />
            <Route path="/pdf/organize" element={<OrganizePDF />} />
            <Route path="/pdf/scan" element={<ScanToPDF />} />
            <Route path="/pdf/repair" element={<RepairPDF />} />
            <Route path="/pdf/ocr" element={<OCRPDF />} />
            <Route path="/pdf/to-pdfa" element={<PDFToPDFA />} />
            <Route path="/pdf/rotate" element={<RotatePDF />} />
            <Route path="/pdf/add-page-numbers" element={<AddPageNumbers />} />
            <Route path="/pdf/add-watermark" element={<AddWatermark />} />
            <Route path="/pdf/crop" element={<CropPDF />} />
            <Route path="/pdf/edit" element={<EditPDF />} />
            <Route path="/pdf/unlock" element={<UnlockPDF />} />
            <Route path="/pdf/protect" element={<ProtectPDF />} />
            <Route path="/pdf/sign" element={<SignPDF />} />
            <Route path="/pdf/redact" element={<RedactPDF />} />
            <Route path="/pdf/compare" element={<ComparePDF />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
