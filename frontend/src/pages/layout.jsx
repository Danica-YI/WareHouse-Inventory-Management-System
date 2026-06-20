export const MobileBottomNav = ({ navigate, user }) => (
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
        {user?.role === 'admin' && <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/suppliers')}>👥</span>}
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/alerts')}>🔔</span>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/adjustments')}>⚙️</span>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/stocks')}>🏭</span>
    </div>
);

export const DesktopSidebar = ({ navigate, handleLogout, user, activePath }) => (
    <div style={{
        width: '240px',
        minHeight: '100vh',
        backgroundColor: 'white',
        borderRight: '1px solid #eee',
        padding: '20px 0',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
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
                    { icon: '📥', label: 'Inbound', path: '/Inbound' },
                    { icon: '📤', label: 'Outbound', path: '/Outbound' },
                    { icon: '📋', label: 'View Orders', path: '/orders' },
                ]),
                { icon: '🔔', label: 'Low Stock Alerts', path: '/alerts' },
                { icon: '⚙️', label: 'Adjustments', path: '/adjustments' },
            ].map((item) => (
                <div
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    style={{
                        padding: '12px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '14px',
                        color: item.path === activePath ? '#ECBC76' : '#444',
                        fontWeight: item.path === activePath ? 'bold' : 'normal',
                        backgroundColor: item.path === activePath ? '#FFF8EC' : 'transparent',
                    }}
                    onMouseEnter={e => { if (item.path !== activePath) e.currentTarget.style.backgroundColor = '#FFF8EC' }}
                    onMouseLeave={e => { if (item.path !== activePath) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                </div>
            ))}
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid #eee' }}>
            <button onClick={handleLogout} style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#ECBC76',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
            }}>Logout</button>
        </div>
    </div>
);