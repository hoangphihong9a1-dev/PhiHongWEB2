import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getRecommendations, deleteRecommendation } from '../api/api';
import { Star, MessageSquare, Trash2, Package, ArrowLeft, Heart } from 'lucide-react';

export default function AdminRecommendationsPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data || []);
      if (res.data && res.data.length > 0) {
        handleProductSelect(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = async (product) => {
    setSelectedProduct(product);
    try {
      // In the database or recommend-service, we fetch recommendations using the productName
      const res = await getRecommendations(product.productName);
      setRecommendations(res.data || []);
    } catch (err) {
      setRecommendations([]);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        await deleteRecommendation(id);
        setRecommendations(recommendations.filter(r => r.id !== id));
      } catch (err) {
        alert('Lỗi khi xóa đánh giá.');
      }
    }
  };

  if (loading) return <div className="loading-center">Đang tải...</div>;

  return (
    <div className="page-wrapper" style={{ padding: '0', maxWidth: '100%', margin: '0' }}>
      <div className="page-header flex-between mb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.8rem' }}>
            <Star size={28} /> Quản lý đánh giá & Đề xuất
          </h1>
        </div>
      </div>

      <div className="admin-split-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Side: Product List */}
        <div className="admin-sidebar-list" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={18} /> Danh sách sản phẩm
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
            {products.map(p => (
              <div 
                key={p.id} 
                className={`admin-sidebar-item ${selectedProduct?.id === p.id ? 'active' : ''}`}
                onClick={() => handleProductSelect(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: selectedProduct?.id === p.id ? '700' : '500',
                  color: selectedProduct?.id === p.id ? 'var(--primary)' : 'var(--text-main)',
                  background: selectedProduct?.id === p.id ? 'var(--primary-light)' : 'transparent',
                  transition: 'all 0.2s'
                }}
              >
                <Package size={16} style={{ flexShrink: 0 }} />
                <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.productName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Ratings */}
        <div className="admin-right-content-panel" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '1rem', padding: '2rem', boxShadow: 'var(--shadow-sm)', minHeight: '400px' }}>
          {selectedProduct ? (
            <>
              <div className="flex-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {selectedProduct.productName}
                  </h2>
                  <small className="text-muted">{selectedProduct.category}</small>
                </div>
                <span className="badge badge-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  {recommendations.length} đánh giá
                </span>
              </div>

              {recommendations.length === 0 ? (
                <div className="empty-state" style={{ border: 'none', boxShadow: 'none', padding: '4rem 1rem' }}>
                  <MessageSquare size={48} className="text-muted" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Chưa có đánh giá</h3>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>Sản phẩm này chưa nhận được nhận xét nào từ khách hàng.</p>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Mã khách hàng</th>
                        <th>Điểm đánh giá</th>
                        <th style={{ textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recommendations.map(r => (
                        <tr key={r.id}>
                          <td>#{r.id}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                              User #{r.userId}
                            </div>
                          </td>
                          <td>
                            <div className="flex-center gap-1 text-warning" style={{ justifyContent: 'flex-start' }}>
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} fill={i < r.rating ? 'var(--warning)' : 'none'} stroke="var(--warning)" />
                              ))}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button onClick={() => handleDelete(r.id)} className="btn-icon btn-icon-delete" title="Xóa đánh giá">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state" style={{ border: 'none', boxShadow: 'none', padding: '6rem 1rem' }}>
              <Heart size={48} className="text-muted" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Chọn một sản phẩm</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Chọn sản phẩm ở cột bên trái để xem các đánh giá tương ứng.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
