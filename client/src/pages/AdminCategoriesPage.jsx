import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, updateProduct, deleteProduct } from '../api/api';
import { Layers, Plus, Edit, Trash2, X, ArrowLeft, RefreshCw, Package, Check } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Selection/Form states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState('');
  const [updatedCategoryName, setUpdatedCategoryName] = useState('');
  const [deletingCategory, setDeletingCategory] = useState('');
  const [deleteOption, setDeleteOption] = useState('reassign'); // 'reassign' or 'delete'
  const [reassignTarget, setReassignTarget] = useState('Khác');
  const [actionLoading, setActionLoading] = useState(false);

  const defaultCategories = ['Electronics', 'Accessories', 'Displays', 'Audio', 'Smart Home'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      const fetchedProducts = res.data || [];
      setProducts(fetchedProducts);

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

      // Extract current categories used in products
      const dbCategories = fetchedProducts.map(p => p.category).filter(Boolean);

      // Unique list of all categories
      const uniqueCats = Array.from(new Set([...defaultCategories, ...dbCategories, ...customCats]));
      setCategories(uniqueCats);

      // Set default reassign target
      if (uniqueCats.length > 0) {
        setReassignTarget(uniqueCats[0]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Count products in a category
  const getProductCount = (catName) => {
    return products.filter(p => p.category === catName).length;
  };

  // Helper: Count total stock/inventory in a category
  const getCategoryStock = (catName) => {
    return products
      .filter(p => p.category === catName)
      .reduce((sum, p) => sum + (p.availability || 0), 0);
  };

  // Add Category
  const handleAddCategory = (e) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;

    if (categories.some(c => c.toLowerCase() === name.toLowerCase())) {
      alert('Danh mục này đã tồn tại!');
      return;
    }

    const updatedList = [...categories, name];
    setCategories(updatedList);
    
    // Save custom list
    const customCats = updatedList.filter(c => !defaultCategories.includes(c));
    localStorage.setItem('rf_custom_categories', JSON.stringify(customCats));

    setNewCategoryName('');
    setShowAddModal(false);
  };

  // Rename Category (Updates all corresponding products in the DB)
  const handleRenameCategory = async (e) => {
    e.preventDefault();
    const oldName = editingCategory;
    const newName = updatedCategoryName.trim();
    if (!newName || oldName === newName) {
      setShowEditModal(false);
      return;
    }

    if (categories.some(c => c.toLowerCase() === newName.toLowerCase() && c !== oldName)) {
      alert('Tên danh mục mới đã trùng với một danh mục khác!');
      return;
    }

    setActionLoading(true);
    try {
      // Find all products in old category
      const productsToUpdate = products.filter(p => p.category === oldName);
      
      // Update each product via API
      for (const p of productsToUpdate) {
        const payload = {
          productName: p.productName,
          discription: p.discription,
          price: Number(p.price),
          category: newName,
          imageUrl: p.imageUrl,
          availability: Number(p.availability)
        };
        await updateProduct(p.id, payload);
      }

      // Update category list
      const updatedList = categories.map(c => c === oldName ? newName : c);
      setCategories(updatedList);

      // Save custom list
      const customCats = updatedList.filter(c => !defaultCategories.includes(c));
      localStorage.setItem('rf_custom_categories', JSON.stringify(customCats));

      // Refresh product data
      await fetchData();
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi đổi tên danh mục trong cơ sở dữ liệu.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Category (Reassign or delete related products)
  const handleDeleteCategory = async () => {
    const catToDelete = deletingCategory;
    setActionLoading(true);
    try {
      const relatedProducts = products.filter(p => p.category === catToDelete);

      if (deleteOption === 'delete') {
        // Delete all products
        for (const p of relatedProducts) {
          await deleteProduct(p.id);
        }
      } else {
        // Reassign products to target category
        for (const p of relatedProducts) {
          const payload = {
            productName: p.productName,
            discription: p.discription,
            price: Number(p.price),
            category: reassignTarget,
            imageUrl: p.imageUrl,
            availability: Number(p.availability)
          };
          await updateProduct(p.id, payload);
        }
      }

      // Remove from category list
      const updatedList = categories.filter(c => c !== catToDelete);
      setCategories(updatedList);

      // Save custom list
      const customCats = updatedList.filter(c => !defaultCategories.includes(c));
      localStorage.setItem('rf_custom_categories', JSON.stringify(customCats));

      // Refresh data
      await fetchData();
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
      alert('Lỗi xảy ra khi xóa danh mục.');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setUpdatedCategoryName(cat);
    setShowEditModal(true);
  };

  const openDeleteModal = (cat) => {
    setDeletingCategory(cat);
    // Find target reassignment excluding the deleted category
    const remainingCats = categories.filter(c => c !== cat);
    if (remainingCats.length > 0) {
      setReassignTarget(remainingCats[0]);
    } else {
      setReassignTarget('Khác');
    }
    setShowDeleteModal(true);
  };

  if (loading) return <div className="loading-center">Đang tải danh mục sản phẩm...</div>;

  return (
    <div className="page-wrapper" style={{ padding: '0', maxWidth: '100%', margin: '0' }}>
      {/* Header */}
      <div className="page-header flex-between mb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
            <ArrowLeft size={16} /> Quay lại
          </Link>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>
            <Layers size={28} className="text-primary" /> Quản lý Danh mục
          </h1>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '0.5rem' }}>
          <Plus size={18} /> Thêm Danh mục
        </button>
      </div>

      {/* Grid Quick Stats for Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {categories.slice(0, 3).map((cat, idx) => (
          <div key={idx} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1.25rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: idx === 0 ? '#EEF2FF' : idx === 1 ? '#F0F9FF' : '#ECFDF5', 
              color: idx === 0 ? '#6366F1' : idx === 1 ? '#0EA5E9' : '#10B981', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Layers size={20} />
            </div>
            <div className="flex-column">
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>{cat}</span>
              <span style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.15rem' }}>
                {getProductCount(cat)} sản phẩm (Kho: {getCategoryStock(cat)})
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Categories Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên Danh mục</th>
              <th>Số lượng sản phẩm</th>
              <th>Tổng số lượng tồn</th>
              <th style={{ textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat}>
                <td>
                  <strong style={{ fontSize: '0.95rem', color: '#334155' }}>{cat}</strong>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: '#4F46E5' }}>{getProductCount(cat)}</span> sản phẩm
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>{getCategoryStock(cat)}</span> sản phẩm trong kho
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => openEditModal(cat)} 
                      className="btn-icon btn-icon-edit" 
                      title="Sửa tên danh mục"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => openDeleteModal(cat)} 
                      className="btn-icon btn-icon-delete" 
                      title="Xóa danh mục"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Không tìm thấy danh mục nào. Hãy thêm danh mục mới.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Add Category */}
      {showAddModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Thêm Danh mục mới</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="admin-form">
              <div className="form-group">
                <label>Tên Danh mục *</label>
                <input
                  required
                  type="text"
                  placeholder="Nhập tên danh mục (ví dụ: Phụ kiện, Smartwatch...)"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  Thêm mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Category */}
      {showEditModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Sửa tên Danh mục</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRenameCategory} className="admin-form">
              <div className="form-group">
                <label>Tên Danh mục mới *</label>
                <input
                  required
                  type="text"
                  value={updatedCategoryName}
                  onChange={e => setUpdatedCategoryName(e.target.value)}
                  style={{ width: '100%' }}
                  disabled={actionLoading}
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.5rem', lineHeight: '1.4' }}>
                ⚠️ <strong>Lưu ý:</strong> Việc đổi tên danh mục sẽ tự động cập nhật lại danh mục cho tất cả <strong>{getProductCount(editingCategory)}</strong> sản phẩm thuộc danh mục này trong cơ sở dữ liệu.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)} disabled={actionLoading}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Đang cập nhật DB...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Category */}
      {showDeleteModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ color: '#EF4444' }}>Xóa danh mục: {deletingCategory}</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="admin-form" style={{ padding: '0.5rem 0' }}>
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5', marginBottom: '1rem' }}>
                Danh mục này đang chứa <strong>{getProductCount(deletingCategory)}</strong> sản phẩm. Chọn phương án xử lý các sản phẩm này:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <input
                    type="radio"
                    name="deleteOption"
                    value="reassign"
                    checked={deleteOption === 'reassign'}
                    onChange={() => setDeleteOption('reassign')}
                  />
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>Chuyển sang danh mục khác</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B' }}>Các sản phẩm sẽ được gán sang danh mục mới mà không bị xóa.</span>
                  </div>
                </label>

                {deleteOption === 'reassign' && (
                  <div style={{ paddingLeft: '1.5rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Chọn danh mục nhận sản phẩm:</label>
                    <select
                      value={reassignTarget}
                      onChange={e => setReassignTarget(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1'
                      }}
                    >
                      {categories.filter(c => c !== deletingCategory).map(catName => (
                        <option key={catName} value={catName}>{catName}</option>
                      ))}
                    </select>
                  </div>
                )}

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', background: '#FFF5F5', borderRadius: '8px', border: '1px solid #FEE2E2' }}>
                  <input
                    type="radio"
                    name="deleteOption"
                    value="delete"
                    checked={deleteOption === 'delete'}
                    onChange={() => setDeleteOption('delete')}
                  />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#EF4444' }}>Xóa hết các sản phẩm liên quan</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#EF4444' }}>⚠️ CẢNH BÁO: Tất cả các sản phẩm thuộc danh mục này sẽ bị xóa vĩnh viễn khỏi Database!</span>
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowDeleteModal(false)} disabled={actionLoading}>
                  Hủy bỏ
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  style={{ background: '#EF4444', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 600 }}
                  onClick={handleDeleteCategory} 
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận Xóa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
