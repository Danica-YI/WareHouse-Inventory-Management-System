const StockAdjustment = require('../models/stockAdjustment');
const Stock = require('../models/Stock');

// Get all adjustments
const getAllAdjustments = async (req, res) => {
    try {
        const adjustments = await StockAdjustment.find()
            .populate('stock', 'name sku')
            .populate('requestedBy', 'name email')
            .populate('approvedBy', 'name email');
        res.status(200).json(adjustments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single adjustment by ID
const getAdjustmentById = async (req, res) => {
    try {
        const adjustment = await StockAdjustment.findById(req.params.id)
            .populate('stock', 'name sku')
            .populate('requestedBy', 'name email')
            .populate('approvedBy', 'name email');
        if (!adjustment) return res.status(404).json({ message: 'Adjustment not found' });
        res.status(200).json(adjustment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create adjustment request (staff)
const createAdjustment = async (req, res) => {
    try {
        const { stock: stockId, current_qty, actual_qty, reason } = req.body;

        const stock = await Stock.findById(stockId);
        if (!stock) return res.status(404).json({ message: 'Stock not found' });

        const adjustment = await StockAdjustment.create({
            stock: stockId,
            current_qty,
            actual_qty,
            reason,
            requestedBy: req.user.id,
        });

        res.status(201).json(adjustment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Approve or reject adjustment (admin only)
const updateAdjustmentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can approve or reject adjustments' });
        }

        const adjustment = await StockAdjustment.findById(req.params.id);
        if (!adjustment) return res.status(404).json({ message: 'Adjustment not found' });

        // Can only update if still pending
        if (adjustment.status !== 'pending') {
            return res.status(400).json({ message: 'Adjustment has already been processed' });
        }

        // If approved, update stock quantity
        if (status === 'approved') {
            const stock = await Stock.findById(adjustment.stock);
            if (!stock) return res.status(404).json({ message: 'Stock not found' });
            stock.quantity = adjustment.actual_qty;
            await stock.save();
        }

        adjustment.status = status;
        adjustment.approvedBy = req.user.id;
        await adjustment.save();

        res.status(200).json(adjustment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete adjustment (only if pending)
const deleteAdjustment = async (req, res) => {
    try {
        const adjustment = await StockAdjustment.findById(req.params.id);
        if (!adjustment) return res.status(404).json({ message: 'Adjustment not found' });

        if (adjustment.status !== 'pending') {
            return res.status(400).json({ message: 'Cannot delete a processed adjustment' });
        }

        await adjustment.deleteOne();
        res.status(200).json({ message: 'Adjustment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllAdjustments, getAdjustmentById, createAdjustment, updateAdjustmentStatus, deleteAdjustment };