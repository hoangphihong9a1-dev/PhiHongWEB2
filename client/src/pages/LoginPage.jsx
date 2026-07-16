import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, user, isLoggedIn } = useAuth();

  const successMsg = location.state?.message;
  const from = location.state?.from || '/';

  // Redirect if already logged in AS ADMIN
  React.useEffect(() => {
    if (isLoggedIn && user) {
      if (user.role?.roleName === 'ROLE_ADMIN' || user.userName === 'admin') {
        navigate('/admin', { replace: true });
      }
    }
  }, [isLoggedIn, user, navigate]);

  const [form, setForm] = useState({ userName: '', userPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.userName || !form.userPassword) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    setLoading(true);
    try {
      const res = await loginUser({
        username: form.userName,
        password: form.userPassword
      });
      const loginResponse = res.data;
      const userData = {
        id: loginResponse.userId,
        userName: form.userName,
        role: {
          roleName: loginResponse.role
        },
        accessToken: loginResponse.accessToken,
        refreshToken: loginResponse.refreshToken
      };
      login(userData);
      if (userData.role?.roleName === 'ROLE_ADMIN' || userData.userName === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        const target = from.startsWith('/admin') ? '/' : from;
        navigate(target, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || err.response?.data || err.message;
      setError(`Đăng nhập thất bại: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUserBypass = () => {
    const mockUser = {
      id: 1,
      userName: 'john_doe',
      role: { roleName: 'ROLE_USER' }
    };
    login(mockUser);
    navigate(from, { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-sm">
        <div className="auth-header">
          <LogIn size={40} />
          <h1>Đăng nhập</h1>
          <p>Chào mừng trở lại RainbowForest</p>
        </div>

        {isLoggedIn && user && (
          <div className="alert alert-info" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Bạn đang đăng nhập với tên <strong>{user.userName}</strong>. 
            <button onClick={logout} className="btn-link" style={{ marginLeft: '0.5rem', fontWeight: 'bold' }}>Đăng xuất</button> để đổi tài khoản.
          </div>
        )}

        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input
              name="userName"
              value={form.userName}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập"
              autoComplete="username"
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
                autoComplete="current-password"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <button 
            onClick={handleUserBypass}
            className="btn btn-outline btn-sm" 
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            Đăng nhập nhanh (Bypass - John Doe)
          </button>
        </div>

        <p className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}
