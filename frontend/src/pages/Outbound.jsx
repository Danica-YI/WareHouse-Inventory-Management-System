import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../service/api';
import { MobileBottomNav, DesktopSidebar } from '../pages/Layout';


const labelStyle = {
    fontSize: '14px', color: '#666',
    display: 'block', marginBottom: '6px',
    textAlign: 'left',
};

const inputStyle = {
    width: '100%', padding: '12px',
    border: '1.5px solid #ECBC76', borderRadius: '8px',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none',
};

const inputStyleGray = {
    ...inputStyle,
    border: '1.5px solid #ddd',
    backgroundColor: '#f9f9f9', color: '#666',
};

const OutboundForm = ({ formData, setFormData, handleSubmit, handleProductSearch, suppliers, error, success }) => (
    <div style={{
        backgroundColor: 'white', borderRadius: '16px',
        padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
        <h2 style={{ margin: '0 0 24px', fontSize: '22px', fontWeight: 'bold', textAlign: 'left' }}>
            Record Outbound Stock
        </h2>

        {/* Transaction Type */}
        <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Transaction Type</label>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'outbound_sale', supplierId: '' })}
                    style={{
                        padding: '10px 30px',
                        backgroundColor: formData.type === 'outbound_sale' ? '#ECBC76' : '#f0f0f0',
                        color: formData.type === 'outbound_sale' ? 'white' : '#444',
                        border: 'none', borderRadius: '8px',
                        cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                    }}
                >Sale</button>
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'outbound_return' })}
                    style={{
                        padding: '10px 30px',
                        backgroundColor: formData.type === 'outbound_return' ? '#ECBC76' : '#f0f0f0',
                        color: formData.type === 'outbound_return' ? 'white' : '#444',
                        border: 'none', borderRadius: '8px',
                        cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                    }}
                >Return</button>
            </div>
        </div>

        <form onSubmit={handleSubmit}>
            {/* Product ID */}
            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Product ID (SKU)</label>
                <input
                    type="text"
                    placeholder="Enter Product ID"
                    value={formData.sku}
                    onChange={(e) => {
                        setFormData({ ...formData, sku: e.target.value, productName: '', stockId: '' });
                        handleProductSearch(e.target.value);
                    }}
                    required
                    style={inputStyle}
                />
            </div>

            {/* Product Name - Auto filled */}
            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Product Name</label>
                <input
                    type="text"
                    placeholder="Auto-filled"
                    value={formData.productName}
                    readOnly
                    style={inputStyleGray}
                />
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Quantity</label>
                <input
                    type="number"
                    min="1"
                    placeholder="Enter Quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    style={inputStyle}
                />
            </div>

            {/* Date */}
            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Date</label>
                <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    style={inputStyle}
                />
            </div>

            {/* Supplier - only for return */}
            {formData.type === 'outbound_return' && (
                <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Supplier</label>
                    <select
                        value={formData.supplierId}
                        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                        required
                        style={inputStyle}
                    >
                        <option value="">Select Supplier</option>
                        {suppliers.map(s => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Reason */}
            <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Reason (optional)</label>
                <input
                    type="text"
                    placeholder="Enter reason..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    style={inputStyleGray}
                />
            </div>

            {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}
            {success && <p style={{ color: 'green', fontSize: '14px', marginBottom: '16px' }}>{success}</p>}

            <button type="submit" style={{
                width: '100%', padding: '14px',
                backgroundColor: '#ECBC76', color: 'white',
                border: 'none', borderRadius: '8px',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '16px',
            }}>Confirm</button>
        </form>
    </div>
);

function Outbound() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [recentMovements, setRecentMovements] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [formData, setFormData] = useState({
        type: 'outbound_sale',
        sku: '',
        stockId: '',
        productName: '',
        quantity: '',
        date: new Date().toISOString().split('T')[0],
        reason: '',
        supplierId: '',
    });

    useEffect(() => {
        fetchData();
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchData = async () => {
        try {
            const [movRes, supplierRes] = await Promise.all([
                API.get('/movements'),
                API.get('/suppliers'),
            ]);
            setRecentMovements(movRes.data.filter(m =>
                m.type === 'outbound_sale' || m.type === 'outbound_return'
            ).slice(0, 10));
            setSuppliers(supplierRes.data);
        } catch (err) {
            console.error('Failed to fetch data');
        }
    };

    const handleProductSearch = async (sku) => {
        if (!sku) return;
        try {
            const { data } = await API.get('/stocks');
            const found = data.find(s => s.sku.toLowerCase() === sku.toLowerCase());
            if (found) {
                setFormData(prev => ({ ...prev, stockId: found._id, productName: found.name }));
            } else {
                setFormData(prev => ({ ...prev, stockId: '', productName: '' }));
            }
        } catch (err) {
            console.error('Failed to search product');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.stockId) {
            return setError('Product not found. Please check the SKU.');
        }
        if (formData.type === 'outbound_return' && !formData.supplierId) {
            return setError('Please select a supplier for return.');
        }
        try {
            await API.post('/movements', {
                stockId: formData.stockId,
                type: formData.type,
                quantity: Number(formData.quantity),
                reason: formData.reason,
                supplierId: formData.type === 'outbound_return' ? formData.supplierId : null,
            });
            setSuccess('Outbound recorded successfully!');
            setFormData({
                type: 'outbound_sale',
                sku: '', stockId: '', productName: '',
                quantity: '', date: new Date().toISOString().split('T')[0],
                reason: '', supplierId: '',
            });
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to record outbound');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // mobile
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
                        <span onClick={handleLogout} style={{ fontSize: '20px', cursor: 'pointer' }}>☰</span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                        <OutboundForm
                            formData={formData}
                            setFormData={setFormData}
                            handleSubmit={handleSubmit}
                            handleProductSearch={handleProductSearch}
                            suppliers={suppliers}
                            error={error}
                            success={success}
                        />
                    </div>
                    <MobileBottomNav navigate={navigate} />
                </div>
            </div>
        );
    }

    // desktop
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <DesktopSidebar navigate={navigate} handleLogout={handleLogout} user={user} activePath='/outbound'/>
            <div style={{ marginLeft: '240px', flex: 1, padding: '30px' }}>
                <h1 style={{ margin: '0 0 24px', fontSize: '28px', fontWeight: 'bold' }}>Outbound Management</h1>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Left: Form */}
                    <OutboundForm
                        formData={formData}
                        setFormData={setFormData}
                        handleSubmit={handleSubmit}
                        handleProductSearch={handleProductSearch}
                        suppliers={suppliers}
                        error={error}
                        success={success}
                    />

                    {/* Right: Recent Records */}
                    <div>
                        <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 'bold' }}>Recent Outbound Records</h2>
                        {recentMovements.length === 0 ? (
                            <div style={{
                                backgroundColor: 'white', borderRadius: '16px',
                                padding: '40px', textAlign: 'center', color: '#888',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            }}>No outbound records yet</div>
                        ) : (
                            recentMovements.map((m) => (
                                <div key={m._id} style={{
                                    backgroundColor: 'white', borderRadius: '16px',
                                    padding: '16px', marginBottom: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    borderLeft: `4px solid ${m.type === 'outbound_sale' ? '#FF6B6B' : '#FF9F1C'}`,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '14px' }}>{m.stock?.name}</p>
                                            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#888' }}>SKU: {m.stock?.sku}</p>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Qty: {m.quantity}</p>
                                            {m.supplier && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>Supplier: {m.supplier?.name}</p>}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{
                                                backgroundColor: m.type === 'outbound_sale' ? '#FFE5E5' : '#FFF0E0',
                                                color: m.type === 'outbound_sale' ? '#FF6B6B' : '#FF9F1C',
                                                padding: '4px 8px', borderRadius: '20px', fontSize: '11px',
                                            }}>
                                                {m.type === 'outbound_sale' ? 'Sale' : 'Return'}
                                            </span>
                                            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#aaa' }}>
                                                {new Date(m.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Outbound;