# 🚀 Hostinger ga Deployment Qo'llanmasi

## 1. Hostinger Hosting Sotib Olish

1. **Hostinger.com** ga kiring
2. **Premium** yoki **Business** hosting rejasini tanlang (Node.js uchun)
3. Domen nomini tanlang (masalan: `dodaai.com`)
4. To'lovni amalga oshiring

## 2. Hostinger Control Panel Sozlamalari

### 2.1 Node.js Yoqish
1. Hostinger hPanel ga kiring
2. **Advanced** bo'limiga o'ting
3. **Node.js** ni tanlang
4. **Create Application** tugmasini bosing
5. Node.js versiyasini tanlang (18.x yoki 20.x)
6. Application nomini kiriting: `doda-ai`

### 2.2 Environment Variables Sozlash
1. Node.js application sahifasida **Environment Variables** ga o'ting
2. Quyidagi o'zgaruvchilarni qo'shing:

```
NODE_ENV=production
PORT=3000
STABILITY_API_KEY=sk-D2EqaNQu4Ol6udaG43IB2kUcYj3gSZnrGbTWrPITVnShTHzU
RUNWAY_API_KEY=key_d0987bcc92409c8e9f82f18dd77e0ce2abd74fdd9315b0952fbaacf3cc3721ef88498a2fa02a6134ddf2fecab029c277929c7c1ff3e13634d58cee3ad93991e1
OPENAI_API_KEY=fd333cedf053ca52e63977a0e8b01983
HUGGINGFACE_API_KEY=fd333cedf053ca52e63977a0e8b01983
TELEGRAM_BOT_TOKEN=8306888404:AAHT5-4sJ-UEXaqpx04xSISUqoYl9qmq8ME
TELEGRAM_CHAT_ID=8069248183
```

## 3. Fayllarni Yuklash

### 3.1 File Manager orqali
1. hPanel da **File Manager** ni oching
2. `public_html` papkasiga o'ting
3. Barcha loyiha fayllarini yuklang:
   - `index.html`
   - `server.js`
   - `package.json`
   - `style.css`
   - `script.js`
   - Barcha rasm va video fayllar
   - `.htaccess` fayli

### 3.2 Git orqali (Tavsiya etiladi)
```bash
# Hostinger terminal da
git clone https://github.com/yourusername/doda-ai.git
cd doda-ai
npm install
```

## 4. Dependencies O'rnatish

Hostinger terminal da:
```bash
cd public_html
npm install
```

## 5. Application Ishga Tushirish

1. Node.js application sahifasida **Restart** tugmasini bosing
2. Yoki terminal da:
```bash
pm2 start ecosystem.config.js --env production
```

## 6. Domain Sozlamalari

### 6.1 DNS Sozlamalari
1. **DNS Zone** ga o'ting
2. A record qo'shing:
   - Type: A
   - Name: @ (yoki www)
   - Points to: Hostinger server IP

### 6.2 SSL Sertifikat
1. **SSL/TLS** bo'limiga o'ting
2. **Let's Encrypt** sertifikatini yoqing
3. Auto-renewal ni faollashtiring

## 7. Tekshirish va Test

### 7.1 Sayt Ishlashini Tekshirish
- `https://yourdomain.com` ga kiring
- Barcha funksiyalar ishlashini tekshiring:
  - Rasm generatsiya
  - Video generatsiya
  - Telegram integratsiya

### 7.2 Performance Test
- Google PageSpeed Insights
- GTmetrix
- Pingdom

## 8. Monitoring va Logs

### 8.1 Error Logs
```bash
# Hostinger terminal da
pm2 logs doda-ai
```

### 8.2 Performance Monitoring
```bash
pm2 monit
```

## 9. Backup va Security

### 9.1 Automatic Backup
- Hostinger da automatic backup ni yoqing
- Haftalik full backup sozlang

### 9.2 Security
- Strong parollar ishlating
- 2FA ni yoqing
- Regular updates qiling

## 10. Troubleshooting

### Umumiy Muammolar:
1. **Port xatosi**: Environment variables tekshiring
2. **API xatolari**: API kalitlar to'g'riligini tekshiring
3. **File permissions**: 755 ruxsatlar o'rnating
4. **Memory issues**: PM2 restart qiling

### Yordam Olish:
- Hostinger Support: 24/7 chat
- Documentation: help.hostinger.com
- Community: Hostinger forums

## 🎉 Muvaffaqiyat!

Saytingiz endi jonli va ishlamoqda:
- **URL**: https://yourdomain.com
- **Admin**: Hostinger hPanel
- **Monitoring**: PM2 dashboard

---
**Eslatma**: Barcha API kalitlar va parollarni xavfsiz saqlang!
