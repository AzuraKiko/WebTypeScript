1. STO (HOSE)

Có đầy đủ tất cả các phiên:

| Giai đoạn      | BORD_EVNT_ID | OPER_STAT_TP | TRD_SESSN_ID |
| -------------- | ------------ | ------------ | ------------ |
| ATO (Mở cửa)   | AA1          | 2            | 10           |
| Liên tục sáng  | AB1          | 3            | 10           |
| Nghỉ trưa      | AC2          | 5            | 30           |
| Liên tục chiều | AB1          | 3            | 10           |
| ATC (Đóng cửa) | AD2          | 8            | 40           |
| PLO (Sau giờ)  | AW8          | 8            | 40           |
| Kết thúc ngày  | BB1          | 99           | 99           |

🏦 2. STX (HNX)

⚠️ Không có ATO, không có PLO

Chỉ có Liên tục + ATC + Kết thúc.

| Giai đoạn      | BORD_EVNT_ID | OPER_STAT_TP | TRD_SESSN_ID |
| -------------- | ------------ | ------------ | ------------ |
| Liên tục sáng  | AB1          | 3            | 10           |
| Nghỉ trưa      | AC2          | 5            | 30           |
| Liên tục chiều | AB1          | 3            | 10           |
| ATC (Đóng cửa) | AD2          | 8            | 40           |
| Kết thúc ngày  | BB1          | 99           | 99           |

🏦 3. UPX (UPCOM)

⚠️ Không có ATO, không có ATC, không có PLO

Chỉ có LO (Liên tục cả ngày) + Nghỉ trưa + Kết thúc.

| Giai đoạn      | BORD_EVNT_ID | OPER_STAT_TP | TRD_SESSN_ID |
| -------------- | ------------ | ------------ | ------------ |
| Liên tục sáng  | AB1          | 3            | 10           |
| Nghỉ trưa      | AC2          | 5            | 30           |
| Liên tục chiều | AB1          | 3            | 10           |
| Kết thúc ngày  | BB1          | 99           | 99           |

| Code | Market Name (VN)  | Ghi chú                 |
| ---- | ----------------- | ----------------------- |
| STO  | HoSE Stock Market | Sàn TP.HCM              |
| STX  | HNX Stock Market  | Sàn Hà Nội              |
| UPX  | UPCoM Market      | Sàn UPCoM (HNX quản lý) |

3. Bảng giao dịch (Board ID)

| Board Id | Tên bảng (VN)              | Ý nghĩa                                                                      |
| -------- | -------------------------- | ---------------------------------------------------------------------------- |
| **G1**   | Main Board                 | Bảng khớp lệnh liên tục chính                                                |
| **G3**   | Negotiation Board          | Giao dịch thoả thuận (Negotiation – cổ phiếu)                                |
| **G4**   | Odd lot                    | Bảng lô lẻ                                                                   |
| **G7**   | Derivative Board           | Bảng phái sinh (hợp đồng tương lai, quyền chọn – Futures/Options)            |
| **T1**   | Main Board – TPDN          | Giao dịch trái phiếu doanh nghiệp (Corporate Bond Market) – khớp lệnh thường |
| **T3**   | Negotiation Board – TPDN   | Thoả thuận trái phiếu doanh nghiệp                                           |
| **T4**   | Outright Bond Board – TPDN | Trái phiếu doanh nghiệp (giao dịch outright)                                 |
| **T6**   | Repo Bond Board – TPDN     | Giao dịch repo trái phiếu doanh nghiệp                                       |

2. Mapping theo sàn (MKT_ID)

STO (HoSE Stock Market) → thường có G1 (Main), G3 (Negotiation).

STX (HNX Stock Market) → thường có G1 (Main), G3 (Negotiation).

UPX (UPCoM) → cũng có G1, G3.

HCX (HNX Corporate Bond Market) → thường dùng T1, T3, T4, T6.

FIO (HNX Derivatives) → dùng G7.

| Mã (BORD_EVNT_ID) | Ý nghĩa (theo KRX)                           | Phiên tương ứng              |
| ----------------- | -------------------------------------------- | ---------------------------- |
| **AB1**           | Continuous Trading (Khớp lệnh liên tục)      | CNT (phiên chính trong ngày) |
| **AB2**           | Opening Auction (Khớp lệnh định kỳ mở cửa)   | AT0                          |
| **BB1**           | Break (Nghỉ trưa / Intermission)             | Break                        |
| **AC2**           | Closing Auction (Khớp lệnh định kỳ đóng cửa) | ATC                          |
| **AD2**           | After-Hour / PLO (Khớp lệnh sau giờ)         | PLO                          |
| **AW8**           | End of Day / Market Closed                   | Hết phiên                    |

5. Loại phiên (Trading Session ID)

2 – Phiên buổi sáng (Morning session).

3 – Phiên buổi chiều (Afternoon session).

5 – Nghỉ trưa (Break session).

8 – Sau giờ (After session).

OPER_STAT_TP (Trạng thái vận hành)

10 – Normal Trading → Đang giao dịch bình thường.

30 – Suspension / Halt → Tạm ngừng giao dịch (nghỉ trưa, tạm ngừng do sự kiện).

40 – Closing → Đóng cửa (kết thúc phiên, ngừng khớp lệnh).

99 – End of Operation / System Close → Hệ thống kết thúc vận hành trong ngày.
