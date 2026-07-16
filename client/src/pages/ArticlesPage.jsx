import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, User, ArrowRight, BookOpen } from 'lucide-react';

export const MOCK_ARTICLES = [
  {
    id: 1,
    title: 'Đánh giá chi tiết Smart TV QLED 4K thế hệ mới: Đỉnh cao hiển thị',
    summary: 'Phân tích chi tiết công nghệ hiển thị chấm lượng tử (Quantum Dot), độ sáng tối đa HDR và các tính năng thông minh trên dòng tivi cao cấp vừa ra mắt trong năm nay.',
    content: `Smart TV QLED 4K thế hệ mới đại diện cho bước nhảy vọt lớn trong phân khúc màn hình gia đình. Được tích hợp tấm nền Quantum Dot cải tiến cùng hệ thống đèn nền Mini-LED ma trận động, dòng TV này hứa hẹn mang lại độ tương phản vô cực và màu sắc chân thực chưa từng thấy.

Đầu tiên là độ sáng tối đa. Với khả năng đạt tới 2000 nits, các nội dung HDR10+ và Dolby Vision hiển thị sắc nét đến từng chi tiết nhỏ nhất trong vùng tối hoặc vùng sáng mạnh. So với các thế hệ trước, hiện tượng hở sáng (blooming) xung quanh các vật thể sáng trên nền tối đã giảm đến 90%.

Về phần mềm, hệ điều hành TizenOS / Google TV đi kèm phản hồi mượt mà, hỗ trợ trợ lý ảo giọng nói tiếng Việt cực tốt. Trải nghiệm chơi game cũng được tối ưu hóa với cổng HDMI 2.1, hỗ trợ tần số quét 120Hz và công nghệ chống xé hình VRR. 

Tóm lại, nếu bạn đang tìm kiếm một thiết bị trung tâm giải trí sang trọng cho phòng khách với khả năng hiển thị đỉnh cao trong môi trường ánh sáng mạnh, dòng QLED thế hệ mới này chắc chắn là khoản đầu tư vô cùng xứng đáng.`,
    category: 'Đánh giá',
    author: 'Minh Trần',
    date: '12/07/2026',
    readTime: '6 phút đọc',
    imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Top 5 tai nghe Bluetooth chụp tai (Over-ear) chống ồn tốt nhất 2026',
    summary: 'Tìm kiếm chiếc tai nghe hoàn hảo để làm việc tập trung hay đi máy bay? Dưới đây là bảng xếp hạng các tai nghe ANC hàng đầu từ Sony, Bose và Sennheiser.',
    content: `Công nghệ chống ồn chủ động (ANC) đã đạt đến một tầm cao mới trong năm 2026. Các hãng âm thanh lớn liên tục chạy đua tích hợp AI để tối ưu hóa khả năng triệt tiêu tiếng ồn môi trường thời gian thực. Dưới đây là danh sách 5 cái tên sáng giá nhất:

1. **Sony WH-1000XM6**: Tiếp tục khẳng định vị thế dẫn đầu nhờ chip xử lý âm thanh kép mới, lọc âm trung và cao (như giọng nói của người xung quanh) hiệu quả hơn 40% so với thế hệ tiền nhiệm.
2. **Bose QuietComfort Ultra**: Vô địch về độ êm ái khi đeo lâu nhờ chất đệm tai cao cấp và lực kẹp vừa vặn, kết hợp công nghệ âm thanh không gian Immersive Audio sống động.
3. **Sennheiser Momentum 4 Wireless**: Sở hữu chất âm audiophile chi tiết nhất cùng thời lượng pin khổng lồ lên tới 60 giờ nghe nhạc liên tục.
4. **Apple AirPods Max 2**: Thiết kế sang trọng hoàn thiện bằng nhôm, tích hợp sâu vào hệ sinh thái Apple và hỗ trợ sạc nhanh qua cổng USB-C tiện lợi.
5. **JBL Tour One M3**: Lựa chọn cân bằng nhất giữa hiệu năng chống ồn, chất âm bass uy lực đặc trưng và mức giá dễ tiếp cận hơn các đối thủ.`,
    category: 'Hướng dẫn',
    author: 'Hoàng Nguyễn',
    date: '10/07/2026',
    readTime: '5 phút đọc',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Mẹo cực hay giúp kéo dài tuổi thọ pin Laptop của bạn gấp đôi',
    summary: 'Pin laptop bị chai nhanh là nỗi ám ảnh của nhiều người. Khám phá ngay các quy tắc sạc pin đúng cách và thiết lập hệ thống tối ưu nhất.',
    content: `Hầu hết laptop hiện đại sử dụng pin Lithium-ion hoặc Lithium-polymer. Các loại pin này sẽ giảm dung lượng theo thời gian và số chu kỳ sạc (cycle count). Tuy nhiên, với một số thói quen sử dụng thông minh, bạn hoàn toàn có thể kéo dài tuổi thọ của pin lên gấp đôi.

**Quy tắc vàng: Đừng để pin quá nóng hoặc quá lạnh**
Nhiệt độ là kẻ thù số một của pin. Khi chơi game hoặc render video nặng, hãy kê cao laptop hoặc dùng đế tản nhiệt để không khí lưu thông tốt hơn. Tuyệt đối không đặt laptop lên nệm, gối vì sẽ làm bít các khe tản nhiệt dưới máy.

**Giới hạn mức sạc tối đa ở 80%**
Nếu bạn thường xuyên cắm sạc laptop cố định tại bàn làm việc, hãy bật tính năng sạc pin thông minh (như Battery Health Manager trên các dòng máy Asus, Dell, Lenovo hay Mac). Việc giữ pin ở mức 80% thay vì cắm liên tục ở 100% giúp giảm đáng kể áp lực hóa học lên các cell pin.

**Tránh để pin xả cạn về 0%**
Việc để laptop sập nguồn do hết pin sẽ đẩy nhanh quá trình chai pin. Hãy cắm sạc khi máy báo pin yếu (khoảng 15-20%).`,
    category: 'Mẹo hay',
    author: 'Phi Hồng',
    date: '05/07/2026',
    readTime: '4 phút đọc',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop'
  },
  {
    id: 4,
    title: 'Xu hướng thiết bị nhà thông minh (Smart Home) lên ngôi năm nay',
    summary: 'Giao thức kết nối vạn vật Matter cùng trí tuệ nhân tạo thế hệ mới đang tái định nghĩa lại cách chúng ta tương tác với không gian sống như thế nào.',
    content: `Nhà thông minh giờ đây không còn chỉ dừng lại ở việc tắt mở đèn bằng giọng nói hay hẹn giờ bật máy lạnh. Xu hướng Smart Home năm nay tập trung vào khả năng tự động hóa thông minh tự thích ứng và khả năng tương thích chéo không giới hạn giữa các thương hiệu lớn.

**Sự phổ biến của giao thức Matter**
Matter - tiêu chuẩn kết nối nhà thông minh hợp nhất được hậu thuẫn bởi Apple, Google, Amazon, Samsung - đã trở thành điều kiện bắt buộc trên các thiết bị mới. Người dùng nay có thể dễ dàng điều khiển bóng đèn Philips Hue bằng Apple Home app hay Google Home mà không cần các hub chuyển đổi phức tạp.

**Trí tuệ nhân tạo thích ứng ngữ cảnh**
Các cảm biến thông minh được tích hợp AI tự học thói quen sinh hoạt của gia chủ. Hệ thống điều hòa sẽ tự động điều chỉnh nhiệt độ dựa trên độ ẩm phòng, thời tiết bên ngoài và số lượng người đang có mặt trong nhà mà không cần bấm remote.

**Tiết kiệm năng lượng thông minh**
Các hệ thống quản lý năng lượng gia đình kết nối trực tiếp với công tơ điện thông minh, tự động tắt bớt các thiết bị không cần thiết vào giờ cao điểm, giúp hóa đơn tiền điện giảm đáng kể.`,
    category: 'Xu hướng',
    author: 'Thuỳ Linh',
    date: '01/07/2026',
    readTime: '5 phút đọc',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop'
  }
];

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const navigate = useNavigate();

  const categories = ['Tất cả', 'Đánh giá', 'Hướng dẫn', 'Mẹo hay', 'Xu hướng'];

  const filteredArticles = MOCK_ARTICLES.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          art.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === 'Tất cả' || art.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const featuredArticle = MOCK_ARTICLES[0];
  const regularArticles = filteredArticles.filter(art => art.id !== featuredArticle.id || activeCategory !== 'Tất cả');

  return (
    <div className="page-wrapper" style={{ paddingBottom: '4rem' }}>
      {/* Hero Banner Header */}
      <div className="articles-hero" style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
        color: '#FFFFFF',
        padding: '4rem 2rem',
        borderRadius: '16px',
        marginBottom: '3rem',
        textAlign: 'center',
        boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto' }}>
          <span style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(4px)',
            padding: '0.4rem 1rem',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#E0E7FF',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <BookOpen size={14} /> Blog Công Nghệ & Xu Hướng
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: 1.2 }}>
            Tin tức & Góc Nhìn Công Nghệ RainbowForest
          </h1>
          <p style={{ color: '#C7D2FE', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Khám phá những bài viết đánh giá chuyên sâu, kinh nghiệm sử dụng thiết bị công nghệ và những xu hướng nhà thông minh mới nhất.
          </p>

          {/* Search bar inside hero */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            maxWidth: '550px',
            margin: '0 auto',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
          }}>
            <Search size={20} style={{ color: '#9CA3AF', marginLeft: '1rem' }} />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết công nghệ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                padding: '0.6rem 1rem',
                fontSize: '1rem',
                width: '100%',
                color: '#1F2937'
              }}
            />
          </div>
        </div>

        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '350px',
          height: '350px',
          background: 'rgba(99, 102, 241, 0.2)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          zIndex: 1
        }}></div>
      </div>

      {/* Main Grid Section */}
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Category Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.8rem',
          flexWrap: 'wrap',
          marginBottom: '2.5rem',
          borderBottom: '1px solid #E5E7EB',
          paddingBottom: '1rem'
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '50px',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeCategory === cat ? 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)' : '#F3F4F6',
                color: activeCategory === cat ? '#FFFFFF' : '#4B5563',
                boxShadow: activeCategory === cat ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* No Articles State */}
        {filteredArticles.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}>
            <BookOpen size={48} style={{ color: '#D1D5DB', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', color: '#374151', marginBottom: '0.5rem' }}>Không tìm thấy bài viết phù hợp</h3>
            <p style={{ color: '#6B7280' }}>Thử thay đổi từ khóa tìm kiếm hoặc lọc theo danh mục khác nhé.</p>
          </div>
        )}

        {/* Featured Article - only visible when filter is "Tất cả" and search is empty */}
        {activeCategory === 'Tất cả' && !searchTerm && filteredArticles.length > 0 && (
          <div 
            onClick={() => navigate(`/articles/${featuredArticle.id}`)}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2.5rem',
              background: '#FFFFFF',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
              marginBottom: '3.5rem',
              cursor: 'pointer',
              border: '1px solid #F3F4F6',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            className="featured-article-card"
          >
            <div style={{ overflow: 'hidden', minHeight: '320px', position: 'relative' }}>
              <img 
                src={featuredArticle.imageUrl} 
                alt={featuredArticle.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
              />
              <span style={{
                position: 'absolute',
                top: '1.5rem',
                left: '1.5rem',
                background: '#4F46E5',
                color: '#FFFFFF',
                padding: '0.4rem 1rem',
                borderRadius: '50px',
                fontSize: '0.8rem',
                fontWeight: '700',
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
              }}>
                {featuredArticle.category}
              </span>
            </div>
            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: '1.5rem', color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: '500' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={14} /> {featuredArticle.author}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={14} /> {featuredArticle.date}
                </span>
                <span>{featuredArticle.readTime}</span>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827', marginBottom: '1rem', lineHeight: 1.3 }}>
                {featuredArticle.title}
              </h2>
              <p style={{ color: '#4B5563', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                {featuredArticle.summary}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4F46E5', fontWeight: '700', fontSize: '1rem' }}>
                Đọc bài viết <ArrowRight size={16} />
              </div>
            </div>
          </div>
        )}

        {/* Regular Articles Grid */}
        {regularArticles.length > 0 && (
          <div>
            {activeCategory === 'Tất cả' && !searchTerm && (
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
                Bài viết mới nhất
              </h3>
            )}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem'
            }}>
              {regularArticles.map(art => (
                <div 
                  key={art.id}
                  onClick={() => navigate(`/articles/${art.id}`)}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #F3F4F6',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  className="article-card"
                >
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <img 
                      src={art.imageUrl} 
                      alt={art.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                    />
                    <span style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(4px)',
                      color: '#1E1B4B',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '50px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}>
                      {art.category}
                    </span>
                  </div>
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div style={{ display: 'flex', gap: '1rem', color: '#9CA3AF', fontSize: '0.8rem', marginBottom: '0.8rem', fontWeight: '500' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={12} /> {art.author}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={12} /> {art.date}</span>
                    </div>
                    <h3 style={{
                      fontSize: '1.15rem',
                      fontWeight: '700',
                      color: '#111827',
                      lineHeight: 1.4,
                      marginBottom: '0.8rem',
                      height: '3.2rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {art.title}
                    </h3>
                    <p style={{
                      color: '#6B7280',
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      marginBottom: '1.5rem',
                      height: '4rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      flexGrow: 1
                    }}>
                      {art.summary}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#4F46E5',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      borderTop: '1px solid #F3F4F6',
                      paddingTop: '1rem'
                    }}>
                      Đọc tiếp <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Styled card hover micro-animations injected in header */}
      <style>{`
        .featured-article-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08) !important;
        }
        .featured-article-card:hover img {
          transform: scale(1.03);
        }
        .article-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 30px -5px rgba(0, 0, 0, 0.08) !important;
          border-color: #E0E7FF !important;
        }
        .article-card:hover img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
