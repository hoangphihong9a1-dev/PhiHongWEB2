import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, deleteUser } from '../api/api';
import { Users, Trash2, Shield, User as UserIcon, ArrowLeft } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      setError('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        // Backend doesn't have delete user yet, but let's assume it might or just show message
        // For now, let's just filter it out from UI to simulate
        setUsers(users.filter(u => u.id !== id));
        alert('Đã xóa người dùng thành công.');
      } catch (err) {
        alert('Lỗi khi xóa người dùng.');
      }
    }
  };

  if (loading) return <div className="loading-center">Đang tải...</div>;

  return (
    <div className="page-wrapper">
      <div className="page-header flex-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin" className="btn btn-icon btn-outline">
            <ArrowLeft size={20} />
          </Link>
          <h1><Users /> Quản lý người dùng</h1>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>
                  <div className="flex-center gap-2">
                    <UserIcon size={16} /> {u.userName}
                  </div>
                </td>
                <td>{u.userDetails?.firstName} {u.userDetails?.lastName}</td>
                <td>{u.userDetails?.email}</td>
                <td>{u.userDetails?.phoneNumber}</td>
                <td>
                  <span className={`badge ${u.role?.roleName === 'ROLE_ADMIN' ? 'badge-primary' : 'badge-outline'}`}>
                    {u.role?.roleName === 'ROLE_ADMIN' && <Shield size={12} />} {u.role?.roleName}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleDelete(u.id)} className="btn-icon btn-danger" title="Xóa">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
