import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Sparkles, Bot } from 'lucide-react';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const DEFAULT_MODEL = 'google/gemma-2-9b-it:free';

const SYSTEM_PROMPT = `Bạn là trợ lý ảo AI chính thức của cửa hàng RainbowTech (Hệ thống bán lẻ laptop và thiết bị điện tử chính hãng).
Các sản phẩm nổi bật của cửa hàng bao gồm:
- Laptop: ROG Strix Gaming Laptop (1499.99 USD), MacBook Pro M3 Max (2499.99 USD), HP Spectre x360 (1299.99 USD), Dell XPS 15 (1899.99 USD).
- Thiết bị điện tử: iPad Pro M4 (999.99 USD), PlayStation 5 Pro (699.99 USD), Nintendo Switch OLED (349.99 USD), Tai nghe Sony WH-1000XM5 (399.99 USD), Apple Watch Ultra 2 (799.99 USD).
Chính sách: Giao hàng miễn phí toàn quốc cho hóa đơn từ 15 triệu VND, bảo hành chính hãng 12 tháng, lỗi 1 đổi 1 trong 30 ngày.
Hãy trả lời khách hàng bằng tiếng Việt một cách cực kỳ thân thiện, lịch sự, ngắn gọn và hữu ích. Hãy đóng vai là nhân viên tư vấn nhiệt tình của RainbowTech.`;

const QUICK_REPLIES = [
  'Tư vấn mua Laptop Gaming',
  'Có mẫu MacBook nào mới không?',
  'Chính sách giao hàng thế nào?',
  'Địa chỉ cửa hàng ở đâu?'
];

export default function AIChatBox() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Mình là trợ lý ảo RainbowTech. Mình có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'RainbowTech AI Assistant'
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
            userMessage
          ]
        })
      });

      const data = await response.json();
      const replyContent = data.choices?.[0]?.message?.content || 'Xin lỗi, tôi gặp sự cố khi kết nối với máy chủ AI. Bạn vui lòng thử lại nhé!';
      
      setMessages((prev) => [...prev, { role: 'assistant', content: replyContent }]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Xin lỗi, không thể kết nối tới máy chủ AI của OpenRouter. Vui lòng kiểm tra lại mạng!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="ai-chat-container">
      {/* Floating Toggle Button */}
      <button 
        className={`ai-chat-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Trợ lý AI"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && (
          <span className="ai-toggle-badge">
            <Sparkles size={10} fill="#fff" /> AI
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-header-info">
              <div className="ai-avatar">
                <Bot size={20} />
              </div>
              <div>
                <h3>Trợ lý RainbowTech</h3>
                <span className="status-online">Trực tuyến</span>
              </div>
            </div>
            <button className="ai-close-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Messages List */}
          <div className="ai-chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`ai-message-wrapper ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="ai-msg-avatar">
                    <Bot size={14} />
                  </div>
                )}
                <div className="ai-message-bubble">
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="ai-message-wrapper assistant">
                <div className="ai-msg-avatar">
                  <Bot size={14} />
                </div>
                <div className="ai-message-bubble typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && !isLoading && (
            <div className="ai-quick-replies">
              {QUICK_REPLIES.map((q, idx) => (
                <button key={idx} className="quick-reply-btn" onClick={() => sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleFormSubmit} className="ai-chat-input-form">
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
