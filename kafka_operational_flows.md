# LUỒNG HOẠT ĐỘNG CỦA APACHE KAFKA TRONG MICROSERVICES

Báo cáo này giải thích chi tiết về cơ chế hoạt động của **Apache Kafka**, cách thiết lập luồng xử lý dữ liệu với Kafka trong kiến trúc Microservices, và so sánh luồng này với **RabbitMQ** (đang được sử dụng trong dự án).

---

## I. Các khái niệm cốt lõi cấu thành luồng Kafka

Để hiểu luồng hoạt động, trước tiên cần nắm rõ 5 thành phần chính trong mô hình của Kafka:

```
[Producer] (Gửi message)
     │
     ▼
[Topic] (Chủ đề phân loại tin nhắn)
  ├── Partition 0  [Msg 0][Msg 1][Msg 2]  ◄── Offset (Chỉ số vị trí đọc)
  └── Partition 1  [Msg 0][Msg 1]
     │
     ▼
[Consumer Group] (Nhóm tiêu thụ tin nhắn)
  ├── Consumer A (Đọc Partition 0)
  └── Consumer B (Đọc Partition 1)
```

1.  **Producer (Nhà sản xuất):** Microservice gửi dữ liệu lên Kafka (ví dụ: `order-service` gửi thông tin đơn hàng mới).
2.  **Topic (Chủ đề):** Nơi chứa các thông điệp cùng loại (tương tự như table trong DB).
3.  **Partition (Phân vùng):** Mỗi Topic được chia nhỏ thành nhiều Partition để chạy song song và tăng tốc độ đọc/ghi.
4.  **Offset:** Vị trí của tin nhắn trong Partition. Khi Consumer đọc xong một tin nhắn, nó sẽ "commit offset" để đánh dấu vị trí đã đọc.
5.  **Consumer Group:** Một nhóm các instance của một service cùng đọc dữ liệu. Mỗi Partition chỉ được đọc bởi tối đa **một** Consumer trong một Group tại một thời điểm để tránh trùng lặp dữ liệu.

---

## II. Minh họa Luồng hoạt động của Kafka trong dự án E-Commerce

Nếu chúng ta chuyển đổi hệ thống hiện tại từ RabbitMQ sang sử dụng Kafka, các luồng nghiệp vụ sẽ hoạt động như sau:

### 1. Luồng Tạo Đơn hàng và Thông báo (Order Placement Flow)

1. **Order Service** ghi nhận đơn hàng thành công vào database MySQL cục bộ.
2. **Order Service** (với vai trò Producer) đẩy một tin nhắn `OrderCreatedEvent` vào Topic tên là `orders` của Kafka, đính kèm Message Key là `userId` hoặc `orderId`.
3. Hệ thống Kafka Broker lưu trữ tin nhắn này tuần tự trên đĩa cứng tại các phân vùng (partitions) tương ứng.
4. Các service khác đóng vai trò Consumer tự động kéo (pull) tin nhắn này về xử lý song song:
   * **Shipping Service** (thuộc Consumer Group `shipping-group`) đọc event để tạo vận đơn giao hàng.
   * **Email Service** (thuộc Consumer Group `email-group`) đọc event để gửi thư xác nhận mua hàng thành công.
   * **Analytics Service** (thuộc Consumer Group `analytics-group`) đọc event để thống kê doanh thu và báo cáo thời gian thực.

> *Lưu ý:* Điểm đặc biệt của Kafka là tin nhắn không bị xóa sau khi đọc, do đó các Consumer Group độc lập có thể cùng đọc một tin nhắn mà không làm ảnh hưởng đến tiến trình của nhau.

---

## III. Cơ chế đảm bảo Thứ tự Xử lý (Message Ordering) trong Kafka

Một bài toán kinh điển trong thương mại điện tử là **Thứ tự xử lý sự kiện** (ví dụ: Sự kiện `Đơn hàng đã đặt` bắt buộc phải được xử lý trước sự kiện `Đơn hàng đã thanh toán` và `Đơn hàng đã hủy`).

*   **Cách Kafka giải quyết:** Kafka chỉ đảm bảo thứ tự tin nhắn **trong cùng một Partition**.
*   **Giải pháp:** Producer gửi tin nhắn kèm theo một **Message Key** (Ví dụ: `Key = orderId`). Kafka sẽ băm (hash) key này để luôn đưa tất cả các sự kiện liên quan đến đơn hàng đó vào **cùng một Partition**. Vì vậy, một Consumer đọc partition này sẽ luôn nhận được các sự kiện theo đúng thứ tự thời gian gửi.

---

## IV. So sánh Luồng hoạt động: RabbitMQ vs Apache Kafka

| Đặc tính so sánh | Luồng hoạt động RabbitMQ | Luồng hoạt động Apache Kafka |
| :--- | :--- | :--- |
| **Cơ chế lưu trữ** | Bộ nhớ đệm (Queue). Xóa ngay sau khi đọc/ACK thành công. | Commit Log ghi xuống ổ đĩa cứng. Lưu trữ lâu dài theo cấu hình thời gian (Retention). |
| **Cơ chế phân phối** | Sử dụng **Exchange** (Direct, Topic, Fanout) để định tuyến linh hoạt tới các Queue. | Gửi thẳng vào các **Topic** cố định, phân luồng bằng **Partition Key**. |
| **Độ tin cậy/Replay** | Không thể đọc lại (Replay) tin nhắn cũ đã xử lý xong. | Có thể reset offset để **đọc lại từ đầu** nếu hệ thống gặp sự cố. |
| **Hiệu năng xử lý** | Phù hợp với luồng tác vụ giao dịch vừa phải, phức tạp về logic định tuyến. | Tối ưu cho luồng dữ liệu cực lớn, liên tục (IoT, Log Aggregation, Real-time Stream). |
