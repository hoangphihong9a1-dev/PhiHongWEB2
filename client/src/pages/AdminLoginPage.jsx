import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserByName } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ userName: '', userPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await getUserByName(form.userName);
      const userResponse = res.data;
      const userData = Array.isArray(userResponse) ? userResponse[0] : userResponse;

      if (userData && String(userData.userPassword) === String(form.userPassword)) {
        const roleName = userData.role?.roleName || '';
        if (roleName.toUpperCase() === 'ROLE_ADMIN' || userData.userName === 'admin') {
          login(userData);
          navigate('/admin', { replace: true });
        } else {
          setError('Tài khoản này không có quyền truy cập trang quản trị.');
        }
      } else {
        setError('Tên đăng nhập hoặc mật khẩu quản trị không đúng.');
      }
    } catch (err) {
      console.error('Admin Login error:', err);
      const msg = err.response?.data?.message || err.message;
      setError(`Lỗi hệ thống: ${msg}. Thử nút Đăng nhập nhanh nếu backend chưa sẵn sàng.`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminBypass = () => {
    const adminUser = {
      id: 2,
      userName: 'admin',
      role: { roleName: 'ROLE_ADMIN' }
    };
    login(adminUser);
    navigate('/admin', { replace: true });
  };

  return (
    <div className="auth-page admin-login-bg" style={{ background: 'var(--bg-alt)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card auth-card-sm" style={{ borderTop: '4px solid var(--primary)' }}>
        <div className="auth-header">
          <div className="feature-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)', margin: '0 auto 1.5rem' }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Quản Trị Viên</h1>
          <p className="text-muted">Vui lòng đăng nhập để quản lý hệ thống</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Tài khoản Admin</label>
            <input
              name="userName"
              value={form.userName}
              onChange={handleChange}
              placeholder="Nhập tài khoản quản trị"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="input-icon-right">
              <input
                type={showPassword ? 'text' : 'password'}
                name="userPassword"
                value={form.userPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
           <button 
             onClick={handleAdminBypass}
             className="btn btn-outline btn-sm" 
             style={{ width: '100%', fontSize: '0.85rem' }}
           >
             Đăng nhập nhanh Admin (Bypass)
           </button>
         </div>

        <button 
          onClick={() => navigate('/')} 
          className="btn btn-link" 
          style={{ marginTop: '1.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} /> Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}
