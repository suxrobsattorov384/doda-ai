// Barcha foydalanuvchilarga test xabar
import fetch from 'node-fetch';

async function testAllUsers() {
  try {
    console.log('📤 Barcha foydalanuvchilarga test xabar yuborilmoqda...');
    
    const response = await fetch('http://localhost:3001/api/notify-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Foydalanuvchi',
        email: 'test@example.com'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ ${result.sentTo} foydalanuvchiga xabar yuborildi!`);
      console.log('📋 Natijalar:', result.details);
    } else {
      console.error('❌ Xabar yuborilmadi:', result.error);
    }
  } catch (error) {
    console.error('❌ Test xatosi:', error.message);
  }
}

testAllUsers();
