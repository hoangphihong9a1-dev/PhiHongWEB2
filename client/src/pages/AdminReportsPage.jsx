import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getAllOrders } from '../api/api';
import { 
  ArrowLeft, TrendingUp, ShoppingBag, DollarSign, Package, 
  Layers, ShoppingCart, Award, Calendar, RefreshCw 
} from 'lucide-react';

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Stats states
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    pendingRevenue: 0,
    totalOrders: 0,
    paidOrdersCount: 0,
    aov: 0,
  });

  const [categoryData, setCategoryData] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        getProducts().catch(() => ({ data: [] })),
        getAllOrders().catch(() => ({ data: [] }))
      ]);

      const fetchedProducts = productsRes.data || [];
      const fetchedOrders = ordersRes.data || [];

      setProducts(fetchedProducts);
      setOrders(fetchedOrders);

      // Create product lookup map: id -> category, price, name
      const productMap = {};
      fetchedProducts.forEach(p => {
        productMap[p.id] = {
          name: p.productName,
          category: p.category || 'Khác',
          price: Number(p.price || 0),
          imageUrl: p.imageUrl,
          availability: p.availability || 0
        };
      });

      // Calculate KPI metrics
      let paidRevenue = 0;
      let pendingRev = 0;
      let paidOrdersCount = 0;

      fetchedOrders.forEach(o => {
        const orderTotal = Number(o.total || 0);
        if (o.status === 'COMPLETED' || o.status === 'PAID') {
          paidRevenue += orderTotal;
          paidOrdersCount++;
        } else if (o.status === 'PAYMENT_EXPECTED') {
          pendingRev += orderTotal;
        }
      });

      // Calculate category revenue & items sold
      const categoryMetrics = {};
      const productSales = {};

      fetchedOrders.forEach(o => {
        // We calculate revenue based on successful orders (COMPLETED or PAID)
        const isPaid = (o.status === 'COMPLETED' || o.status === 'PAID');
        if (!isPaid) return;

        o.items?.forEach(item => {
          const productId = item.product?.id;
          const qty = Number(item.quantity || 0);
          
          // Get details from catalog if available, otherwise from order item
          const prodCatalog = productMap[productId] || {};
          const category = prodCatalog.category || item.product?.category || 'Khác';
          const price = prodCatalog.price || Number(item.product?.price || 0);
          const name = prodCatalog.name || item.product?.productName || `Sản phẩm #${productId}`;
          const subTotal = Number(item.subTotal || (qty * price));

          // Accumulate for category
          if (!categoryMetrics[category]) {
            categoryMetrics[category] = {
              categoryName: category,
              revenue: 0,
              itemsSold: 0,
              productCount: 0
            };
          }
          categoryMetrics[category].revenue += subTotal;
          categoryMetrics[category].itemsSold += qty;

          // Accumulate for product sales
          if (!productSales[productId]) {
            productSales[productId] = {
              id: productId,
              name: name,
              category: category,
              price: price,
              imageUrl: prodCatalog.imageUrl || '',
              itemsSold: 0,
              revenue: 0
            };
          }
          productSales[productId].itemsSold += qty;
          productSales[productId].revenue += subTotal;
        });
      });

      // Inject catalog product counts into categories
      fetchedProducts.forEach(p => {
        const cat = p.category || 'Khác';
        if (!categoryMetrics[cat]) {
          categoryMetrics[cat] = {
            categoryName: cat,
            revenue: 0,
            itemsSold: 0,
            productCount: 0
          };
        }
        categoryMetrics[cat].productCount += 1;
      });

      // Convert category metrics object to array
      const categoryDataArray = Object.values(categoryMetrics).map(item => ({
        ...item,
        percentage: paidRevenue > 0 ? (item.revenue / paidRevenue) * 100 : 0
      })).sort((a, b) => b.revenue - a.revenue);

      // Convert product sales object to array and sort for best sellers
      const bestSellersArray = Object.values(productSales)
        .sort((a, b) => b.itemsSold - a.itemsSold)
        .slice(0, 5);

      setKpis({
        totalRevenue: paidRevenue,
        pendingRevenue: pendingRev,
        totalOrders: fetchedOrders.length,
        paidOrdersCount: paidOrdersCount,
        aov: paidOrdersCount > 0 ? (paidRevenue / paidOrdersCount) : 0,
      });

      setCategoryData(categoryDataArray);
      setBestSellers(bestSellersArray);

    } catch (err) {
      console.error("Error analyzing reports data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-center">Đang phân tích báo cáo doanh thu...</div>;

  return (
    <div className="page-wrapper" style={{ padding: '0', maxWidth: '100%', margin: '0' }}>
      {/* Header */}
      <div className="page-header flex-between mb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
            <ArrowLeft size={16} /> Quay lại
          </Link>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>
            <TrendingUp size={28} className="text-primary" /> Báo cáo doanh thu & Danh mục
          </h1>
        </div>
        <button onClick={fetchData} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '0.5rem' }}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Total Paid Revenue Card */}
        <div style={{ 
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
          color: '#fff', 
          borderRadius: '1.25rem', 
          padding: '1.75rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Doanh thu thực tế</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.25rem 0 0 0', lineHeight: '1.1' }}>
              {kpis.totalRevenue.toLocaleString()}đ
            </h2>
            <small style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.75)', marginTop: '0.5rem', display: 'block' }}>
              Từ {kpis.paidOrdersCount} đơn hàng đã hoàn thành
            </small>
          </div>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={26} />
          </div>
        </div>

        {/* Pending Revenue Card */}
        <div style={{ 
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', 
          color: '#fff', 
          borderRadius: '1.25rem', 
          padding: '1.75rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.2)'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Doanh thu chờ thanh toán</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.25rem 0 0 0', lineHeight: '1.1' }}>
              {kpis.pendingRevenue.toLocaleString()}đ
            </h2>
            <small style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.75)', marginTop: '0.5rem', display: 'block' }}>
              Từ các đơn hàng đang chờ thanh toán
            </small>
          </div>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={26} />
          </div>
        </div>

        {/* Total Orders Card */}
        <div style={{ 
          background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', 
          color: '#fff', 
          borderRadius: '1.25rem', 
          padding: '1.75rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.2)'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng số đơn hàng</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.25rem 0 0 0', lineHeight: '1.1' }}>
              {kpis.totalOrders}
            </h2>
            <small style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.75)', marginTop: '0.5rem', display: 'block' }}>
              Tất cả trạng thái đơn hàng
            </small>
          </div>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={26} />
          </div>
        </div>

        {/* Average Order Value Card */}
        <div style={{ 
          background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)', 
          color: '#fff', 
          borderRadius: '1.25rem', 
          padding: '1.75rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxShadow: '0 10px 15px -3px rgba(236, 72, 153, 0.2)'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Giá trị trung bình đơn</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.25rem 0 0 0', lineHeight: '1.1' }}>
              {Math.round(kpis.aov).toLocaleString()}đ
            </h2>
            <small style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.75)', marginTop: '0.5rem', display: 'block' }}>
              Tính trên các đơn hàng hoàn tất
            </small>
          </div>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={26} />
          </div>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {/* Left Column: Revenue by Product Category */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1.25rem', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Layers size={20} className="text-primary" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Doanh thu theo danh mục</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {categoryData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>Chưa có phát sinh doanh thu.</div>
            ) : (
              categoryData.map((cat, index) => (
                <div key={cat.categoryName} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                    <span>{cat.categoryName}</span>
                    <span>
                      {cat.revenue.toLocaleString()}đ <span style={{ fontWeight: 500, color: '#94A3B8', fontSize: '0.8rem' }}>({cat.percentage.toFixed(1)}%)</span>
                    </span>
                  </div>
                  {/* Progress Bar Container */}
                  <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ 
                      width: `${cat.percentage}%`, 
                      height: '100%', 
                      background: index === 0 ? '#6366F1' : index === 1 ? '#10B981' : index === 2 ? '#3B82F6' : '#F59E0B', 
                      borderRadius: '999px',
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                    <span>{cat.productCount} sản phẩm trong kho</span>
                    <span>Đã bán {cat.itemsSold} sản phẩm</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Top Best-Selling Products */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1.25rem', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Award size={20} className="text-primary" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Top 5 Sản phẩm bán chạy nhất</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bestSellers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>Chưa có sản phẩm nào được bán.</div>
            ) : (
              bestSellers.map((item, index) => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '1rem', 
                  background: '#F8FAFC', 
                  border: '1px solid #F1F5F9',
                  borderRadius: '1rem'
                }}>
                  {/* Rank Badge */}
                  <div style={{ 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    background: index === 0 ? '#FEF3C7' : index === 1 ? '#F1F5F9' : '#FFFBEB',
                    color: index === 0 ? '#D97706' : index === 1 ? '#475569' : '#B45309',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>

                  {/* Product Image */}
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '8px', 
                    border: '1px solid #E2E8F0', 
                    background: '#fff',
                    overflow: 'hidden', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Package size={20} style={{ color: '#94A3B8' }} />
                    )}
                  </div>

                  {/* Product details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                    <span className="badge badge-outline" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', marginTop: '0.2rem', display: 'inline-block' }}>
                      {item.category}
                    </span>
                  </div>

                  {/* Quantity and Sales */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4F46E5', display: 'block' }}>
                      {item.revenue.toLocaleString()}đ
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Đã bán: <strong>{item.itemsSold}</strong> sản phẩm
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category Management Overview Grid */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Layers size={22} className="text-primary" /> Bảng phân tích chi tiết danh mục
      </h3>

      <div className="admin-table-container" style={{ marginBottom: '3rem' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên Danh mục</th>
              <th>Số lượng SKU sản phẩm</th>
              <th>Số lượng đã bán</th>
              <th>Doanh thu đóng góp</th>
              <th>Đóng góp tỷ lệ</th>
              <th style={{ textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categoryData.map(cat => (
              <tr key={cat.categoryName}>
                <td>
                  <strong style={{ fontSize: '0.95rem', color: '#334155' }}>{cat.categoryName}</strong>
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>{cat.productCount}</span> sản phẩm
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: '#4F46E5' }}>{cat.itemsSold}</span> đơn vị
                </td>
                <td>
                  <strong className="text-accent">{cat.revenue.toLocaleString()}đ</strong>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cat.percentage.toFixed(1)}%</span>
                    <div style={{ width: '60px', height: '6px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${cat.percentage}%`, height: '100%', background: '#6366F1' }} />
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Link 
                    to={`/admin/products`}
                    className="btn btn-outline" 
                    style={{ padding: '0.35rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    Xem sản phẩm
                  </Link>
                </td>
              </tr>
            ))}
            {categoryData.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Không tìm thấy danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
