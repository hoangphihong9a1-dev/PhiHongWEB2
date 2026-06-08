import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrders } from '../api/api';
import { ShoppingBag, Clock, CheckCircle, User as UserIcon, Calendar, ArrowLeft } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getAllOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAYMENT_EXPECTED': return <span className="badge badge-warning"><Clock size={12} /> Chờ thanh toán</span>;
      case 'PAID': return <span className="badge badge-success"><CheckCircle size={12} /> Đã thanh toán</span>;
      default: return <span className="badge badge-outline">{status}</span>;
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
          <h1><ShoppingBag /> Quản lý đơn hàng</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>Chưa có đơn hàng nào</h3>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Sản phẩm</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>
                    <div className="flex-column">
                      <span><UserIcon size={14} /> {o.user?.userName}</span>
                      <small className="text-muted">{o.user?.userDetails?.email}</small>
                    </div>
                  </td>
                  <td>
                    <div className="flex-center gap-1 text-muted">
                      <Calendar size={14} /> {o.orderedDate}
                    </div>
                  </td>
                  <td><strong className="text-accent">${Number(o.total).toFixed(2)}</strong></td>
                  <td>{getStatusBadge(o.status)}</td>
                  <td>
                    <div className="order-items-summary">
                      {o.items?.length} sản phẩm
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
