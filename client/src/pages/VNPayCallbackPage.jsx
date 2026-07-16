import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyVNPayPayment } from '../api/api';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShoppingBag } from 'lucide-react';

export default function VNPayCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'failed'
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    setOrderId(params['vnp_TxnRef'] || '');
    if (params['vnp_Amount']) {
      setAmount(Number(params['vnp_Amount']) / 100);
    }

    // Call API to verify payment
    verifyVNPayPayment(params)
      .then((res) => {
        if (res.data && res.data.status === 'success') {
          setStatus('success');
          setMessage(res.data.message || 'Thanh toán đơn hàng thành công!');
        } else {
          setStatus('failed');
          setMessage(res.data.message || 'Thanh toán không thành công.');
        }
      })
      .catch((err) => {
        console.error(err);
        setStatus('failed');
        setMessage(err.response?.data?.message || 'Xác thực chữ ký giao dịch thất bại.');
      });
  }, [location.search]);

  return (
    <div className="container flex-center" style={{ minHeight: '80vh', marginTop: '2rem', marginBottom: '2rem' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '2rem',
        padding: '3rem 2.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid var(--border)',
        maxWidth: '520px',
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        {status === 'loading' && (
          <>
            <div style={{ display: 'flex', position: 'relative', width: '80px', height: '80px', justifyContent: 'center', alignItems: 'center' }}>
              <Loader2 size={64} className="text-primary" style={{ animation: 'spin 1.5s linear infinite' }} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>Xác thực giao dịch</h2>
            <p style={{ color: '#64748B', fontSize: '1rem', margin: 0 }}>Vui lòng giữ kết nối. Chúng tôi đang kiểm tra chữ ký số và cập nhật đơn hàng của bạn...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#D1FAE5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.15)'
            }}>
              <CheckCircle2 size={48} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981', margin: 0 }}>Thanh toán thành công!</h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>Đơn hàng của bạn đã được ghi nhận thanh toán hoàn tất.</p>
            
            <div style={{
              width: '100%',
              background: '#F8FAFC',
              border: '1px solid #F1F5F9',
              borderRadius: '1rem',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#64748B' }}>Mã đơn hàng:</span>
                <strong style={{ color: '#334155' }}>#{orderId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#64748B' }}>Số tiền thanh toán:</span>
                <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>{amount.toLocaleString('vi-VN')} đ</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#64748B' }}>Phương thức:</span>
                <strong style={{ color: '#334155' }}>Cổng thanh toán VNPAY</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
              <Link to="/orders" className="btn btn-primary" style={{ flex: 1, padding: '0.85rem', borderRadius: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={18} /> Đơn hàng của tôi
              </Link>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EF4444',
              boxShadow: '0 8px 16px rgba(239, 68, 68, 0.15)'
            }}>
              <XCircle size={48} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#EF4444', margin: 0 }}>Thanh toán thất bại!</h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>{message}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '1rem' }}>
              <Link to="/cart" className="btn btn-primary" style={{ padding: '0.85rem', borderRadius: '0.75rem', fontWeight: 600 }}>
                Thử lại trong giỏ hàng
              </Link>
              <Link to="/orders" className="btn btn-outline" style={{ padding: '0.85rem', borderRadius: '0.75rem', fontWeight: 600 }}>
                Xem danh sách đơn hàng
              </Link>
            </div>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
