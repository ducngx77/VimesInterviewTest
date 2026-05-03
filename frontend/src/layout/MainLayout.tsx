import { UserDTO } from '@shared/type';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/NavBar';
import Sidebar from '../components/SideBar';

interface MainLayoutProps {
  user: UserDTO;
  onLogout: () => void;
}

const MainLayout = ({ user, onLogout }: MainLayoutProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar user={user} onLogout={onLogout} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '20px', background: '#fff' }}>
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default MainLayout;