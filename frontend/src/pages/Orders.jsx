import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../service/api';

const DesktopSidebar = ({ navigate, handleLogout, user }) => (
    <div style={{
        width: '240px', minHeight: '100vh', backgroundColor: 'white',
        borderRight: '1px solid #eee', padding: '20px 0',
        position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column',
    }}>
        <div style={{ padding: '0 20px 30px', borderBottom: '1px solid #eee' }}>
            <span style={{ color: '#ECBC76', fontWeight: 'bold', fontSize: '24px' }}>WIMS</span>
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#888' }}>Warehouse Inventory</p>
        </div>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{user?.name}</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#ECBC76' }}>{user?.role?.toUpperCase()}</p>
        </div>
        <nav style={{ flex: 1, padding: '20px 0' }}>
            {[
                { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
                { icon: '📦', label: 'Stock', path: '/stocks' },
                ...(user?.role === 'admin' ? [
                    { icon: '📋', label: 'Purchase Orders', path: '/orders' },
                    { icon: '👥', label: 'Suppliers', path: '/suppliers' },
                    { icon: '👤', label: 'Users', path: '/users' },
                ] : [
                    { icon: '📥', label: 'Inbound', path: '/inbound' },
                    { icon: '📤', label: 'Outbound', path: '/outbound' },
                    { icon: '📋', label: 'View Orders', path: '/orders' },
                ]),
                { icon: '🔔', label: 'Low Stock Alerts', path: '/alerts' },
                { icon: '⚙️', label: 'Adjustments', path: '/adjustments' },
            ].map((item) => (
                <div key={item.path} onClick={() => navigate(item.path)} style={{
                    padding: '12px 20px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px',
                    color: window.location.pathname === item.path ? '#ECBC76' : '#444',
                    fontWeight: window.location.pathname === item.path ? 'bold' : 'normal',
                    backgroundColor: window.location.pathname === item.path ? '#FFF8EC' : 'transparent',
                }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FFF8EC'}
                    onMouseLeave={e => {
                        if (window.location.pathname !== item.path)
                            e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <span>{item.icon}</span><span>{item.label}</span>
                </div>
            ))}
        </nav>
        <div style={{ padding: '20px', borderTop: '1px solid #eee' }}>
            <button onClick={handleLogout} style={{
                width: '100%', padding: '10px', backgroundColor: '#ECBC76',
                color: 'white', border: 'none', borderRadius: '8px',
                cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
            }}>Logout</button>
        </div>
    </div>
);

const MobileBottomNav = ({ navigate, user }) => (
    <div style={{
        position: 'sticky', bottom: 0, width: '100%', backgroundColor: 'white',
        display: 'flex', justifyContent: 'space-around', padding: '12px 0',
        borderTop: '1px solid #eee', zIndex: 100, borderRadius: '0 0 40px 40px',
    }}>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>👤</span>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/orders')}>📋</span>
        {user?.role === 'admin' && <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/suppliers')}>👥</span>}
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/alerts')}>🔔</span>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/adjustments')}>⚙️</span>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/stocks')}>🏭</span>
    </div>
);

const statusColor = (status) => {
    const colors = {
        draft: '#888', pending: '#FF9F1C', approved: '#52B788',
        shipped: '#56CFE1', received: '#7C83FD', cancelled: '#FF6B6B',
    };
    return colors[status] || '#888';
};

const inputStyle = {
    width: '100%', padding: '12px', border: '1.5px solid #ECBC76',
    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none',
};

const labelStyle = {
    fontSize: '14px', color: '#666', display: 'block',
    marginBottom: '6px', textAlign: 'left',
};

// Order Detail Component
const OrderDetail = ({ order, onBack, onUpdateStatus, onAddTracking, user }) => {
    const [trackingData, setTrackingData] = useState({
        carrier: order.trackingInfo?.carrier || '',
        trackingNumber: order.trackingInfo?.trackingNumber || '',
        estimatedDelivery: order.trackingInfo?.estimatedDelivery
            ? new Date(order.trackingInfo.estimatedDelivery).toISOString().split('T')[0]
            : '',
        notes: order.trackingInfo?.notes || '',
    });
    const [trackingError, setTrackingError] = useState('');

    const steps = ['Draft', 'Pending', 'Approved', 'Shipped', 'Received'];
    const currentStep = steps.findIndex(s => s.toLowerCase() === order.status) + 1;

    const handleTrackingSubmit = async () => {
        setTrackingError('');
        if (!trackingData.carrier || !trackingData.trackingNumber) {
            return setTrackingError('Please fill in carrier and tracking number');
        }
        await onAddTracking(order._id, trackingData);
    };

    return (
        <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <button onClick={onBack} style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#444',
                }}>←</button>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>Order Details</h2>
            </div>

            {/* Order Info */}
            <div style={{
                padding: '16px', backgroundColor: '#f9f9f9',
                borderRadius: '12px', marginBottom: '20px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <p style={{ margin: '0 0 6px', fontWeight: 'bold', fontSize: '18px' }}>{order.orderNumber}</p>
                        <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#666' }}>
                            Supplier: <strong>{order.supplier?.name}</strong>
                        </p>
                        <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#666' }}>
                            Date: {new Date(order.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                            Items: {order.items?.length}
                        </p>
                    </div>
                    <span style={{
                        color: statusColor(order.status), fontWeight: 'bold',
                        fontSize: '16px', backgroundColor: `${statusColor(order.status)}20`,
                        padding: '6px 14px', borderRadius: '20px',
                    }}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            {order.status !== 'cancelled' && (
                <div style={{ marginBottom: '24px' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: 'bold', fontSize: '14px' }}>Order Progress</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {steps.filter(s => s !== 'Draft').map((step, i) => {
                            const stepIndex = i + 2;
                            const isCompleted = currentStep >= stepIndex;
                            const isCurrent = currentStep === stepIndex;
                            return (
                                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                    <div style={{ textAlign: 'center', flex: 1 }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            backgroundColor: isCompleted ? '#ECBC76' : '#eee',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            margin: '0 auto 4px',
                                            border: isCurrent ? '3px solid #C9A84C' : 'none',
                                            color: isCompleted ? 'white' : '#aaa',
                                            fontSize: '14px', fontWeight: 'bold',
                                        }}>
                                            {isCompleted ? '✓' : i + 1}
                                        </div>
                                        <p style={{ margin: 0, fontSize: '11px', color: isCompleted ? '#ECBC76' : '#aaa' }}>{step}</p>
                                    </div>
                                    {i < 3 && (
                                        <div style={{
                                            height: '2px', flex: 1,
                                            backgroundColor: currentStep > stepIndex ? '#ECBC76' : '#eee',
                                        }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Items */}
            <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 12px', fontWeight: 'bold', fontSize: '14px' }}>Order Items</p>
                {order.items?.map((item, i) => (
                    <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between',
                        padding: '12px', border: '1px solid #eee',
                        borderRadius: '8px', marginBottom: '8px',
                    }}>
                        <div>
                            <p style={{ margin: '0 0 4px', fontWeight: '500', fontSize: '14px' }}>{item.stock?.name}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>SKU: {item.stock?.sku}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '14px' }}>x{item.quantity}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#ECBC76' }}>${item.unitPrice}/unit</p>
                        </div>
                    </div>
                ))}
                <div style={{
                    padding: '12px 16px', backgroundColor: '#FFF8EC',
                    borderRadius: '8px', display: 'flex', justifyContent: 'space-between',
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Total</p>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#ECBC76' }}>${order.totalAmount}</p>
                </div>
            </div>

            {/* Tracking Info Display (shipped/received) */}
            {(order.status === 'shipped' || order.status === 'received') && order.trackingInfo?.trackingNumber && (
                <div style={{
                    padding: '16px', backgroundColor: '#f0f9ff',
                    borderRadius: '12px', marginBottom: '20px',
                    border: '1px solid #56CFE1',
                }}>
                    <p style={{ margin: '0 0 12px', fontWeight: 'bold', fontSize: '14px', color: '#56CFE1' }}>
                        📦 Tracking Information
                    </p>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#666' }}>
                        Carrier: <strong>{order.trackingInfo.carrier}</strong>
                    </p>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#666' }}>
                        Tracking No: <strong>{order.trackingInfo.trackingNumber}</strong>
                    </p>
                    {order.trackingInfo.estimatedDelivery && (
                        <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#666' }}>
                            Est. Delivery: <strong>
                                {new Date(order.trackingInfo.estimatedDelivery).toLocaleDateString('en-AU', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </strong>
                        </p>
                    )}
                    {order.trackingInfo.notes && (
                        <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#666' }}>
                            Notes: {order.trackingInfo.notes}
                        </p>
                    )}
                </div>
            )}

            {/* Admin Actions */}
            {user?.role === 'admin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Pending → Approve/Cancel */}
                    {order.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => onUpdateStatus(order._id, 'approved')} style={{
                                flex: 1, padding: '14px', backgroundColor: '#52B788', color: 'white',
                                border: 'none', borderRadius: '8px', cursor: 'pointer',
                                fontWeight: 'bold', fontSize: '14px',
                            }}>✓ Approve Order</button>
                            <button onClick={() => onUpdateStatus(order._id, 'cancelled')} style={{
                                flex: 1, padding: '14px', backgroundColor: '#FF6B6B', color: 'white',
                                border: 'none', borderRadius: '8px', cursor: 'pointer',
                                fontWeight: 'bold', fontSize: '14px',
                            }}>✕ Cancel Order</button>
                        </div>
                    )}

                    {/* Approved → Add Tracking */}
                    {order.status === 'approved' && (
                        <div>
                            <p style={{ margin: '0 0 16px', fontWeight: 'bold', fontSize: '16px' }}>
                                Add Tracking Information
                            </p>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={labelStyle}>Carrier Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. DHL, FedEx, Australia Post"
                                    value={trackingData.carrier}
                                    onChange={(e) => setTrackingData({ ...trackingData, carrier: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={labelStyle}>Tracking Number</label>
                                <input
                                    type="text"
                                    placeholder="Enter tracking number"
                                    value={trackingData.trackingNumber}
                                    onChange={(e) => setTrackingData({ ...trackingData, trackingNumber: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={labelStyle}>Estimated Delivery Date</label>
                                <input
                                    type="date"
                                    value={trackingData.estimatedDelivery}
                                    onChange={(e) => setTrackingData({ ...trackingData, estimatedDelivery: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Notes (optional)</label>
                                <input
                                    type="text"
                                    placeholder="Any additional notes..."
                                    value={trackingData.notes}
                                    onChange={(e) => setTrackingData({ ...trackingData, notes: e.target.value })}
                                    style={{ ...inputStyle, border: '1.5px solid #ddd' }}
                                />
                            </div>
                            {trackingError && <p style={{ color: 'red', fontSize: '14px', marginBottom: '12px' }}>{trackingError}</p>}
                            <button onClick={handleTrackingSubmit} style={{
                                width: '100%', padding: '14px', backgroundColor: '#ECBC76', color: 'white',
                                border: 'none', borderRadius: '8px', cursor: 'pointer',
                                fontWeight: 'bold', fontSize: '14px',
                            }}>Save Tracking & Mark as Shipped</button>
                        </div>
                    )}

                    {/* Shipped → Mark Received */}
                    {order.status === 'shipped' && (
                        <button onClick={() => onUpdateStatus(order._id, 'received')} style={{
                            width: '100%', padding: '14px', backgroundColor: '#7C83FD', color: 'white',
                            border: 'none', borderRadius: '8px', cursor: 'pointer',
                            fontWeight: 'bold', fontSize: '14px',
                        }}>✓ Mark as Received</button>
                    )}
                </div>
            )}
        </div>
    );
};

const CreateOrderForm = ({ formData, setFormData, suppliers, stocks, handleSubmit, handleSave, setShowCreateForm, resetForm, error }) => {
    const addItem = () => {
        setFormData({ ...formData, items: [...formData.items, { stockId: '', quantity: '', unitPrice: '' }] });
    };

    const removeItem = (index) => {
        setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === 'stockId') {
            const stock = stocks.find(s => s._id === value);
            if (stock) newItems[index].unitPrice = stock.price;
        }
        setFormData({ ...formData, items: newItems });
    };

    const totalPrice = formData.items.reduce((sum, item) => {
        return sum + (Number(item.quantity) * Number(item.unitPrice) || 0);
    }, 0);

    const isEditing = !!formData.orderId;

    return (
        <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <button onClick={() => { setShowCreateForm(false); resetForm(); }} style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#444',
                }}>←</button>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>
                    {isEditing ? 'Edit Order' : 'Create Order'}
                </h2>
            </div>

            {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}

            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Supplier</label>
                <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    style={inputStyle}
                >
                    <option value="">Select supplier</option>
                    {suppliers.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Items</label>
                {formData.items.map((item, index) => (
                    <div key={index} style={{
                        padding: '16px', border: '1px solid #eee',
                        borderRadius: '12px', marginBottom: '12px', backgroundColor: '#fafafa',
                    }}>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ ...labelStyle, fontSize: '13px' }}>Product</label>
                            <select
                                value={item.stockId}
                                onChange={(e) => updateItem(index, 'stockId', e.target.value)}
                                style={{ ...inputStyle, border: '1.5px solid #ddd' }}
                            >
                                <option value="">Select product</option>
                                {stocks.map(s => (
                                    <option key={s._id} value={s._id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '13px' }}>Quantity</label>
                                <input
                                    type="number" min="1" value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                    style={{ ...inputStyle, border: '1.5px solid #ddd' }}
                                />
                            </div>
                            <div>
                                <label style={{ ...labelStyle, fontSize: '13px' }}>Unit Price ($)</label>
                                <input
                                    type="number" min="0" value={item.unitPrice}
                                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                                    style={{ ...inputStyle, border: '1.5px solid #ddd' }}
                                />
                            </div>
                        </div>
                        {formData.items.length > 1 && (
                            <button onClick={() => removeItem(index)} style={{
                                marginTop: '10px', padding: '4px 12px',
                                backgroundColor: '#FFE5E5', color: '#FF6B6B',
                                border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                            }}>Remove</button>
                        )}
                    </div>
                ))}
                <button onClick={addItem} type="button" style={{
                    color: '#ECBC76', background: 'none', border: 'none',
                    cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                }}>+ Add item</button>
            </div>

            <div style={{
                padding: '12px 16px', backgroundColor: '#FFF8EC',
                borderRadius: '8px', marginBottom: '20px',
            }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
                    Total Price: <span style={{ color: '#ECBC76' }}>${totalPrice.toFixed(2)}</span>
                </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                {!isEditing && (
                    <button onClick={handleSave} style={{
                        flex: 1, padding: '12px', backgroundColor: '#f0f0f0', color: '#444',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                    }}>Save Draft</button>
                )}
                <button onClick={handleSubmit} style={{
                    flex: 1, padding: '12px', backgroundColor: '#ECBC76', color: 'white',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                }}>Submit</button>
            </div>
            <button onClick={() => { setShowCreateForm(false); resetForm(); }} style={{
                width: '100%', padding: '12px', backgroundColor: '#222', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
            }}>Cancel</button>
        </div>
    );
};

function Orders() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [orders, setOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        orderId: '', supplierId: '',
        items: [{ stockId: '', quantity: '', unitPrice: '' }],
    });

    useEffect(() => {
        fetchData();
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const openId = searchParams.get('openId');
        if (openId && orders.length > 0){
            const target = orders.find(o => o._id === openId);
            if (target) setSelectedOrder(target);
        }
    }, [orders, searchParams]);



    const fetchData = async () => {
        try {
            const [orderRes, supplierRes, stockRes] = await Promise.all([
                API.get('/orders'),
                API.get('/suppliers'),
                API.get('/stocks'),
            ]);
            setOrders(orderRes.data);
            setSuppliers(supplierRes.data);
            setStocks(stockRes.data);
        } catch (err) {
            setError('Failed to fetch data');
        }
    };

    const resetForm = () => {
        setFormData({ orderId: '', supplierId: '', items: [{ stockId: '', quantity: '', unitPrice: '' }] });
        setError('');
    };

    const handleSave = async () => {
        setError('');
        if (!formData.supplierId) return setError('Please select a supplier');
        if (formData.items.some(i => !i.stockId || !i.quantity || !i.unitPrice)) {
            return setError('Please fill in all item fields');
        }
        try {
            await API.post('/orders', {
                supplier: formData.supplierId,
                items: formData.items.map(i => ({
                    stock: i.stockId, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice),
                })),
            });
            setSuccess('Order saved as draft!');
            setShowCreateForm(false);
            resetForm();
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save order');
        }
    };

    const handleSubmitOrder = async () => {
        setError('');
        if (!formData.supplierId) return setError('Please select a supplier');
        if (formData.items.some(i => !i.stockId || !i.quantity || !i.unitPrice)) {
            return setError('Please fill in all item fields');
        }
        try {
            let orderId = formData.orderId;
            if (orderId) {
                await API.put(`/orders/${orderId}`, {
                    supplier: formData.supplierId,
                    items: formData.items.map(i => ({
                        stock: i.stockId, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice),
                    })),
                });
            } else {
                const { data } = await API.post('/orders', {
                    supplier: formData.supplierId,
                    items: formData.items.map(i => ({
                        stock: i.stockId, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice),
                    })),
                });
                orderId = data._id;
            }
            await API.put(`/orders/${orderId}/submit`);
            setSuccess('Order submitted successfully!');
            setShowCreateForm(false);
            resetForm();
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit order');
        }
    };

    const handleEditOrder = (order) => {
        setFormData({
            orderId: order._id,
            supplierId: order.supplier?._id || '',
            items: order.items.map(i => ({
                stockId: i.stock?._id || '',
                quantity: i.quantity,
                unitPrice: i.unitPrice,
            })),
        });
        setShowCreateForm(true);
        setError('');
    };

    const handleUpdateStatus = async (orderId, status) => {
        try {
            await API.put(`/orders/${orderId}/status`, { status });
            setSuccess(`Order ${status} successfully!`);
            fetchData();
            // refresh selected order
            const { data } = await API.get('/orders');
            setOrders(data);
            const updated = data.find(o => o._id === orderId);
            if (updated) setSelectedOrder(updated);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleAddTracking = async (orderId, trackingData) => {
        try {
            await API.put(`/orders/${orderId}/tracking`, {
                trackingNumber: trackingData.trackingNumber,
                carrier: trackingData.carrier,
                estimatedDelivery: trackingData.estimatedDelivery,
                notes: trackingData.notes,
            });
            // Auto mark as shipped after adding tracking
            await API.put(`/orders/${orderId}/status`, { status: 'shipped' });
            setSuccess('Tracking added and order marked as shipped!');
            fetchData();
            const { data } = await API.get('/orders');
            setOrders(data);
            const updated = data.find(o => o._id === orderId);
            if (updated) setSelectedOrder(updated);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add tracking');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredOrders = orders.filter(o =>
        o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const OrderCard = ({ order }) => (
        <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: '20px', marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${statusColor(order.status)}`,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '16px' }}>{order.orderNumber}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#666' }}>{order.supplier?.name}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#666' }}>
                        {order.items?.length} items • ${order.totalAmount}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <span style={{ color: statusColor(order.status), fontWeight: 'bold', fontSize: '14px' }}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                    {user?.role === 'admin' && order.status === 'draft' && (
                        <button onClick={(e) => { e.stopPropagation(); handleEditOrder(order); }} style={{
                            padding: '4px 10px', backgroundColor: '#FF9F1C', color: 'white',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                        }}>Edit</button>
                    )}
                    {/* Arrow - click to view detail */}
                    <div
                        onClick={() => setSelectedOrder(order)}
                        style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            backgroundColor: '#222', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'white', fontSize: '16px',
                            cursor: 'pointer',
                        }}>→</div>
                </div>
            </div>
        </div>
    );

    const mainContent = () => {
        if (showCreateForm) {
            return (
                <CreateOrderForm
                    formData={formData}
                    setFormData={setFormData}
                    suppliers={suppliers}
                    stocks={stocks}
                    handleSubmit={handleSubmitOrder}
                    handleSave={handleSave}
                    setShowCreateForm={setShowCreateForm}
                    resetForm={resetForm}
                    error={error}
                />
            );
        }

        if (selectedOrder) {
            return (
                <OrderDetail
                    order={selectedOrder}
                    onBack={() => setSelectedOrder(null)}
                    onUpdateStatus={handleUpdateStatus}
                    onAddTracking={handleAddTracking}
                    user={user}
                />
            );
        }

        return (
            <>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#ECBC76', color: 'white' }}>
                                {['Order No.', 'Supplier', 'Items', 'Total', 'Date', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order, index) => (
                                    <tr key={order._id} style={{
                                        borderBottom: '1px solid #f0f0f0',
                                        backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                                    }}>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '500' }}>{order.orderNumber}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#666' }}>{order.supplier?.name}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#666' }}>{order.items?.length}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#ECBC76', fontWeight: '600' }}>${order.totalAmount}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#666' }}>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{
                                                color: statusColor(order.status), fontWeight: 'bold',
                                                fontSize: '13px', backgroundColor: `${statusColor(order.status)}20`,
                                                padding: '4px 10px', borderRadius: '20px',
                                            }}>
                                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                {user?.role === 'admin' && order.status === 'draft' && (
                                                    <button onClick={() => handleEditOrder(order)} style={{
                                                        padding: '6px 12px', backgroundColor: '#FF9F1C', color: 'white',
                                                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                                                    }}>Edit</button>
                                                )}
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    style={{
                                                        padding: '6px 14px', backgroundColor: '#222', color: 'white',
                                                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                                                    }}>View →</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    // 手机版
    if (isMobile) {
        return (
            <div style={{
                minHeight: '100vh', backgroundColor: '#ECBC76',
                display: 'flex', justifyContent: 'center',
                alignItems: 'flex-start', padding: '20px 0',
            }}>
                <div style={{
                    width: '390px', backgroundColor: '#f5f5f5',
                    minHeight: 'calc(100vh - 40px)', borderRadius: '40px',
                    overflow: 'hidden', boxShadow: '0 0 30px rgba(0,0,0,0.2)',
                    display: 'flex', flexDirection: 'column',
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '16px 20px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <span style={{ color: '#ECBC76', fontWeight: 'bold', fontSize: '20px' }}>WIMS</span>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            {user?.role === 'admin' && !showCreateForm && !selectedOrder && (
                                <span onClick={() => { setShowCreateForm(true); resetForm(); }} style={{ fontSize: '20px', cursor: 'pointer' }}>+</span>
                            )}
                            <span onClick={handleLogout} style={{ fontSize: '20px', cursor: 'pointer' }}>☰</span>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                        {showCreateForm ? (
                            <CreateOrderForm
                                formData={formData}
                                setFormData={setFormData}
                                suppliers={suppliers}
                                stocks={stocks}
                                handleSubmit={handleSubmitOrder}
                                handleSave={handleSave}
                                setShowCreateForm={setShowCreateForm}
                                resetForm={resetForm}
                                error={error}
                            />
                        ) : selectedOrder ? (
                            <OrderDetail
                                order={selectedOrder}
                                onBack={() => setSelectedOrder(null)}
                                onUpdateStatus={handleUpdateStatus}
                                onAddTracking={handleAddTracking}
                                user={user}
                            />
                        ) : (
                            <>
                                <h2 style={{ margin: '0 0 16px', fontWeight: 'bold', fontSize: '22px' }}>Purchase Order</h2>
                                <div style={{
                                    backgroundColor: 'white', borderRadius: '20px',
                                    padding: '10px 16px', display: 'flex',
                                    alignItems: 'center', gap: '8px', marginBottom: '16px',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                }}>

                                    <input
                                        placeholder="Search by Order No., Supplier or Order Status"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#888' }}
                                    />
                                </div>
                                {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
                                {success && <p style={{ color: 'green', fontSize: '14px' }}>{success}</p>}
                                {filteredOrders.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>No orders found</div>
                                ) : (
                                    filteredOrders.map(order => <OrderCard key={order._id} order={order} />)
                                )}
                            </>
                        )}
                    </div>
                    <MobileBottomNav navigate={navigate} user={user} />
                </div>
            </div>
        );
    }

    // 桌面版
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <DesktopSidebar navigate={navigate} handleLogout={handleLogout} user={user} />
            <div style={{ marginLeft: '240px', flex: 1, padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
                        {selectedOrder ? 'Order Details' : 'Purchase Orders'}
                    </h1>
                    {!showCreateForm && !selectedOrder && (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{
                                backgroundColor: 'white', borderRadius: '20px',
                                padding: '10px 16px', display: 'flex',
                                alignItems: 'center', gap: '8px',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.08)', width: '280px',
                            }}>
                               
                                <input
                                    placeholder="Search by Order No., Supplier or Order Status"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#888' }}
                                />
                            </div>
                            {user?.role === 'admin' && (
                                <button onClick={() => { setShowCreateForm(true); resetForm(); }} style={{
                                    padding: '10px 20px', backgroundColor: '#ECBC76',
                                    color: 'white', border: 'none', borderRadius: '8px',
                                    cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                                }}>+ Create Order</button>
                            )}
                        </div>
                    )}
                </div>
                {mainContent()}
            </div>
        </div>
    );
}

export default Orders;