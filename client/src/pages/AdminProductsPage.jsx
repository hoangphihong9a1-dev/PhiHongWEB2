import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../api/api';
import { Package, Plus, Trash2, Edit, X, Search, Image as ImageIcon, ArrowLeft } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null when adding
  const [form, setForm] = useState({
    productName: '',
    discription: '',
    price: '',
    category: '',
    imageUrl: '',
    availability: 10
  });

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

  const uniqueCategories = Array.from(
    new Set([
      ...products.map(p => p.category).filter(Boolean),
      'Electronics',
      'Accessories',
      'Displays',
      'Audio',
      'Smart Home',
      ...customCats
    ])
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredProducts(
      products.filter(p =>
        (p.productName || '').toLowerCase().includes(term) ||
        (p.category || '').toLowerCase().includes(term)
      )
    );
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data || []);
      setFilteredProducts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm({ productName: '', discription: '', price: '', category: uniqueCategories[0] || 'Electronics', imageUrl: '', availability: 10 });
    setShowModal(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setForm({
      productName: product.productName || '',
      discription: product.discription || '',
      price: product.price || '',
      category: product.category || '',
      imageUrl: product.imageUrl || '',
      availability: product.availability || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        alert('Lỗi khi xóa sản phẩm.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        availability: Number(form.availability)
      };

      if (editingProduct) {
        // Edit
        const res = await updateProduct(editingProduct.id, payload);
        setProducts(products.map(p => p.id === editingProduct.id ? res.data : p));
      } else {
        // Add
        const res = await addProduct(payload);
        setProducts([res.data, ...products]);
      }
      setShowModal(false);
    } catch (err) {
      alert(editingProduct ? 'Lỗi khi cập nhật sản phẩm.' : 'Lỗi khi thêm sản phẩm.');
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn một file ảnh.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Kích thước ảnh tối đa là 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };


  if (loading) return <div className="loading-center">Đang tải...</div>;

  return (
    <div className="page-wrapper" style={{ padding: '0', maxWidth: '100%', margin: '0' }}>
      <div className="page-header flex-between mb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.8rem' }}>
            <Package size={28} /> Quản lý sản phẩm
          </h1>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <Plus size={18} /> Thêm sản phẩm
        </button>
      </div>

      {/* Actions / Search Bar */}
      <div className="admin-actions-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon-left" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm hoặc danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="badge badge-primary">{filteredProducts.length} sản phẩm</span>
      </div>

      {/* Products Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Kho</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="admin-table-img">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.productName} /> : <ImageIcon size={20} className="text-muted" />}
                  </div>
                </td>
                <td>
                  <div className="flex-column">
                    <strong>{p.productName}</strong>
                    <small className="text-muted" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '280px' }}>
                      {p.discription}
                    </small>
                  </div>
                </td>
                <td><span className="badge badge-primary">{p.category}</span></td>
                <td>{Number(p.price).toLocaleString()}đ</td>
                <td>{p.availability} sản phẩm</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleOpenEdit(p)} className="btn-icon btn-icon-edit" title="Sửa">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="btn-icon btn-icon-delete" title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Không tìm thấy sản phẩm nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group form-grid-full">
                  <label>Tên sản phẩm *</label>
                  <input
                    required
                    value={form.productName}
                    onChange={e => setForm({ ...form, productName: e.target.value })}
                    placeholder="Tên sản phẩm"
                  />
                </div>
                <div className="form-group">
                  <label>Danh mục *</label>
                  <select
                    required
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      color: 'var(--text)'
                    }}
                  >
                    <option value="" disabled>-- Chọn danh mục --</option>
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Giá (VNĐ) *</label>
                  <input
                    required
                    type="number"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Số lượng kho *</label>
                  <input
                    required
                    type="number"
                    value={form.availability}
                    onChange={e => setForm({ ...form, availability: e.target.value })}
                    placeholder="10"
                  />
                </div>
                <div className="form-group form-grid-full">
                  <label>Hình ảnh sản phẩm</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        id="product-image-upload"
                      />
                      <label
                        htmlFor="product-image-upload"
                        className="btn btn-outline btn-sm"
                        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}
                      >
                        <ImageIcon size={16} /> Chọn ảnh từ thiết bị
                      </label>
                      {form.imageUrl && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm"
                          style={{ color: '#ef4444', padding: 0 }}
                          onClick={() => setForm({ ...form, imageUrl: '' })}
                        >
                          Xóa ảnh
                        </button>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <input
                          value={form.imageUrl}
                          onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                          placeholder="Hoặc nhập URL ảnh (https://images.unsplash.com/...)"
                          style={{ width: '100%' }}
                        />
                      </div>
                      {form.imageUrl && (
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '8px', 
                          border: '1px solid var(--border)', 
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f8fafc',
                          flexShrink: 0
                        }}>
                          <img 
                            src={form.imageUrl} 
                            alt="Preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-group form-grid-full">
                  <label>Mô tả sản phẩm</label>
                  <textarea
                    value={form.discription}
                    onChange={e => setForm({ ...form, discription: e.target.value })}
                    placeholder="Mô tả chi tiết sản phẩm"
                    rows="3"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
