import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, getProductsByCategory } from '../api/api';
import { useCart } from '../context/CartContext';
import {
  ShoppingCart, Package, Star, TrendingUp, Shield, Truck, Headphones,
  ArrowRight, Zap, FileText
} from 'lucide-react';
import { MOCK_ARTICLES } from './ArticlesPage';
import heroImg from '../assets/hero.png';

const FEATURES = [
  { icon: <Truck size={32} />, title: 'Miễn phí vận chuyển', desc: 'Cho đơn hàng trên 500.000đ' },
  { icon: <Shield size={32} />, title: 'Bảo hành chính hãng', desc: 'Bảo hành 12 tháng tất cả sản phẩm' },
  { icon: <Headphones size={32} />, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ hỗ trợ luôn sẵn sàng' },
  { icon: <Zap size={32} />, title: 'Giao hàng nhanh', desc: 'Nhận hàng trong 24 giờ' },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [electronics, setElectronics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getProducts(), getProductsByCategory('Electronics')])
      .then(([allRes, elecRes]) => {
        setFeaturedProducts((allRes.data || []).slice(0, 4));
        setElectronics((elecRes.data || []).slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    addItem(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Zap size={14} /> Microservices Architecture
            </div>
            <h1>Mua sắm thông minh<br /><span style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>cùng RainbowForest</span></h1>
            <p>Khám phá hàng ngàn sản phẩm công nghệ cao cấp. Được cung cấp bởi hệ thống microservices hiện đại với Spring Boot, Redis &amp; React.</p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/products')}>
                <ShoppingCart size={20} /> Mua sắm ngay
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/register')}>
                Đăng ký miễn phí <ArrowRight size={18} />
              </button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><span>5+</span><label>Services</label></div>
              <div className="hero-stat"><span>100+</span><label>Sản phẩm</label></div>
              <div className="hero-stat"><span>24/7</span><label>Hỗ trợ</label></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-orb" />
            <img src={heroImg} alt="Futuristic Tech Products" className="hero-banner-img" />
            <div className="hero-floating-card">
              <div className="flex-center icon-box">
                <Package size={24} />
              </div>
              <div>
                <h4>Premium Products</h4>
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="var(--warning)" color="var(--warning)" />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <div className="section-header flex-between">
            <h2 className="section-title"><Star size={24} color="var(--warning)" /> Sản phẩm nổi bật</h2>
            <Link to="/products" className="btn btn-outline btn-sm">Xem tất cả <ArrowRight size={16} /></Link>
          </div>
          {loading ? (
            <div className="grid">
              {[...Array(4)].map((_, i) => <div key={i} className="product-card" style={{ height: '380px', background: 'var(--bg-soft)' }} />)}
            </div>
          ) : (
            <div className="grid">
              {featuredProducts.map((product) => (
                <Link to={`/products/${product.id}`} key={product.id} className="product-card">
                  <div className="card-image">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.productName} className="product-img" />
                    ) : (
                      <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}><Package size={48} /></div>
                    )}
                    <span className="category-badge">{product.category}</span>
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{product.productName}</h3>
                    <p className="card-desc" style={{ marginBottom: '1.5rem' }}>{product.discription}</p>
                    <div className="flex-between">
                      <span className="card-price">{Number(product.price).toLocaleString('vi-VN')} đ</span>
                      <button
                        className={`btn btn-primary btn-sm ${addedId === product.id ? 'btn-success' : ''}`}
                        onClick={(e) => handleAddToCart(e, product)}
                        style={{ padding: '0.6rem 0.8rem' }}
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Electronics */}
      {electronics.length > 0 && (
        <section className="section" style={{ background: 'var(--bg-soft)' }}>
          <div className="container">
            <div className="section-header flex-between">
              <h2 className="section-title"><TrendingUp size={24} color="var(--accent)" /> Đồ điện tử Hot</h2>
              <Link to="/products?category=Electronics" className="btn btn-outline btn-sm">Xem tất cả <ArrowRight size={16} /></Link>
            </div>
            <div className="grid">
              {electronics.map((product) => (
                <Link to={`/products/${product.id}`} key={product.id} className="product-card">
                  <div className="card-image">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.productName} className="product-img" />
                    ) : (
                      <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}><Package size={48} /></div>
                    )}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{product.productName}</h3>
                    <div className="flex-between" style={{ marginTop: '1rem' }}>
                      <span className="card-price">{Number(product.price).toLocaleString('vi-VN')} đ</span>
                      <button
                        className={`btn btn-primary btn-sm ${addedId === product.id ? 'btn-success' : ''}`}
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog/Articles Section */}
      <section className="section" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="section-header flex-between">
            <h2 className="section-title">
              <FileText size={24} style={{ color: 'var(--primary)', marginRight: '0.5rem' }} /> 
              Góc tư vấn & Tin tức công nghệ
            </h2>
            <Link to="/articles" className="btn btn-outline btn-sm">Xem tất cả bài viết <ArrowRight size={16} /></Link>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {MOCK_ARTICLES.slice(0, 3).map(art => (
              <div 
                key={art.id} 
                onClick={() => navigate(`/articles/${art.id}`)}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '1.25rem',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                className="article-card-home"
              >
                <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                  <img src={art.imageUrl} alt={art.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span className="category-badge" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>{art.category}</span>
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.8rem', lineHeight: 1.4, height: '3.1rem', overflow: 'hidden', color: 'var(--text)' }}>{art.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem', flexGrow: 1, height: '2.7rem', overflow: 'hidden' }}>{art.summary}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                    Đọc chi tiết <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          .article-card-home:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-md) !important;
            border-color: var(--primary-light) !important;
          }
        `}</style>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ background: 'var(--gradient)', padding: '4rem 2rem', borderRadius: '2.5rem', color: '#fff', boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Sẵn sàng trải nghiệm?</h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>Đăng ký tài khoản miễn phí và bắt đầu mua sắm ngay hôm nay cùng hệ thống hiện đại nhất.</p>
            <div className="flex-center gap-2">
              <button className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)' }} onClick={() => navigate('/register')}>
                Tạo tài khoản ngay
              </button>
              <button className="btn btn-outline btn-lg" style={{ borderColor: '#fff', color: '#fff' }} onClick={() => navigate('/products')}>
                Xem sản phẩm
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
