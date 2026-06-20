const Stock = require('../models/Stock');
const { createAlert } = require('./alertController');

// Get all stocks
const getAllStocks = async (req, res) => {
    try {
        const stocks = await Stock.find({ status: 'active' });
        res.status(200).json(stocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single stock by ID
const getStockById = async (req, res) => {
    try {
        const stock = await Stock.findById(req.params.id);
        if (!stock) return res.status(404).json({ message: 'Stock not found' });
        res.status(200).json(stock);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new stock
const createStock = async (req, res) => {
    try {
        const { name, sku, category, quantity, unit, price, lowStockThreshold, description } = req.body;
        const stock = await Stock.create({
            name, sku, category, quantity, unit, price, lowStockThreshold, description
        });

        //check low stock and trigger alert
        if (stock.quantity <= stock.lowStockThreshold) {
            await createAlert(stock._id);
        }
        res.status(201).json(stock);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update stock
const updateStock = async (req, res) => {
    try {
        const stock = await Stock.findById(req.params.id);
        if (!stock) return res.status(404).json({ message: 'Stock not found' });

        const { name, sku, category, quantity, unit, price, lowStockThreshold, description, status } = req.body;
        stock.name = name || stock.name;
        stock.sku = sku || stock.sku;
        stock.category = category || stock.category;
        stock.quantity = quantity !== undefined ? quantity : stock.quantity;
        stock.unit = unit || stock.unit;
        stock.price = price !== undefined ? price : stock.price;
        stock.lowStockThreshold = lowStockThreshold !== undefined ? lowStockThreshold : stock.lowStockThreshold;
        stock.description = description || stock.description;
        stock.status = status || stock.status;

        const updatedStock = await stock.save();

        //check low stock and trigger alert
        if (updatedStock.quantity <= updatedStock.lowStockThreshold) {
            await createAlert(updatedStock._id)
        }
        res.status(200).json(updatedStock);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete stock
const deleteStock = async (req, res) => {
    try {
        const stock = await Stock.findById(req.params.id);
        if (!stock) return res.status(404).json({ message: 'Stock not found' });
        await stock.deleteOne();
        res.status(200).json({ message: 'Stock deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get low stock items
const getLowStockItems = async (req, res) => {
    try {
        const stocks = await Stock.find({
            $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
            status: 'active'
        });
        res.status(200).json(stocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllStocks, getStockById, createStock, updateStock, deleteStock, getLowStockItems };