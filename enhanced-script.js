// Enhanced DODa AI Client Script
// Year in footer
document.getElementById('y').textContent = new Date().getFullYear();

/* ---------- Utilities ---------- */
const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => Array.from(root.querySelectorAll(q));
const show = el => el && el.classList.remove('hidden');
const hide = el => el && el.classList.add('hidden');

/* ---------- Configuration ---------- */
const API_BASE = 'http://localhost:3000/api';
let currentUser = null;
let generationHistory = [];

/* ---------- UI Elements ---------- */
const promptEl = $('#prompt');
const countEl = $('#count');
const videoPromptEl = $('#videoPrompt');
const preview = $('#preview');
const fileInput = $('#file');
const fileNameEl = $('#fileName');
const fileDrop = $('#fileDrop');
const videoFileInput = $('#videoFile');
const videoFileNameEl = $('#videoFileName');
const videoFileDrop = $('#videoFileDrop');

/* ---------- Prompt counter ---------- */
promptEl?.addEventListener('input', () => { 
  if (countEl) countEl.textContent = promptEl.value.length; 
});

/* ---------- Duration sliders ---------- */
const sec = $('#sec');
const secVal = $('#secVal');
sec?.addEventListener('input', () => { 
  if (secVal) secVal.textContent = sec.value + 's'; 
});

const videoSec = $('#videoSec');
const videoSecVal = $('#videoSecVal');
videoSec?.addEventListener('input', () => { 
  if (videoSecVal) videoSecVal.textContent = videoSec.value + 's'; 
});

/* ---------- Ratio buttons ---------- */
$$('.ratio-btn').forEach(btn => btn.addEventListener('click', () => {
  $$('.ratio-btn').forEach(b => b.classList.remove('bg-white/12'));
  btn.classList.add('bg-white/12');
}));

/* ---------- File handling ---------- */
function setupFileInput(dropEl, inputEl, nameEl, accept = 'image/*') {
  if (!dropEl || !inputEl || !nameEl) return;

  dropEl.addEventListener('click', () => inputEl.click());
  
  inputEl.addEventListener('change', (e) => {
    const f = e.target.files[0];
    nameEl.textContent = f ? `${f.name} (${Math.round(f.size/1024)}KB)` : 'Fayl tanlanmagan';
  });

  // Drag and drop
  dropEl.addEventListener('dragover', e => { 
    e.preventDefault(); 
    dropEl.classList.add('bg-white/3'); 
  });
  
  dropEl.addEventListener('dragleave', () => { 
    dropEl.classList.remove('bg-white/3'); 
  });
  
  dropEl.addEventListener('drop', e => {
    e.preventDefault(); 
    dropEl.classList.remove('bg-white/3');
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith(accept.split('/')[0])) { 
      inputEl.files = e.dataTransfer.files; 
      nameEl.textContent = `${f.name} (${Math.round(f.size/1024)}KB)`; 
    }
  });
}

setupFileInput(fileDrop, fileInput, fileNameEl, 'image/*');
setupFileInput(videoFileDrop, videoFileInput, videoFileNameEl, 'video/*');

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
  loadUserStats();
}

function getUserByEmail(email) { 
  return getUsers().find(u => u.email && u.email.toLowerCase() === email.toLowerCase()); 
}

/* ---------- Auth UI ---------- */
const btnOpenAuthHeader = $('#btnOpenAuthHeader');
const btnLogoutHeader = $('#btnLogoutHeader');
const authOverlay = $('#authOverlay');
const authCard = $('#authCard');
const btnCloseAuth = $('#btnCloseAuth');
const tabLogin = $('#tabLogin');
const tabRegister = $('#tabRegister');
const formLogin = $('#formLogin');
const formRegister = $('#formRegister');

function openAuth(which = 'login') {
  show(authOverlay); 
  show(authCard);
  authCard.classList.remove('hidden');
  
  if (which === 'register') { 
    show(formRegister); 
    hide(formLogin); 
    tabRegister.classList.add('bg-white/8'); 
    tabLogin.classList.remove('bg-white/8'); 
  } else { 
    show(formLogin); 
    hide(formRegister); 
    tabLogin.classList.add('bg-white/8'); 
    tabRegister.classList.remove('bg-white/8'); 
  }
}

function closeAuth() { 
  hide(authOverlay); 
  hide(authCard); 
}

function updateAuthUI() {
  const cur = getCurrent();
  const sidebarUserName = $('#sidebarUserName');
  
  if (cur && cur.email) {
    hide(btnOpenAuthHeader);
    show(btnLogoutHeader);
    if (sidebarUserName) {
      const user = getUserByEmail(cur.email);
      sidebarUserName.textContent = user?.name || cur.email.split('@')[0];
    }
  } else {
    show(btnOpenAuthHeader);
    hide(btnLogoutHeader);
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

/* ---------- Telegram notifications ---------- */
async function notifyTelegram(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.error('Telegram notification error:', error);
    return { success: false, error: error.message };
  }
}

/* ---------- Auth forms ---------- */
formRegister?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const regError = $('#regError');
  const regName = $('#regName');
  const regEmail = $('#regEmail');
  const regPassword = $('#regPassword');
  
  if (regError) { regError.textContent = ''; hide(regError); }
  
  const name = regName.value.trim();
  const email = regEmail.value.trim();
  const pass = regPassword.value;
  
  if (!name) { 
    if (regError) { regError.textContent = 'Ism kiriting.'; show(regError); }
    return; 
  }
  if (!email || !email.includes('@')) { 
    if (regError) { regError.textContent = 'To\'g\'ri email kiriting.'; show(regError); }
    return; 
  }
  if (pass.length < 6) { 
    if (regError) { regError.textContent = 'Parol kamida 6 belgidan.'; show(regError); }
    return; 
  }
  if (getUserByEmail(email)) { 
    if (regError) { regError.textContent = 'Bu email bilan hisob mavjud.'; show(regError); }
    return; 
  }
  
  const users = getUsers(); 
  users.push({ name, email, pass }); 
  setUsers(users); 
  setCurrent(email);
  
  // Notify Telegram
  await notifyTelegram('notify-register', { email, name });
  
  regName.value = ''; 
  regEmail.value = ''; 
  regPassword.value = ''; 
  closeAuth();
});

formLogin?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const loginError = $('#loginError');
  const loginEmail = $('#loginEmail');
  const loginPassword = $('#loginPassword');
  
  if (loginError) { loginError.textContent = ''; hide(loginError); }
  
  const email = loginEmail.value.trim();
  const pass = loginPassword.value;
  const u = getUserByEmail(email);
  
  if (!u || u.pass !== pass) { 
    if (loginError) { loginError.textContent = 'Email yoki parol noto\'g\'ri.'; show(loginError); }
    return; 
  }
  
  setCurrent(email);
  
  // Notify Telegram
  await notifyTelegram('notify-login', { email, name: u.name });
  
  loginEmail.value = ''; 
  loginPassword.value = ''; 
  closeAuth();
});

/* ---------- User stats ---------- */
async function loadUserStats() {
  const user = getCurrent();
  if (!user?.email) return;

  try {
    const response = await fetch(`${API_BASE}/user-stats?email=${encodeURIComponent(user.email)}`);
    const data = await response.json();
    
    if (data.success !== false) {
      updateStatsUI(data);
    }
  } catch (error) {
    console.error('Stats loading error:', error);
  }
}

function updateStatsUI(stats) {
  // Update sidebar user info
  const sidebarUserSection = $('#sidebarUserSection');
  if (sidebarUserSection) {
    const statusEl = sidebarUserSection.querySelector('.text-xs');
    if (statusEl) {
      statusEl.textContent = stats.isPremium ? 'Premium' : `${stats.generationsLeft} qoldi`;
    }
  }
}

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

function showPremiumModal() {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="glass rounded-2xl p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-bold mb-4">🚀 Bepul Chegara Tugadi</h3>
        <p class="mb-4 text-white/80">Siz kunlik 10 ta bepul generatsiyadan foydalandingiz. Cheksiz generatsiya qilish uchun premium obuna sotib oling.</p>
        <div class="flex gap-3">
          <button onclick="closePremiumModal()" class="flex-1 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition">Keyinroq</button>
          <button onclick="redirectToPricing()" class="flex-1 btn-grad px-4 py-2 rounded-xl font-semibold">Premium Bo'lish</button>
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
  const pricingSection = document.getElementById('pricing');
  if (pricingSection) {
    pricingSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Make functions global
window.closePremiumModal = closePremiumModal;
window.redirectToPricing = redirectToPricing;

async function generateImage() {
  const user = getCurrent();
  if (!user?.email) {
    alert('Iltimos, avval tizimga kiring.');
    openAuth('login');
    return;
  }

  const prompt = promptEl?.value?.trim() || '';
  const file = fileInput?.files[0] || null;
  const provider = document.querySelector('input[name="imageProvider"]:checked')?.value || 'auto';

  if (!prompt && !file) {
    if (!confirm('Prompt kiritilmagan. Demo rasm yaratilishini xohlaysizmi?')) return;
  }

  showLoadingState('AI rasm yaratilmoqda...');

  try {
    const formData = new FormData();
    formData.append('prompt', prompt || 'Creative scene');
    formData.append('email', user.email);
    formData.append('provider', provider);
    formData.append('size', '1024x1024');
    if (file) formData.append('file', file);

    const response = await fetch(`${API_BASE}/generate-image`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.limitReached) {
        showPremiumModal();
        return;
      }
      throw new Error(data.error || `Server xatosi: ${response.status}`);
    }

    if (data.success && data.image) {
      preview.innerHTML = `
        <div class="relative h-full group">
          <img src="${data.image}" class="w-full h-full object-cover rounded-xl" alt="AI Generated Image">
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-xl"></div>
          <div class="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="font-medium">${data.provider.toUpperCase()}</span>
              <span class="text-xs opacity-75">${data.generationsLeft} qoldi</span>
            </div>
          </div>
          <div class="absolute top-4 right-4 bg-green-500/20 backdrop-blur-sm text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/30">
            ✓ Tayyor
          </div>
        </div>
      `;
      
      // Show generation info
      const infoEl = document.getElementById('generationInfo');
      if (infoEl) {
        infoEl.classList.remove('hidden');
        document.getElementById('generationTime').textContent = `Vaqt: ${new Date().toLocaleTimeString()}`;
        document.getElementById('generationProvider').textContent = `Provider: ${data.provider}`;
        document.getElementById('generationSize').textContent = `Hajm: 1024x1024`;
      }
      
      // Update stats
      loadUserStats();
      
      // Add to history
      generationHistory.unshift({
        type: 'image',
        prompt: prompt || 'Creative scene',
        result: data.image,
        timestamp: Date.now(),
        provider: data.provider
      });
      
    } else {
      throw new Error('Rasm yaratilmadi');
    }
  } catch (error) {
    console.error('Image generation error:', error);
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

  const prompt = videoPromptEl?.value?.trim() || '';
  const file = videoFileInput?.files[0] || null;
  const duration = videoSec?.value || 10;
  const provider = document.querySelector('input[name="videoProvider"]:checked')?.value || 'auto';

  if (!prompt && !file) {
    if (!confirm('Prompt kiritilmagan. Demo video yaratilishini xohlaysizmi?')) return;
  }

  showLoadingState('AI video yaratilmoqda...');

  try {
    const formData = new FormData();
    formData.append('prompt', prompt || 'Creative video scene');
    formData.append('email', user.email);
    formData.append('provider', provider);
    formData.append('duration', duration);
    if (file) formData.append('file', file);

    const response = await fetch(`${API_BASE}/generate-video`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.limitReached) {
        showPremiumModal();
        return;
      }
      throw new Error(data.error || `Server xatosi: ${response.status}`);
    }

    if (data.success && data.video) {
      preview.innerHTML = `
        <div class="relative h-full group">
          <video src="${data.video}" class="w-full h-full object-cover rounded-xl" controls autoplay muted loop>
            Sizning brauzeringiz video elementni qo'llab-quvvatlamaydi.
          </video>
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-xl pointer-events-none"></div>
          <div class="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="font-medium">${data.provider.toUpperCase()} • ${duration}s</span>
              <span class="text-xs opacity-75">${data.generationsLeft} qoldi</span>
            </div>
          </div>
          <div class="absolute top-4 right-4 bg-green-500/20 backdrop-blur-sm text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/30">
            ✓ Tayyor
          </div>
        </div>
      `;
      
      // Show generation info
      const infoEl = document.getElementById('generationInfo');
      if (infoEl) {
        infoEl.classList.remove('hidden');
        document.getElementById('generationTime').textContent = `Vaqt: ${new Date().toLocaleTimeString()}`;
        document.getElementById('generationProvider').textContent = `Provider: ${data.provider}`;
        document.getElementById('generationSize').textContent = `Davomiyligi: ${duration}s`;
      }
      
      // Update stats
      loadUserStats();
      
      // Add to history
      generationHistory.unshift({
        type: 'video',
        prompt: prompt || 'Creative video scene',
        result: data.video,
        timestamp: Date.now(),
        provider: data.provider,
        duration: duration
      });
      
    } else {
      throw new Error('Video yaratilmadi');
    }
  } catch (error) {
    console.error('Video generation error:', error);
    showError(error.message);
  }
}

/* ---------- Button event listeners ---------- */
$('#genImage')?.addEventListener('click', generateImage);
$('#genVideo')?.addEventListener('click', generateVideo);

/* ---------- Enhanced functionality ---------- */
$('#downloadBtn')?.addEventListener('click', () => {
  const img = preview?.querySelector('img');
  const video = preview?.querySelector('video');
  
  if (img) {
    const link = document.createElement('a');
    link.href = img.src;
    link.download = `doda-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    // Show success message
    showNotification('Rasm yuklab olindi!', 'success');
  } else if (video) {
    const link = document.createElement('a');
    link.href = video.src;
    link.download = `doda-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    // Show success message
    showNotification('Video yuklab olindi!', 'success');
  } else {
    showNotification('Oldin natija yarating.', 'warning');
  }
});

// Share functionality
$('#shareBtn')?.addEventListener('click', () => {
  const img = preview?.querySelector('img');
  const video = preview?.querySelector('video');
  
  if (img || video) {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'DODa AI - Mening yaratganim',
        text: 'DODa AI yordamida yaratilgan',
        url: url
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(url).then(() => {
        showNotification('Havola nusxalandi!', 'success');
      });
    }
  } else {
    showNotification('Oldin natija yarating.', 'warning');
  }
});

// Regenerate functionality
$('#regenerateBtn')?.addEventListener('click', () => {
  const lastPrompt = promptEl?.value || videoPromptEl?.value;
  if (lastPrompt) {
    // Check which tab is active and regenerate
    const activeTab = document.querySelector('.sidebar-sublink.active');
    if (activeTab?.textContent.includes('Video')) {
      generateVideo();
    } else {
      generateImage();
    }
  } else {
    showNotification('Oldin prompt kiriting.', 'warning');
  }
});

// Notification system
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform translate-x-full`;
  
  const colors = {
    success: 'bg-green-500/20 border border-green-500/30 text-green-400',
    warning: 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400',
    error: 'bg-red-500/20 border border-red-500/30 text-red-400',
    info: 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
  };
  
  notification.className += ` ${colors[type]}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);
  
  // Animate out and remove
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

/* ---------- Pricing toggle ---------- */
const monthly = $('#monthly');
const yearly = $('#yearly');
const tabMonthly = $('#tabMonthly');
const tabYearly = $('#tabYearly');
const sliderIndicator = $('#sliderIndicator');

function setMonthly() {
  if (monthly) monthly.classList.remove('hidden');
  if (yearly) yearly.classList.add('hidden');
  if (tabMonthly) {
    tabMonthly.classList.add('text-white');
    tabMonthly.classList.remove('text-white/70');
  }
  if (tabYearly) {
    tabYearly.classList.add('text-white/70');
    tabYearly.classList.remove('text-white');
  }
  if (sliderIndicator) sliderIndicator.style.transform = 'translateX(0)';
}

function setYearly() {
  if (monthly) monthly.classList.add('hidden');
  if (yearly) yearly.classList.remove('hidden');
  if (tabYearly) {
    tabYearly.classList.add('text-white');
    tabYearly.classList.remove('text-white/70');
  }
  if (tabMonthly) {
    tabMonthly.classList.add('text-white/70');
    tabMonthly.classList.remove('text-white');
  }
  if (sliderIndicator) sliderIndicator.style.transform = 'translateX(104px)';
}

tabMonthly?.addEventListener('click', setMonthly);
tabYearly?.addEventListener('click', setYearly);
setMonthly();

/* ---------- Subscribe buttons ---------- */
$$('.subscribe-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const cur = getCurrent();
    if (!cur?.email) {
      openAuth('login');
      setTimeout(() => { 
        const loginError = $('#loginError');
        if (loginError) {
          loginError.textContent = 'Davom etish uchun avval tizimga kiring.'; 
          show(loginError); 
        }
      }, 60);
      return;
    }
    const url = btn.dataset.link;
    if (!url) { 
      alert('Stripe havolasi mavjud emas.'); 
      return; 
    }
    window.location.href = url;
  });
});

/* ---------- Sidebar functionality ---------- */
const sidebar = $('#sidebar');
const sidebarToggle = $('#sidebarToggle');
const sidebarOverlay = $('#sidebarOverlay');
const mainContent = $('#mainContent');

function toggleSidebar() {
  if (sidebar && mainContent) {
    sidebar.classList.toggle('-translate-x-full');
    if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
  }
}

sidebarToggle?.addEventListener('click', toggleSidebar);
sidebarOverlay?.addEventListener('click', toggleSidebar);

// Sidebar dropdown functionality
$$('.sidebar-dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    const dropdown = toggle.closest('.sidebar-dropdown');
    const menu = dropdown?.querySelector('.sidebar-dropdown-menu');
    const arrow = toggle.querySelector('.sidebar-dropdown-arrow');
    
    if (menu && arrow) {
      menu.classList.toggle('hidden');
      arrow.style.transform = menu.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    }
  });
});

/* ---------- Initialization ---------- */
document.addEventListener('DOMContentLoaded', () => {
  currentUser = getCurrent();
  updateAuthUI();
  loadUserStats();
  
  // Initialize preview with demo video
  if (preview && !preview.innerHTML.trim()) {
    preview.innerHTML = `
      <video src="aivideo.mp4" class="w-full h-full object-cover rounded-xl" autoplay muted loop>
        Sizning brauzeringiz video elementni qo'llab-quvvatlamaydi.
      </video>
    `;
  }
  
  console.log('🚀 Enhanced DODa AI Client initialized');
});

/* ---------- Real-time updates ---------- */
setInterval(() => {
  if (currentUser) {
    loadUserStats();
  }
}, 30000); // Update every 30 seconds
