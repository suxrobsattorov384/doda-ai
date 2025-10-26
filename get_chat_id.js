// Chat ID olish uchun test script
import fetch from 'node-fetch';

const BOT_TOKEN = '8306888404:AAHT5-4sJ-UEXaqpx04xSISUqoYl9qmq8ME';

async function getChatId() {
  try {
    console.log('🔍 Chat ID ni qidiryapman...');
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
    const data = await response.json();
    
    if (data.ok && data.result.length > 0) {
      console.log('✅ Chat ID topildi!');
      console.log('📋 Barcha xabarlar:');
      
      data.result.forEach((update, index) => {
        if (update.message) {
          const chat = update.message.chat;
          console.log(`${index + 1}. Chat ID: ${chat.id}`);
          console.log(`   Tur: ${chat.type}`);
          console.log(`   Ism: ${chat.first_name || 'N/A'} ${chat.last_name || ''}`);
          console.log(`   Username: @${chat.username || 'N/A'}`);
          console.log(`   Xabar: "${update.message.text}"`);
          console.log('---');
        }
      });
      
      // Eng oxirgi chat ID ni ko'rsatish
      const lastUpdate = data.result[data.result.length - 1];
      if (lastUpdate.message) {
        const chatId = lastUpdate.message.chat.id;
        console.log(`🎯 Sizning Chat ID: ${chatId}`);
        console.log(`📝 .env fayliga qo'shing: TELEGRAM_CHAT_ID=${chatId}`);
      }
    } else {
      console.log('❌ Hech qanday xabar topilmadi!');
      console.log('💡 Botga /start yuboring va qayta urinib ko\'ring');
    }
  } catch (error) {
    console.error('❌ Xato:', error.message);
  }
}

getChatId();
