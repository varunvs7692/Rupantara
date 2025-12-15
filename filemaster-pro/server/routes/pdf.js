const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { PDFDocument } = require('pdf-lib');
const router = express.Router();

// Render requires using /tmp for writeable storage; fallback to local uploads for dev
const TMP_DIR = process.env.TMP_DIR || '/tmp';
const FALLBACK_DIR = path.join(__dirname, '../uploads');
const WORK_DIR = fs.existsSync(TMP_DIR) ? TMP_DIR : FALLBACK_DIR;

const upload = multer({ dest: WORK_DIR });
const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DOC_MIME_TYPES = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

function isImage(file) {
  return IMAGE_MIME_TYPES.has(file.mimetype);
}

function isDoc(file) {
  return DOC_MIME_TYPES.has(file.mimetype);
}

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
      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(outPath, pdfBytes);
    } else if (isImage(file)) {
      // Image → PDF using sharp for reliable decoding; embed with correct codec
      const { data, info } = await sharp(file.path).rotate().toBuffer({ resolveWithObject: true });
      const embedded = info.format === 'jpeg' ? await pdfDoc.embedJpg(data) : await pdfDoc.embedPng(data);
      const page = pdfDoc.addPage([info.width, info.height]);
      page.drawImage(embedded, { x: 0, y: 0, width: info.width, height: info.height });
      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(outPath, pdfBytes);
    } else if (isDoc(file)) {
      // Office docs → PDF via LibreOffice
      const inputPath = file.path;
      const cmd = `soffice --headless --convert-to pdf --outdir "${WORK_DIR}" "${inputPath}"`;
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error('[pdf:convert:soffice] error', stderr || error.message);
          try { fs.unlinkSync(inputPath); } catch (_) {}
          return res.status(500).json({ error: 'Office document conversion failed.' });
        }
        const tempBase = path.parse(inputPath).name;
        const outFile = path.join(WORK_DIR, `${tempBase}.pdf`);
        if (!fs.existsSync(outFile)) {
          try { fs.unlinkSync(inputPath); } catch (_) {}
          return res.status(500).json({ error: 'Office document conversion failed.' });
        }
        return res.download(outFile, `${path.parse(file.originalname).name}.pdf`, err => {
          if (err) console.error('[pdf:download] failed', err);
          try { fs.unlinkSync(inputPath); } catch (_) {}
          try { fs.unlinkSync(outFile); } catch (_) {}
        });
      });
      return; // response handled in callback
    } else {
      return res.status(400).json({ error: 'Unsupported file type for PDF conversion.' });
    }

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
