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

const MobileBottomNav = ({ navigate }) => (
    <div style={{
        position: 'sticky', bottom: 0, width: '100%', backgroundColor: 'white',
        display: 'flex', justifyContent: 'space-around', padding: '12px 0',
        borderTop: '1px solid #eee', zIndex: 100, borderRadius: '0 0 40px 40px',
    }}>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>👤</span>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/orders')}>📋</span>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/suppliers')}>👥</span>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/alerts')}>🔔</span>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/adjustments')}>⚙️</span>
        <span style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => navigate('/stocks')}>🏭</span>
    </div>
);

const labelStyle = {
    fontSize: '14px', color: '#666',
    display: 'block', marginBottom: '6px', textAlign: 'left',
};

const inputStyle = {
    width: '100%', padding: '12px',
    border: '1.5px solid #ECBC76', borderRadius: '8px',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none',
};

// Supplier Form — 在外面定义避免失焦
const SupplierForm = ({ formData, setFormData, handleSubmit, editingSupplier, setShowForm, setEditingSupplier, error }) => (
    <div style={{
        backgroundColor: 'white', borderRadius: '16px',
        padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <button onClick={() => { setShowForm(false); setEditingSupplier(null); }} style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#444',
            }}>←</button>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>
                {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
            </h2>
        </div>

        {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
            {/* Company Name */}
            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Company Name</label>
                <input
                    type="text"
                    placeholder="Enter company name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={inputStyle}
                />
            </div>

            {/* Location + Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                    <label style={labelStyle}>Location</label>
                    <input
                        type="text"
                        placeholder="Enter location"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input
                        type="text"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={inputStyle}
                    />
                </div>
            </div>

            {/* Contact Person */}
            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Contact Person</label>
                <input
                    type="text"
                    placeholder="Enter contact person name"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    style={inputStyle}
                />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Email Address</label>
                <input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    required
                    style={inputStyle}
                />
            </div>

            {/* Product Categories */}
            <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Product Categories (comma separated)</label>
                <input
                    type="text"
                    placeholder="e.g. Electronics, Furniture, Food"
                    value={formData.categories}
                    onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                    style={inputStyle}
                />
            </div>

            <button type="submit" style={{
                width: '100%', padding: '14px',
                backgroundColor: '#ECBC76', color: 'white',
                border: 'none', borderRadius: '8px',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '16px',
            }}>
                {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
            </button>
        </form>
    </div>
);

function Suppliers() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [suppliers, setSuppliers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '', address: '', phone: '', contactPerson: '', contactEmail: '', categories: '',
    });

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchSuppliers();
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchSuppliers = async () => {
        try {
            const { data } = await API.get('/suppliers');
            setSuppliers(data);
        } catch (err) {
            setError('Failed to fetch suppliers');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', address: '', phone: '', contactPerson: '', contactEmail: '', categories: '' });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = {
                name: formData.name,
                contactPerson: formData.contactPerson,
                contactEmail: formData.contactEmail,
                phone: formData.phone,
                address: formData.address,
                categories: formData.categories.split(',').map(c => c.trim()).filter(c => c),
            };

            if (editingSupplier) {
                await API.put(`/suppliers/${editingSupplier._id}`, payload);
                setSuccess('Supplier updated successfully!');
            } else {
                await API.post('/suppliers', payload);
                setSuccess('Supplier added successfully!');
            }
            setShowForm(false);
            setEditingSupplier(null);
            resetForm();
            fetchSuppliers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name || '',
            address: supplier.address || '',
            phone: supplier.phone || '',
            contactPerson: supplier.contactPerson || '',
            contactEmail: supplier.contactEmail || '',
            categories: supplier.categories?.join(', ') || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            try {
                await API.delete(`/suppliers/${id}`);
                setSuccess('Supplier deleted!');
                fetchSuppliers();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Failed to delete supplier');
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const SupplierCard = ({ supplier }) => (
        <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: '20px', marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderLeft: '4px solid #ECBC76',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 6px', fontWeight: 'bold', fontSize: '16px' }}>{supplier.name}</p>
                    {supplier.contactPerson && (
                        <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>
                            👤 {supplier.contactPerson}
                        </p>
                    )}
                    {supplier.contactEmail && (
                        <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>
                            ✉️ {supplier.contactEmail}
                        </p>
                    )}
                    {supplier.phone && (
                        <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>
                            📞 {supplier.phone}
                        </p>
                    )}
                    {supplier.address && (
                        <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>
                            📍 {supplier.address}
                        </p>
                    )}
                    {supplier.categories?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                            {supplier.categories.map((cat, i) => (
                                <span key={i} style={{
                                    backgroundColor: '#FFF8EC', color: '#ECBC76',
                                    padding: '2px 10px', borderRadius: '20px', fontSize: '12px',
                                }}>{cat}</span>
                            ))}
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '12px' }}>
                    <button onClick={() => handleEdit(supplier)} style={{
                        padding: '6px 14px', backgroundColor: '#FF9F1C', color: 'white',
                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                    }}>Edit</button>
                    <button onClick={() => handleDelete(supplier._id)} style={{
                        padding: '6px 14px', backgroundColor: '#FF6B6B', color: 'white',
                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                    }}>Delete</button>
                </div>
            </div>
        </div>
    );

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
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            {!showForm && (
                                <span onClick={() => { setShowForm(true); resetForm(); setEditingSupplier(null); }}
                                    style={{ fontSize: '20px', cursor: 'pointer' }}>+</span>
                            )}
                            <span onClick={handleLogout} style={{ fontSize: '20px', cursor: 'pointer' }}>☰</span>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                        {!showForm ? (
                            <>
                                <h2 style={{ margin: '0 0 16px', fontWeight: 'bold', fontSize: '22px' }}>All Suppliers</h2>
                                <div style={{
                                    backgroundColor: 'white', borderRadius: '20px',
                                    padding: '10px 16px', display: 'flex',
                                    alignItems: 'center', gap: '8px', marginBottom: '16px',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                }}>
                                    <span style={{ color: '#aaa' }}>🔍</span>
                                    <input
                                        placeholder="Search suppliers..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#888' }}
                                    />
                                </div>

                                {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
                                {success && <p style={{ color: 'green', fontSize: '14px' }}>{success}</p>}

                                {filteredSuppliers.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>No suppliers found</div>
                                ) : (
                                    filteredSuppliers.map(s => <SupplierCard key={s._id} supplier={s} />)
                                )}
                            </>
                        ) : (
                            <SupplierForm
                                formData={formData}
                                setFormData={setFormData}
                                handleSubmit={handleSubmit}
                                editingSupplier={editingSupplier}
                                setShowForm={setShowForm}
                                setEditingSupplier={setEditingSupplier}
                                error={error}
                            />
                        )}
                    </div>

                    <MobileBottomNav navigate={navigate} />
                </div>
            </div>
        );
    }

    // desktop
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <DesktopSidebar navigate={navigate} handleLogout={handleLogout} user={user} />
            <div style={{ marginLeft: '240px', flex: 1, padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>All Suppliers</h1>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                            backgroundColor: 'white', borderRadius: '20px',
                            padding: '10px 16px', display: 'flex',
                            alignItems: 'center', gap: '8px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)', width: '250px',
                        }}>
                           
                            <input
                                placeholder="Search suppliers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#888' }}
                            />
                        </div>
                        <button onClick={() => { setShowForm(!showForm); resetForm(); setEditingSupplier(null); }} style={{
                            padding: '10px 20px', backgroundColor: '#ECBC76',
                            color: 'white', border: 'none', borderRadius: '8px',
                            cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                        }}>+ Add Supplier</button>
                    </div>
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}

                {showForm && (
                    <SupplierForm
                        formData={formData}
                        setFormData={setFormData}
                        handleSubmit={handleSubmit}
                        editingSupplier={editingSupplier}
                        setShowForm={setShowForm}
                        setEditingSupplier={setEditingSupplier}
                        error={error}
                    />
                )}

                {/* Supplier Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '20px',
                }}>
                    {filteredSuppliers.length === 0 ? (
                        <div style={{
                            backgroundColor: 'white', borderRadius: '16px',
                            padding: '40px', textAlign: 'center', color: '#888',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}>No suppliers found</div>
                    ) : (
                        filteredSuppliers.map(s => <SupplierCard key={s._id} supplier={s} />)
                    )}
                </div>
            </div>
        </div>
    );
}

export default Suppliers;