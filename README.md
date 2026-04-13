# Chup VPS Trade - Telegram Screenshot Bot

Bot Telegram chup va gui screenshot man hinh Windows VPS.

## Yeu Cau

- Windows co Desktop (khong phai Server Core)
- Node.js 18+
- PM2 (`npm install -g pm2`)
- Ket noi internet

## Cai Dat

### 1. Tao Bot Telegram

1. Mo Telegram, tim `@BotFather`
2. Gui `/newbot`
3. Dat ten cho bot (vd: `My VPS Bot`)
4. Dat username cho bot (vd: `my_vps_screenshot_bot`)
5. Copy **Bot Token** (dang `123456:ABC-DEF...`)
6. Gui `/setcommands` cho @BotFather, chon bot cua ban, gui:
   ```
   chup - Chup man hinh chinh
   chup_all - Chup tat ca man hinh
   ```

### 2. Lay Chat ID

1. Mo Telegram, gui mot tin nhan bat ky cho bot vua tao
2. Mo trinh duyet, truy cap:
   ```
   https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
   ```
   (thay `<BOT_TOKEN>` bang token cua ban)
3. Tim `"chat":{"id":123456789}` — so `123456789` la Chat ID cua ban

### 3. Cai Dat Ung Dung

```batch
:: Cai dependencies
npm install

:: Tao file .env tu template
copy .env.example .env
```

Sua file `.env`:
```
BOT_TOKEN=123456:ABC-DEF-your-token
ALLOWED_CHAT_IDS=123456789
```

### 4. Cai PM2

```batch
npm install -g pm2
npm install -g pm2-windows-startup
pm2-startup install
```

### 5. Chay Bot

```batch
:: Khoi dong bot voi PM2
npm run pm2:start

:: Luu danh sach PM2 de tu dong chay khi restart Windows
pm2 save
```

### Cac lenh PM2 thuong dung

```batch
npm run pm2:status     :: Xem trang thai bot
npm run pm2:logs       :: Xem log bot
npm run pm2:restart    :: Khoi dong lai bot
npm run pm2:stop       :: Dung bot
```

## Lenh Bot

| Lenh | Mo ta |
|------|-------|
| `/start` | Hien thi huong dan |
| `/chup` | Chup man hinh chinh |
| `/chup_all` | Chup tat ca man hinh |

## Disconnect RDP An Toan

**Van de:** Khi dong RDP binh thuong, Windows tat desktop → bot chup man hinh bi den/loi.

**Giai phap:** Chay `disconnect.bat` (click doi) THAY VI dong cua so RDP. File nay giu desktop session song de bot van chup duoc.

> **Luu y:** Can quyen Administrator tren mot so Windows Server.

## Cau Truc Du An

```
chup-vps-trade/
├── src/
│   └── index.js           # Code bot chinh
├── .env                   # Config (BOT_TOKEN, ALLOWED_CHAT_IDS)
├── .env.example           # Template config
├── .gitignore
├── disconnect.bat         # Script disconnect RDP an toan
├── ecosystem.config.js    # PM2 config
├── package.json
└── README.md
```

## Xu Ly Loi

| Loi | Nguyen nhan | Cach xu ly |
|-----|-------------|------------|
| Anh den/trong | RDP da disconnect | Chay `disconnect.bat` thay vi dong RDP |
| `BOT_TOKEN` error | Chua cau hinh .env | Kiem tra lai token trong .env |
| Screenshot failed | Khong co desktop | Dang nhap RDP, chay `disconnect.bat` |
| Bot khong phan hoi | Chat ID khong dung | Kiem tra ALLOWED_CHAT_IDS trong .env |
