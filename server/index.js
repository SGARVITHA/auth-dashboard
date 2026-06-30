require('dotenv').config();  // MUST be first line — loads .env
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' })); // Vite default port
app.use(express.json());                              // parse JSON bodies
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 requests per window per IP
    message: { message: 'Too many attempts. Try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => res.json({ status: 'Server running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));