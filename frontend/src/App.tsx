import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import MainLayout from './layout/MainLayout';
import Home from './pages/Home';
import ItemReceipt from './pages/ItemReceipt';
import ReceiptHistory from './pages/ReceiptHistory';
import { UserDTO, LoginResponse } from '@shared/type';
import InventoryStock from './pages/InventoryStock';

function App() {
  const [user, setUser] = useState<UserDTO | null>(() => {
    const saved = sessionStorage.getItem('user_session');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLoginSuccess = (data: LoginResponse) => {
    if (data.user) {
      setUser(data.user);
      sessionStorage.setItem('user_session', JSON.stringify(data.user));
      sessionStorage.setItem('token', data.token || '');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user_session');
    sessionStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />} 
      />

      <Route 
        path="/" 
        element={user ? <MainLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
      >
        <Route index element={<Home user={user!} />} />
        <Route path="item-receipt" element={<ItemReceipt />} />
        <Route path="receipt-history" element={<ReceiptHistory />} />
        <Route path="inventory" element={<InventoryStock />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;