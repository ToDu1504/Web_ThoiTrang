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

> Sơ đồ dưới đây phản ánh đúng những gì đã triển khai thật (xem mục 9–10). Bản kế hoạch ban đầu có tính thêm API Gateway và Cloud Storage như hướng mở rộng — không triển khai vì quy mô hiện tại chưa cần, ghi chú lại ở mục 8.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│         React SPA (frontend/) — Vite + TypeScript            │
│   Trang khách hàng (/...)      Trang admin (/admin/*)        │
└───────────────────────────┬───────────────────────────────────┘
                            │ HTTPS/REST JSON (Axios)
                            │ Authorization: Bearer <JWT> / X-Session-Id
┌───────────────────────────▼───────────────────────────────────┐
│                SPRING BOOT APPLICATION (Monolith, backend/)    │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  Controller Layer (REST Controllers)                   │    │
│  ├───────────────────────────────────────────────────────┤    │
│  │  Service Layer (Business Logic)                        │    │
│  ├───────────────────────────────────────────────────────┤    │
│  │  Repository Layer (Spring Data JPA)                    │    │
│  ├───────────────────────────────────────────────────────┤    │
│  │  Security Layer (Spring Security + JWT)                │    │
│  └───────────────────────────────────────────────────────┘    │
└───────┬───────────────────┬───────────────────┬────────────────┘
       │                   │                   │
┌──────▼──────────┐ ┌──────▼──────────┐ ┌──────▼──────────────┐
│      MySQL       │ │  Redis (Cache)   │ │  Local disk storage  │
│   (Dữ liệu chính) │ │  categories/     │ │  (uploads/, phục vụ  │
│                   │ │  brands/products │ │  qua /uploads/**)    │
└───────────────────┘ └──────────────────┘ └───────────────────────┘
        │
┌───────▼───────────────┐
│  VNPay sandbox API      │
│  (build/ký/verify URL   │
│  thanh toán, callback   │
│  return + IPN)          │
└──────────────────────────┘
```

Không có API Gateway hay reverse proxy — frontend gọi thẳng backend qua Axios (`src/api/client.ts`). Ảnh sản phẩm lưu đĩa cục bộ qua `FileStorageService` (không phải cloud storage) — xem mục 8 cho lý do và hướng đổi sang S3/Cloudinary sau này. Admin dashboard không phải app React riêng mà là một nhánh route (`/admin/*`) trong cùng SPA, gate theo role ở `ProtectedRoute`.

**Gợi ý ban đầu**: bắt đầu với kiến trúc **Monolith layered** (dễ triển khai, phù hợp đồ án/dự án cá nhân), sau này có thể tách thành microservices (Product Service, Order Service, User Service...) nếu quy mô lớn — chưa cần ở giai đoạn hiện tại.

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

> ✅ = đã triển khai xong. Xem mục 9 cho phần frontend, mục 10 cho hướng dẫn chạy dự án thật.

1. ✅ **Giai đoạn 1 – Nền tảng**: Thiết kế DB, tạo entity + repository cơ bản (User, Product, Category)
2. ✅ **Giai đoạn 2 – Auth**: Đăng ký/đăng nhập JWT (access + refresh token), phân quyền theo Role
3. ✅ **Giai đoạn 3 – Sản phẩm**: CRUD sản phẩm (kèm biến thể size/màu), danh mục, thương hiệu, upload ảnh (lưu đĩa cục bộ, trừu tượng hóa qua `FileStorageService` để sau đổi sang S3/Cloudinary)
4. ✅ **Giai đoạn 4 – Giỏ hàng & Đơn hàng**: Cart (khách + thành viên), Checkout, khóa bi quan chống oversell, quản lý trạng thái đơn
5. ✅ **Giai đoạn 5 – Thanh toán**: Tích hợp VNPay (build + ký + verify URL thanh toán, xử lý callback return/IPN). MoMo **chưa** làm — xem ghi chú trong lịch sử trao đổi, chưa có API contract được kiểm chứng
6. ✅ **Giai đoạn 6 – Nâng cao**: Review, Voucher (áp dụng lúc checkout), Wishlist, Cache Redis (danh mục/thương hiệu/chi tiết sản phẩm)
7. ✅ **Giai đoạn 7 – Admin dashboard**: Thống kê doanh thu/đơn hàng/top sản phẩm bán chạy, quản lý người dùng (khóa/mở khóa, gán vai trò)

---

## 8. Ghi chú mở rộng
- Ảnh sản phẩm hiện lưu đĩa cục bộ qua `FileStorageService` (`LocalFileStorageServiceImpl`), trừu tượng hóa sau interface sẵn để đổi sang AWS S3/Cloudinary khi cần scale-out (nhiều instance backend không share được đĩa cục bộ)
- Chưa cần API Gateway/reverse proxy (Nginx, Spring Cloud Gateway) ở quy mô 1 instance backend — cân nhắc thêm khi có nhiều service hoặc cần rate-limit/SSL termination tập trung
- Nếu quy mô lớn, có thể tách `Product Service`, `Order Service`, `User Service` thành microservices riêng, giao tiếp qua REST/Message Queue (Kafka/RabbitMQ)
- Có thể thêm Elasticsearch để tìm kiếm sản phẩm nâng cao (full-text search, gợi ý)
- Thêm tính năng "gợi ý sản phẩm" dựa trên lịch sử mua hàng (recommendation) ở giai đoạn sau

---

## 9. Kế hoạch triển khai Frontend (React SPA)

> Backend (Giai đoạn 1–7 ở mục 7) đã hoàn thành đầy đủ dạng REST API JSON thuần + JWT qua header `Authorization: Bearer <token>`. Frontend đi theo hướng **React SPA gọi thẳng REST API**, không dùng Thymeleaf.

### 9.1. Tech stack

| Thành phần | Công nghệ |
|---|---|
| Build tool | Vite |
| Ngôn ngữ | TypeScript |
| UI framework | React 18 |
| Styling | TailwindCSS |
| Routing | React Router v6 |
| Data fetching / cache | TanStack Query (React Query) |
| Global state (auth, cart badge...) | Zustand |
| HTTP client | Axios (interceptor tự gắn JWT + tự refresh token khi 401) |
| Form + validate | React Hook Form + Zod |
| Icon | lucide-react |

Vị trí: thư mục `frontend/` ngay trong repo hiện tại (monorepo đơn giản, không tách repo riêng).

### 9.2. Danh sách API thực tế (đầy đủ hơn bảng ở mục 4.4)

**Auth** (public)
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh-token`

**Public (khách + thành viên)**
- `GET /api/products?keyword&categoryId&brandId&minPrice&maxPrice&page&size&sort`
- `GET /api/products/{slug}`
- `GET /api/products/{productId}/reviews`
- `GET /api/categories`, `GET /api/categories/{id}`
- `GET /api/brands`, `GET /api/brands/{id}`
- `GET /uploads/**` (ảnh sản phẩm)

**Cart** (khách qua header `X-Session-Id`, thành viên qua JWT — không cần cả hai)
- `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/{id}`, `DELETE /api/cart/items/{id}`

**Customer** (cần JWT)
- `POST /api/orders` (checkout, hỗ trợ `voucherCode`, `paymentMethod`: COD/VNPAY → trả kèm `paymentUrl` nếu VNPAY)
- `GET /api/orders/{id}`, `GET /api/orders/my-orders`
- `POST /api/reviews`
- `GET /api/wishlist`, `POST /api/wishlist`, `DELETE /api/wishlist/{productId}`
- `GET /api/payments/vnpay/return` (trang kết quả thanh toán VNPay redirect về)

**Admin/Staff** (`ROLE_ADMIN`/`ROLE_STAFF`, riêng gán role user chỉ `ROLE_ADMIN`)
- `/api/admin/categories`, `/api/admin/brands` (CRUD)
- `/api/admin/products` (CRUD, GET có filter theo status), `POST /api/admin/products/{id}/images`, `DELETE /api/admin/products/{id}/images/{imageId}`
- `/api/admin/orders` (list/filter theo status), `PUT /api/admin/orders/{id}/status`
- `/api/admin/vouchers` (CRUD)
- `/api/admin/users` (list/search), `PUT /api/admin/users/{id}/status`, `PUT /api/admin/users/{id}/roles` (ADMIN-only)
- `GET /api/admin/dashboard/stats`

Tất cả response đều bọc trong `ApiResponse<T>` (mục 4.3): `{ success, message, data, timestamp }`.

### 9.3. Cấu trúc thư mục

```
frontend/
├── src/
│   ├── api/                # axios instance + hàm gọi API theo module (auth.ts, products.ts, cart.ts...)
│   ├── components/         # Header, Footer, ProductCard, CartDrawer, ProtectedRoute...
│   ├── pages/
│   │   ├── customer/        # Home, ProductList, ProductDetail, Cart, Checkout, OrderHistory, OrderDetail, Login, Register, Wishlist
│   │   └── admin/           # Dashboard, Products, Orders, Categories, Brands, Vouchers, Users
│   ├── store/                # Zustand: authStore (user, tokens), cartStore (badge count)
│   ├── hooks/                # useAuth, useCart, useProducts (React Query wrappers)
│   ├── types/                 # TypeScript interfaces khớp với DTO backend
│   ├── routes/                 # React Router config, ProtectedRoute theo role
│   └── App.tsx
├── .env                     # VITE_API_BASE_URL=http://localhost:8080
└── vite.config.ts
```

### 9.4. Luồng xác thực

- Lưu `accessToken` + `refreshToken` sau khi login/register (Zustand + localStorage persist)
- Axios request interceptor: tự gắn `Authorization: Bearer <accessToken>`
- Axios response interceptor: nếu 401 → gọi `POST /api/auth/refresh-token`, cập nhật token, retry request gốc; nếu refresh cũng fail → logout, chuyển về `/login`
- Giỏ hàng khách: sinh `X-Session-Id` (UUID) lưu localStorage, gắn vào mọi request `/api/cart/**` khi chưa đăng nhập

### 9.5. Lộ trình triển khai (mirror theo giai đoạn backend)

> ✅ Cả 5 phase đã triển khai xong. Biểu đồ dùng thanh bar CSS đơn giản thay vì Recharts (đủ dùng cho quy mô hiện tại, chưa cần thêm thư viện).

1. ✅ **Phase 1 — Khởi tạo & Auth**: scaffold Vite + Tailwind + Router, axios client + interceptor (tự refresh token khi 401), trang Login/Register, layout chung (Header/Footer), Zustand authStore
2. ✅ **Phase 2 — Duyệt sản phẩm**: trang chủ, danh sách sản phẩm (filter danh mục/thương hiệu/giá, tìm kiếm), chi tiết sản phẩm (chọn size/màu, ảnh, đánh giá)
3. ✅ **Phase 3 — Giỏ hàng & Checkout**: thêm/sửa/xóa giỏ hàng (khách qua `X-Session-Id` + thành viên qua JWT), trang checkout, áp voucher, chọn COD/VNPay (redirect sang cổng thanh toán), trang kết quả thanh toán (`/payment/vnpay-return`)
4. ✅ **Phase 4 — Tài khoản khách hàng**: lịch sử đơn hàng, chi tiết đơn, wishlist
5. ✅ **Phase 5 — Admin dashboard**: layout riêng có sidebar, thống kê, CRUD sản phẩm (kèm biến thể + upload/xóa ảnh)/danh mục/thương hiệu/voucher, quản lý đơn hàng (đổi trạng thái), quản lý user (khóa/mở khóa, gán vai trò — ADMIN-only)

---

## 10. Hướng dẫn chạy dự án (local, Windows + Laragon)

Repo tách 2 thư mục độc lập ở gốc: `backend/` (Spring Boot, Maven) và `frontend/` (Vite/React).

### 10.1. Khởi động hạ tầng

```bash
# MySQL
"C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqld.exe" --defaults-file="C:\laragon\bin\mysql\mysql-8.4.3-winx64\my.ini"

# Redis
"C:\laragon\bin\redis\redis-x64-5.0.14.1\redis-server.exe" "C:\laragon\bin\redis\redis-x64-5.0.14.1\redis.windows.conf"
```

Database `fashionshop_db` cần tồn tại sẵn (tạo 1 lần: `CREATE DATABASE fashionshop_db CHARACTER SET utf8mb4`), Hibernate tự tạo/cập nhật bảng từ đó (`ddl-auto=update`). Role mặc định (`ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_CUSTOMER`) tự được tạo lúc khởi động app.

### 10.2. Chạy backend

```bash
cd backend
VNPAY_TMN_CODE=xxx VNPAY_HASH_SECRET=xxx ./mvnw.cmd spring-boot:run
```

`VNPAY_TMN_CODE`/`VNPAY_HASH_SECRET` không bắt buộc để chạy app, chỉ cần khi muốn test luồng thanh toán VNPay thật (đăng ký tài khoản sandbox miễn phí tại vnpayment.vn để lấy). Backend chạy ở `http://localhost:8080`.

### 10.3. Chạy frontend

```bash
cd frontend
npm install   # lần đầu
npm run dev -- --port 5174 --strictPort
```

**Bắt buộc chạy đúng cổng 5174** — backend cấu hình `vnpay.return-url` trỏ cứng vào `http://localhost:5174/payment/vnpay-return`. Frontend chạy ở `http://localhost:5174`.

### 10.4. Lưu ý khi gặp lỗi

- **Các API `/api/categories`, `/api/brands`, `/api/products/{slug}` từng bị lỗi 500 `SerializationException`** khi dữ liệu cache cũ trong Redis (`dump.rdb` ở gốc repo, tự nạp lại mỗi lần Redis khởi động) không tương thích với format serializer hiện tại. Đã có `CacheErrorHandler` (`RedisConfig`) tự bắt lỗi và fallback về database nên không còn làm sập API nữa — nhưng nếu muốn dọn sạch cache cũ vẫn có thể chạy `redis-cli FLUSHALL`.

### 10.5. Tài khoản test có sẵn

Mật khẩu chung: `123456`

| Email | Vai trò | Ghi chú |
|---|---|---|
| `test@example.com` | ROLE_ADMIN, ROLE_CUSTOMER | Nguyen Van A — dùng để đăng nhập vào `/admin` |
| `userb@example.com` | ROLE_CUSTOMER | Tran Thi B — tài khoản khách hàng thường |
