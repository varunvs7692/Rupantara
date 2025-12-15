const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const router = express.Router();

// Render requires using /tmp for writeable storage; fallback to local uploads for dev
const TMP_DIR = process.env.TMP_DIR || '/tmp';
const FALLBACK_DIR = path.join(__dirname, '../uploads');
const WORK_DIR = fs.existsSync(TMP_DIR) ? TMP_DIR : FALLBACK_DIR;

const upload = multer({ dest: WORK_DIR });

// POST /api/pdf/convert

router.post('/convert', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const pdfDoc = await PDFDocument.create();
    const outPath = path.join(WORK_DIR, `${file.filename}.pdf`);

    if (file.mimetype === 'text/plain') {
      // TXT → PDF
      const text = fs.readFileSync(file.path, 'utf8');
      const page = pdfDoc.addPage();
      page.drawText(text, { x: 50, y: 700, size: 12 });
    } else if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      // Image → PDF using sharp for reliable decoding
      const { data, info } = await sharp(file.path).rotate().toBuffer({ resolveWithObject: true });
      const embedded = await pdfDoc.embedPng(data);
      const page = pdfDoc.addPage([info.width, info.height]);
      page.drawImage(embedded, { x: 0, y: 0, width: info.width, height: info.height });
    } else {
      return res.status(400).json({ error: 'Conversion for this file type not implemented.' });
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outPath, pdfBytes);

    res.download(outPath, `${path.parse(file.originalname).name}.pdf`, err => {
      if (err) {
        console.error('[pdf:download] failed', err);
      }
      try { fs.unlinkSync(file.path); } catch (_) {}
      try { fs.unlinkSync(outPath); } catch (_) {}
    });
  } catch (err) {
    console.error('[pdf:convert] error', err);
    res.status(500).json({ error: 'Conversion failed. Please try again.' });
  }
});

module.exports = router;
