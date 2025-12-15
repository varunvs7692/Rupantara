const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');
const router = express.Router();

const upload = multer({ dest: path.join(__dirname, '../uploads') });

const parsePages = (pagesStr, maxPages) => {
  if (!pagesStr) return [];
  const parts = pagesStr.split(',').map(p => p.trim()).filter(Boolean);
  const pages = new Set();
  for (const part of parts) {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(n => parseInt(n, 10) - 1);
      if (Number.isInteger(a) && Number.isInteger(b)) {
        const start = Math.max(Math.min(a, b), 0);
        const end = Math.min(Math.max(a, b), maxPages - 1);
        for (let i = start; i <= end; i++) pages.add(i);
      }
    } else {
      const idx = parseInt(part, 10) - 1;
      if (Number.isInteger(idx) && idx >= 0 && idx < maxPages) pages.add(idx);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
};

const downloadAndCleanup = (res, tmpPaths, downloadName) => {
  res.download(tmpPaths[0], downloadName, () => {
    tmpPaths.forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
  });
};

// Remove Pages
router.post('/remove-pages', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No PDF uploaded.' });
    const pagesStr = req.body.pages || '';
    const pdfBytes = fs.readFileSync(file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const toRemove = parsePages(pagesStr, pdfDoc.getPageCount());
    const keep = [];
    for (let i = 0; i < pdfDoc.getPageCount(); i++) if (!toRemove.includes(i)) keep.push(i);
    if (!keep.length) return res.status(400).json({ error: 'No pages left after removal.' });
    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(pdfDoc, keep);
    copied.forEach(p => newDoc.addPage(p));
    const out = await newDoc.save();
    const outPath = path.join(__dirname, '../uploads', `${file.filename}-removed.pdf`);
    fs.writeFileSync(outPath, out);
    downloadAndCleanup(res, [outPath, file.path], 'trimmed.pdf');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Extract Pages
router.post('/extract-pages', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No PDF uploaded.' });
    const pagesStr = req.body.pages || '';
    const pdfBytes = fs.readFileSync(file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const toKeep = parsePages(pagesStr, pdfDoc.getPageCount());
    if (!toKeep.length) return res.status(400).json({ error: 'No pages selected to extract.' });
    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(pdfDoc, toKeep);
    copied.forEach(p => newDoc.addPage(p));
    const out = await newDoc.save();
    const outPath = path.join(__dirname, '../uploads', `${file.filename}-extracted.pdf`);
    fs.writeFileSync(outPath, out);
    downloadAndCleanup(res, [outPath, file.path], 'extracted.pdf');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Organize PDF (reorder pages)
router.post('/organize', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No PDF uploaded.' });
    const orderStr = req.body.order || '';
    const pdfBytes = fs.readFileSync(file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const indices = orderStr
      .split(',')
      .map(p => parseInt(p.trim(), 10) - 1)
      .filter(n => Number.isInteger(n) && n >= 0 && n < pdfDoc.getPageCount());
    if (!indices.length) return res.status(400).json({ error: 'No valid order provided.' });
    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(pdfDoc, indices);
    copied.forEach(p => newDoc.addPage(p));
    const out = await newDoc.save();
    const outPath = path.join(__dirname, '../uploads', `${file.filename}-organized.pdf`);
    fs.writeFileSync(outPath, out);
    downloadAndCleanup(res, [outPath, file.path], 'organized.pdf');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scan to PDF (image -> single-page PDF)
router.post('/scan', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No image uploaded.' });
    const pdfDoc = await PDFDocument.create();
    const imgBytes = fs.readFileSync(file.path);
    let img;
    if (file.mimetype === 'image/jpeg') img = await pdfDoc.embedJpg(imgBytes);
    else img = await pdfDoc.embedPng(imgBytes);
    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    const out = await pdfDoc.save();
    const outPath = path.join(__dirname, '../uploads', `${file.filename}-scan.pdf`);
    fs.writeFileSync(outPath, out);
    downloadAndCleanup(res, [outPath, file.path], 'scanned.pdf');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Repair PDF (re-save)
router.post('/repair', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No PDF uploaded.' });
    const pdfBytes = fs.readFileSync(file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const out = await pdfDoc.save();
    const outPath = path.join(__dirname, '../uploads', `${file.filename}-repaired.pdf`);
    fs.writeFileSync(outPath, out);
    downloadAndCleanup(res, [outPath, file.path], 'repaired.pdf');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// OCR PDF (placeholder)
router.post('/ocr', upload.single('file'), async (req, res) => {
  res.status(501).json({ error: 'OCR requires Tesseract; not available in this deployment.' });
});

// PDF to PDF/A (placeholder)
router.post('/to-pdfa', upload.single('file'), async (req, res) => {
  res.status(501).json({ error: 'PDF/A conversion not available in this deployment.' });
});

// Rotate PDF
router.post('/rotate', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No PDF uploaded.' });
    const angle = parseInt(req.body.angle, 10) || 90;
    const pagesStr = req.body.pages || '';
    const pdfBytes = fs.readFileSync(file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const targets = parsePages(pagesStr, pdfDoc.getPageCount());
    const applyAll = !targets.length;
    pdfDoc.getPages().forEach((p, idx) => {
      if (applyAll || targets.includes(idx)) p.setRotation(degrees(angle));
    });
    const out = await pdfDoc.save();
    const outPath = path.join(__dirname, '../uploads', `${file.filename}-rotated.pdf`);
    fs.writeFileSync(outPath, out);
    downloadAndCleanup(res, [outPath, file.path], 'rotated.pdf');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Page Numbers
router.post('/add-page-numbers', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No PDF uploaded.' });
    const pdfBytes = fs.readFileSync(file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    pages.forEach((page, idx) => {
      const text = `${idx + 1}`;
      const { width } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, 12);
      page.drawText(text, {
        x: width / 2 - textWidth / 2,
        y: 20,
        size: 12,
        font,
        color: rgb(0, 0, 0)
      });
    });
    const out = await pdfDoc.save();
    const outPath = path.join(__dirname, '../uploads', `${file.filename}-paged.pdf`);
    fs.writeFileSync(outPath, out);
    downloadAndCleanup(res, [outPath, file.path], 'paged.pdf');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Watermark (text)
router.post('/add-watermark', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No PDF uploaded.' });
    const text = req.body.text || 'Watermark';
    const pdfBytes = fs.readFileSync(file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawText(text, {
        x: width / 4,
        y: height / 2,
        size: 36,
        rotate: degrees(-30),
        opacity: 0.2,
        color: rgb(0.2, 0.2, 0.2),
        font
      });
    }
    const out = await pdfDoc.save();
    const outPath = path.join(__dirname, '../uploads', `${file.filename}-watermark.pdf`);
    fs.writeFileSync(outPath, out);
    downloadAndCleanup(res, [outPath, file.path], 'watermarked.pdf');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crop PDF (simple inset)
router.post('/crop', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No PDF uploaded.' });
    const inset = Math.max(parseInt(req.body.inset, 10) || 20, 0);
    const pdfBytes = fs.readFileSync(file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    pdfDoc.getPages().forEach(page => {
      const { width, height } = page.getSize();
      page.setCropBox(inset, inset, width - inset * 2, height - inset * 2);
    });
    const out = await pdfDoc.save();
    const outPath = path.join(__dirname, '../uploads', `${file.filename}-cropped.pdf`);
    fs.writeFileSync(outPath, out);
    downloadAndCleanup(res, [outPath, file.path], 'cropped.pdf');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit PDF (placeholder)
router.post('/edit', upload.single('file'), async (req, res) => {
  res.status(501).json({ error: 'Edit PDF not available in this deployment.' });
});

// Unlock PDF (placeholder)
router.post('/unlock', upload.single('file'), async (req, res) => {
  res.status(501).json({ error: 'Unlocking password-protected PDFs requires qpdf; not available here.' });
});

// Protect PDF (placeholder)
router.post('/protect', upload.single('file'), async (req, res) => {
  res.status(501).json({ error: 'Setting PDF passwords requires qpdf; not available here.' });
});

// Sign PDF (placeholder)
router.post('/sign', upload.single('file'), async (req, res) => {
  res.status(501).json({ error: 'Digital signing requires certificate support; not available here.' });
});

// Redact PDF (placeholder)
router.post('/redact', upload.single('file'), async (req, res) => {
  res.status(501).json({ error: 'Redaction not available in this deployment.' });
});

// Compare PDF (placeholder)
router.post('/compare', upload.single('file'), async (req, res) => {
  res.status(501).json({ error: 'PDF diffing not available in this deployment.' });
});

module.exports = router;
