# Phân Tích & Thiết Kế Kiến Trúc Website Thời Trang (Spring Boot)

## 1. Tổng quan bài toán

Xây dựng website bán quần áo (e-commerce thời trang) gồm:
- **Backend**: Java Spring Boot (REST API)
- **Database**: MySQL/PostgreSQL (quan hệ)
- **Frontend**: có thể là React/Vue (SPA) hoặc Thymeleaf (server-side rendering) — tài liệu này thiết kế theo hướng **REST API + SPA**, dễ mở rộng sang mobile app sau này.

### 1.1. Đối tượng người dùng (Actors)
| Actor | Vai trò |
|---|---|
| Guest (khách vãng lai) | Xem sản phẩm, tìm kiếm, thêm giỏ hàng (session) |
| Customer (khách hàng đã đăng ký) | Đặt hàng, theo dõi đơn, đánh giá sản phẩm, quản lý địa chỉ |
| Staff/Admin | Quản lý sản phẩm, đơn hàng, kho, khuyến mãi |
| Super Admin | Quản lý người dùng, phân quyền, cấu hình hệ thống |

### 1.2. Chức năng chính (Functional Requirements)
1. Quản lý sản phẩm (danh mục, biến thể size/màu, ảnh, giá, tồn kho)
2. Tìm kiếm & lọc sản phẩm (theo danh mục, giá, size, màu, thương hiệu)
3. Giỏ hàng (cart) — cho cả guest (session/localStorage) và user đăng nhập
4. Đặt hàng & thanh toán (COD, chuyển khoản, cổng thanh toán như MoMo/VNPay)
5. Quản lý đơn hàng (trạng thái: chờ xử lý → xác nhận → đang giao → hoàn thành/hủy)
6. Đăng ký/đăng nhập (JWT), quên mật khẩu, xác thực email
7. Đánh giá & bình luận sản phẩm
8. Khuyến mãi/mã giảm giá (voucher, flash sale)
9. Quản lý kho (inventory) theo từng biến thể sản phẩm
10. Trang quản trị (Admin dashboard): thống kê doanh thu, quản lý sản phẩm/đơn hàng/người dùng
11. Wishlist (danh sách yêu thích)
12. Thông báo (email khi đặt hàng thành công, đổi trạng thái đơn)

### 1.3. Yêu cầu phi chức năng (Non-functional)
- Hiệu năng: cache danh mục/sản phẩm hot (Redis)
- Bảo mật: JWT + refresh token, mã hóa mật khẩu (BCrypt), phân quyền theo Role
- Khả năng mở rộng: kiến trúc layered rõ ràng, dễ tách microservice sau này
- Khả năng bảo trì: áp dụng DTO, validation, exception handling tập trung

---

## 2. Kiến trúc tổng thể hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│   React/Vue SPA (Customer)      Admin Dashboard (React)      │
└───────────────────────────┬───────────────────────────────────┘
                            │ HTTPS/REST JSON (Axios/Fetch)
┌───────────────────────────▼───────────────────────────────────┐
│                     API GATEWAY (tuỳ chọn)                    │
│         Nginx reverse proxy / Spring Cloud Gateway            │
└───────────────────────────┬───────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────────┐
│                SPRING BOOT APPLICATION (Monolith)              │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  Controller Layer (REST Controllers)                   │    │
│  ├───────────────────────────────────────────────────────┤    │
│  │  Service Layer (Business Logic)                        │    │
│  ├───────────────────────────────────────────────────────┤    │
│  │  Repository Layer (Spring Data JPA)                    │    │
│  ├───────────────────────────────────────────────────────┤    │
│  │  Security Layer (Spring Security + JWT)                │    │
│  └───────────────────────────────────────────────────────┘    │
└───────────────┬───────────────────────────────┬────────────────┘
                │                               │
     ┌──────────▼──────────┐         ┌──────────▼──────────┐
     │   MySQL/PostgreSQL   │         │   Redis (Cache)      │
     │   (Dữ liệu chính)     │         │   Session/Cart cache │
     └──────────────────────┘         └──────────────────────┘
                │
     ┌──────────▼──────────┐
     │  Cloud Storage        │
     │  (AWS S3/Cloudinary)  │
     │  Ảnh sản phẩm          │
     └────────────────────────┘
```

**Gợi ý**: bắt đầu với kiến trúc **Monolith layered** (dễ triển khai, phù hợp đồ án/dự án cá nhân), sau này có thể tách thành microservices (Product Service, Order Service, User Service...) nếu quy mô lớn.

---

## 3. Thiết kế cơ sở dữ liệu (Database Design)

### 3.1. Sơ đồ thực thể (ERD - mô tả dạng bảng)

#### Bảng `users`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT (PK) | |
| full_name | VARCHAR(100) | |
| email | VARCHAR(100) UNIQUE | |
| password | VARCHAR(255) | Mã hóa BCrypt |
| phone | VARCHAR(20) | |
| avatar_url | VARCHAR(255) | |
| status | ENUM('ACTIVE','LOCKED') | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

#### Bảng `roles`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT (PK) | |
| name | VARCHAR(50) | ROLE_ADMIN, ROLE_CUSTOMER, ROLE_STAFF |

#### Bảng `user_roles` (many-to-many)
| Cột | Kiểu |
|---|---|
| user_id | BIGINT (FK → users) |
| role_id | BIGINT (FK → roles) |

#### Bảng `categories`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT (PK) | |
| name | VARCHAR(100) | Áo nam, Áo nữ, Quần jean... |
| slug | VARCHAR(100) | |
| parent_id | BIGINT (FK → categories) | Danh mục cha (đệ quy) |

#### Bảng `brands`
| Cột | Kiểu |
|---|---|
| id | BIGINT (PK) |
| name | VARCHAR(100) |
| logo_url | VARCHAR(255) |

#### Bảng `products`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT (PK) | |
| name | VARCHAR(255) | |
| slug | VARCHAR(255) | |
| description | TEXT | |
| category_id | BIGINT (FK) | |
| brand_id | BIGINT (FK) | |
| base_price | DECIMAL(12,2) | |
| status | ENUM('ACTIVE','INACTIVE') | |
| created_at | DATETIME | |

#### Bảng `product_variants` (biến thể: size + màu)
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT (PK) | |
| product_id | BIGINT (FK) | |
| size | VARCHAR(10) | S, M, L, XL |
| color | VARCHAR(50) | |
| sku | VARCHAR(100) UNIQUE | |
| price | DECIMAL(12,2) | Giá riêng cho biến thể (nếu khác giá gốc) |
| stock_quantity | INT | Tồn kho |

#### Bảng `product_images`
| Cột | Kiểu |
|---|---|
| id | BIGINT (PK) |
| product_id | BIGINT (FK) |
| image_url | VARCHAR(255) |
| is_thumbnail | BOOLEAN |

#### Bảng `carts` & `cart_items`
| `carts` | |
|---|---|
| id | BIGINT (PK) |
| user_id | BIGINT (FK, nullable cho guest) |
| session_id | VARCHAR(100) (cho guest) |

| `cart_items` | |
|---|---|
| id | BIGINT (PK) |
| cart_id | BIGINT (FK) |
| variant_id | BIGINT (FK → product_variants) |
| quantity | INT |

#### Bảng `orders`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT (PK) | |
| user_id | BIGINT (FK) | |
| order_code | VARCHAR(50) | Mã đơn hiển thị |
| total_amount | DECIMAL(12,2) | |
| discount_amount | DECIMAL(12,2) | |
| shipping_fee | DECIMAL(12,2) | |
| status | ENUM('PENDING','CONFIRMED','SHIPPING','COMPLETED','CANCELLED') | |
| payment_method | ENUM('COD','MOMO','VNPAY','BANK_TRANSFER') | |
| payment_status | ENUM('UNPAID','PAID','FAILED') | |
| shipping_address | VARCHAR(255) | |
| receiver_name | VARCHAR(100) | |
| receiver_phone | VARCHAR(20) | |
| created_at | DATETIME | |

#### Bảng `order_items`
| Cột | Kiểu |
|---|---|
| id | BIGINT (PK) |
| order_id | BIGINT (FK) |
| variant_id | BIGINT (FK) |
| quantity | INT |
| price | DECIMAL(12,2) | Giá tại thời điểm mua |

#### Bảng `reviews`
| Cột | Kiểu |
|---|---|
| id | BIGINT (PK) |
| product_id | BIGINT (FK) |
| user_id | BIGINT (FK) |
| rating | INT (1-5) |
| comment | TEXT |
| created_at | DATETIME |

#### Bảng `vouchers`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT (PK) | |
| code | VARCHAR(50) UNIQUE | |
| discount_type | ENUM('PERCENT','FIXED') | |
| discount_value | DECIMAL(12,2) | |
| min_order_value | DECIMAL(12,2) | |
| start_date | DATETIME | |
| end_date | DATETIME | |
| usage_limit | INT | |

#### Bảng `wishlists`
| Cột | Kiểu |
|---|---|
| id | BIGINT (PK) |
| user_id | BIGINT (FK) |
| product_id | BIGINT (FK) |

### 3.2. Quan hệ chính
- `users` 1—n `orders`
- `products` 1—n `product_variants`
- `products` 1—n `product_images`
- `orders` 1—n `order_items`
- `product_variants` 1—n `order_items` / `cart_items`
- `categories` tự tham chiếu (parent_id) để hỗ trợ danh mục con
- `users` n—n `roles` qua `user_roles`

### 3.3. Index quan trọng
- `products.slug`, `products.category_id`, `products.brand_id`
- `product_variants.sku` (unique)
- `orders.user_id`, `orders.status`
- `users.email` (unique)

---

## 4. Kiến trúc backend Spring Boot

### 4.1. Cấu trúc package (theo layer)

```
com.fashionshop
├── config/                 # Cấu hình: SecurityConfig, CorsConfig, RedisConfig, SwaggerConfig
├── controller/              # REST Controllers
│   ├── AuthController
│   ├── ProductController
│   ├── CategoryController
│   ├── CartController
│   ├── OrderController
│   ├── ReviewController
│   └── admin/
│       ├── AdminProductController
│       ├── AdminOrderController
│       └── AdminDashboardController
├── service/
│   ├── impl/
│   ├── AuthService
│   ├── ProductService
│   ├── CartService
│   ├── OrderService
│   ├── PaymentService
│   └── VoucherService
├── repository/               # Spring Data JPA interfaces
│   ├── UserRepository
│   ├── ProductRepository
│   ├── ProductVariantRepository
│   ├── OrderRepository
│   └── ...
├── entity/                   # JPA Entities (@Entity)
├── dto/
│   ├── request/               # RegisterRequest, OrderRequest, ProductRequest...
│   └── response/              # ProductResponse, OrderResponse, ApiResponse...
├── mapper/                    # MapStruct mappers (Entity <-> DTO)
├── security/
│   ├── JwtTokenProvider
│   ├── JwtAuthFilter
│   └── UserDetailsServiceImpl
├── exception/
│   ├── GlobalExceptionHandler (@ControllerAdvice)
│   ├── ResourceNotFoundException
│   └── BusinessException
├── utils/
└── FashionShopApplication.java
```

### 4.2. Luồng xử lý request điển hình

```
Client → Controller (nhận request, validate DTO)
       → Service (xử lý nghiệp vụ, transaction)
       → Repository (truy vấn DB qua JPA)
       → Entity → Mapper → DTO Response
       → Controller trả về ApiResponse<T>
```

### 4.3. Chuẩn hóa response API

```json
{
  "success": true,
  "message": "Lấy danh sách sản phẩm thành công",
  "data": { },
  "timestamp": "2026-07-31T10:00:00"
}
```

### 4.4. Thiết kế REST API chính

| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| POST | /api/auth/register | Đăng ký | Public |
| POST | /api/auth/login | Đăng nhập, trả JWT | Public |
| POST | /api/auth/refresh-token | Làm mới token | Public |
| GET | /api/products | Danh sách sản phẩm (filter, phân trang) | Public |
| GET | /api/products/{slug} | Chi tiết sản phẩm | Public |
| GET | /api/categories | Danh sách danh mục | Public |
| POST | /api/cart/items | Thêm vào giỏ hàng | Customer |
| GET | /api/cart | Xem giỏ hàng | Customer |
| PUT | /api/cart/items/{id} | Cập nhật số lượng | Customer |
| DELETE | /api/cart/items/{id} | Xóa item khỏi giỏ | Customer |
| POST | /api/orders | Tạo đơn hàng (checkout) | Customer |
| GET | /api/orders/{id} | Chi tiết đơn hàng | Customer/Owner |
| GET | /api/orders/my-orders | Lịch sử đơn hàng | Customer |
| POST | /api/reviews | Đánh giá sản phẩm | Customer |
| POST | /api/admin/products | Tạo sản phẩm | Admin |
| PUT | /api/admin/products/{id} | Cập nhật sản phẩm | Admin |
| PUT | /api/admin/orders/{id}/status | Cập nhật trạng thái đơn | Admin/Staff |
| GET | /api/admin/dashboard/stats | Thống kê doanh thu | Admin |

### 4.5. Bảo mật (Spring Security + JWT)

```
Request → JwtAuthFilter (đọc token từ header Authorization)
        → Validate token (JwtTokenProvider)
        → Load UserDetails → set SecurityContext
        → Kiểm tra quyền theo @PreAuthorize("hasRole('ADMIN')")
        → Cho phép/từ chối truy cập endpoint
```

- Access token: thời hạn ngắn (15-30 phút)
- Refresh token: lưu ở DB hoặc Redis, thời hạn dài hơn (7 ngày)
- Mật khẩu: BCryptPasswordEncoder
- CORS: cấu hình cho phép domain frontend

### 4.6. Tích hợp thanh toán (MoMo/VNPay)

```
Client → POST /api/orders (checkout)
       → OrderService tạo order (status: PENDING, payment_status: UNPAID)
       → PaymentService gọi API cổng thanh toán (MoMo AIO/VNPay) tạo payment URL
       → Trả về payment URL cho FE redirect user
       → Cổng thanh toán gọi callback (IPN) về BE
       → PaymentService xác thực chữ ký, cập nhật order (payment_status: PAID)
```

### 4.7. Xử lý tồn kho (tránh oversell)

- Dùng `@Transactional` + pessimistic lock hoặc `SELECT ... FOR UPDATE` khi trừ kho lúc đặt hàng
- Hoặc dùng optimistic locking (`@Version` trên `product_variants`) để tránh race condition khi nhiều người mua cùng lúc

### 4.8. Caching chiến lược (Redis)
- Cache danh sách danh mục (ít thay đổi)
- Cache sản phẩm nổi bật/trang chủ
- Cache giỏ hàng của guest theo session
- Invalidate cache khi admin cập nhật sản phẩm

---

## 5. Kiến trúc Frontend (gợi ý)

- **Customer site**: React + TypeScript + TailwindCSS + React Query (gọi API) + Zustand/Redux (state giỏ hàng)
- **Admin dashboard**: React + Ant Design/MUI, biểu đồ thống kê (Recharts/Chart.js)
- Giao tiếp với BE qua Axios, interceptor tự động gắn JWT và refresh token khi hết hạn

```
src/
├── api/                # axios instance, các hàm gọi API theo module
├── components/         # Component dùng chung (Header, Footer, ProductCard...)
├── pages/               # Home, ProductDetail, Cart, Checkout, OrderHistory...
├── store/                # Redux/Zustand store (auth, cart)
├── hooks/                # useAuth, useCart...
└── routes/               # React Router config
```

---

## 6. Công nghệ đề xuất (Tech Stack)

| Thành phần | Công nghệ |
|---|---|
| Backend framework | Spring Boot 3.x |
| ORM | Spring Data JPA + Hibernate |
| Database | MySQL 8 hoặc PostgreSQL 15 |
| Cache | Redis |
| Bảo mật | Spring Security + JWT (jjwt) |
| Validation | Jakarta Bean Validation |
| Mapping | MapStruct |
| API docs | Springdoc OpenAPI (Swagger UI) |
| Upload ảnh | AWS S3 / Cloudinary |
| Thanh toán | MoMo AIO API / VNPay |
| Frontend | React + TypeScript + TailwindCSS |
| Build tool | Maven hoặc Gradle |
| Containerize | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## 7. Lộ trình triển khai đề xuất (cho người mới học)

1. **Giai đoạn 1 – Nền tảng**: Thiết kế DB, tạo entity + repository cơ bản (User, Product, Category)
2. **Giai đoạn 2 – Auth**: Đăng ký/đăng nhập JWT, phân quyền
3. **Giai đoạn 3 – Sản phẩm**: CRUD sản phẩm, danh mục, upload ảnh
4. **Giai đoạn 4 – Giỏ hàng & Đơn hàng**: Cart, Checkout, quản lý trạng thái đơn
5. **Giai đoạn 5 – Thanh toán**: Tích hợp MoMo/VNPay
6. **Giai đoạn 6 – Nâng cao**: Review, Voucher, Wishlist, Cache Redis
7. **Giai đoạn 7 – Admin dashboard**: Thống kê, quản lý toàn diện

---

## 8. Ghi chú mở rộng
- Nếu quy mô lớn, có thể tách `Product Service`, `Order Service`, `User Service` thành microservices riêng, giao tiếp qua REST/Message Queue (Kafka/RabbitMQ)
- Có thể thêm Elasticsearch để tìm kiếm sản phẩm nâng cao (full-text search, gợi ý)
- Thêm tính năng "gợi ý sản phẩm" dựa trên lịch sử mua hàng (recommendation) ở giai đoạn sau
