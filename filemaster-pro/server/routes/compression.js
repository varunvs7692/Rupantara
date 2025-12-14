const express = require('express');
const multer = require('multer');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const upload = multer({ dest: path.join(__dirname, '../uploads') });

// POST /api/compress
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { level } = req.body; // 'low', 'medium', 'high'
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    // Compression logic (ZIP for all types)
    const outputZip = path.join(__dirname, '../uploads', `${file.filename}.zip`);
    const output = fs.createWriteStream(outputZip);
    const archive = archiver('zip', {
      zlib: { level: level === 'high' ? 9 : level === 'medium' ? 6 : 3 }
    });
    output.on('close', () => {
      res.download(outputZip, `${path.parse(file.originalname).name}.zip`, () => {
        fs.unlinkSync(file.path);
        fs.unlinkSync(outputZip);
      });
    });
    archive.on('error', err => res.status(500).json({ error: err.message }));
    archive.pipe(output);
    archive.file(file.path, { name: file.originalname });
    archive.finalize();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
