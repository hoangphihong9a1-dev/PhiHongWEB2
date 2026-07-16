# CHI TIẾT CÁC LUỒNG XỬ LÝ (SYSTEM DATA FLOWS)

Dưới đây là phân tích chi tiết từng bước của 4 luồng nghiệp vụ cốt lõi trong hệ thống RainbowForest E-Commerce.

---

## 1. Luồng Đăng ký & Đăng nhập (Authentication Flow)

```
       React Client (:3000)                Zuul API Gateway (:8900)             User Service (:8811)
               │                                      │                                    │
    (1) POST /api/accounts/login                      │                                    │
               ├─────────────────────────────────────►│                                    │
               │                                      │ (2) Chuyển tiếp request            │
               │                                      ├───────────────────────────────────►│
               │                                      │                                    │ (3) Truy vấn MySQL
               │                                      │                                    │ ──┐
               │                                      │                                    │   │
               │                                      │                                    │ ◄─┘
               │                                      │ (4) Trả về User Data               │
               │                                      │◄───────────────────────────────────┤
               │                                      │                                    │
               │                                      │ (5) Ghi nhận Session vào Redis     │
               │                                      │ ──┐                                │
               │                                      │   │                                │
               │                                      │ ◄─┘                                │
               │ (6) Trả về HTTP 200 OK + User Info   │                                    │
               │◄─────────────────────────────────────┤                                    │
               │                                      │                                    │
```

### Điểm kỹ thuật cốt lõi:
*   **Session chia sẻ:** Khi đăng nhập thành công, Zuul API Gateway sử dụng **Spring Session Redis** để ghi nhớ phiên làm việc. Nhờ đó, bất kể request tiếp theo của client được chuyển tới service nào phía sau, session vẫn được đồng bộ qua Redis.
*   **Phân quyền ở Frontend:** 
    *   Đối với route thường: `Navbar.jsx` kiểm tra quyền để hiển thị giỏ hàng, thông tin cá nhân.
    *   Đối với route `/admin/**`: `App.jsx` bọc các component trong `<AdminRoute>` kiểm tra `user.role?.roleName === 'ROLE_ADMIN'`.

---

## 2. Luồng Đặt hàng & Trừ kho (Checkout & Inventory Flow)

Đây là luồng phức tạp nhất kết hợp cả **giao tiếp đồng bộ (HTTP Feign Client)** và **ghi nhật ký lưu vết**.

```
    React Client                Zuul Gateway               Order Service             User Service             Product Service
         │                           │                           │                         │                         │
(1) POST /api/shop/order             │                           │                         │                         │
         ├──────────────────────────►│                           │                         │                         │
         │                           │ (2) Chuyển tiếp           │                         │                         │
         │                           ├──────────────────────────►│                         │                         │
         │                           │                           │                         │                         │
         │                           │                           │ ─── (3) Gọi Feign Client (Xác thực user) ────────►│
         │                           │                           │◄──────────────────────────────────────────────────┤
         │                           │                           │                                                   │
         │                           │                           │ ─── (4) Gọi Feign Client (Xác thực tồn kho) ───────────────────────►│
         │                           │                           │◄────────────────────────────────────────────────────────────────────┤
         │                           │                           │                                                   │
         │                           │                           │ ─── (5) PUT /deduct (Trừ kho) ─────────────────────────────────────►│
         │                           │                           │◄────────────────────────────────────────────────────────────────────┤
         │                           │                           │                                                   │
         │                           │                           │ (6) Ghi đơn hàng vào MySQL & Ghi nhật ký vào MongoDB│
         │                           │                           │ ──┐                                               │
         │                           │                           │   │                                               │
         │                           │                           │ ◄─┘                                               │
         │                           │ (7) Trả về HTTP 201       │                                                   │
         │                           │◄──────────────────────────┤                                                   │
         │◄──────────────────────────┤                           │                                                   │
```

---

## 3. Luồng Giao tiếp Bất đồng bộ sự kiện (Event-Driven Flow với RabbitMQ)

Khi thông tin sản phẩm thay đổi trong `Product Catalog Service` (ví dụ: thay đổi giá, sửa tên), hệ thống cần cập nhật hoặc thông báo cho các bên liên quan mà không làm nghẽn luồng xử lý chính.

1. **Admin** cập nhật sản phẩm tại Giao diện Admin (`PUT /api/catalog/products/{id}`).
2. **Product Catalog Service** lưu dữ liệu mới vào cơ sở dữ liệu MySQL của mình.
3. Đồng thời, **Product Catalog Service** phát một event bất đồng bộ tên là `ProductUpdatedEvent` (JSON chứa ID, Tên, Giá mới) lên **RabbitMQ**.
4. **Product Catalog Service** phản hồi thành công ngay lập tức về phía Client (giảm thời gian chờ đợi).
5. **RabbitMQ Exchange** định tuyến event này tới các Queue tương ứng.
6. **Order Service** tiêu thụ (consume) event này từ Queue và cập nhật thông tin cache sản phẩm của mình nếu cần để hiển thị đơn hàng lịch sử chính xác.

---

## 4. Luồng Đánh giá & Gợi ý (Review & Recommendation Flow)

1. **Gửi đánh giá:**
   * Khách hàng gửi nhận xét/số sao cho sản phẩm.
   * Request được gửi thông qua Gateway tới **Recommendation Service** (`/api/review/recommendations`).
   * Service lưu đánh giá vào cơ sở dữ liệu MySQL `product_recommendations`.

2. **Truy vấn gợi ý:**
   * Khi khách hàng truy cập trang chi tiết một sản phẩm, Client gọi API lấy danh sách gợi ý.
   * **Recommendation Service** truy vấn điểm đánh giá trung bình và các nhận xét liên quan từ MySQL.
   * Đồng thời, nó gọi **Product Catalog Service** qua *Feign Client* để lấy thêm thông tin chi tiết (hình ảnh, giá bán) của các sản phẩm liên quan nhằm trả về đầy đủ thông tin hiển thị cho Client.
