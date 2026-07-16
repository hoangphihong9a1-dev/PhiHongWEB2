import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../api/api';
import { ShoppingBag, Calendar, MapPin, Phone, User, Package, Clock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      const res = await getUserOrders(user.id);
      const userOrders = res.data || [];
      // Sort newest first
      userOrders.sort((a, b) => b.id - a.id);
      setOrders(userOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAYMENT_EXPECTED': 
        return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}><Clock size={12} /> Chờ thanh toán</span>;
      case 'PAID': 
        return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}><CheckCircle size={12} /> Đã thanh toán</span>;
      case 'COMPLETED':
        return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, background: '#D1FAE5', color: '#065F46' }}><CheckCircle size={12} /> Hoàn thành</span>;
      default: 
        return <span className="badge badge-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}>{status}</span>;
    }
  };

  const toggleExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  if (loading) {
    return <div className="loading-center">Đang tải đơn hàng...</div>;
  }

  return (
    <div className="container" style={{ marginTop: '4rem', marginBottom: '4rem', maxWidth: '800px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Page Header */}
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingBag size={32} style={{ color: '#4F46E5' }} /> Đơn hàng của tôi
          </h1>
          <p style={{ color: '#64748B', margin: '0.25rem 0 0 0' }}>Xem lịch sử mua sắm và theo dõi trạng thái đơn hàng của bạn</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid #F1F5F9'
          }}>
            <ShoppingBag size={48} style={{ color: '#94A3B8', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#334155', margin: '0 0 0.5rem 0' }}>Bạn chưa có đơn hàng nào</h3>
            <p style={{ color: '#64748B', margin: '0 0 1.5rem 0', fontSize: '0.95rem' }}>Hãy khám phá các sản phẩm tuyệt vời của chúng tôi để mua sắm ngay!</p>
            <Link to="/products" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600 }}>
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map(order => {
              const isExpanded = expandedOrder === order.id;
              return (
                <div key={order.id} style={{
                  background: '#ffffff',
                  borderRadius: '1.25rem',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                  border: '1px solid #F1F5F9',
                  overflow: 'hidden',
                  transition: 'all 0.3s'
                }}>
                  {/* Order Card Header */}
                  <div 
                    onClick={() => toggleExpand(order.id)}
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      cursor: 'pointer',
                      background: isExpanded ? '#F8FAFC' : '#ffffff',
                      borderBottom: isExpanded ? '1px solid #F1F5F9' : 'none',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>Mã đơn hàng</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B' }}>#{order.id}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>Ngày đặt hàng</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={14} /> {order.orderedDate}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', display: 'block', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Trạng thái</span>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>Tổng thanh toán</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4F46E5' }}>{Number(order.total).toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div style={{ color: '#64748B' }}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content Details */}
                  {isExpanded && (
                    <div style={{ padding: '1.5rem', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      
                      {/* Shipping Info Block */}
                      <div style={{ background: '#F8FAFC', borderRadius: '0.75rem', padding: '1rem 1.25rem', border: '1px solid #F1F5F9' }}>
                        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Thông tin giao nhận hàng
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                            <User size={16} style={{ color: '#94A3B8' }} />
                            <span><strong>Người nhận:</strong> {order.shippingName || user.userName}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                            <Phone size={16} style={{ color: '#94A3B8' }} />
                            <span><strong>Số điện thoại:</strong> {order.shippingPhone || user.userDetails?.phoneNumber || 'N/A'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#475569', gridColumn: 'span 2' }}>
                            <MapPin size={16} style={{ color: '#94A3B8', marginTop: '0.15rem', flexShrink: 0 }} />
                            <span><strong>Địa chỉ:</strong> {order.shippingAddress || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Products List Block */}
                      <div>
                        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Package size={16} /> Danh sách sản phẩm mua
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, idx) => (
                              <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem 1rem',
                                background: '#FAF5FF',
                                borderRadius: '0.75rem',
                                border: '1px solid #F3E8FF'
                              }}>
                                <div>
                                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#581C87', display: 'block' }}>
                                    {item.product?.productName}
                                  </span>
                                  <span style={{ fontSize: '0.8rem', color: '#7E22CE' }}>
                                    Số lượng: {item.quantity} × {Number(item.product?.price || 0).toLocaleString('vi-VN')} đ
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#6B21A8' }}>
                                  {Number(item.subTotal || (item.quantity * (item.product?.price || 0))).toLocaleString('vi-VN')} đ
                                </span>
                              </div>
                            ))
                          ) : (
                            <div style={{ padding: '1rem', color: '#64748B', fontSize: '0.9rem', textAlign: 'center' }}>
                              Không có chi tiết sản phẩm.
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
