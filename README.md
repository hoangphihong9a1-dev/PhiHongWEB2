# 🌈 RainbowForest E-Commerce Microservices

Ứng dụng thương mại điện tử xây dựng theo kiến trúc **Microservices** với Spring Boot, React, Redis, RabbitMQ và MySQL.

---

## 🏗️ Kiến trúc hệ thống

```
Client (React + Vite :5173)
        │
        ▼
API Gateway (Zuul :8900)  ←→  Eureka Server (:8761)
   ├── /api/accounts/**   →  User Service        (:8811)
   ├── /api/catalog/**    →  Product Catalog      (:8810)
   ├── /api/shop/**       →  Order Service        (:8813)
   └── /api/review/**     →  Recommendation Svc  (:8812)
        │
   Redis (:6379)  —  MySQL (:3306)  —  RabbitMQ (:5672)
```

## 🛠️ Công nghệ sử dụng

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router, Axios |
| API Gateway | Spring Cloud Netflix Zuul, Spring Session Redis |
| Service Discovery | Netflix Eureka |
| Backend Services | Spring Boot 2.1.5, Spring Data JPA, OpenFeign |
| Database | MySQL 8.0 |
| Cache / Session | Redis (JEDIS) |
| Message Broker | RabbitMQ |
| Load Balancing | Netflix Ribbon |

---

## 🚀 Hướng dẫn chạy dự án

### Yêu cầu
- Java 11+ (hoặc 12)
- Maven 3.6+
- Node.js 18+
- Docker & Docker Compose (tùy chọn)

---

### Cách 1: Docker Compose (Khuyến nghị)

```bash
# Khởi động toàn bộ hệ thống
docker-compose up --build

# Dừng hệ thống
docker-compose down
```

---

### Cách 2: Chạy thủ công

#### Bước 1 — Khởi động MySQL, Redis, RabbitMQ

```bash
docker-compose up mysql redis rabbitmq -d
```

#### Bước 2 — Chạy Eureka Server

```bash
cd eureka-server
mvn spring-boot:run
# Truy cập: http://localhost:8761
```

#### Bước 3 — Chạy các Microservices (mỗi service một terminal)

```bash
# User Service
cd user-service && mvn spring-boot:run

# Product Catalog Service
cd product-catalog-service && mvn spring-boot:run

# Order Service
cd order-service && mvn spring-boot:run

# Product Recommendation Service
cd product-recommendation-service && mvn spring-boot:run
```

#### Bước 4 — Chạy API Gateway

```bash
cd api-gateway && mvn spring-boot:run
# Truy cập: http://localhost:8900
```

#### Bước 5 — Chạy React Client

```bash
cd client
npm install
npm run dev
# Truy cập: http://localhost:5173
```

---

## 📡 API Endpoints

### User Service (qua Gateway: `/api/accounts`)
| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/api/accounts/registration` | Đăng ký người dùng |
| GET | `/api/accounts/users` | Danh sách người dùng |
| GET | `/api/accounts/users?name={name}` | Tìm user theo tên |
| GET | `/api/accounts/users/{id}` | Lấy user theo ID |

### Product Catalog Service (qua Gateway: `/api/catalog`)
| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/catalog/products` | Danh sách sản phẩm |
| GET | `/api/catalog/products/{id}` | Chi tiết sản phẩm |
| GET | `/api/catalog/products?category={cat}` | Lọc theo danh mục |
| GET | `/api/catalog/products?name={name}` | Tìm theo tên |
| POST | `/api/catalog/admin/products` | Thêm sản phẩm (Admin) |
| DELETE | `/api/catalog/admin/products/{id}` | Xóa sản phẩm (Admin) |

### Order Service (qua Gateway: `/api/shop`)
| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/shop/cart` | Xem giỏ hàng |
| POST | `/api/shop/cart?productId=&quantity=` | Thêm vào giỏ |
| DELETE | `/api/shop/cart?productId=` | Xóa khỏi giỏ |
| POST | `/api/shop/order/{userId}` | Đặt hàng |

### Recommendation Service (qua Gateway: `/api/review`)
| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/review/recommendations?name={productName}` | Xem đánh giá |
| POST | `/api/review/{userId}/recommendations/{productId}?rating=` | Gửi đánh giá |
| DELETE | `/api/review/recommendations/{id}` | Xóa đánh giá |

---

## 🌐 Chức năng người dùng (User)

- ✅ **Đăng ký tài khoản** với thông tin cá nhân & địa chỉ
- ✅ **Đăng nhập** / Đăng xuất
- ✅ **Xem danh mục sản phẩm** với bộ lọc theo category
- ✅ **Tìm kiếm sản phẩm** theo tên
- ✅ **Xem chi tiết sản phẩm** + đánh giá (rating)
- ✅ **Giỏ hàng** — thêm, sửa số lượng, xóa (lưu Redis)
- ✅ **Đặt hàng** (checkout)
- ✅ **Gửi đánh giá sản phẩm** (1-5 sao)

## 🔧 Chức năng Admin

- ✅ **Thêm sản phẩm** — POST `/api/catalog/admin/products`
- ✅ **Xóa sản phẩm** — DELETE `/api/catalog/admin/products/{id}`

---

## 🗄️ Cơ sở dữ liệu

| Database | Service |
|----------|---------|
| `users` | User Service |
| `product_catalog` | Product Catalog Service |
| `orders` | Order Service |
| `product_recommendations` | Recommendation Service |

---

## 🐰 RabbitMQ Dashboard

Truy cập: `http://localhost:15672`  
Username: `guest` / Password: `guest`

## 📊 Eureka Dashboard

Truy cập: `http://localhost:8761`
