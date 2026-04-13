# Huong Dan Deploy Bot Chup Man Hinh Len Windows VPS

Huong dan tung buoc tu A-Z de cai dat va chay bot tren Windows VPS.

---

## Buoc 1: Tao Bot Telegram

1. Mo Telegram tren dien thoai hoac may tinh
2. Tim **@BotFather** (co dau tick xanh)
3. Gui lenh: `/newbot`
4. Dat **ten hien thi** cho bot (vd: `VPS Screenshot Bot`)
5. Dat **username** cho bot (phai ket thuc bang `bot`, vd: `my_vps_chup_bot`)
6. BotFather se gui lai **Bot Token** dang:
   ```
   7123456789:AAF1234abcd5678efgh-xyz
   ```
   **Luu lai token nay**, se dung o buoc sau.

7. Gui tiep cho @BotFather lenh: `/setcommands`
8. Chon bot vua tao
9. Gui noi dung sau:
   ```
   chup - Chup man hinh chinh
   chup_all - Chup tat ca man hinh
   ```

---

## Buoc 2: Lay Chat ID Cua Ban

1. Mo Telegram, gui mot tin nhan bat ky cho bot vua tao (vd: gui `hello`)
2. Mo trinh duyet, truy cap dia chi sau (thay token cua ban vao):
   ```
   https://api.telegram.org/bot8228991844:AAFBRYddJcjEyQEQecgR4mAsnfw36986Hr8/getUpdates
   ```
3. Tim dong `"chat":{"id":123456789` — so `123456789` chinh la **Chat ID** cua ban
4. **Luu lai Chat ID nay**

> **Meo:** Neu trang tra ve `{"result":[]}` thi gui lai tin nhan cho bot roi tai lai trang.

---

## Buoc 3: Cai Dat Node.js Tren VPS

1. Dang nhap VPS bang **Remote Desktop (RDP)**
2. Mo trinh duyet tren VPS, tai Node.js tai: `https://nodejs.org`
   - Chon phien ban **LTS** (vd: 20.x hoac 22.x)
   - Tai ban **Windows Installer (.msi)**
3. Chay file cai dat, nhan **Next** cho den khi xong
4. Mo **Command Prompt** (nhan `Win + R`, go `cmd`, Enter)
5. Kiem tra da cai thanh cong:
   ```batch
   node --version
   npm --version
   ```
   Neu hien so phien ban la OK.

---

## Buoc 4: Cai PM2

Mo Command Prompt (chay voi quyen Admin), go:

```batch
npm install -g pm2
npm install -g pm2-windows-startup
pm2-startup install
```

> **pm2-windows-startup** giup bot tu dong chay lai khi Windows restart.

---

## Buoc 5: Copy Du An Len VPS

### Cach 1: Tai tu GitHub (neu da push len)
```batch
cd C:\
git clone <url-repo-cua-ban> chup-vps-trade
cd chup-vps-trade
```

### Cach 2: Copy bang tay
1. Nen tat ca file du an thanh `.zip` tren may tinh cua ban
2. Copy file zip len VPS (keo tha qua RDP, hoac tai len Google Drive)
3. Giai nen vao `C:\chup-vps-trade`

---

## Buoc 6: Cai Dependencies

```batch
cd C:\chup-vps-trade
npm install
```

Cho den khi hien `added X packages`. Neu co error lien quan `node-gyp` thi cai them:
```batch
npm install -g windows-build-tools
```

---

## Buoc 7: Cau Hinh .env

```batch
copy .env.example .env
notepad .env
```

Sua noi dung file `.env`:
```
BOT_TOKEN=7123456789:AAF1234abcd5678efgh-xyz
ALLOWED_CHAT_IDS=123456789
```

- **BOT_TOKEN**: Token tu buoc 1
- **ALLOWED_CHAT_IDS**: Chat ID tu buoc 2 (nhieu ID cach nhau bang dau phay)

Luu file va dong Notepad.

---

## Buoc 8: Test Thu Bot

```batch
cd C:\chup-vps-trade
npm start
```

Neu hien:
```
Bot dang chay... Cho lenh tu Telegram.
Allowed chat IDs: 123456789
```

Mo Telegram, gui `/chup` cho bot. Neu nhan duoc anh chup man hinh la thanh cong!

Nhan `Ctrl + C` de dung bot (se chay lai bang PM2 o buoc sau).

---

## Buoc 9: Chay Bot Voi PM2

```batch
cd C:\chup-vps-trade
npm run pm2:start
pm2 save
```

Kiem tra bot dang chay:
```batch
npm run pm2:status
```

Hien bang nhu sau la OK:
```
┌────┬──────────────────┬──────┬───────┐
│ id │ name             │ mode │ status│
├────┼──────────────────┼──────┼───────┤
│ 0  │ chup-vps-trade   │ fork │ online│
└────┴──────────────────┴──────┴───────┘
```

### Cac lenh PM2 can nho

| Lenh | Chuc nang |
|------|-----------|
| `npm run pm2:start` | Khoi dong bot |
| `npm run pm2:stop` | Dung bot |
| `npm run pm2:restart` | Khoi dong lai bot |
| `npm run pm2:logs` | Xem log (loi, thong bao) |
| `npm run pm2:status` | Xem trang thai bot |
| `pm2 save` | Luu de tu dong chay khi restart VPS |

---

## Buoc 10: Disconnect RDP An Toan (QUAN TRONG)

**Van de:** Khi ban dong RDP binh thuong (nhan X), Windows se tat man hinh ao → bot chup man hinh se bi **anh den** hoac **loi**.

**Giai phap:** Dung file `disconnect.bat` de ngat ket noi RDP ma van giu man hinh song.

### Cach dung:
1. Tim file `disconnect.bat` trong thu muc du an (`C:\chup-vps-trade\disconnect.bat`)
2. **Click phai** → **Run as administrator**
3. Cua so RDP se tu dong dong, nhung man hinh VPS van hoat dong
4. Bot van chup man hinh binh thuong

> **LUON** dung `disconnect.bat` thay vi dong cua so RDP!

### Tao Shortcut tren Desktop (tien hon):
1. Click phai `disconnect.bat` → **Create shortcut**
2. Keo shortcut ra **Desktop**
3. Click phai shortcut → **Properties** → **Advanced** → Tick **"Run as administrator"** → OK

---

## Xu Ly Loi Thuong Gap

| Van de | Nguyen nhan | Cach xu ly |
|--------|-------------|------------|
| Bot khong phan hoi | Chat ID sai | Kiem tra ALLOWED_CHAT_IDS trong .env |
| Anh den/trong | RDP da dong | Dang nhap lai RDP, sau do dung `disconnect.bat` |
| `BOT_TOKEN` error | Token sai hoac thieu | Kiem tra lai .env |
| `npm install` loi | Thieu build tools | Chay `npm install -g windows-build-tools` |
| Bot crash lien tuc | Loi code hoac config | Chay `npm run pm2:logs` de xem chi tiet |
| PM2 khong tu chay | Chua save | Chay `pm2 save` sau khi start |

---

## Kiem Tra Sau Khi Deploy

- [ ] Gui `/start` → Bot tra loi huong dan
- [ ] Gui `/chup` → Nhan anh man hinh
- [ ] Gui `/chup_all` → Nhan anh tat ca man hinh
- [ ] `npm run pm2:status` → Status `online`
- [ ] Ngat RDP bang `disconnect.bat` → Gui `/chup` → Van nhan anh binh thuong
- [ ] Restart VPS → Bot tu dong chay lai (neu da `pm2 save`)
