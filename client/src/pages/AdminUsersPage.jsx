import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, addUser, updateUser, deleteUser } from '../api/api';
import { Users, Plus, Trash2, Edit, X, Search, Shield, User as UserIcon, ArrowLeft } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null when adding
  const [form, setForm] = useState({
    userName: '',
    userPassword: '',
    roleName: 'ROLE_USER',
    active: 1,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    country: 'Vietnam'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredUsers(
      users.filter(u =>
        (u.userName || '').toLowerCase().includes(term) ||
        (u.userDetails?.firstName || '').toLowerCase().includes(term) ||
        (u.userDetails?.lastName || '').toLowerCase().includes(term) ||
        (u.userDetails?.email || '').toLowerCase().includes(term)
      )
    );
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data || []);
      setFilteredUsers(res.data || []);
    } catch (err) {
      setError('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setForm({
      userName: '',
      userPassword: '',
      roleName: 'ROLE_USER',
      active: 1,
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      country: 'Vietnam'
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setForm({
      userName: user.userName || '',
      userPassword: '', // Don't show password, type if changing
      roleName: user.role?.roleName || 'ROLE_USER',
      active: user.active ?? 1,
      firstName: user.userDetails?.firstName || '',
      lastName: user.userDetails?.lastName || '',
      email: user.userDetails?.email || '',
      phoneNumber: user.userDetails?.phoneNumber || '',
      country: user.userDetails?.country || 'Vietnam'
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (err) {
        alert('Lỗi khi xóa người dùng.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Build proper User object matching backend structure
      const payload = {
        userName: form.userName,
        userPassword: form.userPassword,
        active: Number(form.active),
        role: {
          roleName: form.roleName
        },
        userDetails: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          country: form.country
        }
      };

      if (editingUser) {
        // For editing, if password is empty, don't update it
        if (!form.userPassword) {
          payload.userPassword = editingUser.userPassword;
        }
        const res = await updateUser(editingUser.id, payload);
        setUsers(users.map(u => u.id === editingUser.id ? res.data : u));
      } else {
        // For adding, password is required
        if (!form.userPassword) {
          setError('Mật khẩu là bắt buộc khi thêm mới.');
          return;
        }
        const res = await addUser(payload);
        setUsers([res.data, ...users]);
      }
      setShowModal(false);
    } catch (err) {
      const msg = err.response?.data || err.message;
      setError(typeof msg === 'string' ? msg : 'Có lỗi xảy ra khi lưu người dùng.');
    }
  };

  if (loading) return <div className="loading-center">Đang tải...</div>;

  return (
    <div className="page-wrapper" style={{ padding: '0', maxWidth: '100%', margin: '0' }}>
      <div className="page-header flex-between mb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.8rem' }}>
            <Users size={28} /> Quản lý người dùng
          </h1>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <Plus size={18} /> Thêm người dùng
        </button>
      </div>

      {/* Search / Filter Bar */}
      <div className="admin-actions-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon-left" />
          <input
            type="text"
            placeholder="Tìm kiếm theo username, họ tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="badge badge-primary">{filteredUsers.length} người dùng</span>
      </div>

      {/* Users Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên tài khoản</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Trạng thái</th>
              <th>Vai trò</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td>#{u.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserIcon size={16} className="text-muted" />
                    <strong>{u.userName}</strong>
                  </div>
                </td>
                <td>{u.userDetails?.firstName || ''} {u.userDetails?.lastName || ''}</td>
                <td>{u.userDetails?.email}</td>
                <td>{u.userDetails?.phoneNumber || <span className="text-muted">Chưa cập nhật</span>}</td>
                <td>
                  <span className={`admin-badge-role ${u.active === 1 ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                    {u.active === 1 ? 'Hoạt động' : 'Tạm khóa'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.role?.roleName === 'ROLE_ADMIN' ? 'badge-primary' : 'badge-outline'}`}>
                    {u.role?.roleName === 'ROLE_ADMIN' && <Shield size={12} style={{ marginRight: '3px' }} />}
                    {u.role?.roleName}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleOpenEdit(u)} className="btn-icon btn-icon-edit" title="Sửa">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="btn-icon btn-icon-delete" title="Xóa" disabled={u.userName === 'admin'}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingUser ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Tên tài khoản *</label>
                  <input
                    required
                    disabled={!!editingUser}
                    value={form.userName}
                    onChange={e => setForm({ ...form, userName: e.target.value })}
                    placeholder="Username"
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu {editingUser ? '(Để trống nếu giữ nguyên)' : '*'}</label>
                  <input
                    type="password"
                    value={form.userPassword}
                    onChange={e => setForm({ ...form, userPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div className="form-group">
                  <label>Họ *</label>
                  <input
                    required
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    placeholder="First name"
                  />
                </div>
                <div className="form-group">
                  <label>Tên *</label>
                  <input
                    required
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="example@mail.com"
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    value={form.phoneNumber}
                    onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                    placeholder="0123456789"
                  />
                </div>
                <div className="form-group">
                  <label>Vai trò *</label>
                  <select
                    value={form.roleName}
                    onChange={e => setForm({ ...form, roleName: e.target.value })}
                  >
                    <option value="ROLE_USER">ROLE_USER (Khách hàng)</option>
                    <option value="ROLE_ADMIN">ROLE_ADMIN (Quản trị)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Trạng thái *</label>
                  <select
                    value={form.active}
                    onChange={e => setForm({ ...form, active: e.target.value })}
                  >
                    <option value={1}>Hoạt động</option>
                    <option value={0}>Tạm khóa</option>
                  </select>
                </div>
                <div className="form-group form-grid-full">
                  <label>Quốc gia</label>
                  <input
                    value={form.country}
                    onChange={e => setForm({ ...form, country: e.target.value })}
                    placeholder="Vietnam"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
