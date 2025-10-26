// Test xabar yuborish
import fetch from 'node-fetch';

const BOT_TOKEN = '7924051668:AAH9MbkrQY_nlQgTkoKLChZmkWzaYPz7Udo';
const CHAT_ID = '8069248183';

async function sendTestMessage() {
  try {
    console.log('📤 Test xabar yuborilmoqda...');
    
    const message = `🎉 <b>DODa AI Test Xabari!</b>

✅ Bot to'g'ri sozlandi!
🆔 Chat ID: ${CHAT_ID}
⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}

Endi saytga ro'yxatdan o'tganingizda yoki kirganingizda xabar keladi! 🚀`;

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
      console.log('✅ Test xabar muvaffaqiyatli yuborildi!');
      console.log('📱 Telegramingizni tekshiring!');
    } else {
      console.error('❌ Xabar yuborilmadi:', data.description);
    }
  } catch (error) {
    console.error('❌ Xato:', error.message);
  }
}

sendTestMessage();
