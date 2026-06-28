require('dotenv').config();  // MUST be first line — loads .env
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' })); // Vite default port
app.use(express.json());                              // parse JSON bodies

app.use('/api/auth', authRoutes);
app.get('/', (req, res) => res.json({ status: 'Server running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));