import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrders } from '../api/api';
import { ShoppingBag, Clock, CheckCircle, User as UserIcon, Calendar, ArrowLeft, X, Phone, MapPin, Receipt } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
    <div className="page-wrapper" style={{ padding: '0', maxWidth: '100%', margin: '0' }}>
      <div className="page-header flex-between mb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.8rem' }}>
            <ShoppingBag size={28} /> Quản lý đơn hàng
          </h1>
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
                <th>Thao tác</th>
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
                  <td><strong className="text-accent">{Number(o.total).toLocaleString('vi-VN')} đ</strong></td>
                  <td>{getStatusBadge(o.status)}</td>
                  <td>
                    <div className="order-items-summary">
                      {o.items?.length || 0} sản phẩm
                    </div>
                  </td>
                  <td>
                    <button 
                      onClick={() => setSelectedOrder(o)}
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '1.25rem',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '2rem',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setSelectedOrder(null)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: '#F1F5F9',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: '50%',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#F1F5F9'}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', background: '#EEF2FF', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Receipt size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Đơn hàng #{selectedOrder.id}</h2>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, marginTop: '0.15rem' }}>Ngày đặt: {selectedOrder.orderedDate}</p>
              </div>
            </div>

            {/* Content Body */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              {/* Shipping & Customer Information */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Thông tin giao nhận
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#F8FAFC', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #F1F5F9' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>Người mua hàng</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                      <UserIcon size={14} /> {selectedOrder.user?.userName}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#64748B', display: 'block', marginTop: '0.1rem', paddingLeft: '1.15rem' }}>{selectedOrder.user?.userDetails?.email}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>Người nhận hàng</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', display: 'block', marginTop: '0.15rem' }}>
                      {selectedOrder.shippingName || selectedOrder.user?.userName}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>Số điện thoại</span>
                    <span style={{ fontSize: '0.95rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem', fontWeight: 600 }}>
                      <Phone size={14} /> {selectedOrder.shippingPhone || selectedOrder.user?.userDetails?.phoneNumber || 'N/A'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>Địa chỉ giao hàng</span>
                    <span style={{ fontSize: '0.9rem', color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '0.35rem', marginTop: '0.15rem', lineHeight: '1.4' }}>
                      <MapPin size={14} style={{ marginTop: '0.15rem', flexShrink: 0 }} /> 
                      {selectedOrder.shippingAddress || 
                       `${selectedOrder.user?.userDetails?.street || ''} ${selectedOrder.user?.userDetails?.streetNumber || ''}, ${selectedOrder.user?.userDetails?.locality || ''}, ${selectedOrder.user?.userDetails?.country || ''}`.trim() || 
                       'N/A'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Trạng thái</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Danh sách sản phẩm
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '0.75rem', border: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                            {item.product?.productName}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                            Số lượng: {item.quantity} × {Number(item.product?.price || 0).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#6366F1' }}>
                          {Number(item.subTotal || (item.quantity * (item.product?.price || 0))).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B', fontSize: '0.9rem' }}>
                      Không có chi tiết sản phẩm.
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '1rem 1.25rem', background: '#EEF2FF', borderRadius: '0.75rem', border: '1px solid #E0E7FF' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#4F46E5' }}>Tổng cộng</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4F46E5' }}>
                    {Number(selectedOrder.total).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.5rem' }}>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="btn btn-outline"
                style={{ padding: '0.6rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
