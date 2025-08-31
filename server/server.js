import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Example city data
const cities = [
  { id: 1, name: 'Bogotá' },
  { id: 2, name: 'Medellín' },
  { id: 3, name: 'Cali' },
];

// Endpoint to get cities
app.get('/cities', (req, res) => {
  try {
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving cities' });
  }
});

// Endpoint for root
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Cities API' });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});