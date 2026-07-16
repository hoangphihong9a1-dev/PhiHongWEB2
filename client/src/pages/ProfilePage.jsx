import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUser } from '../api/api';
import { User, Mail, Phone, MapPin, Shield, Edit2, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.userDetails?.firstName || '',
    lastName: user.userDetails?.lastName || '',
    email: user.userDetails?.email || '',
    phoneNumber: user.userDetails?.phoneNumber || '',
    street: user.userDetails?.street || '',
    streetNumber: user.userDetails?.streetNumber || '',
    zipCode: user.userDetails?.zipCode || '',
    locality: user.userDetails?.locality || '',
    country: user.userDetails?.country || 'Vietnam',
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.userDetails?.firstName || '',
      lastName: user.userDetails?.lastName || '',
      email: user.userDetails?.email || '',
      phoneNumber: user.userDetails?.phoneNumber || '',
      street: user.userDetails?.street || '',
      streetNumber: user.userDetails?.streetNumber || '',
      zipCode: user.userDetails?.zipCode || '',
      locality: user.userDetails?.locality || '',
      country: user.userDetails?.country || 'Vietnam',
    });
    setIsEditing(false);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Build request body according to User entity format in user-service
      const requestBody = {
        ...user,
        userDetails: {
          ...user.userDetails,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          street: formData.street,
          streetNumber: formData.streetNumber,
          zipCode: formData.zipCode,
          locality: formData.locality,
          country: formData.country,
        }
      };

      const res = await updateUser(user.id, requestBody);
      
      // Update local storage and auth context state
      login(res.data);
      
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Cập nhật thông tin hồ sơ thành công!' });
    } catch (err) {
      console.error(err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data || 'Có lỗi xảy ra trong quá trình cập nhật. Vui lòng thử lại.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '4rem', marginBottom: '4rem', maxWidth: '900px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <User size={32} style={{ color: '#4F46E5' }} /> Hồ sơ cá nhân
            </h1>
            <p style={{ color: '#64748B', margin: '0.25rem 0 0 0' }}>Quản lý thông tin cá nhân và địa chỉ giao hàng của bạn</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '0.75rem' }}
            >
              <Edit2 size={16} /> Chỉnh sửa hồ sơ
            </button>
          )}
        </div>

        {/* Alert Notification */}
        {message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            borderRadius: '0.75rem',
            border: message.type === 'success' ? '1px solid #A7F3D0' : '1px solid #FECACA',
            background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            color: message.type === 'success' ? '#065F46' : '#991B1B',
            fontSize: '0.95rem',
            fontWeight: 500,
          }}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          
          {/* Main Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
            border: '1px solid #F1F5F9',
            overflow: 'hidden'
          }}>
            
            {/* Account Info Header Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
              padding: '2rem',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800
                }}>
                  {user.userName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>@{user.userName}</h2>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'rgba(255,255,255,0.15)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '50px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    marginTop: '0.4rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    <Shield size={12} /> {user.role?.roleName === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                Trạng thái: <span style={{ fontWeight: 700 }}>{user.active ? 'Hoạt động' : 'Tạm khóa'}</span>
              </div>
            </div>

            {/* Fields Grid Container */}
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Section: Personal Info */}
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', borderBottom: '2px solid #F1F5F9', paddingBottom: '0.5rem', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Thông tin cá nhân
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748B', marginBottom: '0.4rem' }}>Họ</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #CBD5E1',
                        background: isEditing ? '#ffffff' : '#F8FAFC',
                        color: '#334155',
                        outline: 'none',
                        transition: 'all 0.2s',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748B', marginBottom: '0.4rem' }}>Tên</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #CBD5E1',
                        background: isEditing ? '#ffffff' : '#F8FAFC',
                        color: '#334155',
                        outline: 'none',
                        transition: 'all 0.2s',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748B', marginBottom: '0.4rem' }}>Địa chỉ Email</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 2.5rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #CBD5E1',
                          background: isEditing ? '#ffffff' : '#F8FAFC',
                          color: '#334155',
                          outline: 'none',
                          transition: 'all 0.2s',
                          fontSize: '0.95rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748B', marginBottom: '0.4rem' }}>Số điện thoại</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        disabled={!isEditing}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 2.5rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #CBD5E1',
                          background: isEditing ? '#ffffff' : '#F8FAFC',
                          color: '#334155',
                          outline: 'none',
                          transition: 'all 0.2s',
                          fontSize: '0.95rem'
                        }}
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Section: Address Info */}
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', borderBottom: '2px solid #F1F5F9', paddingBottom: '0.5rem', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Địa chỉ giao nhận hàng
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748B', marginBottom: '0.4rem' }}>Tên đường</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Ví dụ: Nguyễn Trãi"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #CBD5E1',
                        background: isEditing ? '#ffffff' : '#F8FAFC',
                        color: '#334155',
                        outline: 'none',
                        transition: 'all 0.2s',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748B', marginBottom: '0.4rem' }}>Số nhà</label>
                    <input
                      type="text"
                      name="streetNumber"
                      value={formData.streetNumber}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Ví dụ: 123/4"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #CBD5E1',
                        background: isEditing ? '#ffffff' : '#F8FAFC',
                        color: '#334155',
                        outline: 'none',
                        transition: 'all 0.2s',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748B', marginBottom: '0.4rem' }}>Phường/Xã/Quận</label>
                    <input
                      type="text"
                      name="locality"
                      value={formData.locality}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Ví dụ: Phường Bến Thành"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #CBD5E1',
                        background: isEditing ? '#ffffff' : '#F8FAFC',
                        color: '#334155',
                        outline: 'none',
                        transition: 'all 0.2s',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748B', marginBottom: '0.4rem' }}>Mã Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="700000"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #CBD5E1',
                        background: isEditing ? '#ffffff' : '#F8FAFC',
                        color: '#334155',
                        outline: 'none',
                        transition: 'all 0.2s',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748B', marginBottom: '0.4rem' }}>Quốc gia</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #CBD5E1',
                        background: isEditing ? '#ffffff' : '#F8FAFC',
                        color: '#334155',
                        outline: 'none',
                        transition: 'all 0.2s',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* Form Action Buttons (Only when editing) */}
          {isEditing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-outline"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              >
                <X size={16} /> Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.75rem',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              >
                <Save size={16} /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
