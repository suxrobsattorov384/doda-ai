// Simple DODa AI Script - Faqat bepul AI
console.log('🚀 Simple DODa AI yuklandi');

// Year in footer
document.getElementById('y').textContent = new Date().getFullYear();

// Simple selectors
const $ = (id) => document.getElementById(id);
const promptEl = $('prompt');
const videoPromptEl = $('videoPrompt');
const preview = $('preview');
const genImageBtn = $('genImage');
const genVideoBtn = $('genVideo');

// Current user
let currentUser = null;

/* ---------- Authentication ---------- */
function getUsers() { 
  try { 
    return JSON.parse(localStorage.getItem('doda_users')) || []; 
  } catch(e) { 
    return []; 
  } 
}

function setUsers(list) { 
  localStorage.setItem('doda_users', JSON.stringify(list)); 
}

function getCurrent() { 
  try { 
    return JSON.parse(localStorage.getItem('doda_current')); 
  } catch(e) { 
    return null; 
  } 
}

function setCurrent(email) { 
  localStorage.setItem('doda_current', JSON.stringify({ email })); 
  currentUser = { email };
  updateAuthUI(); 
}

function getUserByEmail(email) { 
  return getUsers().find(u => u.email && u.email.toLowerCase() === email.toLowerCase()); 
}

/* ---------- Auth UI ---------- */
const btnOpenAuthHeader = $('btnOpenAuthHeader');
const btnLogoutHeader = $('btnLogoutHeader');
const authOverlay = $('authOverlay');
const authCard = $('authCard');
const btnCloseAuth = $('btnCloseAuth');
const tabLogin = $('tabLogin');
const tabRegister = $('tabRegister');
const formLogin = $('formLogin');
const formRegister = $('formRegister');

function openAuth(which = 'login') {
  if (authOverlay) authOverlay.classList.remove('hidden');
  if (authCard) authCard.classList.remove('hidden');
  
  if (which === 'register') { 
    if (formRegister) formRegister.classList.remove('hidden');
    if (formLogin) formLogin.classList.add('hidden');
    if (tabRegister) tabRegister.classList.add('bg-white/8'); 
    if (tabLogin) tabLogin.classList.remove('bg-white/8'); 
  } else { 
    if (formLogin) formLogin.classList.remove('hidden');
    if (formRegister) formRegister.classList.add('hidden');
    if (tabLogin) tabLogin.classList.add('bg-white/8'); 
    if (tabRegister) tabRegister.classList.remove('bg-white/8'); 
  }
}

function closeAuth() { 
  if (authOverlay) authOverlay.classList.add('hidden');
  if (authCard) authCard.classList.add('hidden');
}

function updateAuthUI() {
  const cur = getCurrent();
  const sidebarUserName = $('sidebarUserName');
  
  if (cur && cur.email) {
    if (btnOpenAuthHeader) btnOpenAuthHeader.classList.add('hidden');
    if (btnLogoutHeader) btnLogoutHeader.classList.remove('hidden');
    if (sidebarUserName) {
      const user = getUserByEmail(cur.email);
      sidebarUserName.textContent = user?.name || cur.email.split('@')[0];
    }
  } else {
    if (btnOpenAuthHeader) btnOpenAuthHeader.classList.remove('hidden');
    if (btnLogoutHeader) btnLogoutHeader.classList.add('hidden');
    if (sidebarUserName) {
      sidebarUserName.textContent = 'Mehmon';
    }
  }
}

// Event listeners
btnOpenAuthHeader?.addEventListener('click', () => openAuth('login'));
btnCloseAuth?.addEventListener('click', closeAuth);
authOverlay?.addEventListener('click', closeAuth);
tabLogin?.addEventListener('click', () => openAuth('login'));
tabRegister?.addEventListener('click', () => openAuth('register'));

btnLogoutHeader?.addEventListener('click', () => {
  localStorage.removeItem('doda_current'); 
  currentUser = null;
  updateAuthUI(); 
  alert('Chiqildi');
});

/* ---------- Telegram Bot Functions ---------- */
async function sendTelegramNotification(type, userData) {
  try {
    const response = await fetch(`/api/notify-${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    if (result.success) {
      console.log(`✅ Telegram ${type} xabari yuborildi`);
    } else {
      console.warn(`⚠️ Telegram ${type} xabari yuborilmadi:`, result.error);
    }
  } catch (error) {
    console.error(`❌ Telegram ${type} xabar xatosi:`, error);
  }
}

// Foydalanuvchi Chat ID ni saqlash
async function saveChatId(email, chatId) {
  try {
    const response = await fetch('/api/save-chat-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, chatId })
    });
    
    const result = await response.json();
    if (result.success) {
      console.log(`✅ Chat ID saqlandi: ${email}`);
    }
  } catch (error) {
    console.error('❌ Chat ID saqlash xatosi:', error);
  }
}

// Telegram Chat ID ni so'rash
function promptForChatId(email) {
  const chatId = prompt(`🤖 Telegram xabarlarini olish uchun:\n\n1. @Dodaai_uz_bot ga boring\n2. /start yuboring\n3. Chat ID ni kiriting:\n\n(Yoki @userinfobot dan ID oling)`);
  
  if (chatId && chatId.trim()) {
    saveChatId(email, chatId.trim());
    alert('✅ Chat ID saqlandi! Endi sizga shaxsiy xabarlar keladi.');
  }
}

/* ---------- Auth forms ---------- */
formRegister?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const regError = $('regError');
  const regName = $('regName');
  const regEmail = $('regEmail');
  const regPassword = $('regPassword');
  
  if (regError) { regError.textContent = ''; regError.classList.add('hidden'); }
  
  const name = regName.value.trim();
  const email = regEmail.value.trim();
  const pass = regPassword.value;
  
  if (!name) { 
    if (regError) { regError.textContent = 'Ism kiriting.'; regError.classList.remove('hidden'); }
    return; 
  }
  if (!email || !email.includes('@')) { 
    if (regError) { regError.textContent = 'To\'g\'ri email kiriting.'; regError.classList.remove('hidden'); }
    return; 
  }
  if (pass.length < 6) { 
    if (regError) { regError.textContent = 'Parol kamida 6 belgidan.'; regError.classList.remove('hidden'); }
    return; 
  }
  if (getUserByEmail(email)) { 
    if (regError) { regError.textContent = 'Bu email bilan hisob mavjud.'; regError.classList.remove('hidden'); }
    return; 
  }
  
  const users = getUsers(); 
  users.push({ name, email, pass }); 
  setUsers(users); 
  setCurrent(email);
  
  // Telegram botga ro'yxatdan o'tish xabarini yuborish
  await sendTelegramNotification('register', { name, email });
  
  regName.value = ''; 
  regEmail.value = ''; 
  regPassword.value = ''; 
  closeAuth();
});

formLogin?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const loginError = $('loginError');
  const loginEmail = $('loginEmail');
  const loginPassword = $('loginPassword');
  
  if (loginError) { loginError.textContent = ''; loginError.classList.add('hidden'); }
  
  const email = loginEmail.value.trim();
  const pass = loginPassword.value;
  const u = getUserByEmail(email);
  
  if (!u || u.pass !== pass) { 
    if (loginError) { loginError.textContent = 'Email yoki parol noto\'g\'ri.'; loginError.classList.remove('hidden'); }
    return; 
  }
  
  setCurrent(email);
  
  // Telegram botga kirish xabarini yuborish
  await sendTelegramNotification('login', { name: u.name, email: u.email });
  
  loginEmail.value = ''; 
  loginPassword.value = ''; 
  closeAuth();
});

/* ---------- Generation functions ---------- */
function showLoadingState(message = 'Yaratilmoqda...') {
  if (preview) {
    preview.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-white/60">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
        <div>${message}</div>
      </div>
    `;
  }
}

function showError(message) {
  if (preview) {
    preview.innerHTML = `
      <div class="flex items-center justify-center h-full">
        <div class="text-red-400 p-4 text-center">
          <div class="text-xl mb-2">❌</div>
          <div>Xatolik: ${message}</div>
        </div>
      </div>
    `;
  }
}

async function generateImage() {
  const user = getCurrent();
  if (!user?.email) {
    alert('Iltimos, avval tizimga kiring.');
    openAuth('login');
    return;
  }

  const prompt = promptEl?.value?.trim() || 'Beautiful landscape';
  
  console.log('🎨 Rasm yaratilmoqda:', prompt);
  showLoadingState('Bepul AI rasm yaratmoqda...');

  try {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('email', user.email);

    const response = await fetch('/api/generate-image', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('📨 Server javobi:', data);

    if (!response.ok) {
      throw new Error(data.error || `Server xatosi: ${response.status}`);
    }

    if (data.success && data.image) {
      preview.innerHTML = `
        <div class="relative h-full group">
          <img src="${data.image}" class="w-full h-full object-cover rounded-xl" alt="AI Generated Image" onload="console.log('✅ Rasm yuklandi')">
          <div class="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="font-medium">${data.provider?.toUpperCase() || 'AI'}</span>
              <span class="text-xs opacity-75">${data.generationsLeft || 0} qoldi</span>
            </div>
          </div>
          <div class="absolute top-4 right-4 bg-green-500/20 backdrop-blur-sm text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/30">
            ✓ Tayyor
          </div>
        </div>
      `;
      
      console.log('✅ Rasm muvaffaqiyatli ko\'rsatildi');
    } else {
      throw new Error('Rasm yaratilmadi');
    }
  } catch (error) {
    console.error('❌ Rasm yaratishda xatolik:', error);
    showError(error.message);
  }
}

async function generateVideo() {
  const user = getCurrent();
  if (!user?.email) {
    alert('Iltimos, avval tizimga kiring.');
    openAuth('login');
    return;
  }

  const prompt = videoPromptEl?.value?.trim() || 'Beautiful video scene';
  
  console.log('🎥 Video yaratilmoqda:', prompt);
  showLoadingState('AI video yaratilmoqda... (60 soniya kutish)');

  try {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('email', user.email);

    const response = await fetch('/api/generate-video', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server xatosi: ${response.status}`);
    }

    if (data.success && data.video) {
      preview.innerHTML = `
        <div class="relative h-full group">
          <video src="${data.video}" class="w-full h-full object-cover rounded-xl" controls autoplay muted loop>
            Sizning brauzeringiz video elementni qo'llab-quvvatlamaydi.
          </video>
          <div class="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="font-medium">DEMO VIDEO</span>
              <span class="text-xs opacity-75">${data.generationsLeft || 0} qoldi</span>
            </div>
          </div>
        </div>
      `;
      
      console.log('✅ Video muvaffaqiyatli ko\'rsatildi');
    } else {
      throw new Error('Video yaratilmadi');
    }
  } catch (error) {
    console.error('❌ Video yaratishda xatolik:', error);
    showError(error.message);
  }
}

/* ---------- Button event listeners ---------- */
genImageBtn?.addEventListener('click', generateImage);
genVideoBtn?.addEventListener('click', generateVideo);

/* ---------- Download functionality ---------- */
const downloadBtn = $('downloadBtn');
downloadBtn?.addEventListener('click', () => {
  const img = preview?.querySelector('img');
  const video = preview?.querySelector('video');
  
  if (img) {
    const link = document.createElement('a');
    link.href = img.src;
    link.download = `doda-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    alert('Rasm yuklab olindi!');
  } else if (video) {
    const link = document.createElement('a');
    link.href = video.src;
    link.download = `doda-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    alert('Video yuklab olindi!');
  } else {
    alert('Oldin natija yarating.');
  }
});

/* ---------- Initialization ---------- */
document.addEventListener('DOMContentLoaded', () => {
  currentUser = getCurrent();
  updateAuthUI();
  
  console.log('✅ Simple DODa AI tayyor!');
  
  // Test server connection
  fetch('/api/test')
    .then(res => res.json())
    .then(data => console.log('✅ Server aloqasi:', data))
    .catch(err => console.error('❌ Server aloqasi xatosi:', err));
});
