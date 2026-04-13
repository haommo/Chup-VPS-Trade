# Phase 01 - Project Setup & Bot Configuration

## Overview
- **Priority:** High
- **Status:** Completed
- **Effort:** ~10 min

## Requirements

### Functional
- Khởi tạo Node.js project với package.json
- Cài đặt dependencies: grammy, screenshot-desktop, dotenv
- Tạo cấu trúc file `.env` cho bot token và allowed chat IDs
- Tạo `.gitignore` để bảo vệ credentials

### Non-functional
- File structure gọn, dễ hiểu
- Config tách biệt khỏi code

## Files to Create

| File | Purpose |
|------|---------|
| `package.json` | Project config, scripts, dependencies |
| `.env.example` | Template cho environment variables |
| `.gitignore` | Ignore node_modules, .env |

## Implementation Steps

1. Tạo `package.json` với:
   - name: `chup-vps-trade`
   - scripts: `start` → `node src/index.js`
   - dependencies: grammy, screenshot-desktop, dotenv

2. Tạo `.env.example`:
   ```
   BOT_TOKEN=your_bot_token_here
   ALLOWED_CHAT_IDS=123456789,987654321
   ```

3. Tạo `.gitignore`:
   ```
   node_modules/
   .env
   ```

## Todo
- [x] Tạo package.json
- [x] Tạo .env.example
- [x] Tạo .gitignore

## Success Criteria
- `npm install` chạy thành công
- Cấu trúc project sạch, rõ ràng
