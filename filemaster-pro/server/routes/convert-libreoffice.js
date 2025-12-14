const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const router = express.Router();

const upload = multer({ dest: path.join(__dirname, '../uploads') });

// POST /api/convert-libreoffice
// Accepts any office file or PDF, converts to target format (pdf, docx, pptx, xlsx, etc.)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { target } = req.body; // e.g. 'pdf', 'docx', 'pptx', 'xlsx'
    if (!file || !target) return res.status(400).json({ error: 'File and target format required.' });
    const inputPath = file.path;
    const outputDir = path.join(__dirname, '../uploads');
    // LibreOffice CLI command
    const command = `soffice --headless --convert-to ${target} --outdir "${outputDir}" "${inputPath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        fs.unlinkSync(inputPath);
        return res.status(500).json({ error: stderr || error.message });
      }
      // Find the output file
      const base = path.parse(file.originalname).name;
      const outFile = path.join(outputDir, `${base}.${target}`);
      if (!fs.existsSync(outFile)) {
        fs.unlinkSync(inputPath);
        return res.status(500).json({ error: 'Conversion failed.' });
      }
      res.download(outFile, `${base}.${target}`, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outFile);
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
