// Debug test - sizga xabar yuborish
import fetch from 'node-fetch';

const BOT_TOKEN = '8306888404:AAHT5-4sJ-UEXaqpx04xSISUqoYl9qmq8ME';
const YOUR_CHAT_ID = '8069248183'; // Sizning Chat ID

async function debugTest() {
  try {
    console.log('🔍 Debug test boshlandi...');
    
    // 1. Bot ma'lumotlarini tekshirish
    console.log('1️⃣ Bot ma\'lumotlarini tekshiryapman...');
    const botResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const botData = await botResponse.json();
    
    if (botData.ok) {
      console.log(`✅ Bot: ${botData.result.first_name} (@${botData.result.username})`);
    } else {
      console.log('❌ Bot xatosi:', botData.description);
      return;
    }
    
    // 2. Sizga test xabar yuborish
    console.log('2️⃣ Sizga test xabar yuborilmoqda...');
    const message = `🧪 <b>Debug Test</b>

⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}
🤖 Bot: @${botData.result.username}
🆔 Chat ID: ${YOUR_CHAT_ID}

Agar bu xabarni ko'rsangiz, bot ishlayapti! ✅`;

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: YOUR_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Test xabar yuborildi!');
      console.log('📱 Telegramingizni tekshiring!');
    } else {
      console.error('❌ Xabar xatosi:', data.description);
      console.error('🔍 Xato kodi:', data.error_code);
      
      if (data.error_code === 403) {
        console.log('⚠️ Bot bloklangan yoki /start yuborilmagan!');
        console.log('💡 @Dodaai_uz_bot ga /start yuboring!');
      }
    }
    
  } catch (error) {
    console.error('❌ Debug xatosi:', error.message);
  }
}

debugTest();
