import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getProducts, getProductsByCategory, getProductsByName } from '../api/api';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, Filter, Package, Search } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [addedId, setAddedId] = useState(null);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nameParam = searchParams.get('name');

  // Load custom categories from local storage
  let customCats = [];
  try {
    const stored = localStorage.getItem('rf_custom_categories');
    if (stored) {
      customCats = JSON.parse(stored);
    }
  } catch (e) {
    console.error(e);
  }
  const CATEGORIES = ['All', 'Electronics', 'Accessories', 'Displays', 'Audio', 'Smart Home', ...customCats];

  useEffect(() => {
    setLoading(true);
    const fetch = nameParam
      ? getProductsByName(nameParam)
      : activeCategory === 'All'
      ? getProducts()
      : getProductsByCategory(activeCategory);

    fetch
      .then((res) => setProducts(res.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory, nameParam]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h1><Package size={32} /> Danh mục sản phẩm</h1>
        {nameParam && (
          <p className="search-result-label">
            <Search size={16} /> Kết quả tìm kiếm: "<strong>{nameParam}</strong>"
          </p>
        )}
      </div>

      {/* Category Filter */}
      {!nameParam && (
        <div className="category-filter">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="loading-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card skeleton" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <Package size={64} />
          <h3>Không tìm thấy sản phẩm nào</h3>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            Xem tất cả sản phẩm
          </button>
        </div>
      ) : (
        <div className="grid">
          {products.map((product) => (
            <Link to={`/products/${product.id}`} key={product.id} className="card product-card">
              <div className="card-image">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.productName} className="product-img" />
                ) : (
                  <Package size={56} />
                )}
              </div>
              <div className="card-body">
                <div className="flex-between mb-2">
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{product.category}</span>
                </div>
                <h3 className="card-title">{product.productName}</h3>
                <p className="card-desc">{product.discription}</p>
                <div className="card-footer">
                  <span className="card-price">{Number(product.price).toLocaleString('vi-VN')} đ</span>
                  <button
                    className={`btn btn-primary btn-sm ${addedId === product.id ? 'btn-success' : ''}`}
                    onClick={(e) => handleAddToCart(e, product)}
                    style={{ padding: '0.6rem 1rem' }}
                  >
                    <ShoppingCart size={16} />
                    {addedId === product.id ? 'Đã thêm!' : 'Thêm vào giỏ'}
                  </button>
                </div>
                {product.availability === 0 && (
                  <span className="out-of-stock-badge">Hết hàng</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
