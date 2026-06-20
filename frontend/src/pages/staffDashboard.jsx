import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../service/api';
import { MobileBottomNav, DesktopSidebar } from '../pages/layout';

const StatCard = ({ title, value, onClick, color }) => (
    <div onClick={onClick} style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        borderLeft: `4px solid ${color || '#ECBC76'}`,
    }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#888',textAlign: 'left' }}>{title}</p>
        <p style={{ margin: '0 0 12px 0', fontSize: '28px', fontWeight: 'bold', color: '#222',textAlign: 'left' }}>
            {value?.toLocaleString() ?? '...'}
        </p>
        <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: color || '#ECBC76',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px',
        }}>→</div>
    </div>
);



function StaffDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [stats, setStats] = useState({
        totalStocks:0,
        outboundList:0,
        inboundList: 0,
        lowStockAlerts: 0,
        viewOrders: 0,
        submittedRequests: 0,
    });

    useEffect(() => {
        fetchStats();
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchStats = async () => {
        try {
            const [stocks, movements, alerts, orders, adjustments] = await Promise.all([
                API.get('/stocks'),
                API.get('/movements'),
                API.get('/alerts/active'),
                API.get('/orders'),
                API.get('/adjustments'),
            ]);

            setStats({
                totalStocks: stocks.data.length,
                outboundList: movements.data.filter(m =>
                    m.type === 'outbound_sale' || m.type === 'outbound_return'
                ).length,
                inboundList: orders.data.filter(o => o.status === 'shipped').length,
                lowStockAlerts: alerts.data.length,
                viewOrders: orders.data.length,
                submittedRequests: adjustments.data.filter(a =>
                    a.requestedBy?._id === user?.id && a.status === 'pending'
                ).length,
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
        { title: 'Outbound List', value: stats.outboundList, path: '/outbound', color: '#FF6B6B' },
        { title: 'Inbound List', value: stats.inboundList, path: '/inbound', color: '#56CFE1' },
        { title: 'Low Stock Alerts', value: stats.lowStockAlerts, path: '/alerts', color: '#FF9F1C' },
        { title: 'View Orders', value: stats.viewOrders, path: '/orders', color: '#7C83FD' },
        { title: 'Submitted Requests', value: stats.submittedRequests, path: '/adjustments', color: '#52B788' },
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
                    {/* Mobile Header */}
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
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {if (e.key === 'Enter') handleSearch(); }}
                                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#888' }}
                                />
                            </div>
                        </div>

                        {/* Greeting */}
                        <div style={{ padding: '8px 20px 16px' }}>
                            <h2 style={{ margin: 0, fontSize: '28px', textAlign: 'left' }}>
                                <span style={{ fontFamily: 'cursive', fontWeight: 'normal' }}>hello </span>
                                <span style={{ fontWeight: 'bold' }}>Staff</span>
                            </h2>
                        </div>

                        {/* Stats Grid */}
                        <div style={{
                            padding: '0 20px 20px',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                        }}>
                            {cards.map((card) => (
                                <StatCard
                                    key={card.title}
                                    title={card.title}
                                    value={card.value}
                                    color={card.color}
                                    onClick={() => navigate(card.path)}
                                />
                            ))}
                        </div>
                    </div>

                    <MobileBottomNav navigate={navigate} user={user} />
                </div>
            </div>
        );
    }

    // web
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            {/* Sidebar */}
            <DesktopSidebar navigate={navigate} handleLogout={handleLogout} user={user} activePath='/dashboard' />

            {/* Main Content */}
            <div style={{ marginLeft: '240px', flex: 1, padding: '30px' }}>
                {/* Top Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '32px' }}>
                            <span style={{ fontFamily: 'cursive', fontWeight: 'normal' }}>hello </span>
                            <span style={{ fontWeight: 'bold' }}>Staff</span>
                        </h1>
                        <p style={{ margin: '4px 0 0', color: '#888', fontSize: '14px' }}>
                            Welcome back, {user?.name}!
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                        width: '300px',
                    }}>
                        
                        <input
                            placeholder="Search for something"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#888' }}
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '20px',
                }}>
                    {cards.map((card) => (
                        <StatCard
                            key={card.title}
                            title={card.title}
                            value={card.value}
                            color={card.color}
                            onClick={() => navigate(card.path)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StaffDashboard;