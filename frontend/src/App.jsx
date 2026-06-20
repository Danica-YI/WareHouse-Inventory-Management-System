import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';
import Stocks from './pages/Stocks';
import Inbound from './pages/Inbound';
import Outbound from './pages/Outbound';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import Adjustments from './pages/Adjustments';
import SearchResults from './pages/SearchResults';
import Alerts from './pages/Alerts';
import Users from './pages/User';

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
                <PrivateRoute>
                    <Dashboard />
                </PrivateRoute>
            } />
            <Route path="/stocks" element={
                <PrivateRoute>
                    <Stocks />
                </PrivateRoute>
            } />
            <Route path="/inbound" element={
                <PrivateRoute>
                    <Inbound />
                </PrivateRoute>
            } />
            <Route path="/outbound" element={
                <PrivateRoute>
                    <Outbound />
                </PrivateRoute>
            } />
            <Route path="/orders" element={
                <PrivateRoute>
                    <Orders />
                </PrivateRoute>
            } />
            <Route path="/suppliers" element={
                <PrivateRoute>
                   <Suppliers />
                </PrivateRoute>
            } />
            <Route path="/adjustments" element={
                <PrivateRoute>
                   <Adjustments />
                </PrivateRoute>
            } />
            <Route path= "/search" element={
                <PrivateRoute>
                    <SearchResults />
                </PrivateRoute>
            }/>
            <Route path="/users" element={
                <PrivateRoute>
                    <Users />
                </PrivateRoute>
           }/>
           <Route path="/alerts" element={
                <PrivateRoute>
                    <Alerts />
                </PrivateRoute>
           }/>
            <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
    );
}

export default App;