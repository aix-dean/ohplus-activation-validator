const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

const PORT = process.env.PORT || 8080;

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.post('/validate-activation-key', upload.single('activationKey'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  try {
    const fileContent = req.file.buffer.toString('utf8');
    const decoded = Buffer.from(fileContent, 'base64').toString('utf8');
    const json = JSON.parse(decoded);
    const { licenseData, signature } = json;

    const publicKey = fs.readFileSync('public.pem', 'utf8');
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(licenseData);
    const isValid = verifier.verify(publicKey, signature, 'base64');

    if (isValid) {
      const parsedLicenseData = JSON.parse(licenseData);
      res.json({ success: true, data: parsedLicenseData });
    } else {
      res.status(400).json({ success: false, error: 'Invalid Activation Key' });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: 'Invalid Activation Key' });
  }
});

app.listen(PORT, () => {
  console.log('License validator running on port ${PORT}');
});