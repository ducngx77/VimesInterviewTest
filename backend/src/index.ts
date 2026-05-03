import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
const PORT = 5000;

app.use('/api/auth', authRoutes);
app.use('/api/receipt', receiptRoutes);
app.use('/api/inventory', inventoryRoutes);
app.listen(PORT, () => console.log("Server is running on port 5000"));