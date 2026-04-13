require("dotenv").config();
const { Bot, InputFile } = require("grammy");
const screenshot = require("screenshot-desktop");

// --- Config validation ---
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN || BOT_TOKEN === "your_bot_token_here") {
  console.error("LOI: Chua cau hinh BOT_TOKEN trong file .env");
  process.exit(1);
}

const ALLOWED_IDS = (process.env.ALLOWED_CHAT_IDS || "")
  .split(",")
  .map((id) => Number(id.trim()))
  .filter((id) => !isNaN(id) && id > 0);

if (ALLOWED_IDS.length === 0) {
  console.error("LOI: Chua cau hinh ALLOWED_CHAT_IDS trong file .env");
  process.exit(1);
}

// --- Bot setup ---
const bot = new Bot(BOT_TOKEN);

// Global error handler — tránh crash khi có lỗi không mong đợi
bot.catch((err) => {
  console.error(`[${new Date().toLocaleString()}] Bot error:`, err.message);
});

// Auth middleware — chỉ cho phép chat ID trong whitelist
bot.use((ctx, next) => {
  if (ALLOWED_IDS.includes(ctx.chat?.id)) return next();
  // Im lặng với người lạ
});

// /start — welcome message
bot.command("start", async (ctx) => {
  await ctx.reply(
    "Chao ban! Toi la bot chup man hinh VPS.\n\n" +
      "Cac lenh:\n" +
      "/chup - Chup man hinh chinh\n" +
      "/chup_all - Chup tat ca man hinh"
  );
});

// /chup — chụp màn hình chính, gửi ảnh JPG
bot.command("chup", async (ctx) => {
  await ctx.reply("Dang chup man hinh...");
  try {
    const img = await screenshot({ format: "jpg" });
    await ctx.replyWithPhoto(new InputFile(img, "screenshot.jpg"));
    console.log(`[${new Date().toLocaleString()}] Da gui screenshot cho chat ${ctx.chat.id}`);
  } catch (err) {
    console.error("Loi chup man hinh:", err.message);
    await ctx.reply("Loi chup man hinh. Xem log tren server de biet chi tiet.");
  }
});

// /chup_all — chụp tất cả màn hình
bot.command("chup_all", async (ctx) => {
  await ctx.reply("Dang chup tat ca man hinh...");
  try {
    const displays = await screenshot.listDisplays();
    const images = await screenshot.all({ format: "jpg" });

    for (let i = 0; i < images.length; i++) {
      const name = displays[i]?.name || `display-${i + 1}`;
      await ctx.replyWithPhoto(new InputFile(images[i], `screen-${name}.jpg`), {
        caption: `Man hinh: ${name}`,
      });
    }
    console.log(`[${new Date().toLocaleString()}] Da gui ${images.length} screenshot cho chat ${ctx.chat.id}`);
  } catch (err) {
    console.error("Loi chup man hinh:", err.message);
    await ctx.reply("Loi chup man hinh. Xem log tren server de biet chi tiet.");
  }
});

// --- Start bot ---
bot.start().catch((err) => {
  console.error("LOI: Khong the khoi dong bot:", err.message);
  process.exit(1);
});
console.log("Bot dang chay... Cho lenh tu Telegram.");
console.log(`Allowed chat IDs: ${ALLOWED_IDS.join(", ")}`);

// Graceful shutdown
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());
