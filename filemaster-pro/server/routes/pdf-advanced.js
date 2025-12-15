const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const PDFMerger = require('pdf-merger-js');
const router = express.Router();

const upload = multer({ dest: path.join(__dirname, '../uploads') });

// Merge PDFs
router.post('/merge', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length < 2) return res.status(400).json({ error: 'At least two PDF files required.' });
    const merger = new PDFMerger();
    for (const file of files) {
      merger.add(file.path);
    }
    const mergedPdf = await merger.saveAsBuffer();
    const outPath = path.join(__dirname, '../uploads', `merged-${Date.now()}.pdf`);
    fs.writeFileSync(outPath, mergedPdf);
    files.forEach(f => fs.unlinkSync(f.path));
    res.download(outPath, 'merged.pdf', () => fs.unlinkSync(outPath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Split PDF (first page only for demo)
router.post('/split', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No PDF uploaded.' });
    const pagesStr = req.body.pages || '';
    const pdfBytes = fs.readFileSync(file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const total = pdfDoc.getPageCount();
    const indices = pagesStr
      .split(',')
      .map(p => p.trim())
      .filter(Boolean)
      .flatMap(part => {
        if (part.includes('-')) {
          const [a, b] = part.split('-').map(n => parseInt(n, 10) - 1);
          if (Number.isInteger(a) && Number.isInteger(b)) {
            const start = Math.max(Math.min(a, b), 0);
            const end = Math.min(Math.max(a, b), total - 1);
            return Array.from({ length: end - start + 1 }, (_, i) => start + i);
          }
        }
        const idx = parseInt(part, 10) - 1;
        return Number.isInteger(idx) && idx >= 0 && idx < total ? [idx] : [];
      });
    const unique = Array.from(new Set(indices)).sort((a, b) => a - b);
    if (!unique.length) return res.status(400).json({ error: 'No valid pages specified.' });
    const newPdf = await PDFDocument.create();
    const copied = await newPdf.copyPages(pdfDoc, unique);
    copied.forEach(p => newPdf.addPage(p));
    const splitBytes = await newPdf.save();
    const outPath = path.join(__dirname, '../uploads', `split-${Date.now()}.pdf`);
    fs.writeFileSync(outPath, splitBytes);
    fs.unlinkSync(file.path);
    res.download(outPath, 'split.pdf', () => fs.unlinkSync(outPath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
