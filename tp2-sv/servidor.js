
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
}));

app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Connection error:', error));

// Definición del esquema y modelo
const searchSchema = new mongoose.Schema({
  city: String,
  country: String,
  temp: String,
  condition: String,
  icon: String,
  conditionText: String,
  date: { type: Date, default: Date.now },
}, { collection: 'historial' });

const Search = mongoose.model('Search', searchSchema);

// Endpoint para guardar búsquedas
app.post('/api/search', async (req, res) => {
  try {
    const { city, country, temp, condition, icon, conditionText } = req.body;
    const newSearch = new Search({
      city,
      country,
      temp,
      condition,
      icon,
      conditionText,
    });
    const savedSearch = await newSearch.save();
    res.status(201).json(savedSearch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint para obtener búsquedas
app.get('/api/searches', async (req, res) => {
  try {
    const searches = await Search.find().sort({ date: -1 });
    res.status(200).json(searches);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
