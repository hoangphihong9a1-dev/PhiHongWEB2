import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, addProduct, deleteProduct } from '../api/api';
import { Package, Plus, Trash2, Tag, Image as ImageIcon, ArrowLeft } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productName: '',
    discription: '',
    price: '',
    category: '',
    imageUrl: '',
    availability: 10
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await addProduct(newProduct);
      setProducts([res.data, ...products]);
      setShowAddForm(false);
      setNewProduct({ productName: '', discription: '', price: '', category: '', imageUrl: '', availability: 10 });
    } catch (err) {
      alert('Lỗi khi thêm sản phẩm.');
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
          <h1><Package /> Quản lý sản phẩm</h1>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary btn-sm">
          {showAddForm ? 'Hủy' : <><Plus size={18} /> Thêm sản phẩm</>}
        </button>
      </div>

      {showAddForm && (
        <div className="admin-form-card">
          <h3>Thêm sản phẩm mới</h3>
          <form onSubmit={handleAddProduct} className="admin-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Tên sản phẩm</label>
                <input required value={newProduct.productName} onChange={e => setNewProduct({...newProduct, productName: e.target.value})} placeholder="Tên sản phẩm" />
              </div>
              <div className="form-group">
                <label>Danh mục</label>
                <input required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} placeholder="VD: Điện tử, Thời trang..." />
              </div>
              <div className="form-group">
                <label>Giá (VNĐ)</label>
                <input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Số lượng kho</label>
                <input required type="number" value={newProduct.availability} onChange={e => setNewProduct({...newProduct, availability: e.target.value})} placeholder="10" />
              </div>
            </div>
            <div className="form-group">
              <label>Link ảnh (URL)</label>
              <input value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} placeholder="https://unsplash.com/..." />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea value={newProduct.discription} onChange={e => setNewProduct({...newProduct, discription: e.target.value})} placeholder="Mô tả chi tiết sản phẩm" rows="3"></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Lưu sản phẩm</button>
          </form>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Kho</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="admin-table-img">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.productName} /> : <ImageIcon size={20} />}
                  </div>
                </td>
                <td><strong>{p.productName}</strong></td>
                <td><span className="badge badge-outline">{p.category}</span></td>
                <td>{Number(p.price).toLocaleString()}đ</td>
                <td>{p.availability}</td>
                <td>
                  <button onClick={() => handleDelete(p.id)} className="btn-icon btn-danger">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
