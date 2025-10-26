// Firebase konfiguratsiya fayli
// Bu faylni Firebase Console dan olingan ma'lumotlar bilan to'ldiring

export const firebaseConfig = {
  // Firebase Console -> Project Settings -> General -> Your apps -> Firebase SDK snippet -> Config
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", 
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

/* 
QADAMLAR:

1. Firebase Console ga kiring: https://console.firebase.google.com
2. "Create a project" yoki mavjud loyihani tanlang
3. Project Settings > General > Your apps bo'limiga o'ting
4. "</>" (Web) tugmasini bosing
5. App nickname kiriting: "doda-ai-web"
6. "Register app" bosing
7. Firebase SDK snippet > Config ni nusxalang
8. Yuqoridagi ma'lumotlarni almashtiring

AUTHENTICATION SOZLASH:
1. Authentication > Sign-in method
2. Phone ni enable qiling
3. Test phone numbers qo'shishingiz mumkin (ixtiyoriy)

DOMAIN SOZLASH:
1. Authentication > Settings > Authorized domains
2. Localhost va saytingiz domenini qo'shing

ESLATMA: 
- Bu ma'lumotlar ochiq bo'lishi mumkin (frontend da)
- Lekin Firebase Rules orqali xavfsizlik ta'minlanadi
- Production da Firebase Rules ni to'g'ri sozlang
*/
