// Warehouse Inventory Management System - Backend API
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: '*'
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stocks', require('./routes/stockRoutes'));
app.use('/api/movements', require('./routes/stockMovementRoutes'));
app.use('/api/adjustments', require('./routes/stockAdjustmentRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Export the app object for testing
if (require.main === module) {
    connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;