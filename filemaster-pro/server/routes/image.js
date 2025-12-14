const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const upload = multer({ dest: path.join(__dirname, '../uploads') });

// POST /api/image/compress
router.post('/compress', upload.single('image'), async (req, res) => {
  try {
    const { quality } = req.body; // 10-100
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No image uploaded' });
    const ext = path.extname(file.originalname).toLowerCase();
    const outPath = path.join(__dirname, '../uploads', `${file.filename}-compressed${ext}`);
    await sharp(file.path)
      .jpeg({ quality: parseInt(quality) })
      .toFile(outPath);
    const origSize = fs.statSync(file.path).size;
    const compSize = fs.statSync(outPath).size;
    res.download(outPath, `${path.parse(file.originalname).name}-compressed${ext}`, () => {
      fs.unlinkSync(file.path);
      fs.unlinkSync(outPath);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/image/enhance (AI upscaling placeholder)
router.post('/enhance', upload.single('image'), async (req, res) => {
  try {
    // Placeholder: In production, call AI upscaling library/service
    res.status(501).json({ error: 'AI upscaling not implemented in demo.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
