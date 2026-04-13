# Telegram Screenshot Bot - Stack Research

## Recommendation Summary

| Component | Choice | Package |
|-----------|--------|---------|
| Telegram Bot | **grammY** | `grammy` |
| Screenshot | **screenshot-desktop** | `screenshot-desktop` |
| Total deps | **2 packages** | Minimal |

---

## 1. Telegram Bot Library Comparison

| Criterion | node-telegram-bot-api | telegraf | grammY |
|-----------|----------------------|---------|--------|
| TypeScript | Bolted-on types | Migrated v4 (complex) | Built from scratch |
| Maintenance | Slow updates | Moderate | Active, latest Bot API |
| Complexity | Low (event emitter) | Medium (middleware) | Medium (middleware) |
| Photo sending | `sendPhoto(chatId, buffer)` | `ctx.replyWithPhoto({source: buffer})` | `ctx.replyWithPhoto(new InputFile(buffer))` |
| Scalability | Poor past ~50 LOC | Good | Good |
| Docs quality | Minimal | API reference only | Excellent guides |

**Verdict: grammY wins.** For a simple single-command bot, all three are easy enough. But grammY has the best docs, best TypeScript support, active maintenance, and the API is clean. The overhead vs NTBA is negligible -- a few more lines at most. NTBA's event emitter pattern becomes messy fast and it's poorly maintained.

---

## 2. Screenshot Library Comparison

| Criterion | screenshot-desktop | robotjs | sharp + native |
|-----------|-------------------|---------|----------------|
| Windows support | Native (no ext deps) | Requires build tools | N/A (not a capture lib) |
| Output | Buffer (JPG/PNG) | Raw bitmap | N/A |
| Multi-monitor | Yes (`listDisplays`, `all()`) | Manual | N/A |
| Install complexity | `npm install` just works | Needs node-gyp, VS Build Tools | N/A |
| Maturity | 497 stars, 2.5k dependents | Larger but different purpose | N/A |

**Verdict: screenshot-desktop.** Only real option for simple desktop capture on Windows without native build toolchain. Returns a Buffer directly -- perfect for piping to Telegram. robotjs is overkill (mouse/keyboard automation lib). sharp is image processing, not capture.

---

## 3. Code Snippets

### Bot Setup + Screenshot + Send

```js
const { Bot, InputFile } = require("grammy");
const screenshot = require("screenshot-desktop");

const bot = new Bot("YOUR_BOT_TOKEN");

// Restrict to your chat only
const ALLOWED_CHAT_ID = 123456789; // your Telegram user ID

bot.command("chup", async (ctx) => {
  if (ctx.chat.id !== ALLOWED_CHAT_ID) return;

  try {
    const img = await screenshot({ format: "png" });
    await ctx.replyWithPhoto(new InputFile(img, "screenshot.png"));
  } catch (err) {
    await ctx.reply(`Screenshot failed: ${err.message}`);
  }
});

bot.command("chup_all", async (ctx) => {
  if (ctx.chat.id !== ALLOWED_CHAT_ID) return;

  try {
    const displays = await screenshot.listDisplays();
    const images = await screenshot.all();
    for (let i = 0; i < images.length; i++) {
      await ctx.replyWithPhoto(
        new InputFile(images[i], `screen-${displays[i].name}.png`),
        { caption: `Display: ${displays[i].name}` }
      );
    }
  } catch (err) {
    await ctx.reply(`Screenshot failed: ${err.message}`);
  }
});

bot.start();
console.log("Bot running...");
```

### package.json

```json
{
  "name": "chup-vps-trade",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "grammy": "^1.35.0",
    "screenshot-desktop": "^1.15.0"
  }
}
```

---

## 4. Windows Server Gotchas (CRITICAL)

### Problem: RDP Disconnect Kills Screenshots

When you disconnect from an RDP session, Windows transitions the session to a "disconnected" state. The desktop compositor stops rendering, and **screenshot-desktop returns black/blank images or throws errors**.

This is the #1 issue for VPS screenshot bots.

### Solutions (ranked by reliability)

**1. `tscon` trick (BEST) -- redirect session to console on disconnect**

Create a batch file and use it instead of closing RDP:

```batch
@echo off
:: Redirect current RDP session to console (keeps desktop alive)
for /f "skip=1 tokens=3" %%s in ('query user %USERNAME%') do (
  %windir%\System32\tscon.exe %%s /dest:console
)
```

This disconnects your RDP client but keeps the Windows session active on the physical console. Screenshots continue working. Run this batch file instead of clicking the X on RDP.

**2. Registry: Disable lock screen on disconnect**

```
HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services
  - fPromptForPassword = 0 (DWORD)

HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System
  - InactivityTimeoutSecs = 0 (DWORD, disables auto-lock)
```

**3. Keep RDP window open (simplest, least reliable)**

Use a VNC/RDP client that stays connected. Not practical for always-on bots.

**4. Use a headless screenshot method (alternative)**

If `screenshot-desktop` fails in disconnected sessions, consider PowerShell-based capture as fallback:

```js
const { execSync } = require("child_process");
const fs = require("fs");

function screenshotFallback() {
  const ps = `
    Add-Type -AssemblyName System.Windows.Forms
    $screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
    $bitmap = New-Object System.Drawing.Bitmap($screen.Width, $screen.Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CopyFromScreen($screen.Location, [System.Drawing.Point]::Empty, $screen.Size)
    $bitmap.Save("C:\\temp\\screenshot.png")
  `;
  execSync(`powershell -Command "${ps.replace(/\n/g, " ")}"`);
  return fs.readFileSync("C:\\temp\\screenshot.png");
}
```

Note: This PowerShell fallback has the **same limitation** -- it needs an active desktop session. The `tscon` trick is the real fix.

### Other Windows Notes

- **Temp directory with spaces**: screenshot-desktop issue #320. If `os.tmpdir()` has spaces, it may fail. Workaround: set `TEMP=C:\temp` env var.
- **High-res screens**: Large screenshots may hit stdout buffer limits (issue #297). PNG format produces larger buffers. Use JPG for reliability, or increase Node's `maxBuffer`.
- **Telegram file limit**: Photos max 10MB, documents max 50MB. A 4K PNG screenshot ~5-15MB. Use JPG format or send as document if too large.
- **UAC / Permissions**: Bot process needs to run in an interactive session, not as a Windows Service (no desktop access).

---

## 5. Recommended Architecture

```
Windows VPS (RDP)
  |
  +-- node index.js        (grammy + screenshot-desktop)
  |     |
  |     +-- /chup command  --> screenshot() --> ctx.replyWithPhoto()
  |     +-- /chup_all      --> screenshot.all() --> multiple photos
  |
  +-- disconnect.bat        (tscon trick, keeps session alive)
  +-- startup.bat           (optional: auto-start bot on login)
```

### Auto-start on Login

Create `startup.bat`:
```batch
@echo off
cd /d "C:\path\to\bot"
node index.js
```

Place shortcut in: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\`

Or use Task Scheduler with "Run only when user is logged on" + "Do not start a new instance".

---

## Sources & Credibility

| Source | Type | Credibility |
|--------|------|-------------|
| grammy.dev/guide | Official docs | High (maintainer) |
| grammy.dev/resources/comparison | Official comparison | Medium (biased toward grammY, acknowledged) |
| github.com/bencevans/screenshot-desktop | Source repo + issues | High |
| learn.microsoft.com (tscon) | MS official docs | High |

---

## Unresolved Questions

1. **Exact behavior of screenshot-desktop v1.15 in disconnected RDP** -- needs live testing on target VPS to confirm if `tscon` trick fully resolves it
2. **grammY latest version** -- report uses ^1.35.0 based on knowledge cutoff; verify with `npm info grammy version` at install time
3. **Multiple monitor layout on VPS** -- if VPS has virtual displays, `listDisplays()` behavior may vary by hosting provider
