// RunwayML API test script
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const RUNWAYML_API_SECRET = process.env.RUNWAYML_API_SECRET;

async function testRunwayMLAPI() {
  console.log('🧪 RunwayML API testini boshlash...');
  console.log('🔑 API Key:', RUNWAYML_API_SECRET ? 'Mavjud' : 'Yo\'q');
  
  if (!RUNWAYML_API_SECRET || RUNWAYML_API_SECRET === 'your_runwayml_key') {
    console.log('❌ RunwayML API key topilmadi yoki noto\'g\'ri');
    return;
  }

  try {
    // Test video generation endpoint
    console.log('🎬 Video generation testini boshlash...');
    
    const response = await fetch('http://localhost:3001/api/generate-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        prompt: 'Tog\'lar ustida chiroyli quyosh botishi va uchayotgan qushlar',
        duration: 10
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Video generation muvaffaqiyatli!');
      console.log('📊 Provider:', data.provider);
      console.log('💬 Message:', data.message);
      if (data.video) {
        console.log('🎥 Video URL:', data.video);
      }
    } else {
      console.log('❌ Video generation xatosi:', data.error);
    }

  } catch (error) {
    console.error('❌ Test xatosi:', error.message);
  }
}

// Test ishga tushirish
testRunwayMLAPI();
