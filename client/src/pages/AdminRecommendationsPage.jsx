import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getRecommendations, deleteRecommendation } from '../api/api';
import { Star, MessageSquare, Trash2, Package, ArrowLeft } from 'lucide-react';

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
      setProducts(res.data);
      if (res.data.length > 0) {
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
      const res = await getRecommendations(product.name);
      setRecommendations(res.data || []);
    } catch (err) {
      setRecommendations([]);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa đánh giá này?')) {
      try {
        await deleteRecommendation(id);
        setRecommendations(recommendations.filter(r => r.id !== id));
      } catch (err) {
        alert('Lỗi khi xóa.');
      }
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
          <h1><Star /> Quản lý đề xuất & Đánh giá</h1>
        </div>
      </div>

      <div className="admin-split-layout">
        <div className="admin-sidebar-list">
          <h3>Sản phẩm</h3>
          {products.map(p => (
            <div 
              key={p.id} 
              className={`admin-sidebar-item ${selectedProduct?.id === p.id ? 'active' : ''}`}
              onClick={() => handleProductSelect(p)}
            >
              <Package size={16} />
              <span>{p.name}</span>
            </div>
          ))}
        </div>

        <div className="admin-main-content">
          {selectedProduct && (
            <>
              <div className="flex-between mb-4">
                <h2>Đánh giá cho: {selectedProduct.name}</h2>
                <span className="badge badge-primary">{recommendations.length} đánh giá</span>
              </div>

              {recommendations.length === 0 ? (
                <div className="empty-state">
                  <MessageSquare size={40} />
                  <p>Sản phẩm này chưa có đánh giá nào.</p>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Khách hàng</th>
                        <th>Điểm đánh giá</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recommendations.map(r => (
                        <tr key={r.id}>
                          <td>#{r.id}</td>
                          <td>User ID: {r.userId}</td>
                          <td>
                            <div className="flex-center gap-1 text-warning">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < r.rating ? 'currentColor' : 'none'} />
                              ))}
                            </div>
                          </td>
                          <td>
                            <button onClick={() => handleDelete(r.id)} className="btn-icon btn-danger">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
