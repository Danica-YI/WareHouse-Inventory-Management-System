import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
                { icon: '📋', label: 'Purchase Orders', path: '/orders' },
                { icon: '👥', label: 'Suppliers', path: '/suppliers' },
                { icon: '👤', label: 'Users', path: '/users' },
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

const roleColor = (role) => (role === 'admin' ? '#7C83FD' : '#52B788');

function Users() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await API.get('/users');
            setUsers(data);
        } catch (err) {
            setError('Failed to fetch users');
        }
    };

    const handleRoleChange = async (id, newRole) => {
        setError('');
        try {
            await API.put(`/users/${id}/role`, { role: newRole });
            setSuccess('Role updated successfully!');
            fetchUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update role');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <DesktopSidebar navigate={navigate} handleLogout={handleLogout} user={user} />
            <div style={{ marginLeft: '240px', flex: 1, padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>User Management</h1>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '20px',
                        padding: '10px 16px', display: 'flex', alignItems: 'center',
                        gap: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', width: '250px',
                    }}>
                        
                        <input
                            placeholder="Search by name or email"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#888' }}
                        />
                    </div>
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}

                <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#ECBC76', color: 'white' }}>
                                {['Name', 'Email', 'Phone', 'Status', 'Role', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No users found</td></tr>
                            ) : (
                                filteredUsers.map((u, index) => (
                                    <tr key={u._id} style={{
                                        borderBottom: '1px solid #f0f0f0',
                                        backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                                    }}>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '500' }}>{u.name}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#666' }}>{u.email}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#666' }}>{u.phone || '-'}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#666' }}>{u.status}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{
                                                color: roleColor(u.role), fontWeight: 'bold', fontSize: '13px',
                                                backgroundColor: `${roleColor(u.role)}20`,
                                                padding: '4px 10px', borderRadius: '20px',
                                            }}>{u.role?.toUpperCase()}</span>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            {u._id === user?.id ? (
                                                <span style={{ fontSize: '12px', color: '#aaa' }}>(You)</span>
                                            ) : (
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                    style={{
                                                        padding: '6px 10px', borderRadius: '6px',
                                                        border: '1.5px solid #ddd', fontSize: '13px', cursor: 'pointer',
                                                    }}
                                                >
                                                    <option value="staff">Staff</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            )}
                                        </td>
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

export default Users;