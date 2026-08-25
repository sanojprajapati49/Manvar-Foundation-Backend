require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const sequelize = require('./config/db');
const apiRoutes = require('./routes/api');
const Admin = require('./models/Admin');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const productionOrigin = 'https://www.manvarfoundation.org.in';
const allowedOrigins = [
  ...(process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || productionOrigin)
    .split(',')
    .map((origin) => origin.trim()),
  productionOrigin,
  'https://manvarfoundation.org.in'
].filter(Boolean);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.info('MySQL database connected.');
    await sequelize.sync(isProduction ? {} : { alter: true });
    console.info('Database models synchronized.');
    await seedAdminUser();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

const seedAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn('ADMIN_EMAIL or ADMIN_PASSWORD is not set. Admin user was not created.');
      return;
    }

    let adminUser = await Admin.findOne({ where: { email: adminEmail } });

    if (!adminUser) {
      adminUser = await Admin.create({
        name: 'Admin',
        email: adminEmail,
        password: adminPassword,
      });
      console.info(`Admin user created: ${adminUser.email}`);
    } else {
      const isMatch = await adminUser.matchPassword(adminPassword);
      if (!isMatch) {
        adminUser.password = adminPassword;
        await adminUser.save();
        console.info(`Admin password updated for: ${adminUser.email}`);
      }
    }
  } catch (error) {
    console.error('Admin seed error:', error.message);
  }
};

connectDB();

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      "http://manvar-foundation-web-2026.s3-website.ap-south-1.amazonaws.com",
      "https://www.manvarfoundation.org.in",
      "https://manvarfoundation.org.in",
      "https://api.manvarfoundation.org.in"
    ];

    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked origin: ${origin}`));
    }
  },
  credentials: true
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    }
});

const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Serve frontend from the same origin as the API. This keeps the CSRF cookie
// and token on the same site, avoiding Invalid CSRF Token errors in browsers.
const websitePath = path.join(__dirname, '..', 'website');
app.use(express.static(websitePath));

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use(csrfProtection);

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(websitePath, 'index.html'));
});

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.warn('Invalid CSRF Token received.');
    res.status(403).json({ error: 'Invalid CSRF Token. Request blocked.' });
  } else if (req.path.startsWith('/api')) {
    console.error('API error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Server error'
    });
  } else {
    next(err);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.info(`Backend server is running on port ${PORT}.`);
});
