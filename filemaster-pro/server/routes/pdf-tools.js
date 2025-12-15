const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');
const util = require('util');
const { exec } = require('child_process');
const execAsync = util.promisify(exec);
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

// OCR PDF (single page) using tesseract + poppler
router.post('/ocr', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No PDF uploaded.' });
    const base = path.join(__dirname, '../uploads', file.filename);
    const imgBase = `${base}-page`;
    const outPdf = `${base}-ocr.pdf`;
    // Convert first page to PNG
    await execAsync(`pdftoppm -png -f 1 -singlefile "${file.path}" "${imgBase}"`);
    // Run tesseract to searchable PDF
    await execAsync(`tesseract "${imgBase}.png" "${base}-ocr" pdf`);
    if (!fs.existsSync(outPdf)) {
      // tesseract outputs with .pdf suffix
      const generated = `${base}-ocr.pdf`;
      if (!fs.existsSync(generated)) throw new Error('OCR output missing');
    }
    res.download(outPdf, 'ocr.pdf', () => {
      [file.path, `${imgBase}.png`, outPdf, `${base}-ocr.txt`].forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PDF to PDF/A using Ghostscript
router.post('/to-pdfa', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No PDF uploaded.' });
    const outPath = path.join(__dirname, '../uploads', `${file.filename}-pdfa.pdf`);
    const cmd = `gs -dPDFA=2 -dBATCH -dNOPAUSE -dNOOUTERSAVE -sPROCESSCOLORMODEL=DeviceRGB -sDEVICE=pdfwrite -sOutputFile="${outPath}" -sPDFACompatibilityPolicy=1 "${file.path}"`;
    await execAsync(cmd);
    res.download(outPath, 'pdfa.pdf', () => {
      [file.path, outPath].forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

// Edit PDF (add footer text)
router.post('/edit', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const note = req.body.note || 'Edited by Rupantara';
    if (!file) return res.status(400).json({ error: 'No PDF uploaded.' });
    const pdfBytes = fs.readFileSync(file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    pdfDoc.getPages().forEach(page => {
      const { width } = page.getSize();
      const textWidth = font.widthOfTextAtSize(note, 10);
      page.drawText(note, { x: width - textWidth - 20, y: 20, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
    });
    const out = await pdfDoc.save();
    const outPath = path.join(__dirname, '../uploads', `${file.filename}-edited.pdf`);
    fs.writeFileSync(outPath, out);
    downloadAndCleanup(res, [outPath, file.path], 'edited.pdf');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unlock PDF via qpdf
router.post('/unlock', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const password = req.body.password || '';
    if (!file) return res.status(400).json({ error: 'No PDF uploaded.' });
    if (!password) return res.status(400).json({ error: 'Password required to unlock.' });
    const outPath = path.join(__dirname, '../uploads', `${file.filename}-unlocked.pdf`);
    await execAsync(`qpdf --password=${password} --decrypt "${file.path}" "${outPath}"`);
    res.download(outPath, 'unlocked.pdf', () => {
      [file.path, outPath].forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protect PDF via qpdf
router.post('/protect', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const password = req.body.password || '';
    if (!file) return res.status(400).json({ error: 'No PDF uploaded.' });
    if (!password) return res.status(400).json({ error: 'Password required to protect PDF.' });
    const outPath = path.join(__dirname, '../uploads', `${file.filename}-protected.pdf`);
    await execAsync(`qpdf --encrypt ${password} ${password} 256 -- "${file.path}" "${outPath}"`);
    res.download(outPath, 'protected.pdf', () => {
      [file.path, outPath].forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sign PDF (visual stamp, not cryptographic)
router.post('/sign', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const signer = req.body.signer || 'Rupantara';
    if (!file) return res.status(400).json({ error: 'No PDF uploaded.' });
    const pdfBytes = fs.readFileSync(file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const text = `Signed by ${signer}`;
    pdfDoc.getPages().forEach(page => {
      const { width } = page.getSize();
      page.drawText(text, { x: width - 180, y: 40, size: 12, font, color: rgb(0, 0.2, 0.6) });
    });
    const out = await pdfDoc.save();
    const outPath = path.join(__dirname, '../uploads', `${file.filename}-signed.pdf`);
    fs.writeFileSync(outPath, out);
    downloadAndCleanup(res, [outPath, file.path], 'signed.pdf');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Redact PDF (black bar at top margin)
router.post('/redact', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No PDF uploaded.' });
    const heightPx = Math.max(parseInt(req.body.height || '50', 10), 10);
    const pdfBytes = fs.readFileSync(file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    pdfDoc.getPages().forEach(page => {
      const { width, height } = page.getSize();
      page.drawRectangle({ x: 0, y: height - heightPx, width, height: heightPx, color: rgb(0, 0, 0) });
    });
    const out = await pdfDoc.save();
    const outPath = path.join(__dirname, '../uploads', `${file.filename}-redacted.pdf`);
    fs.writeFileSync(outPath, out);
    downloadAndCleanup(res, [outPath, file.path], 'redacted.pdf');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Compare PDF (simple page count diff)
router.post('/compare', upload.array('files', 2), async (req, res) => {
  try {
    const [a, b] = req.files || [];
    if (!a || !b) return res.status(400).json({ error: 'Two PDF files required.' });
    const aDoc = await PDFDocument.load(fs.readFileSync(a.path));
    const bDoc = await PDFDocument.load(fs.readFileSync(b.path));
    const result = {
      pagesA: aDoc.getPageCount(),
      pagesB: bDoc.getPageCount(),
      equalPages: aDoc.getPageCount() === bDoc.getPageCount()
    };
    fs.unlinkSync(a.path);
    fs.unlinkSync(b.path);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
