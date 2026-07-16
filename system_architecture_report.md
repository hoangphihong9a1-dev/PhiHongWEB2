# BÁO CÁO HỆ THỐNG HÓA KIẾN TRÚC MICROSERVICES
## Dự án: RainbowForest E-Commerce Storefront

Báo cáo này tổng hợp chi tiết về mặt lý thuyết lẫn thực tiễn của hệ thống Thương mại điện tử xây dựng dựa trên kiến trúc **Microservices** dùng hệ sinh thái Spring Cloud.

---

## I. Tổng quan Kiến trúc Hệ thống

Hệ thống được tổ chức thành 5 service chính và 4 dịch vụ bổ trợ hạ tầng. Client (Frontend) giao tiếp với các Service nội bộ thông qua một cổng duy nhất là **API Gateway**.

```
Client (React + Vite :3000)
        │
        ▼
API Gateway (Zuul :8900)  <--->  Eureka Server (:8761)
   ├── /api/accounts/**   --->  User Service        (:8811)
   ├── /api/catalog/**    --->  Product Catalog      (:8810)
   ├── /api/shop/**       --->  Order Service        (:8813)
   └── /api/review/**     --->  Recommendation Svc  (:8812)
        │
   Redis (:6379)  ---  MySQL (:3306)  ---  RabbitMQ (:5672)  ---  MongoDB (:27017)
```

---

## II. Phân tích chi tiết các thành phần hạ tầng (Infrastructure Layers)

### 1. Eureka Server (Service Registry & Discovery)
*   **Vai trò:** Eureka hoạt động như một "danh bạ điện thoại" của hệ thống. Mỗi khi một instance của microservice khởi động, nó tự động đăng ký tên dịch vụ (`spring.application.name`) cùng địa chỉ IP và Port với Eureka.
*   **Lợi ích:** Giải quyết vấn đề địa chỉ động. Trong môi trường Container (Docker/Kubernetes), IP của container thay đổi liên tục khi khởi động lại. Eureka giúp các service tìm thấy nhau qua tên dịch vụ thay vì hardcode IP.
*   **Cơ chế hoạt động:**
    1.  **Register:** Service gửi thông tin của mình lên Eureka.
    2.  **Heartbeat (Renew):** Cứ mỗi 30 giây, service gửi một request HTTP "tôi vẫn sống" lên Eureka. Nếu quá thời hạn không gửi, Eureka sẽ xóa service ra khỏi danh bạ.
    3.  **Fetch Registry:** API Gateway hoặc các service khác tải danh bạ từ Eureka về máy cục bộ để biết danh sách các service đang hoạt động.

### 2. Zuul API Gateway
*   **Vai trò:** API Gateway là điểm tiếp nhận duy nhất cho mọi request từ Client. Nó che giấu đi sự phức tạp của hệ thống nội bộ.
*   **Chức năng chính:**
    *   **Routing (Định tuyến):** Chuyển hướng các endpoint của client tới đúng microservice (ví dụ `/api/catalog/**` -> `product-catalog-service`).
    *   **Authentication & Security:** Kiểm tra quyền truy cập tập trung trước khi chuyển tiếp request vào mạng nội bộ.
    *   **Load Balancing (Cân bằng tải):** Kết hợp với Ribbon để phân phối đều request tới các instance khác nhau của cùng một service.

### 3. OpenFeign (Giao tiếp đồng bộ giữa các Service)
*   **Vai trò:** Dùng để gọi API giữa các microservice theo cách khai báo (Declarative REST Client).
*   **Cách thức:** Thay vì viết code gọi HTTP phức tạp bằng `RestTemplate`, lập trình viên chỉ cần khai báo một Interface được đánh dấu `@FeignClient(name = "user-service")`, Spring Cloud sẽ tự động sinh mã thực thi cuộc gọi REST qua mạng.
*   **Ví dụ ứng dụng:** Trong `order-service`, Feign Client được sử dụng để lấy thông tin User từ `user-service` và thông tin chi tiết Product từ `product-catalog-service` nhằm phục vụ việc tính toán hóa đơn đơn hàng.

### 4. Message Broker (RabbitMQ - Giao tiếp bất đồng bộ)
*   **Vai trò:** Cho phép giao tiếp bất đồng bộ (Non-blocking), giảm tải và giảm sự phụ thuộc cứng (Loose Coupling) giữa các service.
*   **Kịch bản ứng dụng:** Khi có đơn hàng mới được tạo trong `order-service`, một thông điệp (Event) được đẩy lên RabbitMQ Exchange. Các service phụ trách hóa đơn, vận chuyển, hoặc gửi mail sẽ lắng nghe (Subscribe) thông điệp này và xử lý tiếp mà không bắt người dùng phải đợi trên màn hình Checkout.

---

## III. Chi tiết các Backend Microservices

| Microservice | Port | Database | Trách nhiệm chính |
| :--- | :---: | :--- | :--- |
| **User Service** | `8811` | MySQL (`users`) | Quản lý thông tin tài khoản, thông tin cá nhân, phân quyền truy cập (`ROLE_USER`, `ROLE_ADMIN`). |
| **Product Catalog Service** | `8810` | MySQL (`product_catalog`) | Quản lý danh mục sản phẩm, giá bán, mô tả, hình ảnh và kiểm tra lượng tồn kho thực tế. |
| **Order Service** | `8813` | MySQL (`orders`), MongoDB (`logs`), Redis | Xử lý giỏ hàng, đặt hàng, kiểm tra thanh toán, và lưu trữ nhật ký log đơn hàng vào MongoDB. |
| **Product Recommendation Service** | `8812` | MySQL (`product_recommendations`) | Ghi nhận đánh giá của người dùng (từ 1 đến 5 sao) và đề xuất các sản phẩm liên quan. |

---

## IV. Bảng tổng hợp công nghệ bổ trợ

*   **Redis (Port 6379):** 
    *   *Session Storage:* Lưu trữ Session tập trung để đảm bảo người dùng không bị mất trạng thái đăng nhập khi request đi qua API Gateway tới các instance khác nhau.
    *   *Distributed Lock:* Khóa sản phẩm tạm thời khi đang thanh toán để tránh tranh chấp tồn kho (Race Condition).
*   **MongoDB (Port 27017):**
    *   *System Logging:* Lưu trữ nhật ký dạng NoSQL (JSON-like) do tốc độ ghi nhanh, cấu trúc nhật ký có thể thay đổi linh hoạt theo từng loại sự kiện mà không cần sửa cấu trúc bảng (Schema).

---

## V. Các luồng xử lý chính trong hệ thống (Workflow Scenarios)

### 1. Luồng Mua hàng và Thanh toán (Order Workflow)
1. **React Client** gửi yêu cầu đặt hàng tới **API Gateway** qua route `/api/shop/order`.
2. **API Gateway** chuyển tiếp yêu cầu đến **Order Service**.
3. **Order Service** gọi **User Service** thông qua *Feign Client* để xác minh danh tính người dùng.
4. **Order Service** gọi **Product Catalog Service** qua *Feign Client* để xác minh sản phẩm tồn kho và lấy thông tin giá mới nhất.
5. Sau khi kiểm tra thành công, **Order Service** trừ số lượng tồn kho (đồng thời gửi sự kiện qua **RabbitMQ** để đồng bộ hóa nếu cần) và ghi thông tin đơn hàng vào MySQL.
6. **Order Service** ghi lại dấu vết (audit log) sự kiện này vào **MongoDB**.
7. Đơn hàng được trả về thành công cho khách hàng ở Frontend.

### 2. Luồng Kiểm tra Bảo mật Admin (Admin Authentication)
*   **Bước 1:** Khi người dùng đăng nhập quản trị, `user-service` xác thực tài khoản.
*   **Bước 2:** User Data được trả về chứa thông tin phân quyền (`roleName`).
*   **Bước 3:** Frontend sử dụng `AdminRoute` kiểm tra. Nếu `roleName === 'ROLE_ADMIN'`, hệ thống cho phép truy cập giao diện Layout Admin mới nâng cấp (với Sidebar Slate 900, Topnav điều hướng và grid thống kê). Nếu không, hệ thống chặn truy cập và chuyển hướng về trang Login.
