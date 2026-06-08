import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Package, ShoppingBag, Star, ArrowRight, LogOut, Home } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminModules = [
    {
      title: 'Quản lý người dùng',
      desc: 'Xem danh sách, quản lý quyền và thông tin khách hàng.',
      icon: <Users size={24} />,
      link: '/admin/users',
      color: 'var(--primary)'
    },
    {
      title: 'Quản lý sản phẩm',
      desc: 'Thêm mới, cập nhật kho và xóa sản phẩm khỏi cửa hàng.',
      icon: <Package size={24} />,
      link: '/admin/products',
      color: 'var(--accent)'
    },
    {
      title: 'Quản lý đơn hàng',
      desc: 'Theo dõi tình trạng đơn hàng và lịch sử mua sắm.',
      icon: <ShoppingBag size={24} />,
      link: '/admin/orders',
      color: 'var(--success)'
    },
    {
      title: 'Quản lý đề xuất',
      desc: 'Quản lý các đánh giá và hệ thống đề xuất sản phẩm.',
      icon: <Star size={24} />,
      link: '/admin/recommendations',
      color: 'var(--warning)'
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header flex-between">
        <div>
          <h1><LayoutDashboard /> Bảng điều khiển Quản trị</h1>
          <p className="text-muted">Chào mừng trở lại, Admin. Bạn có toàn quyền quản lý hệ thống Microservices.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/" className="btn btn-outline btn-sm">
            <Home size={16} /> Cửa hàng
          </Link>
          <button onClick={handleLogout} className="btn btn-error btn-sm">
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </div>

      <div className="grid grid-3">
        {adminModules.map((module, i) => (
          <Link key={i} to={module.link} className="card product-card">
            <div className="card-body" style={{ minHeight: '180px', display: 'flex', flexDirection: 'column' }}>
              <div className="feature-icon" style={{ width: 'fit-content', background: `${module.color}20`, color: module.color }}>
                {module.icon}
              </div>
              <h3 className="card-title" style={{ marginTop: '1rem', fontSize: '1.2rem' }}>{module.title}</h3>
              <p className="card-desc" style={{ flex: 1 }}>{module.desc}</p>
              <div className="see-all-link" style={{ color: module.color }}>
                Quản lý ngay <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="section-alt mt-4 p-4" style={{ 
        borderRadius: '1.5rem', 
        marginTop: '3rem', 
        background: '#fff', 
        border: '1px solid var(--border)',
        padding: '2rem',
        boxShadow: 'var(--shadow)'
      }}>
        <h3 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.5rem' }}>Thống kê nhanh</h3>
        <div className="hero-stats" style={{ display: 'flex', gap: '4rem', justifyContent: 'flex-start' }}>
          <div className="hero-stat">
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>24</span>
            <label style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Người dùng</label>
          </div>
          <div className="hero-stat">
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)' }}>156</span>
            <label style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Sản phẩm</label>
          </div>
          <div className="hero-stat">
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--success)' }}>89</span>
            <label style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Đơn hàng</label>
          </div>
        </div>
      </div>
    </div>
  );
}
