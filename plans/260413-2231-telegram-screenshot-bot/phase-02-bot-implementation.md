# Phase 02 - Screenshot Bot Implementation

## Overview
- **Priority:** High
- **Status:** Completed
- **Effort:** ~20 min

## Context
- [Stack Research](../reports/researcher-260413-2232-telegram-screenshot-bot-stack.md)

## Requirements

### Functional
- Bot nhận lệnh `/start` → gửi welcome message + danh sách lệnh
- Bot nhận lệnh `/chup` → chụp màn hình chính → gửi ảnh JPG về Telegram
- Bot nhận lệnh `/chup_all` → chụp tất cả màn hình → gửi từng ảnh
- Chỉ cho phép chat IDs trong whitelist sử dụng bot
- Ghi log khi nhận lệnh và khi gửi ảnh thành công/thất bại

### Non-functional
- Error handling: catch lỗi screenshot, lỗi gửi ảnh
- Nếu ảnh PNG > 10MB → fallback gửi document hoặc chuyển JPG
- Graceful shutdown: handle SIGINT/SIGTERM

## Architecture

```
src/
  └── index.js        # Entry point: bot setup, commands, screenshot logic
```

Chỉ 1 file vì logic đơn giản (~80-100 dòng). Không cần modularize.

## Key Code Structure

```js
// 1. Load config
require("dotenv").config();
const { Bot, InputFile } = require("grammy");
const screenshot = require("screenshot-desktop");

// 2. Validate config
const BOT_TOKEN = process.env.BOT_TOKEN;
const ALLOWED_IDS = process.env.ALLOWED_CHAT_IDS.split(",").map(Number);

// 3. Create bot
const bot = new Bot(BOT_TOKEN);

// 4. Auth middleware - chặn chat không được phép
bot.use((ctx, next) => {
  if (ALLOWED_IDS.includes(ctx.chat?.id)) return next();
  // im lặng, không phản hồi
});

// 5. Commands
bot.command("start", ...);
bot.command("chup", ...);    // screenshot({ format: "jpg" })
bot.command("chup_all", ...); // screenshot.all()

// 6. Start + graceful shutdown
bot.start();
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());
```

## Implementation Steps

1. Tạo `src/index.js`
2. Load env config với dotenv, validate BOT_TOKEN và ALLOWED_CHAT_IDS tồn tại
3. Tạo bot instance với grammY
4. Implement auth middleware: kiểm tra `ctx.chat.id` trong whitelist
5. Implement `/start` command: gửi welcome + danh sách lệnh
6. Implement `/chup` command:
   - Gửi "Đang chụp..." để user biết đang xử lý
   - Gọi `screenshot({ format: "jpg" })`
   - Gửi ảnh bằng `ctx.replyWithPhoto(new InputFile(buffer, "screenshot.jpg"))`
   - Catch error → gửi thông báo lỗi
7. Implement `/chup_all` command:
   - List displays → chụp all → gửi từng ảnh kèm caption tên display
8. Graceful shutdown handlers
9. Console log khi bot start thành công

## Todo
- [x] Tạo src/index.js với đầy đủ logic
- [x] Test locally (nếu có desktop)

## Success Criteria
- Bot start thành công, hiện log
- Gửi `/chup` → nhận ảnh screenshot
- Gửi `/chup_all` → nhận ảnh từ tất cả displays
- Chat ID không trong whitelist → không phản hồi
- Lỗi screenshot → bot gửi thông báo lỗi thay vì crash

## Security
- Bot token lưu trong .env, không hardcode
- Chat ID whitelist ngăn người lạ sử dụng
- Không log token ra console
