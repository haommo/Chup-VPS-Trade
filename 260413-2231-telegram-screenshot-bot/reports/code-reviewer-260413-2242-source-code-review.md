# Code Review: Chup VPS Trade - Telegram Screenshot Bot

## Scope
- Files: 7 (index.js, package.json, .env.example, .gitignore, disconnect.bat, startup.bat, README.md)
- LOC: ~115 (code), ~115 (docs)
- Focus: Full project review

## Overall Assessment

Clean, well-structured small project. Follows KISS/YAGNI. Auth whitelist implemented correctly. A few production-readiness issues found, mostly around error handling and a potential data leak.

---

## Critical Issues

### 1. Error message leaks internal info to Telegram chat

**File:** `src/index.js:50, 70`

```js
await ctx.reply(`Loi chup man hinh: ${err.message}`);
```

`err.message` from `screenshot-desktop` or system errors can contain file paths, system usernames, or internal OS details. This leaks server internals to the Telegram user.

**Fix:** Send a generic error message to the user, keep detailed error only in server logs.

```js
console.error("Loi chup man hinh:", err);
await ctx.reply("Loi chup man hinh. Vui long thu lai sau.");
```

### 2. Allowed chat IDs logged to stdout on every startup

**File:** `src/index.js:77`

```js
console.log(`Allowed chat IDs: ${ALLOWED_IDS.join(", ")}`);
```

Chat IDs are user identifiers. If logs are shipped to a centralized logging service or shared, this is a minor PII/identity leak. Not critical for a personal VPS bot, but worth noting.

**Recommendation:** Remove or reduce to just printing the count: `console.log(`Allowed: ${ALLOWED_IDS.length} chat(s)`)`

---

## High Priority

### 3. `bot.start()` is async but not awaited — errors silently swallowed

**File:** `src/index.js:75`

```js
bot.start();
console.log("Bot dang chay...");
```

`bot.start()` returns a Promise. If the bot token is invalid or network fails at startup, the rejection goes unhandled. The `console.log` on line 76 prints immediately regardless of success.

**Fix:**
```js
bot.start().catch((err) => {
  console.error("Bot khong the khoi dong:", err.message);
  process.exit(1);
});
```

### 4. Auth middleware silently drops — no return/promise handling

**File:** `src/index.js:26-29`

```js
bot.use((ctx, next) => {
  if (ALLOWED_IDS.includes(ctx.chat?.id)) return next();
  // Im lang voi nguoi la
});
```

When `ctx.chat` is `undefined` (e.g., channel posts, inline queries, callback queries without chat context), `ctx.chat?.id` is `undefined`, which correctly fails the check. This is fine behavior-wise.

However, the middleware returns `undefined` instead of a resolved Promise for unauthorized users. grammY handles this gracefully today, but explicitly returning is safer:

```js
bot.use((ctx, next) => {
  if (ALLOWED_IDS.includes(ctx.chat?.id)) return next();
  return; // explicit
});
```

This is minor but worth documenting the intent.

### 5. No error handler on the bot instance

**File:** `src/index.js`

grammY emits errors through `bot.catch()`. Without it, errors in handlers (e.g., network timeout mid-photo-send) crash the process with an unhandled rejection.

**Fix:** Add a global error handler:
```js
bot.catch((err) => {
  console.error("Bot error:", err.message);
});
```

---

## Medium Priority

### 6. `ctx.reply()` in command handlers can throw — outer try/catch missing

**File:** `src/index.js:43`

```js
await ctx.reply("Dang chup man hinh...");
// try block only covers screenshot + replyWithPhoto
```

If `ctx.reply("Dang chup...")` fails (network issue), exception propagates unhandled to grammY. This is acceptable IF issue #5 (bot.catch) is addressed. Otherwise it crashes.

### 7. Chat ID filter uses `Array.includes` — O(n) per message

**File:** `src/index.js:27`

For a personal bot with 1-3 IDs, this is fine. If the whitelist ever grows, convert to a `Set` for O(1) lookups. Not actionable now (YAGNI), just noting.

### 8. `disconnect.bat` has no error handling

**File:** `disconnect.bat`

If `query user` returns unexpected output (e.g., user not logged in via RDP), the `for` loop silently does nothing. The user gets no feedback.

**Recommendation:** Add a fallback message:
```batch
@echo off
for /f "skip=1 tokens=3" %%s in ('query user %USERNAME%') do (
  %windir%\System32\tscon.exe %%s /dest:console
  goto :done
)
echo Khong tim thay session RDP.
:done
```

---

## Low Priority

### 9. No `engines` field in package.json

README says Node.js 18+ required, but `package.json` doesn't enforce it. Adding `"engines": {"node": ">=18"}` prevents confusion.

### 10. `.gitignore` is minimal

Missing common entries: `*.log`, `.DS_Store`, `screenshots/` (if any temp files). Acceptable for current scope.

### 11. `startup.bat` doesn't keep window open on crash

If `node src\index.js` crashes, the command window closes immediately. Adding `pause` at the end would help debugging.

---

## Positive Observations

- Config validation at startup with clear error messages — prevents running with bad config
- Auth middleware placement before commands — correct grammY pattern
- Silent rejection of unauthorized users — no information leakage to strangers
- JPG format for screenshots — good bandwidth choice for Telegram
- Graceful shutdown handlers for SIGINT/SIGTERM
- `disconnect.bat` with tscon trick — solves a real RDP screenshot problem
- README is thorough with troubleshooting table
- Clean dependency set — only 3 deps, all well-maintained

---

## Recommended Actions (Priority Order)

1. **[Critical]** Replace `err.message` in user-facing replies with generic error text
2. **[High]** Add `bot.catch()` error handler to prevent unhandled rejections
3. **[High]** Add `.catch()` to `bot.start()` for startup failure handling
4. **[Medium]** Add error feedback to `disconnect.bat`
5. **[Low]** Add `engines` field to package.json
6. **[Low]** Add `pause` to `startup.bat`

---

## Security Checklist

| Check | Status |
|-------|--------|
| Bot token in .env, not hardcoded | PASS |
| .env in .gitignore | PASS |
| Chat ID whitelist enforced | PASS |
| No secrets in .env.example | PASS |
| Input validation on config | PASS |
| Error messages leak internals | FAIL (issue #1) |
| Unhandled promise rejections | FAIL (issue #3, #5) |

---

## Metrics
- Test Coverage: 0% (no tests — acceptable for this scope)
- Linting Issues: 0 (clean code)
- Dependencies: 3 (all current)
