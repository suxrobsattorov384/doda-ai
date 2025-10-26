# 🤖 Telegram Bot Sozlash Yo'riqnomasi

## 1. Telegram Bot Yaratish

### BotFather orqali bot yaratish:
1. Telegramda `@BotFather` ni toping
2. `/newbot` buyrug'ini yuboring
3. Bot uchun nom kiriting (masalan: `DODa AI Notifications`)
4. Bot uchun username kiriting (masalan: `dodaai_notifications_bot`)
5. BotFather sizga **BOT TOKEN** beradi (masalan: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## 2. Chat ID olish

### Shaxsiy chat uchun:
1. Yaratilgan botga `/start` yuboring
2. Brauzerda quyidagi URL ni oching:
   ```
   https://api.telegram.org/bot[BOT_TOKEN]/getUpdates
   ```
   `[BOT_TOKEN]` o'rniga o'zingizning bot tokeningizni qo'ying
3. Javobda `"chat":{"id":123456789}` ko'rinishida **CHAT ID** ni toping

### Guruh uchun:
1. Botni guruhga qo'shing
2. Guruhda `/start` yuboring
3. Yuqoridagi URL orqali Chat ID ni oling (guruh ID manfiy son bo'ladi)

## 3. .env Faylini Sozlash

`.env` faylingizda quyidagi qatorlarni o'zgartiring:

```env
# Telegram Bot Settings
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

**Eslatma:** 
- `TELEGRAM_BOT_TOKEN` - BotFather bergan token
- `TELEGRAM_CHAT_ID` - Sizning chat ID yoki guruh ID

## 4. Server Qayta Ishga Tushirish

Terminal/CMD da:
```bash
npm start
```

## 5. Test Qilish

1. Saytga kiring
2. "Kirish" tugmasini bosing
3. Yangi hisob yarating yoki mavjud hisob bilan kiring
4. Telegram botingizga xabar kelishi kerak!

## 📱 Xabar Formatlari

### Ro'yxatdan o'tish:
```
🆕 Yangi ro'yxatdan o'tish
Email: user@example.com
Ism: Foydalanuvchi Ismi
Vaqt: 13.10.2025, 15:30:45
```

### Kirish:
```
👤 Yangi foydalanuvchi
Email: user@example.com
Ism: Foydalanuvchi Ismi
Vaqt: 13.10.2025, 15:30:45
```

## 🔧 Muammolarni Hal Qilish

### Xabar kelmasa:
1. Bot token to'g'ri ekanligini tekshiring
2. Chat ID to'g'ri ekanligini tekshiring
3. Bot bilan chat boshlagan ekanligingizni tekshiring
4. Server console da xato xabarlarini ko'ring

### Console da xatolar:
- `⚠️ Telegram konfiguratsiyasi toʻliq emas` - .env faylda token yoki chat ID yo'q
- `❌ Telegram xatosi: 401 Unauthorized` - Bot token noto'g'ri
- `❌ Telegram xatosi: 400 Bad Request` - Chat ID noto'g'ri

## ✅ Muvaffaqiyatli Sozlash

Agar hammasi to'g'ri sozlangan bo'lsa, server ishga tushganda console da ko'rasiz:
```
🚀 Server http://localhost:3000 da ishga tushdi
📧 Test uchun: http://localhost:3000/api/test
```

Va har safar kimdir ro'yxatdan o'tganda yoki kirganda Telegram botingizga xabar keladi! 🎉
