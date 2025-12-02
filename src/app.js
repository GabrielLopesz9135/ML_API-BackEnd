const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors({
    origin: '*',
}));
app.use(express.json());

app.use('/api', apiRoutes);

module.exports = app;