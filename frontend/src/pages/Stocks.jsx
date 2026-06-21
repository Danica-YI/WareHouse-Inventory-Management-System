import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../service/api';
import { DesktopSidebar, MobileBottomNav } from '../pages/layout';


// Stock Form
const StockForm = ({ formData, setFormData, handleSubmit, editingStock, setShowForm, setEditingStock }) => (
    <form onSubmit={handleSubmit} style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
        <h3 style={{ margin: '0 0 20px', color: '#222' }}>
            {editingStock ? 'Edit Stock' : 'Add New Stock'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
                { field: 'name', label: 'Product Name', type: 'text', required: true },
                { field: 'sku', label: 'SKU', type: 'text', required: true },
                { field: 'category', label: 'Category', type: 'text', required: true },
                { field: 'quantity', label: 'Quantity', type: 'number', required: true },
                { field: 'unit', label: 'Unit', type: 'text', required: true },
                { field: 'price', label: 'Price ($)', type: 'number', required: true },
                { field: 'lowStockThreshold', label: 'Low Stock Threshold', type: 'number', required: true },
                { field: 'description', label: 'Description', type: 'text', required: false },
            ].map(({ field, label, type, required }) => (
                <div key={field}>
                    <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>{label}</label>
                    <input
                        type={type}
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        required={required}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1.5px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            outline: 'none',
                        }}
                    />
                </div>
            ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" style={{
                padding: '10px 24px',
                backgroundColor: '#ECBC76',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
            }}>
                {editingStock ? 'Update' : 'Add Stock'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingStock(null); }} style={{
                padding: '10px 24px',
                backgroundColor: '#f5f5f5',
                color: '#444',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
            }}>
                Cancel
            </button>
        </div>
    </form>
);

function Stocks() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [stocks, setStocks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingStock, setEditingStock] = useState(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '', sku: '', category: '', quantity: '', unit: '', price: '', lowStockThreshold: '', description: ''
    });

    useEffect(() => {
        fetchStocks();
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchStocks = async () => {
        try {
            const { data } = await API.get('/stocks');
            setStocks(data);
        } catch (err) {
            setError('Failed to fetch stocks');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingStock) {
                await API.put(`/stocks/${editingStock._id}`, formData);
            } else {
                await API.post('/stocks', formData);
            }
            setShowForm(false);
            setEditingStock(null);
            setFormData({ name: '', sku: '', category: '', quantity: '', unit: '', price: '', lowStockThreshold: '', description: '' });
            fetchStocks();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (stock) => {
        setEditingStock(stock);
        setFormData({
            name: stock.name,
            sku: stock.sku,
            category: stock.category,
            quantity: stock.quantity,
            unit: stock.unit,
            price: stock.price,
            lowStockThreshold: stock.lowStockThreshold,
            description: stock.description || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await API.delete(`/stocks/${id}`);
                fetchStocks();
            } catch (err) {
                setError('Failed to delete stock');
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredStocks = stocks.filter(stock =>
        stock.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // mobile
    if (isMobile) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#ECBC76',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '20px 0',
            }}>
                <div style={{
                    width: '390px',
                    backgroundColor: '#f5f5f5',
                    minHeight: 'calc(100vh - 40px)',
                    borderRadius: '40px',
                    overflow: 'hidden',
                    boxShadow: '0 0 30px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <span style={{ color: '#ECBC76', fontWeight: 'bold', fontSize: '20px' }}>WIMS</span>
                        <span onClick={handleLogout} style={{ fontSize: '20px', cursor: 'pointer' }}>☰</span>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                        <h2 style={{ margin: '0 0 16px', fontWeight: 'bold', fontSize: '22px' }}>Stock Dashboard</h2>

                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            padding: '10px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '20px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                        }}>
                            <span style={{ color: '#aaa' }}>🔍</span>
                            <input
                                placeholder="Search by Product ID"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#888' }}
                            />
                        </div>

                        <div onClick={() => navigate('/Inbound')} style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '20px',
                            marginBottom: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            cursor: 'pointer',
                        }}>
                            <p style={{ margin: '0 0 12px', fontWeight: 'bold', fontSize: '16px' }}>Inbound Order</p>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                backgroundColor: '#222', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: 'white', fontSize: '18px',
                            }}>→</div>
                        </div>

                        <div onClick={() => navigate('/Outbound')} style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '20px',
                            marginBottom: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            cursor: 'pointer',
                        }}>
                            <p style={{ margin: '0 0 12px', fontWeight: 'bold', fontSize: '16px' }}>Outbound Order</p>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                backgroundColor: '#222', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: 'white', fontSize: '18px',
                            }}>→</div>
                        </div>

                        {filteredStocks.map((stock) => (
                            <div key={stock._id} style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                padding: '16px',
                                marginBottom: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                borderLeft: `4px solid ${stock.quantity <= stock.lowStockThreshold ? '#FF6B6B' : '#ECBC76'}`,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{stock.name}</p>
                                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>{stock.sku} • {stock.category}</p>
                                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>Qty: {stock.quantity} {stock.unit}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontWeight: 'bold', color: '#ECBC76' }}>${stock.price}</p>
                                        {stock.quantity <= stock.lowStockThreshold && (
                                            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#FF6B6B' }}>⚠️ Low Stock</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <MobileBottomNav navigate={navigate} user={user} />
                </div>
            </div>
        );
    }

    // desktop

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <DesktopSidebar navigate={navigate} handleLogout={handleLogout} user={user} activePath= '/stocks' />

            <div style={{ marginLeft: '240px', flex: 1, padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Stock Management</h1>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            padding: '10px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                            width: '250px',
                        }}>
                           
                            <input
                                placeholder="Search stocks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#888' }}
                            />
                        </div>
                        {user?.role === 'admin' && (
                            <button onClick={() => {
                                setShowForm(!showForm);
                                setEditingStock(null);
                                setFormData({ name: '', sku: '', category: '', quantity: '', unit: '', price: '', lowStockThreshold: '', description: '' });
                            }} style={{
                                padding: '10px 20px',
                                backgroundColor: '#ECBC76',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px',
                            }}>
                                + Add Stock
                            </button>
                        )}
                    </div>
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                {/* Inbound & Outbound */}
                <div style={{ display:'flex', gap:'20px', marginBottom: '24px' }}>
                    <div onClick={() => navigate('/Inbound')} style ={{
                        flex: 1,
                        backgroundColor:'white',
                        borderRadius:'16px',
                        padding:'20px 24px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor:'pointer',
                        display:'flex',
                        justifyContent:'space-between',
                        alignItems:'center',
                        transition:'transform 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        
                    >
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>Inbound Order</p>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            backgroundColor: '#222', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'white', fontSize: '18px',
                        }}>→</div>
                    </div>
                    <div onClick={() => navigate('/Outbound')} style={{
                        flex: 1,
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'transform 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>Outbound Order</p>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            backgroundColor: '#222', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'white', fontSize: '18px',
                        }}>→</div>
                    </div>
                </div>


                {showForm && (
                    <StockForm
                        formData={formData}
                        setFormData={setFormData}
                        handleSubmit={handleSubmit}
                        editingStock={editingStock}
                        setShowForm={setShowForm}
                        setEditingStock={setEditingStock}
                    />
                )}

                <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#ECBC76', color: 'white' }}>
                                {['Name', 'SKU', 'Category', 'Quantity', 'Unit', 'Price', 'Status', ...(user?.role === 'admin' ? ['Actions'] : [])].map(h => (
                                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStocks.length === 0 ? (
                                <tr>
                                    <td colSpan={user?.role === 'admin' ? 8 : 7} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                        No stocks found
                                    </td>
                                </tr>
                            ) : (
                                filteredStocks.map((stock, index) => (
                                    <tr key={stock._id} style={{
                                        borderBottom: '1px solid #f0f0f0',
                                        backgroundColor: stock.quantity <= stock.lowStockThreshold ? '#FFF5F5' : index % 2 === 0 ? 'white' : '#fafafa',
                                    }}>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '500' }}>{stock.name}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#666' }}>{stock.sku}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#666' }}>{stock.category}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600' }}>{stock.quantity}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#666' }}>{stock.unit}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#ECBC76', fontWeight: '600' }}>${stock.price}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            {stock.quantity <= stock.lowStockThreshold ? (
                                                <span style={{ backgroundColor: '#FFE5E5', color: '#FF6B6B', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>⚠️ Low Stock</span>
                                            ) : (
                                                <span style={{ backgroundColor: '#E5F5E5', color: '#52B788', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>✅ OK</span>
                                            )}
                                        </td>
                                        {user?.role === 'admin' && (
                                            <td style={{ padding: '14px 16px' }}>
                                                <button onClick={() => handleEdit(stock)} style={{
                                                    marginRight: '8px', padding: '6px 14px',
                                                    backgroundColor: '#FF9F1C', color: 'white',
                                                    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                                                }}>Edit</button>
                                                <button onClick={() => handleDelete(stock._id)} style={{
                                                    padding: '6px 14px', backgroundColor: '#FF6B6B',
                                                    color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                                                }}>Delete</button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Stocks;