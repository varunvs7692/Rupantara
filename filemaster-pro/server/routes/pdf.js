const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const router = express.Router();

const upload = multer({ dest: path.join(__dirname, '../uploads') });

// POST /api/pdf/convert
router.post('/convert', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    // Only TXT to PDF implemented here for brevity
    if (file.mimetype === 'text/plain') {
      const text = fs.readFileSync(file.path, 'utf8');
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      page.drawText(text, { x: 50, y: 700, size: 12 });
      const pdfBytes = await pdfDoc.save();
      const outPath = path.join(__dirname, '../uploads', `${file.filename}.pdf`);
      fs.writeFileSync(outPath, pdfBytes);
      res.download(outPath, `${path.parse(file.originalname).name}.pdf`, () => {
        fs.unlinkSync(file.path);
        fs.unlinkSync(outPath);
      });
    } else {
      res.status(400).json({ error: 'Conversion for this file type not implemented in demo.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
