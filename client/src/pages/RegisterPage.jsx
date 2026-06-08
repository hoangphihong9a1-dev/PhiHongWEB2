import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/api';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    userName: '',
    userPassword: '',
    active: 1,
    userDetails: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      street: '',
      streetNumber: '',
      zipCode: '',
      locality: '',
      country: '',
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in form.userDetails) {
      setForm((f) => ({ ...f, userDetails: { ...f.userDetails, [name]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.userName || !form.userPassword) {
      setError('Tên đăng nhập và mật khẩu là bắt buộc.');
      return;
    }
    if (!form.userDetails.firstName || !form.userDetails.lastName || !form.userDetails.email) {
      setError('Họ tên và email là bắt buộc.');
      return;
    }
    setLoading(true);
    try {
      await registerUser(form);
      navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } });
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || 'Đăng ký thất bại. Tên đăng nhập hoặc email đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <UserPlus size={40} />
          <h1>Tạo tài khoản</h1>
          <p>Tham gia RainbowForest ngay hôm nay</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-section-title">Thông tin đăng nhập</div>

          <div className="form-row">
            <div className="form-group">
              <label>Tên đăng nhập *</label>
              <input name="userName" value={form.userName} onChange={handleChange} placeholder="username" required />
            </div>
            <div className="form-group">
              <label>Mật khẩu *</label>
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
          </div>

          <div className="form-section-title">Thông tin cá nhân</div>

          <div className="form-row">
            <div className="form-group">
              <label>Họ *</label>
              <input name="firstName" value={form.userDetails.firstName} onChange={handleChange} placeholder="Nguyễn" required />
            </div>
            <div className="form-group">
              <label>Tên *</label>
              <input name="lastName" value={form.userDetails.lastName} onChange={handleChange} placeholder="Văn A" required />
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input type="email" name="email" value={form.userDetails.email} onChange={handleChange} placeholder="example@email.com" required />
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input name="phoneNumber" value={form.userDetails.phoneNumber} onChange={handleChange} placeholder="0912 345 678" />
          </div>

          <div className="form-section-title">Địa chỉ</div>

          <div className="form-row">
            <div className="form-group">
              <label>Đường</label>
              <input name="street" value={form.userDetails.street} onChange={handleChange} placeholder="Nguyễn Huệ" />
            </div>
            <div className="form-group">
              <label>Số nhà</label>
              <input name="streetNumber" value={form.userDetails.streetNumber} onChange={handleChange} placeholder="42" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mã bưu chính</label>
              <input name="zipCode" value={form.userDetails.zipCode} onChange={handleChange} placeholder="700000" />
            </div>
            <div className="form-group">
              <label>Thành phố</label>
              <input name="locality" value={form.userDetails.locality} onChange={handleChange} placeholder="Hồ Chí Minh" />
            </div>
          </div>

          <div className="form-group">
            <label>Quốc gia</label>
            <input name="country" value={form.userDetails.country} onChange={handleChange} placeholder="Việt Nam" />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
          </button>
        </form>

        <p className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
}
