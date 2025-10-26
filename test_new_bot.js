// Yangi bot bilan test
import fetch from 'node-fetch';

const BOT_TOKEN = '8306888404:AAHT5-4sJ-UEXaqpx04xSISUqoYl9qmq8ME';
const CHAT_ID = '8069248183';

async function testNewBot() {
  try {
    console.log('🤖 Yangi bot ma\'lumotlarini tekshiryapman...');
    
    // Avval bot ma'lumotlarini olish
    const botResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const botData = await botResponse.json();
    
    if (botData.ok) {
      console.log('✅ Yangi bot topildi!');
      console.log(`📱 Bot nomi: ${botData.result.first_name}`);
      console.log(`🔗 Bot username: @${botData.result.username}`);
      console.log(`🆔 Bot ID: ${botData.result.id}`);
      console.log('');
      
      // Test xabar yuborish
      console.log('📤 Test xabar yuborilmoqda...');
      
      const message = `🎉 <b>Yangi Bot Ulandi!</b>

✅ Bot muvaffaqiyatli o'zgartirildi!
🤖 Bot: ${botData.result.first_name}
🆔 Chat ID: ${CHAT_ID}
⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}

Endi bu bot orqali xabarlar keladi! 🚀`;

      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        console.log('✅ Yangi bot bilan test xabar yuborildi!');
        console.log('📱 Telegramingizni tekshiring!');
      } else {
        console.error('❌ Xabar yuborilmadi:', data.description);
      }
    } else {
      console.error('❌ Bot xatosi:', botData.description);
    }
  } catch (error) {
    console.error('❌ Xato:', error.message);
  }
}

testNewBot();
