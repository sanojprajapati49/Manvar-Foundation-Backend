const multer = require('multer');
const path = require('path');
const fs = require('fs');

// सुनिश्चित करें कि अपलोड डायरेक्टरी मौजूद है
const uploadDir = path.join(__dirname, '..', 'uploads', 'csr');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // फाइल के नाम को यूनिक बनाने के लिए डेट और ओरिजिनल नाम का उपयोग करें
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeFieldName = String(file.fieldname || 'file').replace(/[^a-z0-9_-]/gi, '');
    cb(null, safeFieldName + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
