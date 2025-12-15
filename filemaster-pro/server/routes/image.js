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

// POST /api/image/enhance (basic sharpen/upscale using sharp)
router.post('/enhance', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const scale = Math.min(Math.max(parseFloat(req.body.scale) || 1.5, 1), 3); // clamp 1x-3x
    if (!file) return res.status(400).json({ error: 'No image uploaded' });

    const ext = path.extname(file.originalname).toLowerCase();
    const outPath = path.join(__dirname, '../uploads', `${file.filename}-enhanced${ext}`);

    const image = sharp(file.path);
    const meta = await image.metadata();
    const targetWidth = meta.width ? Math.min(Math.round(meta.width * scale), 8000) : undefined;
    const targetHeight = meta.height ? Math.min(Math.round(meta.height * scale), 8000) : undefined;

    await image
      .resize({ width: targetWidth, height: targetHeight, fit: 'inside', withoutEnlargement: false })
      .sharpen()
      .normalize()
      .toFile(outPath);

    res.download(outPath, `${path.parse(file.originalname).name}-enhanced${ext}`, () => {
      fs.unlinkSync(file.path);
      fs.unlinkSync(outPath);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
