import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, createVNPayPayment } from '../api/api';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Shield, Truck, CreditCard } from 'lucide-react';

export default function CartPage() {
  const { cartItems, cartCount, total, addItem, removeItem, clearCart, cartId } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderMsg, setOrderMsg] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'VNPAY'

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    setOrderLoading(true);
    setOrderMsg('');
    try {
      const res = await createOrder(user.id, cartId);
      const createdOrder = res.data;
      clearCart();
      if (paymentMethod === 'VNPAY') {
        setOrderMsg('✓ Đang chuyển hướng sang cổng thanh toán VNPAY...');
        const paymentRes = await createVNPayPayment(createdOrder.id);
        if (paymentRes.data && paymentRes.data.paymentUrl) {
          window.location.href = paymentRes.data.paymentUrl;
        } else {
          setOrderMsg('✗ Không thể khởi tạo link thanh toán VNPAY. Vui lòng thanh toán tại danh sách đơn hàng.');
        }
      } else {
        setOrderMsg('✓ Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
      }
    } catch (err) {
      console.error(err);
      setOrderMsg('✗ Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setOrderLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-wrapper container">
        <div className="empty-state">
          <div className="feature-icon" style={{ width: '100px', height: '100px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
            <ShoppingCart size={48} color="var(--primary)" strokeWidth={1.5} />
          </div>
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Có vẻ như bạn chưa thêm bất kỳ sản phẩm nào. Hãy khám phá hàng ngàn ưu đãi hấp dẫn ngay!</p>
          <Link to="/products" className="btn btn-primary btn-lg" style={{ padding: '1rem 2.5rem' }}>
            <Package size={20} /> Bắt đầu mua sắm ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper container" style={{ minHeight: '80vh' }}>
      <div className="page-header" style={{ marginBottom: '3rem' }}>
        <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
          <ShoppingCart size={40} color="var(--primary)" strokeWidth={2.5} /> 
          Giỏ hàng của bạn
        </h1>
        <p className="text-muted" style={{ fontSize: '1.1rem' }}>Bạn đang có <strong>{cartCount}</strong> sản phẩm trong danh sách mua sắm.</p>
      </div>

      {orderMsg && (
        <div className={`alert ${orderMsg.startsWith('✓') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '3rem', borderRadius: '1rem', padding: '1.5rem' }}>
          <div className="flex-center gap-3">
            <Package size={24} />
            <span style={{ fontSize: '1.1rem' }}>{orderMsg}</span>
          </div>
        </div>
      )}

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          <div className="flex-between mb-4" style={{ padding: '0 0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Sản phẩm đã chọn</h3>
            <button onClick={clearCart} className="btn-icon" style={{ color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 600, gap: '0.4rem', display: 'flex', alignItems: 'center' }}>
              <Trash2 size={16} /> Làm trống giỏ hàng
            </button>
          </div>
          
          <div className="cart-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {cartItems.map((item) => {
              if (!item || !item.product) return null;
              return (
                <div key={item.product.id} className="cart-item" style={{ padding: '2rem' }}>
                  <div className="cart-item-image" style={{ width: '120px', height: '120px' }}>
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.productName} />
                    ) : (
                      <Package size={48} color="var(--border)" />
                    )}
                  </div>
                  
                  <div className="cart-item-info">
                    <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>{item.product.category}</span>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{item.product.productName}</h3>
                    <p className="cart-item-price" style={{ fontSize: '1.1rem' }}>{Number(item.product.price).toLocaleString('vi-VN')} đ <span className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 400 }}>/ sản phẩm</span></p>
                  </div>

                  <div className="cart-item-qty" style={{ padding: '0.5rem 0.75rem' }}>
                    <button 
                      onClick={() => {
                        if (item.quantity <= 1) removeItem(item.product.id);
                        else addItem(item.product, -1);
                      }}
                      style={{ width: '32px', height: '32px' }}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ fontSize: '1.2rem', margin: '0 0.5rem' }}>{item.quantity}</span>
                    <button 
                      onClick={() => addItem(item.product, 1)}
                      style={{ width: '32px', height: '32px' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="cart-item-subtotal" style={{ minWidth: '120px' }}>
                    <span style={{ fontSize: '0.85rem', display: 'block', color: 'var(--text-muted)', fontWeight: 500 }}>Thành tiền</span>
                    <span style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>{(Number(item.subTotal) || 0).toLocaleString('vi-VN')} đ</span>
                  </div>

                  <button className="cart-item-remove" onClick={() => removeItem(item.product.id)} style={{ padding: '0.75rem' }}>
                    <Trash2 size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="cart-summary" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Tóm tắt đơn hàng</h2>

          <div className="summary-details" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="summary-row">
              <span>Tạm tính ({cartCount} món)</span>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{total.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span className="text-success" style={{ fontWeight: 800 }}>MIỄN PHÍ</span>
            </div>
            <div className="summary-row">
              <span>Giảm giá</span>
              <span style={{ fontWeight: 700 }}>0 đ</span>
            </div>
            
            <div className="summary-total" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid var(--bg-soft)' }}>
              <div className="flex-between">
                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Tổng thanh toán</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>{total.toLocaleString('vi-VN')} đ</span>
              </div>
              <p className="text-muted" style={{ fontSize: '0.8rem', textAlign: 'right', marginTop: '0.5rem' }}>(Đã bao gồm thuế VAT)</p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="payment-selector" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Phương thức thanh toán</span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                type="button" 
                onClick={() => setPaymentMethod('COD')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem',
                  borderRadius: '0.75rem',
                  border: paymentMethod === 'COD' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: paymentMethod === 'COD' ? '#EEF2FF' : '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: paymentMethod === 'COD' ? 'var(--primary)' : 'var(--text-main)',
                  transition: 'all 0.2s'
                }}
              >
                <Truck size={16} /> COD (Giao hàng)
              </button>
              <button 
                type="button" 
                onClick={() => setPaymentMethod('VNPAY')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem',
                  borderRadius: '0.75rem',
                  border: paymentMethod === 'VNPAY' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: paymentMethod === 'VNPAY' ? '#EEF2FF' : '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: paymentMethod === 'VNPAY' ? 'var(--primary)' : 'var(--text-main)',
                  transition: 'all 0.2s'
                }}
              >
                <CreditCard size={16} /> Ví VNPAY
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleCheckout}
            disabled={orderLoading}
            style={{ width: '100%', marginTop: '2.5rem', height: '60px', fontSize: '1.1rem', borderRadius: '1rem', boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)' }}
          >
            {orderLoading ? 'Đang xử lý...' : (
              <><ArrowRight size={22} /> {isLoggedIn ? 'Tiến hành thanh toán' : 'Đăng nhập để mua hàng'}</>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/products" className="continue-shopping" style={{ fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              ← Tiếp tục mua sắm
            </Link>
          </div>
          
          <div className="summary-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', opacity: 0.5 }}>
             <Shield size={20} title="Bảo mật" />
             <Truck size={20} title="Giao hàng nhanh" />
             <Package size={20} title="Đóng gói cẩn thận" />
          </div>
        </div>
      </div>
    </div>
  );
}
