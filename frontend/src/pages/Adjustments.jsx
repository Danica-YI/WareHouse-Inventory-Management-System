import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../service/api';
import { MobileBottomNav, DesktopSidebar } from '../pages/layout';

const inputStyle = {
    width: '100%', padding: '12px', border: '1.5px solid #ECBC76',
    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none',
};

const labelStyle = {
    fontSize: '14px', color: '#666', display: 'block',
    marginBottom: '6px', textAlign: 'left',
};

// Submit Adjustment Form — 在外面定义
const SubmitAdjustmentForm = ({ selectedStock, formData, setFormData, handleSubmit, onBack, error, success }) => {
    const difference = Number(formData.actualQty) - selectedStock.quantity;

    return (
        <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <button onClick={onBack} style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#444',
                }}>←</button>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Submit Adjustment Request</h2>
            </div>

            {/* Product ID */}
            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Product ID</label>
                <input
                    type="text"
                    value={selectedStock.sku}
                    readOnly
                    style={{ ...inputStyle, backgroundColor: '#f9f9f9', color: '#888', border: '1.5px solid #ddd' }}
                />
            </div>

            {/* Product Name */}
            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Product Name</label>
                <input
                    type="text"
                    value={selectedStock.name}
                    readOnly
                    style={{ ...inputStyle, backgroundColor: '#f9f9f9', color: '#888', border: '1.5px solid #ddd' }}
                />
            </div>

            {/* Current System Stock */}
            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Current System Stock</label>
                <input
                    type="number"
                    value={selectedStock.quantity}
                    readOnly
                    style={{ ...inputStyle, backgroundColor: '#f9f9f9', color: '#888', border: '1.5px solid #ddd' }}
                />
            </div>

            {/* Proposed New Stock */}
            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Proposed New Stock</label>
                <input
                    type="number"
                    min="0"
                    value={formData.actualQty}
                    onChange={(e) => setFormData({ ...formData, actualQty: e.target.value })}
                    style={inputStyle}
                />
            </div>

            {/* Difference */}
            {formData.actualQty !== '' && (
                <div style={{
                    padding: '10px 16px', borderRadius: '8px', marginBottom: '16px',
                    backgroundColor: difference === 0 ? '#E5F5E5' : '#FFE5E5',
                    color: difference === 0 ? '#52B788' : '#FF6B6B',
                    fontWeight: 'bold', fontSize: '14px', textAlign: 'center',
                }}>
                    {difference === 0 ? 'No difference' : `Differences: ${difference > 0 ? '+' : ''}${difference} unit${Math.abs(difference) !== 1 ? 's' : ''}!`}
                </div>
            )}

            {/* Reason */}
            <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Reason for Adjustment</label>
                <input
                    type="text"
                    placeholder="Explain the reason..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    style={inputStyle}
                />
            </div>

            {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}
            {success && <p style={{ color: 'green', fontSize: '14px', marginBottom: '12px' }}>{success}</p>}

            <button onClick={handleSubmit} style={{
                width: '100%', padding: '14px', backgroundColor: '#ECBC76', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px',
                marginBottom: '10px',
            }}>Submit</button>
            <button onClick={onBack} style={{
                width: '100%', padding: '14px', backgroundColor: '#222', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px',
            }}>Cancel</button>
        </div>
    );
};

// Reject Form — 在外面定义
const RejectForm = ({ rejectReason, setRejectReason, onConfirm, onCancel }) => (
    <div style={{ marginTop: '12px' }}>
        <label style={labelStyle}>Reason for Rejection</label>
        <input
            type="text"
            placeholder="Explain the reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            style={inputStyle}
        />
        <button onClick={onConfirm} style={{
            width: '100%', padding: '12px', backgroundColor: '#ECBC76', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
            marginTop: '10px',
        }}>Confirm</button>
        <button onClick={onCancel} style={{
            width: '100%', padding: '10px', backgroundColor: '#f0f0f0', color: '#444',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
            marginTop: '6px',
        }}>Cancel</button>
    </div>
);

function Adjustments() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [stocks, setStocks] = useState([]);
    const [adjustments, setAdjustments] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [actualCounts, setActualCounts] = useState({});
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({ actualQty: '', reason: '' });

    useEffect(() => {
        fetchData();
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchData = async () => {
        try {
            const [stockRes, adjRes] = await Promise.all([
                API.get('/stocks'),
                API.get('/adjustments'),
            ]);
            setStocks(stockRes.data);
            setAdjustments(adjRes.data);
        } catch (err) {
            setError('Failed to fetch data');
        }
    };

    const handleSelectStock = (stock) => {
        setSelectedStock(stock);
        setFormData({
            actualQty: actualCounts[stock._id] || '',
            reason: '',
        });
        setError('');
        setSuccess('');
    };

    const handleSubmitAdjustment = async () => {
        setError('');
        if (!formData.actualQty) return setError('Please enter proposed new stock');
        if (!formData.reason) return setError('Please enter a reason');
        if (Number(formData.actualQty) === selectedStock.quantity) {
            return setError('Proposed stock is same as current stock');
        }
        try {
            await API.post('/adjustments', {
                stock: selectedStock._id,
                current_qty: selectedStock.quantity,
                actual_qty: Number(formData.actualQty),
                reason: formData.reason,
            });
            setSuccess('Adjustment request submitted!');
            setActualCounts({ ...actualCounts, [selectedStock._id]: formData.actualQty });
            fetchData();
            setTimeout(() => {
                setSuccess('');
                setSelectedStock(null);
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit');
        }
    };

    const handleApprove = async (adjId) => {
        try {
            await API.put(`/adjustments/${adjId}`, { status: 'approved' });
            setSuccess('Adjustment approved!');
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve');
        }
    };

    const handleReject = async (adjId) => {
        if (!rejectReason) return setError('Please enter a reason for rejection');
        try {
            await API.put(`/adjustments/${adjId}`, { status: 'rejected', notes: rejectReason });
            setSuccess('Adjustment rejected!');
            setRejectingId(null);
            setRejectReason('');
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredStocks = stocks.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingAdjustments = adjustments.filter(a => a.status === 'pending');

    // Staff Stock Count View
    const StockCountView = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontWeight: 'bold', fontSize: '22px' }}>Stock Count</h2>
            </div>

            {/* Search */}
            <div style={{
                backgroundColor: 'white', borderRadius: '20px',
                padding: '10px 16px', display: 'flex',
                alignItems: 'center', gap: '8px', marginBottom: '16px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}>
                <span style={{ color: '#aaa' }}>🔍</span>
                <input
                    placeholder="Search by Product ID or Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#888' }}
                />
            </div>

            {filteredStocks.map((stock) => {
                const actual = actualCounts[stock._id];
                const isConsistent = actual !== undefined && Number(actual) === stock.quantity;
                const isInconsistent = actual !== undefined && Number(actual) !== stock.quantity;

                return (
                    <div key={stock._id} style={{
                        backgroundColor: 'white', borderRadius: '16px',
                        padding: '16px', marginBottom: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div>
                                <p style={{ margin: '0 0 2px', fontWeight: 'bold', fontSize: '14px' }}>{stock.sku}</p>
                                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{stock.name}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#888' }}>System Stock:</p>
                                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{stock.quantity}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                            <label style={{ ...labelStyle, fontSize: '13px' }}>Actual Count</label>
                            <input
                                type="number"
                                min="0"
                                placeholder={String(stock.quantity)}
                                value={actualCounts[stock._id] || ''}
                                onChange={(e) => setActualCounts({ ...actualCounts, [stock._id]: e.target.value })}
                                style={{
                                    ...inputStyle,
                                    border: isInconsistent ? '1.5px solid #FF6B6B' : isConsistent ? '1.5px solid #52B788' : '1.5px solid #ECBC76',
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {isConsistent && (
                                <span style={{
                                    backgroundColor: '#E5F5E5', color: '#52B788',
                                    padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold',
                                }}>Consistent ✓</span>
                            )}
                            {isInconsistent && (
                                <span style={{
                                    backgroundColor: '#FFE5E5', color: '#FF6B6B',
                                    padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold',
                                }}>✗ Inconsistent</span>
                            )}
                            {!actual && <span />}

                            {isInconsistent && (
                                <div
                                    onClick={() => handleSelectStock(stock)}
                                    style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        backgroundColor: '#222', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: 'white', fontSize: '16px', cursor: 'pointer',
                                    }}>→</div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    // Admin Adjustments View
    const AdminAdjustmentsView = () => (
        <div>
            <h2 style={{ margin: '0 0 16px', fontWeight: 'bold', fontSize: '22px' }}>
                Approve Adjustment Request
            </h2>

            {pendingAdjustments.length === 0 && (
                <div style={{
                    backgroundColor: 'white', borderRadius: '16px',
                    padding: '40px', textAlign: 'center', color: '#888',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px',
                }}>No pending adjustment requests</div>
            )}

            <p style={{ margin: '0 0 12px', fontWeight: 'bold', fontSize: '14px', color: '#888' }}>
                Pending Request List
            </p>

            {pendingAdjustments.map((adj) => (
                <div key={adj._id} style={{
                    backgroundColor: 'white', borderRadius: '16px',
                    padding: '20px', marginBottom: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    borderLeft: '4px solid #FF9F1C',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                            <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '15px' }}>
                                {adj.stock?.sku} — {adj.stock?.name}
                            </p>
                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>
                                Requested by: <strong>{adj.requestedBy?.name}</strong>
                            </p>
                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>
                                Current: <strong>{adj.current_qty}</strong> → Proposed: <strong>{adj.actual_qty}</strong>
                            </p>
                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>
                                Difference: <span style={{
                                    color: adj.actual_qty - adj.current_qty > 0 ? '#52B788' : '#FF6B6B',
                                    fontWeight: 'bold',
                                }}>
                                    {adj.actual_qty - adj.current_qty > 0 ? '+' : ''}{adj.actual_qty - adj.current_qty}
                                </span>
                            </p>
                        </div>
                        <span style={{
                            color: '#FF9F1C', fontWeight: 'bold', fontSize: '13px',
                            backgroundColor: '#FFF0E0', padding: '4px 10px',
                            borderRadius: '20px', height: 'fit-content',
                        }}>Pending</span>
                    </div>

                    <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#666' }}>
                        Reason: {adj.reason}
                    </p>

                    {rejectingId !== adj._id ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleApprove(adj._id)} style={{
                                flex: 1, padding: '10px', backgroundColor: '#52B788', color: 'white',
                                border: 'none', borderRadius: '8px', cursor: 'pointer',
                                fontWeight: 'bold', fontSize: '14px',
                            }}>Approve</button>
                            <span style={{ display: 'flex', alignItems: 'center', color: '#888', fontSize: '13px' }}>or</span>
                            <button onClick={() => { setRejectingId(adj._id); setRejectReason(''); }} style={{
                                flex: 1, padding: '10px', backgroundColor: '#ECBC76', color: 'white',
                                border: 'none', borderRadius: '8px', cursor: 'pointer',
                                fontWeight: 'bold', fontSize: '14px',
                            }}>Reject</button>
                        </div>
                    ) : (
                        <RejectForm
                            rejectReason={rejectReason}
                            setRejectReason={setRejectReason}
                            onConfirm={() => handleReject(adj._id)}
                            onCancel={() => { setRejectingId(null); setRejectReason(''); }}
                        />
                    )}
                </div>
            ))}

            {/* All adjustments history */}
            {adjustments.filter(a => a.status !== 'pending').length > 0 && (
                <div style={{ marginTop: '24px' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: 'bold', fontSize: '14px', color: '#888' }}>History</p>
                    {adjustments.filter(a => a.status !== 'pending').map((adj) => (
                        <div key={adj._id} style={{
                            backgroundColor: 'white', borderRadius: '16px',
                            padding: '16px', marginBottom: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            borderLeft: `4px solid ${adj.status === 'approved' ? '#52B788' : '#FF6B6B'}`,
                            opacity: 0.8,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '14px' }}>
                                        {adj.stock?.sku} — {adj.stock?.name}
                                    </p>
                                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>
                                        {adj.current_qty} → {adj.actual_qty}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>
                                        {new Date(adj.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span style={{
                                    color: adj.status === 'approved' ? '#52B788' : '#FF6B6B',
                                    fontWeight: 'bold', fontSize: '13px',
                                    backgroundColor: adj.status === 'approved' ? '#E5F5E5' : '#FFE5E5',
                                    padding: '4px 10px', borderRadius: '20px', height: 'fit-content',
                                }}>
                                    {adj.status?.charAt(0).toUpperCase() + adj.status?.slice(1)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // Staff submitted requests view
    const StaffRequestsView = () => (
        <div style={{ marginTop: '24px' }}>
            <p style={{ margin: '0 0 12px', fontWeight: 'bold', fontSize: '14px', color: '#888' }}>My Submitted Requests</p>
            {adjustments.length === 0 ? (
                <div style={{
                    backgroundColor: 'white', borderRadius: '16px',
                    padding: '20px', textAlign: 'center', color: '#888',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}>No requests submitted yet</div>
            ) : (
                adjustments.map((adj) => (
                    <div key={adj._id} style={{
                        backgroundColor: 'white', borderRadius: '16px',
                        padding: '16px', marginBottom: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        borderLeft: `4px solid ${adj.status === 'approved' ? '#52B788' : adj.status === 'rejected' ? '#FF6B6B' : '#FF9F1C'}`,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '14px' }}>
                                    {adj.stock?.sku} — {adj.stock?.name}
                                </p>
                                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>
                                    {adj.current_qty} → {adj.actual_qty}
                                </p>
                                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>
                                    Reason: {adj.reason}
                                </p>
                                <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>
                                    {new Date(adj.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <span style={{
                                color: adj.status === 'approved' ? '#52B788' : adj.status === 'rejected' ? '#FF6B6B' : '#FF9F1C',
                                fontWeight: 'bold', fontSize: '13px',
                                backgroundColor: adj.status === 'approved' ? '#E5F5E5' : adj.status === 'rejected' ? '#FFE5E5' : '#FFF0E0',
                                padding: '4px 10px', borderRadius: '20px', height: 'fit-content',
                            }}>
                                {adj.status?.charAt(0).toUpperCase() + adj.status?.slice(1)}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

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
                        <span onClick={handleLogout} style={{ fontSize: '20px', cursor: 'pointer' }}>☰</span>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
                        {success && <p style={{ color: 'green', fontSize: '14px' }}>{success}</p>}

                        {selectedStock ? (
                            <SubmitAdjustmentForm
                                selectedStock={selectedStock}
                                formData={formData}
                                setFormData={setFormData}
                                handleSubmit={handleSubmitAdjustment}
                                onBack={() => { setSelectedStock(null); setError(''); setSuccess(''); }}
                                error={error}
                                success={success}
                            />
                        ) : user?.role === 'staff' ? (
                            <>
                                <StockCountView />
                                <StaffRequestsView />
                            </>
                        ) : (
                            <AdminAdjustmentsView />
                        )}
                    </div>

                    <MobileBottomNav navigate={navigate} user={user} />
                </div>
            </div>
        );
    }

    // desktop
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <DesktopSidebar navigate={navigate} handleLogout={handleLogout} user={user} activePath='/adjustments'/>
            <div style={{ marginLeft: '240px', flex: 1, padding: '30px' }}>
                <h1 style={{ margin: '0 0 24px', fontSize: '28px', fontWeight: 'bold' }}>
                    {user?.role === 'admin' ? 'Adjustment Requests' : 'Stock Adjustment'}
                </h1>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}

                {user?.role === 'staff' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Left: Stock Count */}
                        <div>
                            {selectedStock ? (
                                <SubmitAdjustmentForm
                                    selectedStock={selectedStock}
                                    formData={formData}
                                    setFormData={setFormData}
                                    handleSubmit={handleSubmitAdjustment}
                                    onBack={() => { setSelectedStock(null); setError(''); setSuccess(''); }}
                                    error={error}
                                    success={success}
                                />
                            ) : (
                                <div style={{
                                    backgroundColor: 'white', borderRadius: '16px',
                                    padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                }}>
                                    <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 'bold' }}>Stock Count</h2>
                                    <div style={{
                                        backgroundColor: '#f5f5f5', borderRadius: '20px',
                                        padding: '10px 16px', display: 'flex',
                                        alignItems: 'center', gap: '8px', marginBottom: '16px',
                                    }}>
                                        <span style={{ color: '#aaa' }}>🔍</span>
                                        <input
                                            placeholder="Search by Product ID or Name"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#888', backgroundColor: 'transparent' }}
                                        />
                                    </div>
                                    {filteredStocks.map((stock) => {
                                        const actual = actualCounts[stock._id];
                                        const isConsistent = actual !== undefined && Number(actual) === stock.quantity;
                                        const isInconsistent = actual !== undefined && Number(actual) !== stock.quantity;

                                        return (
                                            <div key={stock._id} style={{
                                                padding: '16px', border: '1px solid #eee',
                                                borderRadius: '12px', marginBottom: '12px',
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <div>
                                                        <p style={{ margin: '0 0 2px', fontWeight: 'bold', fontSize: '14px' }}>{stock.sku}</p>
                                                        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{stock.name}</p>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#888' }}>System Stock:</p>
                                                        <p style={{ margin: 0, fontWeight: 'bold' }}>{stock.quantity}</p>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={{ ...labelStyle, fontSize: '12px' }}>Actual Count</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            placeholder={String(stock.quantity)}
                                                            value={actualCounts[stock._id] || ''}
                                                            onChange={(e) => setActualCounts({ ...actualCounts, [stock._id]: e.target.value })}
                                                            style={{
                                                                ...inputStyle,
                                                                border: isInconsistent ? '1.5px solid #FF6B6B' : isConsistent ? '1.5px solid #52B788' : '1.5px solid #ECBC76',
                                                            }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                                                        {isConsistent && (
                                                            <span style={{
                                                                backgroundColor: '#E5F5E5', color: '#52B788',
                                                                padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold',
                                                            }}>Consistent ✓</span>
                                                        )}
                                                        {isInconsistent && (
                                                            <>
                                                                <span style={{
                                                                    backgroundColor: '#FFE5E5', color: '#FF6B6B',
                                                                    padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold',
                                                                }}>✗ Inconsistent</span>
                                                                <div
                                                                    onClick={() => handleSelectStock(stock)}
                                                                    style={{
                                                                        width: '32px', height: '32px', borderRadius: '50%',
                                                                        backgroundColor: '#222', display: 'flex', alignItems: 'center',
                                                                        justifyContent: 'center', color: 'white', fontSize: '16px', cursor: 'pointer',
                                                                    }}>→</div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Right: My Requests */}
                        <div>
                            <div style={{
                                backgroundColor: 'white', borderRadius: '16px',
                                padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            }}>
                                <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 'bold' }}>My Submitted Requests</h2>
                                {adjustments.length === 0 ? (
                                    <p style={{ color: '#888', textAlign: 'center', padding: '20px 0' }}>No requests submitted yet</p>
                                ) : (
                                    adjustments.map((adj) => (
                                        <div key={adj._id} style={{
                                            padding: '16px', border: '1px solid #eee',
                                            borderRadius: '12px', marginBottom: '12px',
                                            borderLeft: `4px solid ${adj.status === 'approved' ? '#52B788' : adj.status === 'rejected' ? '#FF6B6B' : '#FF9F1C'}`,
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <div>
                                                    <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '14px' }}>
                                                        {adj.stock?.sku} — {adj.stock?.name}
                                                    </p>
                                                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>
                                                        {adj.current_qty} → {adj.actual_qty}
                                                    </p>
                                                    <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>
                                                        {new Date(adj.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span style={{
                                                    color: adj.status === 'approved' ? '#52B788' : adj.status === 'rejected' ? '#FF6B6B' : '#FF9F1C',
                                                    fontWeight: 'bold', fontSize: '13px',
                                                    backgroundColor: adj.status === 'approved' ? '#E5F5E5' : adj.status === 'rejected' ? '#FFE5E5' : '#FFF0E0',
                                                    padding: '4px 10px', borderRadius: '20px', height: 'fit-content',
                                                }}>
                                                    {adj.status?.charAt(0).toUpperCase() + adj.status?.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Admin view
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Left: Pending */}
                        <div style={{
                            backgroundColor: 'white', borderRadius: '16px',
                            padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}>
                            <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 'bold' }}>
                                Approve Adjustment Request
                            </h2>
                            <p style={{ margin: '0 0 12px', fontWeight: 'bold', fontSize: '14px', color: '#888' }}>
                                Pending Request List
                            </p>

                            {pendingAdjustments.length === 0 ? (
                                <p style={{ color: '#888', textAlign: 'center', padding: '20px 0' }}>No pending requests</p>
                            ) : (
                                pendingAdjustments.map((adj) => (
                                    <div key={adj._id} style={{
                                        padding: '16px', border: '1px solid #eee',
                                        borderRadius: '12px', marginBottom: '12px',
                                        borderLeft: '4px solid #FF9F1C',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div>
                                                <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '14px' }}>
                                                    {adj.stock?.sku} — {adj.stock?.name}
                                                </p>
                                                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>
                                                    Requested by: <strong>{adj.requestedBy?.name}</strong>
                                                </p>
                                                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>
                                                    Current: <strong>{adj.current_qty}</strong> → Proposed: <strong>{adj.actual_qty}</strong>
                                                </p>
                                            </div>
                                            <span style={{
                                                color: '#FF9F1C', fontWeight: 'bold', fontSize: '12px',
                                                backgroundColor: '#FFF0E0', padding: '4px 8px',
                                                borderRadius: '20px', height: 'fit-content',
                                            }}>Pending</span>
                                        </div>
                                        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#666' }}>
                                            Reason: {adj.reason}
                                        </p>

                                        {rejectingId !== adj._id ? (
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <button onClick={() => handleApprove(adj._id)} style={{
                                                    flex: 1, padding: '8px', backgroundColor: '#52B788', color: 'white',
                                                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                                                    fontWeight: 'bold', fontSize: '13px',
                                                }}>Approve</button>
                                                <span style={{ color: '#888', fontSize: '12px' }}>or</span>
                                                <button onClick={() => { setRejectingId(adj._id); setRejectReason(''); }} style={{
                                                    flex: 1, padding: '8px', backgroundColor: '#ECBC76', color: 'white',
                                                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                                                    fontWeight: 'bold', fontSize: '13px',
                                                }}>Reject</button>
                                            </div>
                                        ) : (
                                            <RejectForm
                                                rejectReason={rejectReason}
                                                setRejectReason={setRejectReason}
                                                onConfirm={() => handleReject(adj._id)}
                                                onCancel={() => { setRejectingId(null); setRejectReason(''); }}
                                            />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Right: History */}
                        <div style={{
                            backgroundColor: 'white', borderRadius: '16px',
                            padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}>
                            <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 'bold' }}>History</h2>
                            {adjustments.filter(a => a.status !== 'pending').length === 0 ? (
                                <p style={{ color: '#888', textAlign: 'center', padding: '20px 0' }}>No history yet</p>
                            ) : (
                                adjustments.filter(a => a.status !== 'pending').map((adj) => (
                                    <div key={adj._id} style={{
                                        padding: '16px', border: '1px solid #eee',
                                        borderRadius: '12px', marginBottom: '12px',
                                        borderLeft: `4px solid ${adj.status === 'approved' ? '#52B788' : '#FF6B6B'}`,
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div>
                                                <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '14px' }}>
                                                    {adj.stock?.sku} — {adj.stock?.name}
                                                </p>
                                                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>
                                                    {adj.current_qty} → {adj.actual_qty}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>
                                                    {new Date(adj.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span style={{
                                                color: adj.status === 'approved' ? '#52B788' : '#FF6B6B',
                                                fontWeight: 'bold', fontSize: '12px',
                                                backgroundColor: adj.status === 'approved' ? '#E5F5E5' : '#FFE5E5',
                                                padding: '4px 8px', borderRadius: '20px', height: 'fit-content',
                                            }}>
                                                {adj.status?.charAt(0).toUpperCase() + adj.status?.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Adjustments;