# Telegram Screenshot Bot - Implementation Plan

```yaml
status: completed
created: 2026-04-13
mode: fast
blockedBy: []
blocks: []
```

## Overview

Node.js app chạy trên Windows VPS, nhận lệnh từ Telegram bot → chụp màn hình → gửi ảnh về Telegram.

**Stack:** grammY (Telegram bot) + screenshot-desktop (chụp màn hình) — 2 npm packages.

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Project Setup & Bot Configuration | completed | [phase-01](./phase-01-project-setup.md) |
| 2 | Screenshot Bot Implementation | completed | [phase-02](./phase-02-bot-implementation.md) |
| 3 | Windows Deployment Guide | completed | [phase-03](./phase-03-windows-deployment.md) |

## Key Decisions

- **grammY** over telegraf/NTBA: best docs, TypeScript native, active maintenance
- **screenshot-desktop**: zero native deps, returns Buffer directly, Windows compatible
- **JPG format** default: smaller file size, avoids Telegram 10MB limit on 4K screens
- **Chat ID whitelist**: security — chỉ cho phép chat ID được cấp phép
- **dotenv** cho config: tách token ra khỏi code

## Architecture

```
Windows VPS
  ├── node index.js          (grammY + screenshot-desktop)
  │     ├── /start           → welcome message + hướng dẫn
  │     ├── /chup            → screenshot 1 màn hình → gửi ảnh
  │     └── /chup_all        → screenshot tất cả màn hình → gửi nhiều ảnh
  ├── .env                   (BOT_TOKEN, ALLOWED_CHAT_IDS)
  ├── disconnect.bat          (tscon trick giữ session khi tắt RDP)
  └── startup.bat            (auto-start bot khi login)
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| grammy | ^1.35.0 | Telegram Bot API |
| screenshot-desktop | ^1.15.0 | Desktop screenshot capture |
| dotenv | ^16.4.0 | Environment variable management |

## Risk

- **RDP disconnect = blank screenshot**: Giải quyết bằng `tscon` trick (đã có trong phase-03)
- **Telegram 10MB limit**: Dùng JPG format, fallback gửi document nếu file lớn

## Reports

- [Stack Research](../reports/researcher-260413-2232-telegram-screenshot-bot-stack.md)
