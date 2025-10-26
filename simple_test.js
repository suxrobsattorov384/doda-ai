// Oddiy test - sizning Chat ID ni topish
import fetch from 'node-fetch';

const BOT_TOKEN = '7924051668:AAH9MbkrQY_nlQgTkoKLChZmkWzaYPz7Udo';

// Test uchun sizning Chat ID ni sinab ko'ramiz
const TEST_CHAT_IDS = [
  '1234567890', // Sizning ID ingiz bo'lishi mumkin
  '987654321',
  // Agar bilsangiz, o'zingizning Telegram ID ni qo'shing
];

async function sendTestMessage(chatId) {
  try {
    const message = '🎉 DODa AI Test Xabari!\n\nAgar bu xabarni ko\'rsangiz, bot to\'g\'ri ishlayapti!';
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log(`✅ Chat ID ${chatId} ga xabar yuborildi!`);
      console.log(`📝 .env fayliga qo'shing: TELEGRAM_CHAT_ID=${chatId}`);
      return true;
    } else {
      console.log(`❌ Chat ID ${chatId}: ${data.description}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Chat ID ${chatId} xatosi: ${error.message}`);
    return false;
  }
}

// Manual Chat ID kiritish
console.log('🔍 Chat ID ni topish...');
console.log('');
console.log('📱 Sizning Telegram Chat ID ni olish uchun:');
console.log('1. @userinfobot ga /start yuboring');
console.log('2. U sizga ID ni beradi');
console.log('3. Yoki @quloqdagi_kitob_bot ga /start yuborib, get_chat_id.js ishga tushiring');
console.log('');

// Agar Chat ID ma'lum bo'lsa, test qiling
// sendTestMessage('YOUR_CHAT_ID_HERE');
