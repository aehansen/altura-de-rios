require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rioPlataRouter = require('./routes/rio-plata');
const rioUruguayRouter = require('./routes/rio-uruguay');
const vientoRouter = require('./routes/viento');
const climaRouter = require('./routes/clima');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET'],
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/rio-plata', rioPlataRouter);
app.use('/api/rio-uruguay', rioUruguayRouter);
app.use('/api/viento', vientoRouter);
app.use('/api/clima', climaRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🌊 Servidor corriendo en puerto ${PORT}`);
});
