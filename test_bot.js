// Bot test qilish uchun
import fetch from 'node-fetch';

const BOT_TOKEN = '7924051668:AAH9MbkrQY_nlQgTkoKLChZmkWzaYPz7Udo';

async function testBot() {
  try {
    console.log('🤖 Bot ma\'lumotlarini olayapman...');
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Bot topildi!');
      console.log(`📱 Bot nomi: ${data.result.first_name}`);
      console.log(`🔗 Bot username: @${data.result.username}`);
      console.log(`🆔 Bot ID: ${data.result.id}`);
      console.log('');
      console.log('📋 Keyingi qadamlar:');
      console.log(`1. Telegramda @${data.result.username} ni toping`);
      console.log('2. Botga /start yuboring');
      console.log('3. Qaytadan get_chat_id.js ni ishga tushiring');
    } else {
      console.log('❌ Bot xatosi:', data.description);
    }
  } catch (error) {
    console.error('❌ Xato:', error.message);
  }
}

testBot();
