/**
 * Healflow Express Backend Server
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Healflow AI Specialist Guide Backend' });
});

// Chatbot API Routes
app.use('/api/chat', chatRoutes);

// Doctor & OPD Queue API Routes
app.use('/api/doctors', doctorRoutes);

// Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Healflow Backend running on port ${PORT}`);
  console.log(`Endpoints available at:`);
  console.log(`- Chat:    http://localhost:${PORT}/api/chat/message`);
  console.log(`- Doctors: http://localhost:${PORT}/api/doctors`);
  console.log(`======================================================\n`);
});

export default app;

