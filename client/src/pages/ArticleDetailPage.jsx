import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_ARTICLES } from './ArticlesPage';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calendar, User, MessageSquare, Send, Tag, BookOpen } from 'lucide-react';

export default function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  
  const article = MOCK_ARTICLES.find(art => art.id === parseInt(id));

  // State for comments
  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!article) return;

    // Load comments from localStorage
    const storageKey = `rf_comments_art_${article.id}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      setComments(JSON.parse(stored));
    } else {
      // Seed default comments based on article ID
      let defaultComments = [];
      if (article.id === 1) {
        defaultComments = [
          { id: 1, name: 'Hoàng Long', text: 'Bài viết đánh giá rất khách quan. Mình cũng đang dùng dòng này, độ sáng và màu sắc thực sự đỉnh chóp luôn!', date: '12/07/2026' },
          { id: 2, name: 'Khánh An', text: 'Có hỗ trợ eARC truyền âm thanh Dolby Atmos không bạn ơi?', date: '13/07/2026' }
        ];
      } else if (article.id === 2) {
        defaultComments = [
          { id: 1, name: 'Quốc Bảo', text: 'Con Sony WH-1000XM6 nghe nói cải tiến chống ồn nhiều lắm. Đang gom lúa rước em nó.', date: '11/07/2026' },
          { id: 2, name: 'Thu Trang', text: 'Đang dùng Momentum 4, pin trâu khủng khiếp đeo cả tuần không cần sạc.', date: '12/07/2026' }
        ];
      } else if (article.id === 3) {
        defaultComments = [
          { id: 1, name: 'Hải Đăng', text: 'Mẹo sạc 80% này chuẩn này, điện thoại bây giờ cũng toàn khuyên sạc thế để bảo vệ pin.', date: '06/07/2026' }
        ];
      } else {
        defaultComments = [
          { id: 1, name: 'Hương Giang', text: 'Tiêu chuẩn Matter này tiện thật, trước mua đồ cứ lo xem có hợp với hệ sinh thái nhà mình không.', date: '02/07/2026' }
        ];
      }
      localStorage.setItem(storageKey, JSON.stringify(defaultComments));
      setComments(defaultComments);
    }

    // Scroll to top on load
    window.scrollTo(0, 0);
  }, [article, id]);

  // Set name if user logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      setCommentName(user.userName);
    } else {
      setCommentName('');
    }
  }, [user, isLoggedIn]);

  if (!article) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Không tìm thấy bài viết!</h2>
        <Link to="/articles" className="btn btn-primary" style={{ marginTop: '1rem' }}>Quay lại danh sách</Link>
      </div>
    );
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      name: commentName.trim(),
      text: commentText.trim(),
      date: new Date().toLocaleDateString('vi-VN')
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    localStorage.setItem(`rf_comments_art_${article.id}`, JSON.stringify(updated));

    setCommentText('');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  // Get related articles (exclude current one)
  const relatedArticles = MOCK_ARTICLES
    .filter(art => art.id !== article.id)
    .slice(0, 2);

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Back button */}
      <button 
        onClick={() => navigate('/articles')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          color: '#4B5563',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '2rem',
          fontSize: '0.95rem',
          padding: '0.5rem 0',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.color = '#4F46E5'}
        onMouseLeave={(e) => e.target.style.color = '#4B5563'}
      >
        <ArrowLeft size={18} /> Quay lại danh sách bài viết
      </button>

      {/* Main Article Container */}
      <article style={{ background: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}>
        {/* Banner image */}
        <div style={{ height: '400px', overflow: 'hidden', position: 'relative' }}>
          <img src={article.imageUrl} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <span style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '1.5rem',
            background: '#4F46E5',
            color: '#FFFFFF',
            padding: '0.4rem 1.2rem',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: '700',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
          }}>
            {article.category}
          </span>
        </div>

        {/* Article Meta & Content */}
        <div style={{ padding: '3rem 2.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: '500', borderBottom: '1px solid #F3F4F6', paddingBottom: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={14} /> Tác giả: <strong>{article.author}</strong></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={14} /> {article.date}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><BookOpen size={14} /> {article.readTime}</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#111827', marginBottom: '1.5rem', lineHeight: 1.25 }}>
            {article.title}
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#4B5563', fontWeight: '500', lineHeight: 1.6, marginBottom: '2rem', paddingLeft: '1rem', borderLeft: '4px solid #4F46E5' }}>
            {article.summary}
          </p>

          <div style={{ 
            fontSize: '1.1rem', 
            color: '#374151', 
            lineHeight: 1.8, 
            whiteSpace: 'pre-wrap'
          }}>
            {article.content}
          </div>
        </div>
      </article>

      {/* Related Articles Section */}
      <div style={{ marginTop: '3.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tag size={20} style={{ color: '#4F46E5' }} /> Bài viết liên quan khác
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {relatedArticles.map(art => (
            <Link 
              to={`/articles/${art.id}`} 
              key={art.id} 
              style={{
                textDecoration: 'none',
                background: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)',
                border: '1px solid #F3F4F6',
                display: 'flex',
                gap: '1rem',
                padding: '1rem',
                alignItems: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 15px -3px rgba(0,0,0,0.05)';
              }}
            >
              <img src={art.imageUrl} alt={art.title} style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover' }} />
              <div>
                <span style={{ fontSize: '0.7rem', color: '#4F46E5', fontWeight: '700', textTransform: 'uppercase' }}>{art.category}</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111827', margin: '0.2rem 0', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {art.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Comments Section */}
      <div style={{ marginTop: '4rem', background: '#FFFFFF', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#111827', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <MessageSquare size={20} style={{ color: '#4F46E5' }} /> Ý kiến bạn đọc ({comments.length})
        </h3>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '0.4rem' }}>Tên hiển thị *</label>
              <input
                type="text"
                placeholder="Nhập tên của bạn..."
                required
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                disabled={isLoggedIn}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #D1D5DB',
                  outline: 'none',
                  fontSize: '0.95rem',
                  background: isLoggedIn ? '#F3F4F6' : '#FFFFFF'
                }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '0.4rem' }}>Nội dung bình luận *</label>
            <textarea
              placeholder="Chia sẻ ý kiến của bạn về bài viết này..."
              rows={4}
              required
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                outline: 'none',
                fontSize: '0.95rem',
                resize: 'none',
                lineHeight: 1.5,
                fontFamily: 'inherit'
              }}
            />
          </div>

          {submitSuccess && (
            <div style={{ color: '#059669', fontSize: '0.9rem', fontWeight: '600', marginTop: '0.5rem' }}>
              Bình luận của bạn đã được gửi thành công!
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: '1rem',
              background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '10px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.target.style.transform = 'none'}
          >
            <Send size={16} /> Gửi bình luận
          </button>
        </form>

        {/* Comments List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {comments.length === 0 ? (
            <p style={{ color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ nhé!</p>
          ) : (
            comments.map(comment => (
              <div 
                key={comment.id} 
                style={{ 
                  background: '#F9FAFB', 
                  borderRadius: '16px', 
                  padding: '1.25rem 1.5rem',
                  border: '1px solid #F3F4F6'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontWeight: '700', color: '#111827', fontSize: '0.95rem' }}>{comment.name}</span>
                  <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{comment.date}</span>
                </div>
                <p style={{ color: '#4B5563', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                  {comment.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
