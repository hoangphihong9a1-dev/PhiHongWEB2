import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, getRecommendations, addRecommendation } from '../api/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Star, ArrowLeft, Package } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user, isLoggedIn } = useAuth();

  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingMsg, setRatingMsg] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProductById(id)
      .then((res) => {
        setProduct(res.data);
        return getRecommendations(res.data.productName);
      })
      .then((res) => setRecommendations(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleSubmitRating = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setSubmittingRating(true);
    try {
      await addRecommendation(user.id, product.id, rating);
      setRatingMsg('Đánh giá của bạn đã được gửi!');
      const res = await getRecommendations(product.productName);
      setRecommendations(res.data || []);
    } catch {
      setRatingMsg('Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const avgRating =
    recommendations.length > 0
      ? recommendations.reduce((s, r) => s + r.rating, 0) / recommendations.length
      : 0;

  if (loading) return <div className="loading-center">Đang tải sản phẩm...</div>;
  if (!product) return <div className="empty-state"><h3>Không tìm thấy sản phẩm</h3></div>;

  return (
    <div className="page-wrapper container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Quay lại
      </button>

      <div className="product-detail">
        {/* Image */}
        <div className="product-image-large">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.productName} className="product-img-detail" />
          ) : (
            <Package size={120} color="var(--text-muted)" />
          )}
          <span className="category-badge">{product.category}</span>
        </div>

        {/* Info */}
        <div className="product-info">
          <h1 className="product-title">{product.productName}</h1>

          {/* Rating summary */}
          <div className="rating-summary">
            <div className="flex-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={18} fill={s <= Math.round(avgRating) ? '#FBBF24' : 'none'} color="#FBBF24" />
              ))}
            </div>
            <span>{avgRating > 0 ? `${avgRating.toFixed(1)} / 5.0` : 'Chưa có đánh giá'}</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span>{recommendations.length} đánh giá</span>
          </div>

          <p className="product-description">{product.discription}</p>
          
          <div className="product-price">${Number(product.price).toFixed(2)}</div>

          <div className={`product-availability ${product.availability ? 'in-stock' : 'out-stock'}`}>
            {product.availability ? '✓ Còn hàng' : '✗ Hết hàng'}
          </div>

          {/* Quantity */}
          <div className="quantity-row">
            <label>Số lượng:</label>
            <div className="quantity-control">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <button
            className={`btn btn-primary btn-lg ${added ? 'btn-success' : ''}`}
            onClick={handleAddToCart}
            disabled={!product.availability}
            style={{ width: '100%', maxWidth: '300px' }}
          >
            <ShoppingCart size={20} />
            {added ? 'Đã thêm vào giỏ!' : 'Thêm vào giỏ hàng'}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2><Star size={24} color="var(--warning)" fill="var(--warning)" /> Đánh giá & Nhận xét</h2>

        {/* Submit rating */}
        <div className="rating-form">
          <h3>Để lại đánh giá của bạn</h3>
          <p className="text-muted mb-4" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
            Chia sẻ trải nghiệm của bạn về sản phẩm này với những người mua khác.
          </p>
          <div className="stars-input">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={36}
                fill={(hoverRating || rating) >= s ? '#FBBF24' : 'none'}
                color="#FBBF24"
                style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(s)}
                className={(hoverRating || rating) >= s ? 'scale-110' : ''}
              />
            ))}
          </div>
          {ratingMsg && (
            <div className={`alert ${ratingMsg.includes('Lỗi') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '1.5rem' }}>
              {ratingMsg}
            </div>
          )}
          <button 
            className="btn btn-primary" 
            onClick={handleSubmitRating} 
            disabled={submittingRating}
            style={{ minWidth: '160px' }}
          >
            {submittingRating ? 'Đang gửi...' : isLoggedIn ? 'Gửi đánh giá' : 'Đăng nhập để đánh giá'}
          </button>
        </div>

        {/* Reviews list */}
        <div className="reviews-container">
          {recommendations.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem', background: '#fff', borderRadius: '1.5rem', border: '1px solid var(--border)' }}>
              <Star size={40} color="var(--border)" />
              <p className="text-muted mt-2">Chưa có đánh giá nào cho sản phẩm này.</p>
            </div>
          ) : (
            <div className="reviews-list">
              {recommendations.map((rec) => (
                <div key={rec.id} className="review-card">
                  <div className="review-header">
                    <div className="flex-center gap-2">
                      <div className="user-avatar" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                        {(rec.user?.userName || 'U')[0].toUpperCase()}
                      </div>
                      <div className="flex-column">
                        <span className="review-user">
                          {rec.user?.userDetails?.firstName || rec.user?.userName || 'Người dùng ẩn danh'}
                        </span>
                        <small className="text-muted">Đã đánh giá {rec.rating} sao</small>
                      </div>
                    </div>
                    <div className="review-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} fill={s <= rec.rating ? '#FBBF24' : 'none'} color="#FBBF24" />
                      ))}
                    </div>
                  </div>
                  <p className="review-text" style={{ marginTop: '1rem', color: 'var(--text-main)' }}>
                    Sản phẩm chất lượng tuyệt vời, tôi rất hài lòng với lựa chọn này!
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
