import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Footer() {
  const location = useLocation();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');

  // Hide footer on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    showToast('Đăng ký nhận bản tin khuyến mãi thành công!', 'success');
    setEmail('');
  };

  return (
    <footer className="site-footer">
      {/* Upper Features Bar */}
      <div className="footer-features">
        <div className="container features-grid">
          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <Truck size={24} />
            </div>
            <div className="feature-text">
              <h4>Giao Hàng Miễn Phí</h4>
              <p>Cho hóa đơn từ 15 triệu VND</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={24} />
            </div>
            <div className="feature-text">
              <h4>Bảo Hành Chính Hãng</h4>
              <p>Cam kết 100% sản phẩm chính hãng</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <RotateCcw size={24} />
            </div>
            <div className="feature-text">
              <h4>Đổi Trả Trong 30 Ngày</h4>
              <p>Lỗi 1 đổi 1 nhanh chóng tại shop</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="footer-main">
        <div className="container footer-grid">
          {/* Brand Info */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo">
              <span className="logo-gradient">RainbowTech</span>
            </Link>
            <p className="brand-desc">
              Hệ thống bán lẻ laptop và thiết bị điện tử công nghệ chính hãng hàng đầu Việt Nam. Chất lượng tối ưu, phục vụ chuyên nghiệp.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon">
                <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon">
                <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon">
                <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </a>
            </div>
          </div>

          {/* Links 1: Products */}
          <div className="footer-col">
            <h3>Sản Phẩm</h3>
            <ul className="footer-links">
              <li><Link to="/products?category=Laptop">Laptops & MacBooks</Link></li>
              <li><Link to="/products?category=Thiết bị điện tử">Thiết bị điện tử</Link></li>
              <li><Link to="/products">Tất cả sản phẩm</Link></li>
              <li><Link to="/orders">Tra cứu đơn hàng</Link></li>
            </ul>
          </div>

          {/* Links 2: Support */}
          <div className="footer-col">
            <h3>Hỗ Trợ Khách Hàng</h3>
            <ul className="footer-links">
              <li><a href="#!">Quy chế hoạt động</a></li>
              <li><a href="#!">Chính sách bảo mật</a></li>
              <li><a href="#!">Chính sách bảo hành</a></li>
              <li><a href="#!">Hệ thống cửa hàng</a></li>
            </ul>
          </div>

          {/* Contact / Newsletter */}
          <div className="footer-col newsletter-col">
            <h3>Liên Hệ & Đăng Ký</h3>
            <div className="contact-info-list">
              <div className="contact-info-item">
                <Phone size={16} />
                <span>1900 6789 (Hotline hỗ trợ)</span>
              </div>
              <div className="contact-info-item">
                <Mail size={16} />
                <span>support@rainbowtech.vn</span>
              </div>
              <div className="contact-info-item">
                <MapPin size={16} />
                <span>123 Đường Ba Tháng Hai, Quận 10, TP. Hồ Chí Minh</span>
              </div>
            </div>
            
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input 
                type="email" 
                placeholder="Nhập email nhận khuyến mãi..." 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container bottom-flex">
          <p className="copyright">
            © {new Date().getFullYear()} RainbowTech. Tất cả quyền được bảo lưu.
          </p>
          <div className="payment-methods">
            <span className="payment-badge">VNPAY</span>
            <span className="payment-badge">COD</span>
            <span className="payment-badge">VISA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
