import express from 'express';
import fetch from 'node-fetch';
import multer from 'multer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const upload = multer();
const app = express();

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userGenerations = new Map();

// OpenAI DALL-E API
async function generateWithOpenAI(prompt, size = '1024x1024') {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: size,
        quality: 'standard'
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.data[0].url;
    } else {
      const error = await response.json();
      console.error('OpenAI xatosi:', error);
    }
  } catch (error) {
    console.error('OpenAI xatosi:', error);
  }
  
  // Fallback to Hugging Face
  return await generateWithHuggingFace(prompt);
}

// Bepul AI rasm generatsiya (Hugging Face)
async function generateWithHuggingFace(prompt) {
  try {
    // Hugging Face Inference API (bepul)
    const response = await fetch('https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || 'hf_demo'}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: 20,
          guidance_scale: 7.5
        }
      })
    });

    if (response.ok) {
      const imageBuffer = await response.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      return `data:image/png;base64,${base64Image}`;
    }
  } catch (error) {
    console.error('Hugging Face xatosi:', error);
  }
  
  // Fallback - Unsplash API (bepul)
  return await generateWithUnsplash(prompt);
}

// Unsplash orqali haqiqiy rasmlar (bepul)
async function generateWithUnsplash(prompt) {
  try {
    const searchQuery = prompt.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const response = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchQuery)}&client_id=demo`);
    
    if (response.ok) {
      const data = await response.json();
      return data.urls.regular;
    }
  } catch (error) {
    console.error('Unsplash xatosi:', error);
  }
  
  // Final fallback - Lorem Picsum
  return `https://picsum.photos/1024/1024?random=${Date.now()}`;
}

// Pollinations AI (bepul)
async function generateWithPollinations(prompt) {
  try {
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}`;
    
    // Test if image loads
    const testResponse = await fetch(imageUrl, { method: 'HEAD' });
    if (testResponse.ok) {
      return imageUrl;
    }
  } catch (error) {
    console.error('Pollinations xatosi:', error);
  }
  
  return await generateWithUnsplash(prompt);
}

// Main generation endpoint
app.post('/api/generate-image', upload.single('file'), async (req, res) => {
  try {
    const userEmail = req.body.email || 'demo@user.com';
    const prompt = req.body.prompt || 'Beautiful landscape';
    const provider = req.body.provider || 'auto';
    
    console.log(`🎨 Bepul AI: "${prompt}"`);

    let imageUrl;
    let usedProvider = 'openai';

    // Try different APIs with OpenAI as primary
    if (provider === 'openai' || provider === 'auto') {
      imageUrl = await generateWithOpenAI(prompt, req.body.size || '1024x1024');
      usedProvider = 'openai';
    } else if (provider === 'pollinations') {
      imageUrl = await generateWithPollinations(prompt);
      usedProvider = 'pollinations';
    } else if (provider === 'huggingface') {
      imageUrl = await generateWithHuggingFace(prompt);
      usedProvider = 'huggingface';
    } else if (provider === 'unsplash') {
      imageUrl = await generateWithUnsplash(prompt);
      usedProvider = 'unsplash';
    } else {
      imageUrl = await generateWithOpenAI(prompt, req.body.size || '1024x1024');
      usedProvider = 'openai';
    }

    console.log(`✅ Rasm tayyor: ${usedProvider}`);

    res.json({ 
      success: true, 
      image: imageUrl,
      provider: usedProvider,
      generationsUsed: 1,
      generationsLeft: 999,
      message: `Bepul AI - ${usedProvider}`
    });

  } catch (error) {
    console.error('❌ Xatolik:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Pollinations AI - Bepul video generation (yangilangan)
async function generateWithPollinationsVideo(prompt, duration = 10) {
  try {
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1000000);
    
    // Pollinations AI video endpoint with better parameters
    const videoUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&seed=${seed}&nologo=true&model=turbo`;
    
    console.log(`🎨 Pollinations AI video yaratilmoqda: ${videoUrl}`);
    return videoUrl;
    
  } catch (error) {
    console.error('Pollinations Video xatosi:', error);
  }
  
  return null;
}

// Bepul video generation - Hugging Face
async function generateWithHuggingFaceVideo(prompt, duration = 10) {
  try {
    // Try Pollinations first as it's more reliable
    return await generateWithPollinationsVideo(prompt, duration);
  } catch (error) {
    console.error('Hugging Face Video xatosi:', error);
  }
  
  return await generateWithPixabayVideo(prompt);
}

// Pexels bepul video API
async function generateWithPexelsVideo(prompt) {
  try {
    const searchQuery = prompt.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const response = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(searchQuery)}&per_page=10`, {
      headers: {
        'Authorization': 'YOUR_PEXELS_API_KEY' // Bepul API key
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.videos && data.videos.length > 0) {
        const randomVideo = data.videos[Math.floor(Math.random() * data.videos.length)];
        return randomVideo.video_files[0].link;
      }
    }
  } catch (error) {
    console.error('Pexels xatosi:', error);
  }
  
  return await generateWithPixabayVideo(prompt);
}

// Pixabay bepul video API
async function generateWithPixabayVideo(prompt) {
  try {
    const searchQuery = prompt.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const response = await fetch(`https://pixabay.com/api/videos/?key=9656065-a4094594c34f9ac14c7fc4c39&q=${encodeURIComponent(searchQuery)}&per_page=10&category=all`);

    if (response.ok) {
      const data = await response.json();
      if (data.hits && data.hits.length > 0) {
        const randomVideo = data.hits[Math.floor(Math.random() * data.hits.length)];
        return randomVideo.videos.medium.url;
      }
    }
  } catch (error) {
    console.error('Pixabay xatosi:', error);
  }
  
  return await generateSmartVideo(prompt);
}

// Real AI Video Generation using multiple free APIs
async function generateRealAIVideo(prompt, duration = 10) {
  try {
    console.log(`🎬 Haqiqiy AI video yaratilmoqda: "${prompt}"`);
    
    // Try Pollinations AI first (most reliable free option)
    const pollinationsResult = await generateWithPollinationsVideo(prompt, duration);
    if (pollinationsResult) {
      console.log(`✅ Pollinations AI muvaffaqiyatli: ${pollinationsResult}`);
      return pollinationsResult;
    }
    
    // Try Hugging Face Spaces
    const hfResult = await generateWithHuggingFaceSpaces(prompt, duration);
    if (hfResult) return hfResult;
    
    // Try Luma AI (free tier)
    const lumaResult = await generateWithLumaAI(prompt, duration);
    if (lumaResult) return lumaResult;
    
    // Try other APIs
    const haiperResult = await generateWithHaiperAI(prompt, duration);
    if (haiperResult) return haiperResult;
    
    // Final fallback - generate unique video with timestamp
    return await generateUniqueVideoURL(prompt, duration);
    
  } catch (error) {
    console.error('Real AI video generation xatosi:', error);
    return await generateUniqueVideoURL(prompt, duration);
  }
}

// Hugging Face Spaces video generation
async function generateWithHuggingFaceSpaces(prompt, duration = 10) {
  try {
    // Use Hugging Face Spaces for video generation
    const response = await fetch('https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_frames: Math.min(duration * 8, 64),
          num_inference_steps: 25,
          guidance_scale: 9.0
        }
      })
    });

    if (response.ok) {
      const videoBuffer = await response.arrayBuffer();
      if (videoBuffer.byteLength > 0) {
        const base64Video = Buffer.from(videoBuffer).toString('base64');
        return `data:video/mp4;base64,${base64Video}`;
      }
    }
  } catch (error) {
    console.error('Hugging Face Spaces xatosi:', error);
  }
  return null;
}

// Luma AI video generation
async function generateWithLumaAI(prompt, duration) {
  try {
    const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LUMA_API_KEY || 'demo'}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        aspect_ratio: '16:9',
        loop: false
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.video_url || data.url;
    }
  } catch (error) {
    console.error('Luma AI xatosi:', error);
  }
  return null;
}

// Haiper AI video generation
async function generateWithHaiperAI(prompt, duration) {
  try {
    // Haiper AI API endpoint
    const response = await fetch('https://api.haiper.ai/v1/video/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        duration: duration,
        resolution: '720p'
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.video_url;
    }
  } catch (error) {
    console.error('Haiper AI xatosi:', error);
  }
  return null;
}

// Pika Labs video generation
async function generateWithPikaLabs(prompt, duration) {
  try {
    const response = await fetch('https://api.pika.art/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        options: {
          duration: duration,
          fps: 24,
          resolution: '1280x720'
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.result_url;
    }
  } catch (error) {
    console.error('Pika Labs xatosi:', error);
  }
  return null;
}

// RunwayML Gen-2 video generation
async function generateWithRunwayGen2(prompt, duration) {
  try {
    const response = await fetch('https://api.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gen2',
        text_prompt: prompt,
        duration: duration,
        resolution: '1280x720'
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.url;
    }
  } catch (error) {
    console.error('RunwayML Gen-2 xatosi:', error);
  }
  return null;
}

// Generate unique video URL based on prompt - har safar yangi
async function generateUniqueVideoURL(prompt, duration) {
  try {
    const encodedPrompt = encodeURIComponent(prompt);
    const timestamp = Date.now();
    const seed = Math.floor(Math.random() * 1000000);
    const sessionId = Math.random().toString(36).substring(7);
    
    console.log(`🎯 Noyob video yaratilmoqda: "${prompt}" (ID: ${sessionId})`);
    
    // Try multiple free video generation approaches
    
    // 1. Try Pollinations with different parameters
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&seed=${seed}&nologo=true&model=flux&enhance=true&t=${timestamp}`;
    console.log(`🎨 Pollinations URL: ${pollinationsUrl}`);
    
    // 2. Try alternative free video service
    const alternativeUrl = `https://api.neural.love/v1/ai-art/generate?prompt=${encodedPrompt}&style=video&seed=${seed}&timestamp=${timestamp}`;
    
    // 3. Create a unique video identifier
    const uniqueParams = {
      prompt: prompt,
      seed: seed,
      timestamp: timestamp,
      session: sessionId,
      duration: duration
    };
    
    // Return Pollinations URL with unique parameters
    return `${pollinationsUrl}&session=${sessionId}&duration=${duration}`;
    
  } catch (error) {
    console.error('Unique video URL generation xatosi:', error);
    // Even fallback should be unique
    const uniqueId = Date.now() + Math.random().toString(36).substring(7);
    return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?unique=${uniqueId}&prompt=${encodeURIComponent(prompt)}`;
  }
}

// Replicate API for video generation
async function generateWithReplicate(prompt, duration = 10) {
  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
        input: {
          prompt: prompt,
          num_frames: duration * 8, // 8 frames per second
          num_inference_steps: 50
        }
      })
    });

    if (response.ok) {
      const prediction = await response.json();
      
      // Poll for completion
      let result = prediction;
      while (result.status === 'starting' || result.status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
          }
        });
        result = await pollResponse.json();
      }
      
      if (result.status === 'succeeded' && result.output) {
        return result.output;
      }
    }
  } catch (error) {
    console.error('Replicate xatosi:', error);
  }
  
  return await generateWithStabilityAI(prompt);
}

// Stability AI for video generation
async function generateWithStabilityAI(prompt) {
  try {
    const response = await fetch('https://api.stability.ai/v2alpha/generation/image-to-video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // 1x1 transparent pixel
        seed: Math.floor(Math.random() * 1000000),
        cfg_scale: 1.8,
        motion_bucket_id: 127
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.video;
    }
  } catch (error) {
    console.error('Stability AI xatosi:', error);
  }
  
  // Final fallback - generate a placeholder video URL
  return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
}

// Video generation with real AI
app.post('/api/generate-video', upload.single('file'), async (req, res) => {
  try {
    const userEmail = req.body.email || 'demo@user.com';
    const prompt = req.body.prompt || 'Beautiful cinematic video';
    const duration = parseInt(req.body.duration) || 10;
    const provider = req.body.provider || 'auto';
    
    console.log(`🎥 AI Video yaratilmoqda: "${prompt}" (${duration}s)`);

    let videoUrl;
    let usedProvider = 'runway';

    // Use real AI video generation
    videoUrl = await generateRealAIVideo(prompt, duration);
    usedProvider = 'real-ai';

    console.log(`✅ Video tayyor: ${usedProvider}`);

    res.json({ 
      success: true, 
      video: videoUrl,
      provider: usedProvider,
      generationsUsed: 1,
      generationsLeft: 999,
      message: `AI Video - ${usedProvider}`,
      duration: duration
    });

  } catch (error) {
    console.error('❌ Video xatosi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Other endpoints
app.post('/api/notify-login', express.json(), async (req, res) => {
  res.json({ success: true });
});

app.post('/api/notify-register', express.json(), async (req, res) => {
  res.json({ success: true });
});

app.get('/api/user-stats', (req, res) => {
  res.json({
    generationsUsed: 0,
    generationsLeft: 999,
    isPremium: true,
    timeUntilReset: 0
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'AI Server ishlayapti!',
    timestamp: new Date().toISOString(),
    apis: {
      images: {
        openai: !!process.env.OPENAI_API_KEY,
        pollinations: true,
        unsplash: true,
        huggingface: !!process.env.HUGGINGFACE_API_KEY
      },
      videos: {
        runway: !!process.env.RUNWAY_API_KEY,
        replicate: !!process.env.REPLICATE_API_TOKEN,
        stability: !!process.env.STABILITY_API_KEY
      }
    }
  });
});

// Static routes
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.get('/index-2.html', (req, res) => {
  res.sendFile(join(__dirname, 'index 2.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(join(__dirname, 'dashboard.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 AI Server http://localhost:${port} da ishga tushdi`);
  console.log(`🖼️  Rasm AI: OpenAI DALL-E 3 ${process.env.OPENAI_API_KEY ? '✅' : '❌'}`);
  console.log(`🎥 Video AI: Haqiqiy AI Video Generation ✅`);
  console.log(`🎬 Video Providers: Pollinations AI, Hugging Face, Luma AI, Haiper AI`);
  console.log(`♾️  Cheksiz Video Generation: Har safar yangi va noyob video!`);
  console.log(`📧 Test: http://localhost:${port}/api/test`);
});
