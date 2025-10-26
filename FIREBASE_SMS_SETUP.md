# 🔥 Firebase SMS Authentication O'rnatish

## 📋 Qadamlar

### 1️⃣ Firebase Console da loyiha yaratish

1. **Firebase Console** ga kiring: https://console.firebase.google.com
2. **"Create a project"** tugmasini bosing
3. Loyiha nomini kiriting: `doda-ai-sms`
4. Google Analytics ni yoqing (ixtiyoriy)
5. **"Create project"** tugmasini bosing

### 2️⃣ Authentication sozlash

1. Chap menyudan **"Authentication"** ni tanlang
2. **"Get started"** tugmasini bosing
3. **"Sign-in method"** tabiga o'ting
4. **"Phone"** ni tanlang va **"Enable"** qiling
5. **"Save"** tugmasini bosing

### 3️⃣ Web App qo'shish

1. **Project Overview** ga qayting
2. **"</>"** (Web) tugmasini bosing
3. App nickname: `doda-ai-web`
4. **"Register app"** tugmasini bosing
5. **Firebase config** kodini nusxalang

### 4️⃣ Konfiguratsiya

Firebase config kodini `index.html` faylidagi quyidagi qismga joylashtiring:

```javascript
const firebaseConfig = {
  apiKey: "sizning-api-key",
  authDomain: "loyiha-id.firebaseapp.com",
  projectId: "loyiha-id",
  storageBucket: "loyiha-id.appspot.com",
  messagingSenderId: "sender-id",
  appId: "app-id"
};
```

### 5️⃣ Authorized Domains sozlash

1. **Authentication > Settings > Authorized domains**
2. Quyidagi domenlarni qo'shing:
   - `localhost` (development uchun)
   - Sizning sayt domeni (production uchun)

### 6️⃣ Test telefon raqamlari (ixtiyoriy)

Development uchun test raqamlarini qo'shishingiz mumkin:

1. **Authentication > Sign-in method > Phone**
2. **"Phone numbers for testing"** bo'limini oching
3. Test raqam va kod qo'shing, masalan:
   - Raqam: `+998901234567`
   - Kod: `123456`

## 🚀 Qanday ishlaydi

1. **Telefon raqam kiritish**: Foydalanuvchi telefon raqamini kiritadi
2. **reCAPTCHA**: Google reCAPTCHA tekshiruvi
3. **SMS yuborish**: Firebase avtomatik SMS yuboradi
4. **Kod tasdiqlash**: Foydalanuvchi SMS kodini kiritadi
5. **Kirish**: Muvaffaqiyatli tasdiqlashdan keyin tizimga kiradi

## 🔧 Xususiyatlar

- ✅ **50+ mamlakat** qo'llab-quvvatlanadi
- ✅ **Avtomatik mamlakat aniqlash** (+998 → 🇺🇿 O'zbekiston)
- ✅ **reCAPTCHA himoyasi** spam dan himoya
- ✅ **60 soniya timer** qayta yuborish uchun
- ✅ **Xato boshqaruvi** barcha xatoliklar uchun
- ✅ **Responsive dizayn** barcha qurilmalarda ishlaydi

## 💰 Narxlar (Firebase)

- **Bepul**: 10,000 SMS/oy
- **To'lov**: $0.01 har bir SMS uchun (10,000 dan keyin)

## 🔒 Xavfsizlik

- Firebase Authentication xavfsiz
- reCAPTCHA spam dan himoya qiladi
- Telefon raqamlari Firebase da saqlanadi
- SSL/HTTPS majburiy

## 🐛 Muammolarni hal qilish

### SMS kelmayapti?
- Telefon raqami to'g'ri formatda ekanligini tekshiring
- Authorized domains ro'yxatini tekshiring
- Console da xatoliklarni ko'ring

### reCAPTCHA ishlamayapti?
- Internet aloqasini tekshiring
- Sahifani yangilang
- Browser cache ni tozalang

### Firebase yuklanmayapti?
- Internet aloqasini tekshiring
- Firebase config to'g'riligini tekshiring
- Browser console da xatoliklarni ko'ring

## 📞 Qo'llab-quvvat

Muammolar bo'lsa:
1. Browser console ni tekshiring
2. Firebase Console da logs ni ko'ring
3. Telefon raqami formatini tekshiring (+998901234567)

---

**Eslatma**: Bu tizim production da ishlatish uchun tayyor. Firebase Rules ni to'g'ri sozlashni unutmang!
