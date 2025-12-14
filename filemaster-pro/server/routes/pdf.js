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
    let pdfDoc = await PDFDocument.create();
    let outPath = path.join(__dirname, '../uploads', `${file.filename}.pdf`);
    if (file.mimetype === 'text/plain') {
      // TXT to PDF
      const text = fs.readFileSync(file.path, 'utf8');
      const page = pdfDoc.addPage();
      page.drawText(text, { x: 50, y: 700, size: 12 });
    } else if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      // Image to PDF
      const imageBytes = fs.readFileSync(file.path);
      let img;
      if (file.mimetype === "image/jpeg") {
        img = await pdfDoc.embedJpg(imageBytes);
      } else {
        img = await pdfDoc.embedPng(imageBytes);
      }
      const page = pdfDoc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    } else {
      return res.status(400).json({ error: 'Conversion for this file type not implemented.' });
    }
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outPath, pdfBytes);
    res.download(outPath, `${path.parse(file.originalname).name}.pdf`, () => {
      fs.unlinkSync(file.path);
      fs.unlinkSync(outPath);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
