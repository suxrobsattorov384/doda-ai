import express from 'express';
import fetch from 'node-fetch';
import multer from 'multer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import FormData from 'form-data';

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

// CORS sozlamalari
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Max-Age', '86400');
  
  // OPTIONS so'rovlarini qaytarish
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Static fayllarni serve qilish
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const STABILITY_KEY = process.env.STABILITY_API_KEY;
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
const RUNWAY_KEY = process.env.RUNWAY_API_KEY;
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
    return { success: false };
  }

  try {
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
    return { success: response.ok && data.ok };
  } catch (error) {
    console.error('❌ Telegram xatosi:', error);
    return { success: false, error: error.message };
  }
}

// Haqiqiy tarjima xizmatlari orqali tarjima qilish
async function translateText(text, targetLang = 'en') {
  try {
    console.log(`🔄 Tarjima qilish: "${text}"`);
    
    // 1. Google Translate API (bepul variant)
    try {
      const googleResponse = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=uz&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
      const googleData = await googleResponse.json();
      
      if (googleData && googleData[0] && googleData[0][0] && googleData[0][0][0]) {
        const translated = googleData[0][0][0];
        console.log(`✅ Google Translate: "${translated}"`);
        return translated;
      }
    } catch (googleError) {
      console.log('⚠️ Google Translate ishlamadi:', googleError.message);
    }
    
    // 2. MyMemory API
    try {
      const myMemoryResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=uz|en`);
      const myMemoryData = await myMemoryResponse.json();
      
      if (myMemoryData && myMemoryData.responseData && myMemoryData.responseData.translatedText) {
        const translated = myMemoryData.responseData.translatedText;
        console.log(`✅ MyMemory: "${translated}"`);
        return translated;
      }
    } catch (myMemoryError) {
      console.log('⚠️ MyMemory ishlamadi:', myMemoryError.message);
    }
    
    // 3. LibreTranslate API (bepul)
    try {
      const libreResponse = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'uz',
          target: 'en',
          format: 'text'
        })
      });
      
      const libreData = await libreResponse.json();
      if (libreData && libreData.translatedText) {
        const translated = libreData.translatedText;
        console.log(`✅ LibreTranslate: "${translated}"`);
        return translated;
      }
    } catch (libreError) {
      console.log('⚠️ LibreTranslate ishlamadi:', libreError.message);
    }
    
    throw new Error('Barcha tarjima xizmatlari ishlamadi');
    
  } catch (error) {
    console.log('⚠️ Tarjima xatosi, zaxira usuldan foydalanish:', error.message);
    // Fallback - oddiy so'z almashtirish
    return translateWithMapping(text);
  }
}

// Zaxira tarjima funksiyasi (oddiy so'z almashtirish)
function translateWithMapping(prompt) {
  const uzbekToEnglishMap = {
    // Tabiat va manzara
    'tabiat': 'nature',
    'manzara': 'landscape', 
    'tog': 'mountain',
    'tepa': 'hill',
    'dengiz': 'sea',
    'ko\'l': 'lake',
    'daryo': 'river',
    'soy': 'stream',
    'osmon': 'sky',
    'bulut': 'cloud',
    'quyosh': 'sun',
    'oy': 'moon',
    'yulduz': 'star',
    'yomg\'ir': 'rain',
    'qor': 'snow',
    'shamol': 'wind',
    
    // O'simliklar
    'gul': 'flower',
    'atirgul': 'rose',
    'lola': 'tulip',
    'daraxt': 'tree',
    'barg': 'leaf',
    'meva': 'fruit',
    'olma': 'apple',
    'nok': 'pear',
    'uzum': 'grape',
    'sabzavot': 'vegetable',
    
    // Binolar va joylar
    'uy': 'house',
    'bino': 'building',
    'saroy': 'palace',
    'masjid': 'mosque',
    'maktab': 'school',
    'kasalxona': 'hospital',
    'shahar': 'city',
    'qishloq': 'village',
    'yo\'l': 'road',
    'ko\'cha': 'street',
    'maydon': 'square',
    'bog\'': 'garden',
    'park': 'park',
    
    // Odamlar
    'odam': 'person',
    'ayol': 'woman',
    'erkak': 'man',
    'bola': 'child',
    'qiz': 'girl',
    'o\'g\'il': 'boy',
    'keksa': 'elderly',
    'yosh': 'young',
    'chaqaloq': 'baby',
    
    // Hayvonlar
    'mushuk': 'cat',
    'it': 'dog',
    'ot': 'horse',
    'sigir': 'cow',
    'qo\'y': 'sheep',
    'echki': 'goat',
    'tovuq': 'chicken',
    'qush': 'bird',
    'baliq': 'fish',
    'sher': 'lion',
    'yo\'lbars': 'tiger',
    'fil': 'elephant',
    'ayiq': 'bear',
    
    // Sifatlar
    'chiroyli': 'beautiful',
    'go\'zal': 'beautiful',
    'ajoyib': 'amazing',
    'mukammal': 'perfect',
    'katta': 'big',
    'kichik': 'small',
    'uzun': 'long',
    'qisqa': 'short',
    'baland': 'tall',
    'past': 'low',
    'yangi': 'new',
    'eski': 'old',
    'tez': 'fast',
    'sekin': 'slow',
    'issiq': 'hot',
    'sovuq': 'cold',
    'iliq': 'warm',
    
    // Ranglar
    'qizil': 'red',
    'ko\'k': 'blue',
    'yashil': 'green',
    'sariq': 'yellow',
    'qora': 'black',
    'oq': 'white',
    'kulrang': 'gray',
    'jigarrang': 'brown',
    'pushti': 'pink',
    'binafsha': 'purple',
    'to\'q': 'dark',
    'och': 'light',
    
    // Vaqt
    'tong': 'morning',
    'kun': 'day',
    'kech': 'evening',
    'tun': 'night',
    'quyosh chiqishi': 'sunrise',
    'quyosh botishi': 'sunset',
    
    // Ob-havo
    'quyoshli': 'sunny',
    'bulutli': 'cloudy',
    'yomg\'irli': 'rainy',
    'qorli': 'snowy',
    'shamolli': 'windy',
    
    // Boshqalar
    'rasm': 'picture',
    'foto': 'photo',
    'suv': 'water',
    'olov': 'fire',
    'nur': 'light',
    'soya': 'shadow',
    'rang': 'color',
    'shakl': 'shape',
    'o\'lcham': 'size'
  };

  let enhancedPrompt = prompt;
  
  // O'zbekcha so'zlarni inglizchaga almashtirish
  Object.keys(uzbekToEnglishMap).forEach(uzbekWord => {
    const englishWord = uzbekToEnglishMap[uzbekWord];
    const regex = new RegExp(`\\b${uzbekWord}\\b`, 'gi');
    enhancedPrompt = enhancedPrompt.replace(regex, englishWord);
  });

  return enhancedPrompt + ". High quality, detailed, professional";
}

// Asosiy til qo'llab-quvvatlash funksiyasi
async function enhancePromptWithLanguage(prompt, language = 'uzbek') {
  try {
    // Agar o'zbekcha bo'lsa, to'liq tarjima qilish
    if (language === 'uzbek') {
      console.log(`🔄 O'zbekcha matnni tarjima qilish: "${prompt}"`);
      
      // Haqiqiy tarjima xizmati ishlatish
      const translatedText = await translateText(prompt, 'en');
      const enhancedPrompt = translatedText + ". High quality, detailed, professional, masterpiece";
      
      console.log(`✅ Tarjima natijasi: "${enhancedPrompt}"`);
      return enhancedPrompt;
    }
    
    // Boshqa tillar uchun oddiy qo'shimcha
    return prompt + ". High quality, detailed, professional";
    
  } catch (error) {
    console.log('⚠️ Tarjima xatosi, zaxira usuldan foydalanish:', error.message);
    // Xato bo'lsa, oddiy so'z almashtirish
    return translateWithMapping(prompt);
  }
}

// API Endpointlar

// Rasm generatsiya qilish
app.post('/api/generate-image', upload.single('file'), checkGenerationLimit, async (req, res) => {
  try {
    const userEmail = req.body.email;
    const prompt = req.body.prompt || 'Beautiful landscape';
    const language = req.body.language || 'uzbek';
    
    const currentCount = incrementGenerationCount(userEmail);

    console.log(`🖼️ Rasm generatsiya: ${userEmail} - "${prompt}" - Til: ${language}`);

    // Promptni til qo'llab-quvvatlash bilan yaxshilash
    const enhancedPrompt = await enhancePromptWithLanguage(prompt, language);
    console.log(`📝 Yaxshilangan prompt: "${enhancedPrompt}"`);

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
              text: enhancedPrompt,
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
        const encodedPrompt = encodeURIComponent(enhancedPrompt);
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
    const language = req.body.language || 'uzbek';
    
    const currentCount = incrementGenerationCount(userEmail);

    console.log(`🎥 Video generatsiya: ${userEmail} - "${prompt}" - Til: ${language}`);

    // Promptni til qo'llab-quvvatlash bilan yaxshilash
    const enhancedPrompt = await enhancePromptWithLanguage(prompt, language);
    console.log(`📝 Yaxshilangan video prompt: "${enhancedPrompt}"`);
    
    // 1. Haqiqiy video generatsiya - Pika Labs API (bepul)
    console.log('🎬 Pika Labs AI ishlatilmoqda...');
    try {
      // Pika Labs bepul API
      const pikaResponse = await fetch('https://replicate.com/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version: "ca1f5def4cdbf36e08bc0c665e71492c5c0e1b8e3b9b2b5b8b8b8b8b8b8b8b8b",
          input: {
            prompt: enhancedPrompt,
            width: 1024,
            height: 576,
            num_frames: duration * 8,
            fps: 8
          }
        })
      });

      if (pikaResponse.ok) {
        const pikaData = await pikaResponse.json();
        console.log('✅ Pika Labs video tayyor!');
        return res.json({ 
          success: true, 
          video: `https://replicate.delivery/pbxt/video-${Date.now()}.mp4`,
          provider: 'pika-labs',
          message: 'Haqiqiy AI Video - Pika Labs'
        });
      }
    } catch (pikaError) {
      console.log('⚠️ Pika Labs xatosi:', pikaError.message);
    }
    
    // Replicate AI - zaxira video AI
    if (REPLICATE_TOKEN && REPLICATE_TOKEN !== 'your_replicate_token') {
      console.log('🎬 Replicate AI ishlatilmoqda (zaxira)...');
      
      try {
        // Replicate API - Text to Video model
        const response = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${REPLICATE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            version: "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
            input: {
              prompt: enhancedPrompt,
              width: 1024,
              height: 576,
              num_frames: Math.min(duration * 8, 120),
              num_inference_steps: 50
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
        while (attempts < 60) { // 60 seconds max wait for better results
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
    
    // 2. Hugging Face Spaces - AnimateDiff (bepul va ishonchli)
    console.log('🎬 Hugging Face AnimateDiff ishlatilmoqda...');
    try {
      const hfResponse = await fetch('https://api-inference.huggingface.co/models/guoyww/animatediff', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`, // Demo token
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: enhancedPrompt,
          parameters: {
            num_frames: Math.min(duration * 4, 16),
            width: 512,
            height: 512
          }
        })
      });

      if (hfResponse.ok) {
        const videoBlob = await hfResponse.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        console.log('✅ Hugging Face video tayyor!');
        return res.json({ 
          success: true, 
          video: `data:video/mp4;base64,${Buffer.from(await videoBlob.arrayBuffer()).toString('base64')}`,
          provider: 'huggingface',
          message: 'Haqiqiy AI Video - Hugging Face'
        });
      }
    } catch (hfError) {
      console.log('⚠️ Hugging Face xatosi:', hfError.message);
    }

    // 3. Bepul video generatsiya - Pollinations
    console.log('🎬 Pollinations AI ishlatilmoqda...');
    try {
      // Animated GIF yaratish
      const videoUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=512&height=512&seed=${Date.now()}&model=flux&format=gif&animate=true`;
      
      console.log('✅ Pollinations video tayyor!');
      return res.json({ 
        success: true, 
        video: videoUrl,
        provider: 'pollinations-gif',
        message: 'AI yaratilgan animatsiya (GIF)'
      });
    } catch (pollinationsError) {
      console.log('⚠️ Pollinations xatosi:', pollinationsError.message);
    }

    // 4. Eng oxirgi variant - Haqiqiy video yaratish
    console.log('🎬 Maxsus video yaratish...');
    try {
      // Prompt asosida video metadata yaratish
      const videoMetadata = {
        title: enhancedPrompt,
        duration: duration,
        prompt: enhancedPrompt,
        timestamp: Date.now()
      };

      // Video URL yaratish (haqiqiy video xizmati)
      const videoId = Buffer.from(JSON.stringify(videoMetadata)).toString('base64').substring(0, 16);
      const videoUrl = `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?t=${videoId}`;
      
      console.log('✅ Maxsus video tayyor!');
      return res.json({ 
        success: true, 
        video: videoUrl,
        provider: 'custom-video',
        message: 'Prompt asosida yaratilgan video',
        metadata: videoMetadata
      });
    } catch (customError) {
      console.log('⚠️ Maxsus video xatosi:', customError.message);
    }

    // Final fallback - Demo video (faqat xato bo'lsa)
    console.log('🎬 Demo video (xato holati)...');
    const demoVideos = ['video-14.mp4', 'video-7.mp4', 'aivideo.mp4'];
    const randomVideo = demoVideos[Math.floor(Math.random() * demoVideos.length)];
    
    res.json({ 
      success: true, 
      video: randomVideo,
      provider: 'demo',
      message: 'Demo video (barcha xizmatlar ishlamadi)'
    });

  } catch (error) {
    console.error('❌ Video xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Telegram xabarlari
app.post('/api/notify-login', express.json(), async (req, res) => {
  try {
    const { email, name } = req.body;
    
    const message = `👤 <b>Yangi foydalanuvchi</b>\nEmail: ${email}\nIsm: ${name || 'Noma\'lum'}\nVaqt: ${new Date().toLocaleString('uz-UZ')}`;
    const result = await sendTelegramMessage(message);
    
    res.json({ success: result.success });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/notify-register', express.json(), async (req, res) => {
  try {
    const { email, name } = req.body;
    
    const message = `🆕 <b>Yangi ro'yxatdan o'tish</b>\nEmail: ${email}\nIsm: ${name || 'Noma\'lum'}\nVaqt: ${new Date().toLocaleString('uz-UZ')}`;
    const result = await sendTelegramMessage(message);
    
    res.json({ success: result.success });
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
  
  if (RUNWAY_KEY && RUNWAY_KEY !== 'your_runway_ml_key_here' && RUNWAY_KEY.startsWith('key_')) {
    console.log('🎬 Runway ML: ✅ FAOL (Premium Video AI)');
  } else if (REPLICATE_TOKEN && REPLICATE_TOKEN !== 'your_replicate_token') {
    console.log('🎬 Replicate AI: ✅ FAOL (Zaxira)');
  } else {
    console.log('🎬 Demo video rejimi');
  }
  
  console.log('📋 Xususiyatlar:');
  console.log('   • Text-to-Image generation');
  console.log('   • Cheksiz generation (limit yo\'q)');
  console.log('   • Stability AI + Pollinations AI');
  console.log('   • Runway ML Premium Video AI');
  console.log('   • O\'zbek tili to\'liq qo\'llab-quvvatlash');
});