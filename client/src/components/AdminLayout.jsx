import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, Package, ShoppingBag, Star, 
  LogOut, Home, TrendingUp, BarChart3, Layers 
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      path: '/admin',
      name: 'Tổng quan',
      icon: <LayoutDashboard size={20} />
    },
    {
      path: '/admin/users',
      name: 'Người dùng',
      icon: <Users size={20} />
    },
    {
      path: '/admin/products',
      name: 'Sản phẩm',
      icon: <Package size={20} />
    },
    {
      path: '/admin/categories',
      name: 'Danh mục',
      icon: <Layers size={20} />
    },
    {
      path: '/admin/orders',
      name: 'Đơn hàng',
      icon: <ShoppingBag size={20} />
    },
    {
      path: '/admin/recommendations',
      name: 'Đề xuất & Đánh giá',
      icon: <Star size={20} />
    },
    {
      path: '/admin/reports',
      name: 'Báo cáo doanh thu',
      icon: <BarChart3 size={20} />
    }
  ];

  // Helper to check active state
  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user || !user.userName) return 'AD';
    return user.userName.substring(0, 2).toUpperCase();
  };

  return (
    <div className="admin-layout-wrapper">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <TrendingUp size={24} color="#818CF8" />
          <span>RainbowForest Admin</span>
        </div>
        
        <nav className="admin-sidebar-menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-sidebar-link">
            <Home size={20} />
            Xem cửa hàng
          </Link>
          <button 
            onClick={handleLogout} 
            className="admin-sidebar-link" 
            style={{ 
              background: 'none', 
              border: 'none', 
              width: '100%', 
              textAlign: 'left',
              color: '#F87171'
            }}
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-content">
        {/* Top Navbar */}
        <header className="admin-top-nav">
          <div className="admin-nav-left">
            <span style={{ fontWeight: 600, color: '#64748B', fontSize: '0.95rem' }}>
              Hệ thống Quản trị Microservices
            </span>
          </div>
          
          <div className="admin-nav-right">
            <div className="admin-user-profile">
              <div className="admin-user-info" style={{ textAlign: 'right' }}>
                <span className="admin-user-name">{user?.userName || 'Admin'}</span>
                <span className="admin-user-role">{user?.role?.roleName || 'ROLE_ADMIN'}</span>
              </div>
              <div className="admin-user-avatar">
                {getInitials()}
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Body */}
        <main className="admin-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
