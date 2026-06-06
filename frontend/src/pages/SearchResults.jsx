import { useState, useEffect } from "react";
import { useNavigate, useSearchParams} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import API from '../service/api';

function SearchResults(){
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = (searchParams.get('q') || '').trim();

    const [stocks, setStocks] = useState([]);
    const [orders, setOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchAll = async () => {
        setLoading(true);
        try{
            const [stockRes, orderRes, supplierRes] = await Promise.all([
                API.get('/stocks'),
                API.get('/orders'),
                API.get('/suppliers'),
            ]);
            setStocks(stockRes.data);
            setOrders(orderRes.data);
            setSuppliers(supplierRes.data);
        } catch(err){
            console.error('Search fetch failed:', err);
        } finally {
            setLoading(false);
    }
  };
  fetchAll();
}, [query]);
  
const q = query.toLowerCase();

const matchedStocks = q
    ? stocks.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.sku?.toLowerCase().includes(q))
    : [];

const matchedOrders = q
     ? orders.filter(o =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.supplier?.name?.toLowerCase().includes(q))
    : [];

const matchedSuppliers = q
    ? suppliers.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.contactEmail?.toLowerCase().includes(q))
    : [];

const totalResults = matchedStocks.length + matchedOrders.length + matchedSuppliers.length;

 const ResultCard = ({ title, subtitle, onClick }) => (
        <div onClick={onClick} style={{
            backgroundColor: 'white', borderRadius: '12px',
            padding: '16px 20px', marginBottom: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer',
        }}>
            <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '15px' }}>{title}</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>{subtitle}</p>
        </div>
    );

    const Section = ({ label, children }) => (
        <div style={{ marginBottom: '28px' }}>
            <p style={{ margin: '0 0 12px', fontWeight: 'bold', fontSize: '14px', color: '#888' }}>{label}</p>
            {children}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '32px' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <button onClick={() => navigate('/dashboard')} style={{
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#444',
                    }}>←</button>
                    <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold' }}>Search Results</h1>
                </div>
                <p style={{ margin: '0 0 24px 36px', color: '#888', fontSize: '14px' }}>
                    {query ? <>Results for "<strong>{query}</strong>"</> : 'Enter a search term'}
                </p>

                {loading ? (
                    <p style={{ color: '#888' }}>Searching...</p>
                ) : !query ? (
                    <p style={{ color: '#888' }}>Type something in the search bar to search.</p>
                ) : totalResults === 0 ? (
                    <div style={{
                        backgroundColor: 'white', borderRadius: '12px',
                        padding: '40px', textAlign: 'center', color: '#888',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}>No results found for "{query}"</div>
                ) : (
                    <>
                        {matchedStocks.length > 0 && (
                            <Section label={`Products (${matchedStocks.length})`}>
                                {matchedStocks.map(s => (
                                    <ResultCard
                                        key={s._id}
                                        title={s.name}
                                        subtitle={`SKU: ${s.sku} • Qty: ${s.quantity}`}
                                        onClick={() => navigate(`/stocks?q=${encodeURIComponent(s.name)}`)}
                                    />
                                ))}
                            </Section>
                        )}

                        {matchedOrders.length > 0 && (
                            <Section label={`Orders (${matchedOrders.length})`}>
                                {matchedOrders.map(o => (
                                    <ResultCard
                                        key={o._id}
                                        title={o.orderNumber}
                                        subtitle={`Supplier: ${o.supplier?.name || '-'} • ${o.status}`}
                                        onClick={() => navigate(`/orders?openId=${o._id}`)}
                                    />
                                ))}
                            </Section>
                        )}

                        {matchedSuppliers.length > 0 && (
                            <Section label={`Suppliers (${matchedSuppliers.length})`}>
                                {matchedSuppliers.map(s => (
                                    <ResultCard
                                        key={s._id}
                                        title={s.name}
                                        subtitle={s.contactEmail || ''}
                                        onClick={() => navigate(`/suppliers?q=${encodeURIComponent(s.name)}`)}
                                    />
                                ))}
                            </Section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default SearchResults;