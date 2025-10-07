require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();



// middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());




// routes
app.use('/api/auth', require('./routes/auth'));
app.get('/', (req, res) => res.send('API running'));




// connect + start
mongoose
  .connect(process.env.MONGO_URI) // no deprecated options needed
  .then(() => {
    console.log('MongoDB connected!');
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });