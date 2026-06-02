const Order = require('../models/Order');
const Stock = require('../models/Stock');

// Get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('supplier', 'name contactEmail')
            .populate('items.stock', 'name sku')
            .populate('requestedBy', 'name email')
            .populate('approvedBy', 'name email');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('supplier', 'name contactEmail')
            .populate('items.stock', 'name sku')
            .populate('requestedBy', 'name email')
            .populate('approvedBy', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Save order as draft (admin only)
const createOrder = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can create orders' });
        }

        const { supplier, items, notes } = req.body;

        const totalAmount = items.reduce((sum, item) => {
            return sum + (item.quantity * item.unitPrice);
        }, 0);

        const orderNumber = 'ORD-' + Date.now();

        const order = await Order.create({
            orderNumber,
            supplier,
            items,
            totalAmount,
            notes,
            status: 'draft',
            requestedBy: req.user.id,
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Submit order - change from draft to pending (admin only)
const submitOrder = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can submit orders' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status !== 'draft') {
            return res.status(400).json({ message: 'Only draft orders can be submitted' });
        }

        order.status = 'pending';
        await order.save();
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order details (admin only, only if draft)
const updateOrder = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can update orders' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status !== 'draft') {
            return res.status(400).json({ message: 'Only draft orders can be modified' });
        }

        const { supplier, items, notes } = req.body;
        order.supplier = supplier || order.supplier;
        order.items = items || order.items;
        order.notes = notes || order.notes;
        order.totalAmount = items ? items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) : order.totalAmount;

        await order.save();
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Only admin can approve or cancel
        if ((status === 'approved' || status === 'cancelled') && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can approve or cancel orders' });
        }

        // Only admin can set to shipped
        if (status === 'shipped' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can mark orders as shipped' });
        }

        // Cannot set to shipped without tracking info
        if (status === 'shipped') {
            if (!order.trackingInfo || !order.trackingInfo.trackingNumber) {
                return res.status(400).json({ message: 'Please add tracking information before marking as shipped' });
            }
        }

        // Staff can only set to received, and only if order is shipped
        if (status === 'received' && order.status !== 'shipped') {
            return res.status(400).json({ message: 'Can only receive shipped orders' });
        }

        
        // If received, update stock quantities
        if (status === 'received') {
            for (const item of order.items) {
                const stock = await Stock.findById(item.stock);
                if (!stock) {
                    return res.status(400).json({
                        message: `Cannot receive order: stock not found for one of the items (it may have been deleted)`
                    });
                }
                stock.quantity += item.quantity;
                await stock.save();
            }
        }

        order.status = status;
        if (status === 'approved') {
            order.approvedBy = req.user.id;
        }

        await order.save();
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update tracking info (admin only, only if approved or shipped)
const updateTrackingInfo = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can update tracking information' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status !== 'approved' && order.status !== 'shipped') {
            return res.status(400).json({ message: 'Can only update tracking for approved or shipped orders' });
        }

        const { trackingNumber, carrier, estimatedDelivery, notes } = req.body;

        order.trackingInfo = {
            trackingNumber: trackingNumber || order.trackingInfo?.trackingNumber,
            carrier: carrier || order.trackingInfo?.carrier,
            estimatedDelivery: estimatedDelivery || order.trackingInfo?.estimatedDelivery,
            notes: notes || order.trackingInfo?.notes,
            updatedAt: Date.now(),
        };

        await order.save();
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete order (admin only, draft or pending only)
const deleteOrder = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can delete orders' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status !== 'draft' && order.status !== 'pending') {
            return res.status(400).json({ message: 'Can only delete draft or pending orders' });
        }

        await order.deleteOne();
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getAllOrders, 
    getOrderById, 
    createOrder,
    submitOrder,
    updateOrderStatus, 
    updateOrder, 
    deleteOrder, 
    updateTrackingInfo 
};