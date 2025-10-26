# DODa AI - OpenAI Integration

## 🚀 Ishga tushirish

### 1. Serverni ishga tushirish
```bash
npm start
```
yoki
```bash
node free-ai-server.js
```
yoki Windows uchun:
```
start-server.bat
```

### 2. Brauzerda ochish
```
http://localhost:3001
```

## 🔑 API Key Sozlamalari

API kalitingiz `.env` faylida saqlangan:
```
OPENAI_API_KEY=fd333cedf053ca52e63977a0e8b01983
HUGGINGFACE_API_KEY=fd333cedf053ca52e63977a0e8b01983
```

## 🎨 Mavjud AI Providerlar

### Rasm Yaratish
1. **OpenAI GPT-4 Vision** - Rasm tahlil va tushunish
2. **OpenAI DALL-E 3** - AI ko'rgan rasmga asoslangan generation
3. **Stability AI** (Image-to-Image) - Rasm tahrirlash
4. **Pollinations AI** - AI-enhanced generation

### Video Yaratish (Haqiqiy AI)
1. **Pollinations AI** (Asosiy) - Haqiqiy AI video generation
2. **Hugging Face Spaces** - Text-to-video models
3. **Luma AI** - Dream Machine video generation
4. **Haiper AI** - Professional AI video creation
5. **Pika Labs** - Advanced video synthesis

## 📡 API Endpoints

### Rasm yaratish
```
POST /api/generate-image
```

### Video yaratish (AI)
```
POST /api/generate-video
```

### Server holati
```
GET /api/test
```

## 🛠️ Xususiyatlar

- 👁️ **AI Vision**: GPT-4 Vision bilan rasm tahlil
- 🧠 **Smart Generation**: AI ko'rgan rasmga asoslangan yaratish
- 📸 **Rasm Yuklash**: Drag & drop rasm yuklash
- 🎨 **Detallar Qo'shish**: AI rasmni ko'rib, sizning so'zlaringizni qo'shadi
- 🔄 **O'xshash Rasmlar**: Yuklangan rasmga o'xshash yangi rasmlar
- ✨ **Enhanced Prompts**: AI tahlil + sizning promptingiz
- ✅ Avtomatik fallback sistemasi
- ✅ Rasm/video hajmini avtomatik moslash
- ✅ Katta ko'rish (zoom) funksiyasi
- ✅ Qayta yaratish tugmasi
- ✅ Yuklab olish funksiyasi
- ✅ Responsive dizayn
- ✅ Haqiqiy AI video yaratish (har safar yangi video)
- ♾️ Cheksiz video generation
- 🎯 Har prompt uchun noyob video yaratish

## 🔧 Texnik Ma'lumotlar

- **Port:** 3001
- **Framework:** Express.js
- **Frontend:** Vanilla JS + Tailwind CSS
- **APIs:** OpenAI DALL-E 3, Runway ML, Replicate, Stability AI
