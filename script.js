// Year in footer
document.getElementById('y').textContent = new Date().getFullYear();

/* ---------- small utilities ---------- */
const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => Array.from(root.querySelectorAll(q));
const show = el => el && el.classList.remove('hidden');
const hide = el => el && el.classList.add('hidden');

/* ---------- Prompt counter & sec range ---------- */
const promptEl = $('#prompt');
const countEl = $('#count');
promptEl?.addEventListener('input', ()=> { countEl.textContent = promptEl.value.length; });

const sec = $('#sec');
const secVal = $('#secVal');
sec?.addEventListener('input', ()=> { secVal.textContent = sec.value + 's'; });

// Ratio buttons
$$('.ratio-btn').forEach(btn=> btn.addEventListener('click', ()=> {
  $$('.ratio-btn').forEach(b=> b.classList.remove('bg-white/12'));
  btn.classList.add('bg-white/12');
}));

/* ---------- File input display ---------- */
const fileInput = $('#file');
const fileNameEl = $('#fileName');
const fileDrop = $('#fileDrop');
fileDrop.addEventListener('click', ()=> fileInput.click());
fileInput.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  fileNameEl.textContent = f ? `${f.name} (${Math.round(f.size/1024)}KB)` : 'Fayl tanlanmagan';
});

/* ---------- Demo generate (dummy preview) ---------- */
const preview = $('#preview');
const heroPrompt = $('#heroPrompt');
$('#heroGen').addEventListener('click', ()=> {
  const txt = heroPrompt.value.trim() || 'DODa';
  preview.innerHTML = '<div class="text-white/60">Yaratilmoqda...</div>';
  setTimeout(()=> {
    const url = `https://dummyimage.com/1280x720/0ea5e9/ffffff&text=${encodeURIComponent('Quick: '+txt)}`;
    preview.innerHTML = `<img src="${url}" class="w-full h-full object-cover rounded-xl">`;
  }, 800);
});

$('#genImage').addEventListener('click', ()=> demoGenerate('Image'));
$('#genVideo').addEventListener('click', ()=> demoGenerate('Video'));

function demoGenerate(type){
  const txt = (promptEl?.value || '').trim() || 'DODa';
  preview.innerHTML = '<div class="text-white/60">Yaratilmoqda...</div>';
  setTimeout(()=> {
    const url = `https://dummyimage.com/1280x720/000/fff.png&text=${encodeURIComponent(type+': '+txt)}`;
    preview.innerHTML = `<img src="${url}" class="w-full h-full object-cover rounded-xl">`;
  }, 900);
}

// Download button (downloads preview image if present)
$('#downloadBtn').addEventListener('click', ()=>{
  const img = preview.querySelector('img');
  if(!img) { alert('Oldin natija yarating.'); return; }
  const link = document.createElement('a');
  link.href = img.src;
  link.download = 'doda_preview.png';
  document.body.appendChild(link);
  link.click();
  link.remove();
});

/* ---------- Auth modal (localStorage demo) ---------- */
const btnOpenAuthHeader = $('#btnOpenAuthHeader');
const btnLogoutHeader = $('#btnLogoutHeader');
const authOverlay = $('#authOverlay');
const authCard = $('#authCard');
const btnCloseAuth = $('#btnCloseAuth');
const tabLogin = $('#tabLogin');
const tabRegister = $('#tabRegister');
const formLogin = $('#formLogin');
const formRegister = $('#formRegister');
const loginEmail = $('#loginEmail');
const loginPassword = $('#loginPassword');
const regName = $('#regName');
const regEmail = $('#regEmail');
const regPassword = $('#regPassword');
const loginError = $('#loginError');
const regError = $('#regError');

function openAuth(which='login'){
  show(authOverlay); show(authCard);
  authCard.classList.remove('hidden');
  if(which==='register'){ show(formRegister); hide(formLogin); tabRegister.classList.add('bg-white/8'); tabLogin.classList.remove('bg-white/8'); }
  else { show(formLogin); hide(formRegister); tabLogin.classList.add('bg-white/8'); tabRegister.classList.remove('bg-white/8'); }
}
function closeAuth(){ hide(authOverlay); hide(authCard); }

btnOpenAuthHeader.addEventListener('click', ()=> openAuth('login'));
btnCloseAuth.addEventListener('click', closeAuth);
authOverlay.addEventListener('click', closeAuth);
tabLogin.addEventListener('click', ()=> openAuth('login'));
tabRegister.addEventListener('click', ()=> openAuth('register'));

// Simple storage (no hashing in demo)
function getUsers(){ try { return JSON.parse(localStorage.getItem('doda_users')) || []; } catch(e){ return []; } }
function setUsers(list){ localStorage.setItem('doda_users', JSON.stringify(list)); }
function getCurrent(){ try { return JSON.parse(localStorage.getItem('doda_current')); } catch(e){ return null; } }
function setCurrent(email){ localStorage.setItem('doda_current', JSON.stringify({ email })); updateAuthUI(); }

function getUserByEmail(email){ return getUsers().find(u=> u.email && u.email.toLowerCase() === email.toLowerCase()); }

async function notifyTelegramLogin(email, name) {
  try {
    const response = await fetch('/api/notify-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: error.message };
  }
}


// Telegramga ro'yxatdan o'tish haqida xabar yuborish
async function notifyTelegramRegister(email, name) {
  try {
    const response = await fetch('/api/notify-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name })
    });
    const data = await response.json();
    if (!data.success) {
      console.error('Telegram ro\'yxatdan o\'tish xabarida xatolik:', data.error);
    }
  } catch (error) {
    console.error('Telegram ro\'yxatdan o\'tish xabarida xatolik:', error);
  }
}

formRegister.addEventListener('submit', async (e)=>{
  e.preventDefault();
  regError.textContent=''; hide(regError);
  const name = regName.value.trim(), email = regEmail.value.trim(), pass = regPassword.value;
  if(!name){ regError.textContent='Ism kiriting.'; show(regError); return; }
  if(!email || !email.includes('@')){ regError.textContent='To‘g‘ri email kiriting.'; show(regError); return; }
  if(pass.length < 6){ regError.textContent='Parol kamida 6 belgidan.'; show(regError); return; }
  if(getUserByEmail(email)){ regError.textContent='Bu email bilan hisob mavjud.'; show(regError); return; }
  const users = getUsers(); users.push({ name, email, pass }); setUsers(users); setCurrent(email);
  
  // Telegramga ro'yxatdan o'tish xabarini yuborish
  await notifyTelegramRegister(email, name);
  
  regName.value=''; regEmail.value=''; regPassword.value=''; closeAuth();
});

formLogin.addEventListener('submit', async (e)=>{
  e.preventDefault();
  loginError.textContent=''; hide(loginError);
  const email = loginEmail.value.trim(), pass = loginPassword.value;
  const u = getUserByEmail(email);
  if(!u || u.pass !== pass){ loginError.textContent='Email yoki parol noto‘g‘ri.'; show(loginError); return; }
  setCurrent(email);
  
  // Telegramga xabar yuborish
  await notifyTelegramLogin(email, u.name);
  
  loginEmail.value=''; loginPassword.value=''; closeAuth();
});

function updateAuthUI(){
  const cur = getCurrent();
  if(cur && cur.email){
    hide(btnOpenAuthHeader);
    show(btnLogoutHeader);
  } else {
    show(btnOpenAuthHeader);
    hide(btnLogoutHeader);
  }
}
updateAuthUI();

btnLogoutHeader.addEventListener('click', ()=>{
  localStorage.removeItem('doda_current'); updateAuthUI(); alert('Chiqildi');
});

/* ---------- Pricing: monthly/yearly toggle + slider indicator ---------- */
const monthly = $('#monthly'), yearly = $('#yearly');
const tabMonthly = $('#tabMonthly'), tabYearly = $('#tabYearly'), sliderIndicator = $('#sliderIndicator');

// initial state: monthly visible
function setMonthly(){
  monthly.classList.remove('hidden'); yearly.classList.add('hidden');
  tabMonthly.classList.add('text-white'); tabMonthly.classList.remove('text-white/70');
  tabYearly.classList.add('text-white/70'); tabYearly.classList.remove('text-white');
  sliderIndicator.style.transform = 'translateX(0)';
}
function setYearly(){
  monthly.classList.add('hidden'); yearly.classList.remove('hidden');
  tabYearly.classList.add('text-white'); tabYearly.classList.remove('text-white/70');
  tabMonthly.classList.add('text-white/70'); tabMonthly.classList.remove('text-white');
  sliderIndicator.style.transform = 'translateX(104px)'; // roughly width of left + gap
}

tabMonthly.addEventListener('click', setMonthly);
tabYearly.addEventListener('click', setYearly);
setMonthly();

/* ---------- Stripe subscribe buttons (redirect if logged in) ----------
   Using your provided test links.
*/
$$('.subscribe-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const cur = getCurrent();
    if(!cur || !cur.email){
      openAuth('login');
      setTimeout(()=> { $('#loginError').textContent = 'Davom etish uchun avval tizimga kiring.'; show($('#loginError')); }, 60);
      return;
    }
    const url = btn.dataset.link;
    if(!url){ alert('Stripe havolasi mavjud emas.'); return; }
    window.location.href = url;
  });
});

/* ---------- small UX: allow dropping files onto fileDrop ---------- */
;(function enableDrop(){
  fileDrop.addEventListener('dragover', e=> { e.preventDefault(); fileDrop.classList.add('bg-white/3'); });
  fileDrop.addEventListener('dragleave', e => { fileDrop.classList.remove('bg-white/3'); });
  fileDrop.addEventListener('drop', e => {
    e.preventDefault(); fileDrop.classList.remove('bg-white/3');
    const f = e.dataTransfer.files[0];
    if(f){ fileInput.files = e.dataTransfer.files; fileNameEl.textContent = `${f.name} (${Math.round(f.size/1024)}KB)`; }
  });
})();

/* ---------- AI integration functions ---------- */
const MODE = 'proxy';
const PROXY_BASE = '/api';

async function generateImageFromAI({ prompt, file=null, size='1024x1024' }){
  preview.innerHTML = '<div class="text-white/60">AI rasm yaratilmoqda — iltimos kuting...</div>';

  try {
    if(MODE === 'proxy'){
      const fd = new FormData();
      fd.append('prompt', prompt);
      fd.append('size', size);
      if(file) fd.append('file', file);
      const res = await fetch(`${PROXY_BASE}/generate-image`, { method: 'POST', body: fd });
      if(!res.ok) throw new Error(`Server xatosi: ${res.status}`);
      const data = await res.json();
      if(data && data.image){
        preview.innerHTML = `<img src="${data.image}" class="w-full h-full object-cover rounded-xl">`;
      } else {
        throw new Error('No image returned from proxy.');
      }
    }
  } catch(err){
    console.error(err);
    preview.innerHTML = `<div class="text-red-400 p-4">Xatolik: ${err.message}</div>`;
  }
}

// Wire AI buttons
$('#genImage').addEventListener('click', async ()=>{
  const prompt = (promptEl.value || '').trim();
  const file = fileInput.files[0] || null;
  if(!prompt && !file){ if(!confirm('Prompt kiritilmagan. Shunchaki demo rasm yaratilishini xohlaysizmi?')) return; }
  await generateImageFromAI({ prompt: prompt || 'Creative scene', file, size: '1024x1024' });
});

formLogin.addEventListener('submit', async (e)=>{
  e.preventDefault();
  loginError.textContent=''; hide(loginError);
  const email = loginEmail.value.trim(), pass = loginPassword.value;
  const u = getUserByEmail(email);
  if(!u || u.pass !== pass){
    loginError.textContent='Email yoki parol noto‘g‘ri.'; show(loginError); return;
  }
  setCurrent(email);

  // Kirish tugmasini disable qilish va yuklanish ko‘rsatish
  const loginBtn = formLogin.querySelector('button[type=\"submit\"]');
  if(loginBtn) { loginBtn.disabled = true; loginBtn.textContent = 'Kirilmoqda...'; }

  // Telegramga xabar yuborish
  let telegramResult = await notifyTelegramLogin(email, u.name);

  // Tugmani tiklash
  if(loginBtn) { loginBtn.disabled = false; loginBtn.textContent = 'Kirish'; }

  // Natijani ko‘rsatish
  if(telegramResult && telegramResult.success){
    alert('Telegramga xabar yuborildi!');
  } else if(telegramResult && telegramResult.error){
    loginError.textContent = 'Telegram xabari yuborilmadi: ' + telegramResult.error;
    show(loginError);
  }

  loginEmail.value=''; loginPassword.value=''; closeAuth();
});

// --- Reklama funksiyalari ---
window.addEventListener('DOMContentLoaded', ()=>{
  // Modal reklama
  const adModal = document.getElementById('adModal');
  const adModalClose = document.getElementById('adModalClose');
  const adModalText = document.getElementById('adModalText');
  
  if(adModal) {
    // Modal matnini yangilash
    adModalText.textContent = 'Saytga xush kelibsiz! DODa AI bilan ajoyib tajriba orzu qiling.';
    
    // Modalni ko'rsatish
    adModal.classList.remove('hidden');
    setTimeout(() => {
      adModalClose.style.opacity = 1;
    }, 3000);
    
    // Yopish tugmasi
    adModalClose.addEventListener('click', () => {
      adModal.style.display = 'none';
    });
  }

  // SMS reklama
  const adSms = document.getElementById('adSms');
  const adSmsClose = document.getElementById('adSmsClose');
  const adSmsText = document.getElementById('adSmsText');
  
  if(adSms) {
    // SMS matnini yangilash
    adSmsText.textContent = 'DODa AI: Hozir ro\'yxatdan o\'ting va 20% chegmani qo\'lga kiriting!';
    
    // SMSni ko'rsatish
    adSms.classList.remove('hidden');
    setTimeout(() => {
      adSmsClose.style.opacity = 1;
    }, 3000);
    
    // Yopish tugmasi
    adSmsClose.addEventListener('click', () => {
      adSms.style.display = 'none';
    });
  }
});


// Generatsiya funksiyasini yangilash
async function generateImageFromAI({ prompt, file=null, size='1024x1024' }){
  const currentUser = getCurrent();
  
  if (!currentUser || !currentUser.email) {
    alert('Iltimos, avval tizimga kiring.');
    openAuth('login');
    return;
  }

  preview.innerHTML = '<div class="text-white/60">AI rasm yaratilmoqda — iltimos kuting...</div>';

  try {
    const fd = new FormData();
    fd.append('prompt', prompt);
    fd.append('size', size);
    fd.append('email', currentUser.email);
    if(file) fd.append('file', file);
    
    const res = await fetch(`${PROXY_BASE}/generate-image`, { method: 'POST', body: fd });
    const data = await res.json();
    
    if (!res.ok) {
      if (data.limitReached) {
        // Chegaraga yetilganda to'lov modali ko'rsatish
        showPremiumModal();
        return;
      }
      throw new Error(data.error || `Server xatosi: ${res.status}`);
    }
    
    if(data && data.image){
      preview.innerHTML = `<img src="${data.image}" class="w-full h-full object-cover rounded-xl">`;
      
      // Generatsiya hisobini yangilash
      updateGenerationCounter(data.generationsUsed, data.generationsLeft);
    } else {
      throw new Error('No image returned from server.');
    }
  } catch(err){
    console.error(err);
    preview.innerHTML = `<div class="text-red-400 p-4">Xatolik: ${err.message}</div>`;
  }
}

// Premium modalni ko'rsatish
function showPremiumModal() {
  // Sizning mavjud modal yoki yangi modal yaratish
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="glass rounded-2xl p-6 max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">Bepul Generatsiya Chegarasi</h3>
        <p class="mb-4">Siz 10 ta bepul generatsiyadan foydalandingiz. Cheksiz generatsiya qilish uchun premium obuna sotib oling.</p>
        <div class="flex gap-3">
          <button onclick="closePremiumModal()" class="flex-1 px-4 py-2 rounded-xl border border-white/10">Keyinroq</button>
          <button onclick="redirectToPricing()" class="flex-1 btn-grad px-4 py-2 rounded-xl font-semibold">Obuna Bo'lish</button>
        </div>
      </div>
    </div>
  `;
  modal.id = 'premiumModal';
  document.body.appendChild(modal);
}

function closePremiumModal() {
  const modal = document.getElementById('premiumModal');
  if (modal) modal.remove();
}

function redirectToPricing() {
  closePremiumModal();
  document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
}

// Generatsiya hisobchisini yangilash
function updateGenerationCounter(used, left) {
  // UI da hisobchini ko'rsatish (siz o'zingiz qo'shishingiz mumkin)
  console.log(`Foydalanilgan: ${used}, Qolgan: ${left}`);
}


// Video generatsiya funksiyasi
async function generateVideoFromAI({ prompt, file=null, duration=10 }) {
  const currentUser = getCurrent();
  
  if (!currentUser || !currentUser.email) {
    alert('Iltimos, avval tizimga kiring.');
    openAuth('login');
    return;
  }

  preview.innerHTML = '<div class="text-white/60">AI video yaratilmoqda — iltimos kuting...</div>';

  try {
    const fd = new FormData();
    fd.append('prompt', prompt);
    fd.append('duration', duration);
    fd.append('email', currentUser.email);
    if(file) fd.append('file', file);
    
    const res = await fetch(`${PROXY_BASE}/generate-video`, { method: 'POST', body: fd });
    const data = await res.json();
    
    if (!res.ok) {
      if (data.limitReached) {
        showPremiumModal();
        return;
      }
      throw new Error(data.error || `Server xatosi: ${res.status}`);
    }
    
    if(data && data.video){
      preview.innerHTML = `
        <video src="${data.video}" class="w-full h-full object-cover rounded-xl" controls autoplay muted loop>
          Sizning brauzeringiz video elementni qo'llab-quvvatlamaydi.
        </video>
      `;
      updateGenerationCounter(data.generationsUsed, data.generationsLeft);
    } else {
      throw new Error('No video returned from server.');
    }
  } catch(err){
    console.error(err);
    preview.innerHTML = `<div class="text-red-400 p-4">Xatolik: ${err.message}</div>`;
  }
}

// Video yaratish tugmasini ulash
$('#genVideo').addEventListener('click', async ()=>{
  const prompt = ($('#videoPrompt').value || '').trim();
  const file = $('#videoFile').files[0] || null;
  const duration = $('#videoSec').value || 10;
  
  if(!prompt && !file){ 
    if(!confirm('Prompt kiritilmagan. Demo video yaratilishini xohlaysizmi?')) return; 
  }
  
  await generateVideoFromAI({ 
    prompt: prompt || 'Creative video scene', 
    file, 
    duration 
  });
});