const express = require('express');
const multer = require('multer');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Render-compatible temp dir; fall back to local uploads for dev
const TMP_DIR = process.env.TMP_DIR || '/tmp';
const FALLBACK_DIR = path.join(__dirname, '../uploads');
const WORK_DIR = fs.existsSync(TMP_DIR) ? TMP_DIR : FALLBACK_DIR;

const upload = multer({ dest: WORK_DIR });

// POST /api/compress
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { level } = req.body; // 'low', 'medium', 'high'
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    // Always ZIP only (no recompression of PDF/DOCX content)
    const outputZip = path.join(WORK_DIR, `${file.filename}.zip`);
    const output = fs.createWriteStream(outputZip);
    const archive = archiver('zip', {
      zlib: { level: level === 'high' ? 9 : level === 'medium' ? 6 : 3 }
    });

    const cleanup = () => {
      try { fs.unlinkSync(file.path); } catch (_) {}
      try { fs.unlinkSync(outputZip); } catch (_) {}
    };

    output.on('close', () => {
      res.download(outputZip, `${path.parse(file.originalname).name}.zip`, err => {
        if (err) console.error('[compress:download] failed', err);
        cleanup();
      });
    });

    archive.on('error', err => {
      console.error('[compress:archive] error', err);
      cleanup();
      if (!res.headersSent) res.status(500).json({ error: 'Compression failed' });
    });

    archive.pipe(output);
    archive.file(file.path, { name: file.originalname });
    archive.finalize().catch(err => {
      console.error('[compress:finalize] error', err);
      cleanup();
      if (!res.headersSent) res.status(500).json({ error: 'Compression failed' });
    });
  } catch (err) {
    console.error('[compress] error', err);
    if (!res.headersSent) res.status(500).json({ error: 'Compression failed' });
  }
});

module.exports = router;
