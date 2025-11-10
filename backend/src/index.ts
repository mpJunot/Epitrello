import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_PORT = 4000;
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true
}));
app.use(express.json());

// Basic Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Epitrello Backend is running!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(` Server running on http://0.0.0.0:${PORT}`);
  console.log(` Health check: http://0.0.0.0:${PORT}/health`);
});
