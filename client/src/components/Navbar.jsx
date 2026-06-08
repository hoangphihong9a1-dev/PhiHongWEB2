import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingCart, Package, User, TrendingUp, Search, LogOut,
  Menu, X, ChevronDown, LayoutDashboard
} from 'lucide-react';

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Hide navbar on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?name=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setDropOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        {/* Logo */}
        <Link to="/" className="nav-brand" onClick={() => setMenuOpen(false)}>
          <TrendingUp size={28} strokeWidth={3} />
          <span>RainbowForest</span>
        </Link>

        {/* Desktop Search */}
        <form className="nav-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit"><Search size={20} /></button>
        </form>

        {/* Nav Links */}
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            <TrendingUp size={18} />
            <span>Trang chủ</span>
          </Link>
          <Link to="/products" className="nav-link" onClick={() => setMenuOpen(false)}>
            <Package size={18} />
            <span>Sản phẩm</span>
          </Link>

          <Link to="/cart" className="nav-link cart-link" onClick={() => setMenuOpen(false)}>
            <div className="cart-icon-wrapper">
              <ShoppingCart size={18} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            <span>Giỏ hàng</span>
          </Link>

          {isLoggedIn ? (
            <div className="nav-dropdown" ref={dropdownRef}>
              <button 
                className={`nav-link dropdown-trigger ${dropOpen ? 'active' : ''}`}
                onClick={() => setDropOpen(!dropOpen)}
                style={user.role?.roleName === 'ROLE_ADMIN' ? { color: 'var(--primary)', fontWeight: 'bold' } : {}}
              >
                <div className="user-avatar" style={user.role?.roleName === 'ROLE_ADMIN' ? { background: 'var(--primary)', color: 'white' } : {}}>
                  <User size={16} />
                </div>
                <span>{user.userName} {user.role?.roleName === 'ROLE_ADMIN' && '(Admin)'}</span>
                <ChevronDown size={14} className={`arrow ${dropOpen ? 'up' : ''}`} />
              </button>
              
              {dropOpen && (
                <div className="dropdown-menu">
                  {(user.role?.roleName === 'ROLE_ADMIN' || user.userName === 'admin') && (
                    <Link to="/admin" className="dropdown-item admin-item" onClick={() => setDropOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                      <LayoutDashboard size={16} />
                      <span>Trang Quản Trị</span>
                    </Link>
                  )}
                  <Link to="/orders" className="dropdown-item" onClick={() => setDropOpen(false)}>
                    <Package size={16} /> Đơn hàng của tôi
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Đăng ký</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
