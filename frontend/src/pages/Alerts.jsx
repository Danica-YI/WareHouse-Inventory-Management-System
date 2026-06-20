import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../service/api';
import { MobileBottomNav, DesktopSidebar } from '../pages/layout';


function Alerts() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [alerts, setAlerts] = useState([]);
    const [filter, setFilter] = useState('active');
    const [actionAlert, setActionAlert] = useState(null);
    const [actionType, setActionType] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    // a listener for the size of screen
    useEffect(() => {
        fetchAlerts();
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    },[]);

    const fetchAlerts = async () => {
        try {
            const { data } = await API.get('/alerts');
            setAlerts(data);
        } catch (err) {
            setError('Failed to fetch alerts');
        }
    };

    const handleResolve = async (alertId) => {
        try {
            await API.put(`/alerts/${alertId}/resolve`, {
                resolution: 'reorder',
                notes: notes,
            });
            setActionAlert(null);
            setActionType('');
            setNotes('');
            fetchAlerts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resolve alert');
        }
    };

    const handleIgnore = async (alertId) => {
        try {
            await API.put(`/alerts/${alertId}/ignore`, {
                notes: notes,
            });
            setActionAlert(null);
            setActionType('');
            setNotes('');
            fetchAlerts();
        } catch(err) {
            setError(err.response?.data?.message || 'Failed to ignore alert');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active':
                return { backgroundColor: '#FFE5E5', color: '#FF6B6B' };
            case 'resolved':
                return { backgroundColor: '#E5F5E5', color: '#52B788' };
            case 'ignored':
                return { backgroundColor: '#F0F0F0', color: '#888' };
            default:
                return { backgroundColor: '#F0F0F0', color: '#888' };
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        if (filter === 'all') return true;
        return alert.status === filter;
    });

    // Mobile version
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
                        <h2 style={{ margin: '0 0 16px', fontWeight: 'bold', fontSize: '22px' }}>Low Stock Alerts</h2>

                        {/* Filter buttons */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            {['active', 'resolved', 'ignored', 'all'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: filter === f ? 'bold' : 'normal',
                                        backgroundColor: filter === f ? '#ECBC76' : 'white',
                                        color: filter === f ? 'white' : '#666',
                                    }}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>

                        {error && <p style={{ color: 'red', fontSize: '13px' }}>{error}</p>}

                        {filteredAlerts.length === 0 ? (
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                padding: '40px 20px',
                                textAlign: 'center',
                                color: '#888',
                            }}>
                                No {filter === 'all' ? '' : filter} alerts found
                            </div>
                        ) : (
                            filteredAlerts.map((alert) => (
                                <div key={alert._id} style={{
                                    backgroundColor: 'white',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    marginBottom: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    borderLeft: `4px solid ${alert.status === 'active' ? '#FF6B6B' : alert.status === 'resolved' ? '#52B788' : '#ccc'}`,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>
                                                {alert.stock?.name || 'Unknown Product'}
                                            </p>
                                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>
                                                SKU: {alert.stock?.sku || 'N/A'}
                                            </p>
                                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#FF6B6B' }}>
                                                Qty: {alert.stock?.quantity} / Threshold: {alert.threshold}
                                            </p>
                                        </div>
                                        <span style={{
                                            ...getStatusStyle(alert.status),
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                        }}>
                                            {alert.status.toUpperCase()}
                                        </span>
                                    </div>

                                    {alert.status !== 'active' && alert.resolvedBy && (
                                        <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#888' }}>
                                            {alert.resolution === 'reorder' ? '✅ Reordered' : '⏭️ Ignored'} by {alert.resolvedBy.name}
                                            {alert.notes && ` — "${alert.notes}"`}
                                        </p>
                                    )}

                                    {/* Action buttons for admin on active alerts */}
                                    {user?.role === 'admin' && alert.status === 'active' && (
                                        <div style={{ marginTop: '12px' }}>
                                            {actionAlert === alert._id ? (
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Add a note (optional)..."
                                                        value={notes}
                                                        onChange={(e) => setNotes(e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '8px',
                                                            border: '1.5px solid #ddd',
                                                            borderRadius: '8px',
                                                            fontSize: '13px',
                                                            boxSizing: 'border-box',
                                                            marginBottom: '8px',
                                                        }}
                                                    />
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => actionType === 'resolve' ? handleResolve(alert._id) : handleIgnore(alert._id)}
                                                            style={{
                                                                padding: '6px 14px',
                                                                backgroundColor: actionType === 'resolve' ? '#52B788' : '#888',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px',
                                                            }}
                                                        >
                                                            Confirm {actionType === 'resolve' ? 'Reorder' : 'Ignore'}
                                                        </button>
                                                        <button
                                                            onClick={() => { setActionAlert(null); setNotes(''); }}
                                                            style={{
                                                                padding: '6px 14px',
                                                                backgroundColor: '#f5f5f5',
                                                                color: '#444',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px',
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => { setActionAlert(alert._id); setActionType('resolve'); setNotes(''); }}
                                                        style={{
                                                            padding: '6px 14px',
                                                            backgroundColor: '#52B788',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px',
                                                        }}
                                                    >
                                                        🔄 Reorder
                                                    </button>
                                                    <button
                                                        onClick={() => { setActionAlert(alert._id); setActionType('ignore'); setNotes(''); }}
                                                        style={{
                                                            padding: '6px 14px',
                                                            backgroundColor: '#F0F0F0',
                                                            color: '#666',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px',
                                                        }}
                                                    >
                                                        ⏭️ Ignore
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <MobileBottomNav navigate={navigate} user={user} />
                </div>
            </div>
        );
    }

    // Desktop version
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <DesktopSidebar navigate={navigate} handleLogout={handleLogout} user={user} activePath="/alerts"/>

            <div style={{ marginLeft: '240px', flex: 1, padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Low Stock Alerts</h1>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['active', 'resolved', 'ignored', 'all'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: filter === f ? 'bold' : 'normal',
                                    backgroundColor: filter === f ? '#ECBC76' : 'white',
                                    color: filter === f ? 'white' : '#666',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                }}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#ECBC76', color: 'white' }}>
                                {['Product', 'SKU', 'Current Qty', 'Threshold', 'Qty at Alert', 'Status', 'Resolved By',
                                    ...(user?.role === 'admin' ? ['Actions'] : [])
                                ].map(h => (
                                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAlerts.length === 0 ? (
                                <tr>
                                    <td colSpan={user?.role === 'admin' ? 8 : 7} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                        No {filter === 'all' ? '' : filter} alerts found
                                    </td>
                                </tr>
                            ) : (
                                filteredAlerts.map((alert, index) => (
                                    <tr key={alert._id} style={{
                                        borderBottom: '1px solid #f0f0f0',
                                        backgroundColor: alert.status === 'active' ? '#FFF5F5' : index % 2 === 0 ? 'white' : '#fafafa',
                                    }}>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '500' }}>
                                            {alert.stock?.name || 'Unknown'}
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#666' }}>
                                            {alert.stock?.sku || 'N/A'}
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#FF6B6B' }}>
                                            {alert.stock?.quantity}
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#666' }}>
                                            {alert.threshold}
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#666' }}>
                                            {alert.quantityAtAlert}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{
                                                ...getStatusStyle(alert.status),
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                            }}>
                                                {alert.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '13px', color: '#666' }}>
                                            {alert.resolvedBy ? (
                                                <div>
                                                    <span>{alert.resolvedBy.name}</span>
                                                    {alert.notes && (
                                                        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#999', fontStyle: 'italic' }}>
                                                            "{alert.notes}"
                                                        </p>
                                                    )}
                                                </div>
                                            ) : '—'}
                                        </td>
                                        {user?.role === 'admin' && (
                                            <td style={{ padding: '14px 16px' }}>
                                                {alert.status === 'active' ? (
                                                    actionAlert === alert._id ? (
                                                        <div>
                                                            <input
                                                                type="text"
                                                                placeholder="Note (optional)..."
                                                                value={notes}
                                                                onChange={(e) => setNotes(e.target.value)}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '6px 8px',
                                                                    border: '1.5px solid #ddd',
                                                                    borderRadius: '6px',
                                                                    fontSize: '12px',
                                                                    boxSizing: 'border-box',
                                                                    marginBottom: '6px',
                                                                }}
                                                            />
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <button
                                                                    onClick={() => actionType === 'resolve' ? handleResolve(alert._id) : handleIgnore(alert._id)}
                                                                    style={{
                                                                        padding: '5px 10px',
                                                                        backgroundColor: actionType === 'resolve' ? '#52B788' : '#888',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '11px',
                                                                    }}
                                                                >
                                                                    Confirm
                                                                </button>
                                                                <button
                                                                    onClick={() => { setActionAlert(null); setNotes(''); }}
                                                                    style={{
                                                                        padding: '5px 10px',
                                                                        backgroundColor: '#f5f5f5',
                                                                        color: '#444',
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '11px',
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <button
                                                                onClick={() => { setActionAlert(alert._id); setActionType('resolve'); setNotes(''); }}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    backgroundColor: '#52B788',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '12px',
                                                                }}
                                                            >
                                                                Reorder
                                                            </button>
                                                            <button
                                                                onClick={() => { setActionAlert(alert._id); setActionType('ignore'); setNotes(''); }}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    backgroundColor: '#F0F0F0',
                                                                    color: '#666',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '12px',
                                                                }}
                                                            >
                                                                Ignore
                                                            </button>
                                                        </div>
                                                    )
                                                ) : (
                                                    <span style={{ fontSize: '12px', color: '#999' }}>
                                                        {alert.resolution === 'reorder' ? '✅ Reordered' : '⏭️ Ignored'}
                                                    </span>
                                                )}
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

export default Alerts;
