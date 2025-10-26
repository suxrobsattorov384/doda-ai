import express from 'express';
import fetch from 'node-fetch';
import multer from 'multer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import FormData from 'form-data';
import compression from 'compression';
import helmet from 'helmet';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Faqat rasm fayllarini qabul qilish
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Faqat rasm fayllari qabul qilinadi'), false);
    }
  }
});
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https:", "wss:"]
    }
  }
}));

// Compression middleware
app.use(compression());

// CORS sozlamalari
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Static fayllarni serve qilish
app.use(express.static(__dirname, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const STABILITY_KEY = process.env.STABILITY_API_KEY;
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Foydalanuvchi generatsiya cheklovi
const userGenerations = new Map();

// Generatsiya chegarasini tekshirish
function checkGenerationLimit(req, res, next) {
  const userEmail = req.body.email;
  
  if (!userEmail) {
    return res.status(400).json({ 
      success: false, 
      error: 'Foydalanuvchi identifikatori talab qilinadi' 
    });
  }

  // Limit tekshiruvini o'tkazib yuboramiz - cheksiz generation
  req.userGenerations = { count: 0, lastReset: Date.now() };
  next();
}

// Generatsiya hisobini oshirish (DISABLED - cheksiz)
function incrementGenerationCount(email) {
  // Hisoblashni o'chiramiz - cheksiz generation
  return 0;
}

// Telegramga xabar yuborish
async function sendTelegramMessage(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('⚠️ Telegram konfiguratsiyasi toʻliq emas');
    console.log(`BOT_TOKEN: ${TELEGRAM_BOT_TOKEN ? 'Mavjud' : 'Yo\'q'}`);
    console.log(`CHAT_ID: ${TELEGRAM_CHAT_ID ? 'Mavjud' : 'Yo\'q'}`);
    return { success: false };
  }

  try {
    console.log('📤 Telegram xabar yuborilmoqda...');
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.ok) {
      console.log('✅ Telegram xabar yuborildi!');
      return { success: true };
    } else {
      console.error('❌ Telegram API xatosi:', data);
      return { success: false, error: data.description };
    }
  } catch (error) {
    console.error('❌ Telegram xatosi:', error);
    return { success: false, error: error.message };
  }
}

// AI Vision va Image-to-Image funksiyalari olib tashlandi
// Faqat oddiy text-to-image generation qoldi

// API Endpointlar

// Rasm generatsiya qilish
app.post('/api/generate-image', upload.single('file'), checkGenerationLimit, async (req, res) => {
  try {
    const userEmail = req.body.email;
    const prompt = req.body.prompt || 'Beautiful landscape';
    
    const currentCount = incrementGenerationCount(userEmail);

    console.log(`🖼️ Rasm generatsiya: ${userEmail} - "${prompt}"`);

    // Stability AI - haqiqiy AI
    console.log('🎨 Stability AI ishlatilmoqda...');
    
    try {
      // Stability AI API
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STABILITY_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1
            }
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 20,
          samples: 1
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Stability AI xatosi:', errorData);
        throw new Error(errorData.message || 'Stability AI xatosi');
      }

      const data = await response.json();
      
      if (data.artifacts && data.artifacts[0] && data.artifacts[0].base64) {
        const imageUrl = `data:image/png;base64,${data.artifacts[0].base64}`;
        
        console.log('✅ Stability AI rasm tayyor!');
        res.json({ 
          success: true, 
          image: imageUrl,
          provider: 'stability-ai',
          message: 'Haqiqiy AI - Stability AI'
        });
      } else {
        throw new Error('Stability AI dan noto\'g\'ri javob');
      }
      
    } catch (error) {
      console.error('❌ Stability AI xatosi:', error.message);
      
      // Fallback - Pollinations AI
      console.log('🔄 Pollinations AI ga o\'tish...');
      try {
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}`;
        
        console.log('✅ Pollinations rasm tayyor!');
        res.json({ 
          success: true, 
          image: imageUrl,
          provider: 'pollinations',
          message: 'Fallback - Pollinations AI'
        });
      } catch (fallbackError) {
        // Final fallback
        console.log('⚠️ Demo rasm ishlatilmoqda');
        const demoUrl = `https://picsum.photos/1024/1024?random=${Date.now()}`;
        
        res.json({ 
          success: true, 
          image: demoUrl,
          provider: 'demo',
          message: 'Demo rasm'
        });
      }
    }

  } catch (error) {
    console.error('❌ Server xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Video generatsiya qilish
app.post('/api/generate-video', upload.single('file'), checkGenerationLimit, async (req, res) => {
  try {
    const userEmail = req.body.email;
    const prompt = req.body.prompt || 'Beautiful video scene';
    const duration = parseInt(req.body.duration) || 10;
    
    const currentCount = incrementGenerationCount(userEmail);

    console.log(`🎥 Video generatsiya: ${userEmail} - "${prompt}" - ${currentCount}/10`);
    
    // Replicate AI - haqiqiy video AI
    if (REPLICATE_TOKEN && REPLICATE_TOKEN !== 'your_replicate_token') {
      console.log('🎬 Replicate AI ishlatilmoqda...');
      
      try {
        // Replicate API - Stable Video Diffusion
        const response = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${REPLICATE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            version: "25623db92c26025cb95b904c1d043b6d4c1b9b1c",
            input: {
              prompt: prompt,
              num_frames: Math.min(duration * 8, 120), // 8 fps max 120 frames
              width: 1024,
              height: 576,
              num_inference_steps: 25
            }
          })
        });

        if (!response.ok) {
          throw new Error('Replicate API xatosi');
        }

        const prediction = await response.json();
        console.log('🔄 Video yaratilmoqda... ID:', prediction.id);

        // Poll for completion (simplified for demo)
        let attempts = 0;
        while (attempts < 30) { // 30 seconds max wait
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          
          const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: {
              'Authorization': `Token ${REPLICATE_TOKEN}`
            }
          });
          
          const status = await statusResponse.json();
          
          if (status.status === 'succeeded' && status.output) {
            console.log('✅ Replicate video tayyor!');
            return res.json({ 
              success: true, 
              video: status.output,
              provider: 'replicate-ai',
              message: 'Haqiqiy AI Video - Replicate'
            });
          } else if (status.status === 'failed') {
            throw new Error('Video yaratish muvaffaqiyatsiz');
          }
          
          attempts++;
        }
        
        throw new Error('Video yaratish vaqti tugadi');
        
      } catch (replicateError) {
        console.error('❌ Replicate xatosi:', replicateError.message);
        // Fall through to demo video
      }
    }
    
    // Fallback - Demo video
    console.log('🎬 Demo video ishlatilmoqda...');
    const demoVideos = ['video-14.mp4', 'video-7.mp4', 'aivideo.mp4'];
    const randomVideo = demoVideos[Math.floor(Math.random() * demoVideos.length)];
    
    res.json({ 
      success: true, 
      video: randomVideo,
      provider: 'demo',
      message: 'Demo video - Replicate API kerak'
    });

  } catch (error) {
    console.error('❌ Video xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Foydalanuvchi Chat ID larini saqlash
const userChatIds = new Map();

// Bot updates ni tekshirish va yangi foydalanuvchilarni qo'shish
async function checkBotUpdates() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
    const data = await response.json();
    
    if (data.ok && data.result.length > 0) {
      data.result.forEach(update => {
        if (update.message && update.message.text === '/start') {
          const chatId = update.message.chat.id;
          const firstName = update.message.chat.first_name || 'Foydalanuvchi';
          const username = update.message.chat.username || 'noma\'lum';
          
          // Yangi Chat ID ni ro'yxatga qo'shish
          if (!userChatIds.has(chatId.toString())) {
            userChatIds.set(chatId.toString(), {
              firstName,
              username,
              addedAt: new Date()
            });
            console.log(`🆕 Yangi foydalanuvchi qo'shildi: ${firstName} (@${username}) - ${chatId}`);
          }
        }
      });
    }
  } catch (error) {
    console.error('❌ Bot updates xatosi:', error);
  }
}

// Har 10 soniyada bot updates ni tekshirish
setInterval(checkBotUpdates, 10000);

// Foydalanuvchi Chat ID ni saqlash
app.post('/api/save-chat-id', express.json(), async (req, res) => {
  try {
    const { email, chatId } = req.body;
    if (email && chatId) {
      userChatIds.set(email, chatId);
      console.log(`💾 Chat ID saqlandi: ${email} -> ${chatId}`);
    }
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Shaxsiy Telegram xabar yuborish
async function sendPersonalTelegramMessage(message, chatId) {
  if (!TELEGRAM_BOT_TOKEN || !chatId) {
    console.log('⚠️ Telegram konfiguratsiyasi yoki Chat ID yo\'q');
    return { success: false };
  }

  try {
    console.log(`📤 Shaxsiy xabar yuborilmoqda: ${chatId}`);
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.ok) {
      console.log(`✅ Shaxsiy xabar yuborildi: ${chatId}`);
      return { success: true };
    } else {
      console.error(`❌ Shaxsiy xabar xatosi (${chatId}):`, data);
      return { success: false, error: data.description };
    }
  } catch (error) {
    console.error(`❌ Shaxsiy xabar xatosi (${chatId}):`, error);
    return { success: false, error: error.message };
  }
}

// Barcha botga ulangan foydalanuvchilarga xabar yuborish
async function sendToAllBotUsers(message) {
  const results = [];
  
  for (const [chatId, userInfo] of userChatIds) {
    if (typeof userInfo === 'object' && userInfo.firstName) {
      // Bu bot foydalanuvchisi
      const personalMessage = message.replace('Foydalanuvchi', userInfo.firstName);
      const result = await sendPersonalTelegramMessage(personalMessage, chatId);
      results.push({ chatId, success: result.success });
    }
  }
  
  console.log(`📤 ${results.length} foydalanuvchiga xabar yuborildi`);
  return results;
}

// Telegram xabarlari - barcha bot foydalanuvchilariga
app.post('/api/notify-login', express.json(), async (req, res) => {
  try {
    const { email, name } = req.body;
    
    const message = `🎉 <b>Yangi foydalanuvchi kirdi!</b>\n\n👤 Ism: ${name || 'Foydalanuvchi'}\n📧 Email: ${email}\n⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}\n\n🌟 DODa AI ga yangi a'zo qo'shildi!`;
    
    // Barcha bot foydalanuvchilariga xabar yuborish
    const results = await sendToAllBotUsers(message);
    
    res.json({ 
      success: true, 
      sentTo: results.length,
      details: results 
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/notify-register', express.json(), async (req, res) => {
  try {
    const { email, name } = req.body;
    
    const message = `🎊 <b>Yangi ro'yxatdan o'tish!</b>\n\n🆕 Yangi a'zo qo'shildi\n👤 Ism: ${name || 'Foydalanuvchi'}\n📧 Email: ${email}\n⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}\n\n🚀 DODa AI oilasiga xush kelibsiz!`;
    
    // Barcha bot foydalanuvchilariga xabar yuborish
    const results = await sendToAllBotUsers(message);
    
    res.json({ 
      success: true, 
      sentTo: results.length,
      details: results 
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Foydalanuvchi statistikasi
app.get('/api/user-stats', (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ error: 'Email talab qilinadi' });
  }

  // Har doim cheksiz ko'rsatamiz
  res.json({
    generationsUsed: 0,
    generationsLeft: 999999,
    isPremium: true,
    timeUntilReset: 0
  });
});

// Test endpoint - server ishlayotganini tekshirish
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server ishlayapti!',
    timestamp: new Date().toISOString()
  });
});

// Barcha sahifalar
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.get('/index-new.html', (req, res) => {
  res.sendFile(join(__dirname, 'index-new.html'));
});

app.get('/index-2.html', (req, res) => {
  res.sendFile(join(__dirname, 'index 2.html'));
});

// Favicon
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server http://localhost:${port} da ishga tushdi`);
  console.log(`📧 Test uchun: http://localhost:${port}/api/test`);
  console.log(`🎨 Oddiy text-to-image generation`);
  console.log(`♾️  LIMITLAR O'CHIRILDI: Cheksiz generation!`);
  
  if (process.env.OPENAI_API_KEY) {
    console.log('🎨 OpenAI DALL-E API: ✅ FAOL');
  }
  
  if (STABILITY_KEY && STABILITY_KEY !== 'your_stability_ai_key_here') {
    console.log('🎨 Stability AI: ✅ FAOL (Image-to-Image)');
  } else {
    console.log('🎨 Bepul AI rejimi - Pollinations AI');
  }
  
  if (REPLICATE_TOKEN && REPLICATE_TOKEN !== 'your_replicate_token') {
    console.log('🎬 Replicate AI: ✅ FAOL');
  } else {
    console.log('🎬 Demo video rejimi');
  }
  
  console.log('📋 Xususiyatlar:');
  console.log('   • Text-to-Image generation');
  console.log('   • Cheksiz generation (limit yo\'q)');
  console.log('   • Stability AI + Pollinations AI');
  console.log('   • Demo video generation');
});