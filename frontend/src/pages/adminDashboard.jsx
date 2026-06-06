import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../service/api';

const StatCard = ({ title, value, onClick, color = '#222' }) => (
    <div onClick={onClick} style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#888',textAlign: 'left'  }}>{title}</p>
        <p style={{ margin: '0 0 16px 0', fontSize: '28px', fontWeight: 'bold', color: '#222',textAlign: 'left' }}>
            {value?.toLocaleString() ?? '...'}
        </p>
        <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
        }}>→</div>
    </div>
);

// navigation on mobile phone
const BottomNav = ({ navigate }) => (
    <div style={{
        position: 'sticky',
        bottom: 0,
        width: '100%',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0',
        borderTop: '1px solid #eee',
        zIndex: 100,
        borderRadius: '0 0 40px 40px',
    }}>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>👤</span>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/orders')}>📋</span>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/suppliers')}>👥</span>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/alerts')}>🔔</span>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/users')}>⚙️</span>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/stocks')}>🏭</span>
    </div>
);

// navigation on web
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

function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [stats, setStats] = useState({
        totalStocks: 0,
        purchaseOrders: 0,
        totalSuppliers: 0,
        lowStockAlerts: 0,
        totalUsers: 0,
        adjustmentRequests: 0,
    });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStats();
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchStats = async () => {
        try {
            const [stocks, orders, suppliers, alerts, adjustments, users] = await Promise.all([
                API.get('/stocks'),
                API.get('/orders'),
                API.get('/suppliers'),
                API.get('/alerts/active'),
                API.get('/adjustments'),
                API.get('/users'),
            ]);

            setStats({
                totalStocks: stocks.data.length,
                purchaseOrders: orders.data.length,
                totalSuppliers: suppliers.data.length,
                lowStockAlerts: alerts.data.length,
                totalUsers: users.data.length,
                adjustmentRequests: adjustments.data.filter(a => a.status === 'pending').length,
            });
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = () => {
        const q = searchQuery.trim();
        if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
    };

    const cards = [
    { title: 'Total Stocks', value: stats.totalStocks, path: '/stocks', color: '#ECBC76' },
    { title: 'Purchase Orders', value: stats.purchaseOrders, path: '/orders', color: '#FF6B6B' },
    { title: 'Total Suppliers', value: stats.totalSuppliers, path: '/suppliers', color: '#56CFE1' },
    { title: 'Low Stock Alerts', value: stats.lowStockAlerts, path: '/alerts', color: '#FF9F1C' },
    { title: 'Total Users', value: stats.totalUsers, path: '/users', color: '#7C83FD' },
    { title: 'Adjustment Requests', value: stats.adjustmentRequests, path: '/adjustments', color: '#52B788' },
];

    // mobile 
    if (isMobile) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#f0f0f0',
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
                    {/* Header */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <span style={{ color: '#ECBC76', fontWeight: 'bold', fontSize: '20px' }}>WIMS</span>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', color: '#888' }}>{user?.name}</span>
                            <span onClick={handleLogout} style={{ fontSize: '20px', cursor: 'pointer' }}>☰</span>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {/* Search Bar */}
                        <div style={{ padding: '12px 20px' }}>
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '20px',
                                padding: '10px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                            }}>
                               
                                <input
                                    placeholder="Search for something"
                                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#888' }}
                                />
                            </div>
                        </div>

                        {/* Greeting */}
                        <div style={{ padding: '8px 20px 16px' }}>
                            <h2 style={{ margin: 0, fontSize: '28px', textAlign: 'left' }}>
                                <span style={{ fontFamily: 'cursive', fontWeight: 'normal' }}>hello </span>
                                <span style={{ fontWeight: 'bold' }}>Admin</span>
                            </h2>
                        </div>

                        {/* Stats Grid */}
                        <div style={{
                            padding: '0 20px 20px',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                        }}>
                            {cards.map(card => (
                                <StatCard key={card.title} title={card.title} value={card.value} onClick={() => navigate(card.path)} color={card.color} />
                            ))}
                        </div>
                    </div>

                    <BottomNav navigate={navigate} />
                </div>
            </div>
        );
    }

    // web
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <DesktopSidebar navigate={navigate} handleLogout={handleLogout} user={user} />

            {/* Main Content */}
            <div style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>
                {/* Top Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px',
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '32px' }}>
                            <span style={{ fontFamily: 'cursive', fontWeight: 'normal' }}>hello </span>
                            <span style={{ fontWeight: 'bold' }}>Admin</span>
                        </h1>
                        <p style={{ margin: '4px 0 0', color: '#888' }}>Welcome back, {user?.name}</p>
                    </div>

                    {/* Search Bar */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            padding: '10px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                            width: '300px',
                        }}>
                            <span style={{ color: '#aaa' }}>🔍</span>
                            <input
                                placeholder="Search for something"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#444' }}
                            />
                        </div>
                        <button onClick={handleSearch} style={{
                            padding: '10px 20px', backgroundColor: '#ECBC76', color: 'white',
                            border: 'none', borderRadius: '20px', cursor: 'pointer',
                            fontWeight: 'bold', fontSize: '14px',
                        }}>Search</button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '24px',
                }}>
                    {cards.map(card => (
                        <StatCard key={card.title} title={card.title} value={card.value} onClick={() => navigate(card.path)} color={card.color} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;