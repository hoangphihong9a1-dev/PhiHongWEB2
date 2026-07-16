import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers, getProducts, getAllOrders } from '../api/api';
import { LayoutDashboard, Users, Package, ShoppingBag, Star, ArrowRight, LogOut, Home, TrendingUp, DollarSign, Layers } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [stats, setStats] = useState({
    usersCount: 0,
    productsCount: 0,
    ordersCount: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        getUsers().catch(() => ({ data: [] })),
        getProducts().catch(() => ({ data: [] })),
        getAllOrders().catch(() => ({ data: [] }))
      ]);
      const paidOrders = (ordersRes.data || []).filter(o => o.status === 'COMPLETED' || o.status === 'PAID');
      const totalRev = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

      setStats({
        usersCount: usersRes.data?.length || 0,
        productsCount: productsRes.data?.length || 0,
        ordersCount: ordersRes.data?.length || 0,
        totalRevenue: totalRev
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

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
      color: '#6366F1', // Purple
      bgColor: '#EEF2FF'
    },
    {
      title: 'Quản lý sản phẩm',
      desc: 'Thêm mới, cập nhật kho và xóa sản phẩm khỏi cửa hàng.',
      icon: <Package size={24} />,
      link: '/admin/products',
      color: '#0EA5E9', // Blue
      bgColor: '#F0F9FF'
    },
    {
      title: 'Quản lý đơn hàng',
      desc: 'Theo dõi tình trạng đơn hàng và lịch sử mua sắm.',
      icon: <ShoppingBag size={24} />,
      link: '/admin/orders',
      color: '#10B981', // Green
      bgColor: '#ECFDF5'
    },
    {
      title: 'Quản lý đề xuất',
      desc: 'Quản lý các đánh giá và hệ thống đề xuất sản phẩm.',
      icon: <Star size={24} />,
      link: '/admin/recommendations',
      color: '#F59E0B', // Orange
      bgColor: '#FFFBEB'
    },
    {
      title: 'Báo cáo doanh thu',
      desc: 'Xem chi tiết doanh số, phân tích doanh thu theo danh mục và sản phẩm.',
      icon: <TrendingUp size={24} />,
      link: '/admin/reports',
      color: '#EC4899', // Pink
      bgColor: '#FDF2F8'
    },
    {
      title: 'Quản lý danh mục',
      desc: 'Thêm mới, đổi tên và tổ chức danh mục sản phẩm của toàn hệ thống.',
      icon: <Layers size={24} />,
      link: '/admin/categories',
      color: '#818CF8', // Indigo
      bgColor: '#EEF2FF'
    }
  ];

  return (
    <div className="page-wrapper" style={{ padding: '0', maxWidth: '100%', margin: '0' }}>
      {/* Header */}
      <div className="flex-between mb-5">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <LayoutDashboard size={28} /> Tổng quan hệ thống
          </h1>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>
            Chào mừng bạn đến với trang quản trị hệ thống RainbowForest.
          </p>
        </div>
      </div>

      {/* Grid Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {adminModules.map((module, i) => (
          <Link 
            key={i} 
            to={module.link} 
            style={{ 
              background: '#fff', 
              border: '1px solid #F1F5F9', 
              borderRadius: '1.25rem', 
              padding: '2rem', 
              textDecoration: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
              display: 'flex', 
              flexDirection: 'column',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = module.color + '30';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)';
              e.currentTarget.style.borderColor = '#F1F5F9';
            }}
          >
            <div 
              style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '0.75rem', 
                background: module.bgColor, 
                color: module.color, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}
            >
              {module.icon}
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>{module.title}</h3>
            <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.5', flex: 1, marginBottom: '1.5rem' }}>{module.desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: module.color, fontWeight: 700, fontSize: '0.9rem' }}>
              Quản lý ngay <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats Panel */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.5rem' }}>Thống kê nhanh</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Users Card */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1.25rem', padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#EEF2FF', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div className="flex-column">
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', lineHeight: '1.1' }}>
              {loading ? '...' : stats.usersCount}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B', marginTop: '0.25rem' }}>Tổng người dùng</span>
          </div>
        </div>

        {/* Products Card */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1.25rem', padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F0F9FF', color: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={24} />
          </div>
          <div className="flex-column">
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', lineHeight: '1.1' }}>
              {loading ? '...' : stats.productsCount}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B', marginTop: '0.25rem' }}>Tổng sản phẩm</span>
          </div>
        </div>

        {/* Orders Card */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1.25rem', padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={24} />
          </div>
          <div className="flex-column">
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', lineHeight: '1.1' }}>
              {loading ? '...' : stats.ordersCount}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B', marginTop: '0.25rem' }}>Tổng đơn hàng</span>
          </div>
        </div>

        {/* Revenue Card */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1.25rem', padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FDF2F8', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} />
          </div>
          <div className="flex-column">
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', lineHeight: '1.1' }}>
              {loading ? '...' : `${stats.totalRevenue.toLocaleString()}đ`}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B', marginTop: '0.25rem' }}>Tổng doanh thu</span>
          </div>
        </div>
      </div>
    </div>
  );
}
