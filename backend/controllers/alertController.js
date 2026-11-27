const Alert = require('../models/Alert');
const Stock = require('../models/Stock');

// Get all alerts
const getAllAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find()
            .populate('stock', 'name sku quantity lowStockThreshold price')
            .populate('resolvedBy', 'name email');
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get active alerts only
const getActiveAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({ status: 'active' })
            .populate('stock', 'name sku quantity lowStockThreshold price')
            .populate('resolvedBy', 'name email');
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single alert by ID
const getAlertById = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id)
            .populate('stock', 'name sku quantity lowStockThreshold price')
            .populate('resolvedBy', 'name email');
        if (!alert) return res.status(404).json({ message: 'Alert not found' });
        res.status(200).json(alert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create alert (called automatically when stock is low)
const createAlert = async (stockId) => {
    try {
        const stock = await Stock.findById(stockId);
        if (!stock) return;

        // Check if active alert already exists for this stock
        const existingAlert = await Alert.findOne({ 
            stock: stockId, 
            status: 'active' 
        });
        if (existingAlert) return;

        // Create new alert
        await Alert.create({
            stock: stockId,
            alertType: 'low_stock',
            threshold: stock.lowStockThreshold,
            quantityAtAlert: stock.quantity,
        });
    } catch (error) {
        console.error('Error creating alert:', error.message);
    }
};

// Resolve alert (admin only)
const resolveAlert = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can resolve alerts' });
        }

        const alert = await Alert.findById(req.params.id);
        if (!alert) return res.status(404).json({ message: 'Alert not found' });

        if (alert.status !== 'active') {
            return res.status(400).json({ message: 'Alert is already resolved or ignored' });
        }

        const { resolution, notes } = req.body;

        alert.status = 'resolved';
        alert.resolvedBy = req.user.id;
        alert.resolvedAt = Date.now();
        alert.resolution = resolution;
        alert.notes = notes;

        await alert.save();
        res.status(200).json(alert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ignore alert (admin only)
const ignoreAlert = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can ignore alerts' });
        }

        const alert = await Alert.findById(req.params.id);
        if (!alert) return res.status(404).json({ message: 'Alert not found' });

        if (alert.status !== 'active') {
            return res.status(400).json({ message: 'Alert is already resolved or ignored' });
        }

        const { notes } = req.body;

        alert.status = 'ignored';
        alert.resolvedBy = req.user.id;
        alert.resolvedAt = Date.now();
        alert.resolution = 'ignored';
        alert.notes = notes;

        await alert.save();
        res.status(200).json(alert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllAlerts, getActiveAlerts, getAlertById, createAlert, resolveAlert, ignoreAlert };