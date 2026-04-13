# Phase 03 - Windows Deployment Guide

## Overview
- **Priority:** Medium
- **Status:** Completed
- **Effort:** ~10 min

## Requirements

### Functional
- Hướng dẫn tạo Telegram bot qua @BotFather
- Hướng dẫn lấy chat ID
- Script `disconnect.bat` giữ session khi tắt RDP (tscon trick)
- Script `startup.bat` auto-start bot khi login
- README hướng dẫn cài đặt và sử dụng

### Non-functional
- Hướng dẫn bằng tiếng Việt, rõ ràng
- Copy-paste ready

## Files to Create

| File | Purpose |
|------|---------|
| `disconnect.bat` | tscon trick — giữ desktop session khi tắt RDP |
| `startup.bat` | Auto-start bot khi login Windows |
| `README.md` | Hướng dẫn cài đặt và sử dụng |

## Implementation Steps

### 1. Tạo Telegram Bot (hướng dẫn trong README)
- Mở Telegram, tìm `@BotFather`
- Gửi `/newbot` → đặt tên → nhận token
- Gửi `/setcommands` để đăng ký menu lệnh:
  ```
  chup - Chụp màn hình chính
  chup_all - Chụp tất cả màn hình
  ```

### 2. Lấy Chat ID (hướng dẫn trong README)
- Gửi tin nhắn cho bot
- Truy cập `https://api.telegram.org/bot<TOKEN>/getUpdates`
- Lấy `chat.id` từ kết quả

### 3. Tạo `disconnect.bat`
```batch
@echo off
:: Giữ desktop session khi tắt RDP (tscon trick)
:: Chạy file này THAY VÌ đóng cửa sổ RDP
for /f "skip=1 tokens=3" %%s in ('query user %USERNAME%') do (
  %windir%\System32\tscon.exe %%s /dest:console
)
```

### 4. Tạo `startup.bat`
```batch
@echo off
cd /d "%~dp0"
node src\index.js
```

### 5. Tạo README.md
- Mô tả ứng dụng
- Yêu cầu: Node.js 18+, Windows
- Hướng dẫn cài đặt: clone, npm install, tạo .env
- Hướng dẫn tạo bot Telegram
- Hướng dẫn lấy chat ID
- Hướng dẫn chạy
- Hướng dẫn auto-start
- Hướng dẫn disconnect RDP an toàn
- Danh sách lệnh bot

## Todo
- [x] Tạo disconnect.bat
- [x] Tạo startup.bat
- [x] Tạo README.md bằng tiếng Việt

## Success Criteria
- README đủ thông tin để người dùng mới cài đặt từ đầu
- disconnect.bat chạy được trên Windows Server
- startup.bat khởi động bot thành công

## Risk
- **tscon cần quyền admin** trên một số Windows Server → ghi chú trong README
- **Windows Server Core** không có GUI → bot không hoạt động, cần Desktop Experience
