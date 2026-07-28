/* ==========================================================================
   1. الإعدادات والمتغيرات العامة (config.js)
   ========================================================================== */
const SUPABASE_URL = 'https://vfysgxgjahaojrtdagbj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aRu1BBu5Pb29tq-fNYSZIA_PeSrrpoC';

const AGORA_APP_ID = '77a195757c054acaaf8da43c269b2260';
const AGORA_PERMANENT_TOKEN = '00677a195757c054acaaf8da43c269b2260IABQLMitxwtMDMd4/d5F8xLlrQ9ut+mIk0aa9jUYpm13A0UxBjEAAAAAIgBa0EoDD21kagQAAQCPHi99AgCPHi99AwCPHi99BACPHi99';

let supabaseClient = null;
let currentUser = null;
let currentAuthMode = 'login';
let currentLang = 'ar';
let agoraClient = null;
let localAudioTrack = null;
let localVideoTrack = null;
let activeChannel = 'official-golden-chat-id';
let realtimeChannel = null;

/* ==========================================================================
   2. محرك اللغات والترجمة (languages.js)
   ========================================================================== */
const uiDict = {
    ar: { loginTab: "تسجيل الدخول", signupTab: "إنشاء حساب", email: "البريد الإلكتروني", pass: "كلمة المرور", phone: "رقم الهاتف (إجباري مع رمز الدولة +)", btnLogin: "دخول", btnSignup: "إنشاء حساب", offline: "انقطع الاتصال بالإنترنت...", online: "متصل", msgPlaceholder: "اكتب رسالة...", settings: "الإعدادات", langSelect: "لغة التطبيق", myGroups: "مجموعاتي النشطة", logout: "تسجيل الخروج", leave: "مغادرة وحذف", videoLong: "الفيديو يتجاوز 3 دقائق ومرفوض", myChannel: "قناتي الخاصة", generalChat: "المحادثة العامة", dir: "rtl" },
    en: { loginTab: "Log In", signupTab: "Sign Up", email: "Email Address", pass: "Password", phone: "Phone Number (Required with +)", btnLogin: "Log In", btnSignup: "Sign Up", offline: "No Internet Connection...", online: "Online", msgPlaceholder: "Type a message...", settings: "Settings", langSelect: "App Language", myGroups: "My Active Groups", logout: "Log Out", leave: "Leave & Delete", videoLong: "Video exceeds 3 minutes", myChannel: "My Channel", generalChat: "General Chat", dir: "ltr" },
    fr: { loginTab: "Connexion", signupTab: "S'inscrire", email: "Adresse e-mail", pass: "Mot de passe", phone: "Numéro de téléphone (Obligatoire +)", btnLogin: "Connexion", btnSignup: "S'inscrire", offline: "Connexion interrompue...", online: "En ligne", msgPlaceholder: "Écrire un message...", settings: "Paramètres", langSelect: "Langue de l'application", myGroups: "Mes groupes actifs", logout: "Déconnexion", leave: "Quitter et supprimer", videoLong: "La vidéo dépasse 3 minutes", myChannel: "Ma Chaîne", generalChat: "Chat Général", dir: "ltr" },
    // (تم تقليص القائمة هنا للتبسيط، يمكنك ترك باقي اللغات التي كانت في كودك الأصلي كما هي وإضافة myChannel و generalChat لها)
    es: { loginTab: "Iniciar sesión", signupTab: "Registrarse", email: "Correo electrónico", pass: "Contraseña", phone: "Número de teléfono (Requerido con +)", btnLogin: "Entrar", btnSignup: "Registrarse", offline: "Sin conexión...", online: "En línea", msgPlaceholder: "Escribe un mensaje...", settings: "Ajustes", langSelect: "Idioma de la aplicación", myGroups: "Mis grupos activos", logout: "Cerrar sesión", leave: "Salir y eliminar", videoLong: "El video supera los 3 minutos", myChannel: "Mi Canal", generalChat: "Chat General", dir: "ltr" }
};

const extendedLanguages = [
    { code: 'ar', name: 'العربية (Arabic)' }, { code: 'en', name: 'English (UK/US)' }, { code: 'fr', name: 'Français (French)' },
    { code: 'es', name: 'Español (Spanish)' } // أضف باقي اللغات هنا كما كانت في كودك
];

function initLanguagesDropdown() {
    const select = document.getElementById('global-lang-select');
    if(select) {
        select.innerHTML = '';
        extendedLanguages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.innerText = lang.name;
            select.appendChild(option);
        });
        select.value = currentLang;
    }
}

function setLanguageAndProceed(langCode) {
    applyLanguage(langCode);
    if(typeof showView === 'function') showView('auth-view');
    if(typeof switchAuthTab === 'function') switchAuthTab('login');
    if(typeof initSupabaseSafe === 'function') initSupabaseSafe();
}

function changeGlobalLanguage(langCode) {
    applyLanguage(langCode);
    if(typeof closeSettings === 'function') closeSettings();
}

function applyLanguage(langCode) {
    currentLang = uiDict[langCode] ? langCode : 'en'; 
    const d = uiDict[currentLang];
    
    const htmlRoot = document.getElementById('html-root');
    if(htmlRoot) {
        htmlRoot.setAttribute('dir', d.dir);
        htmlRoot.setAttribute('lang', currentLang);
    }
    
    const elementsToUpdate = {
        'tab-login-btn': d.loginTab,
        'tab-signup-btn': d.signupTab,
        'lbl-email': d.email,
        'lbl-pass': d.pass,
        'lbl-phone': d.phone,
        'offline-text': d.offline,
        'user-status': d.online,
        'settings-title': d.settings,
        'lbl-lang-select': d.langSelect,
        'lbl-my-groups': d.myGroups,
        'btn-logout': d.logout,
        'lbl-my-channel': d.myChannel,
        'lbl-general-chat': d.generalChat
    };

    for (const [id, text] of Object.entries(elementsToUpdate)) {
        const el = document.getElementById(id);
        if(el) el.innerText = text;
    }

    const msgInput = document.getElementById('msg-input');
    if(msgInput) msgInput.placeholder = d.msgPlaceholder;

    if(typeof switchAuthTab === 'function') switchAuthTab(currentAuthMode);
}

/* ==========================================================================
   3. المصادقة وإدارة الحسابات (auth.js)
   ========================================================================== */
function switchAuthTab(mode) {
    currentAuthMode = mode;
    const d = uiDict[currentLang];
    const phoneWrapper = document.getElementById('phone-field-wrapper');
    const submitBtn = document.getElementById('btn-submit-auth');
    
    if (mode === 'login') {
        document.getElementById('tab-login-btn').className = "tab-active text-lg pb-2 transition-all font-bold border-b-2 border-gold-400";
        document.getElementById('tab-signup-btn').className = "tab-inactive text-gray-500 text-lg pb-2 transition-all border-b-2 border-transparent";
        if(phoneWrapper) phoneWrapper.style.display = "none";
        if(submitBtn) submitBtn.innerText = d.btnLogin;
    } else {
        document.getElementById('tab-signup-btn').className = "tab-active text-lg pb-2 transition-all font-bold border-b-2 border-gold-400";
        document.getElementById('tab-login-btn').className = "tab-inactive text-gray-500 text-lg pb-2 transition-all border-b-2 border-transparent";
        if(phoneWrapper) phoneWrapper.style.display = "block";
        if(submitBtn) submitBtn.innerText = d.btnSignup;
    }
    validateForm();
}

function validateForm() {
    const emailEl = document.getElementById('email-input');
    const passEl = document.getElementById('password-input');
    const phoneEl = document.getElementById('phone-input');
    const btn = document.getElementById('btn-submit-auth');

    if(!emailEl || !passEl || !btn) return;

    const email = emailEl.value.trim();
    const pass = passEl.value.trim();
    const phone = phoneEl ? phoneEl.value.trim() : '';

    let isValid = email.length > 5 && pass.length >= 6;
    if (currentAuthMode === 'signup') {
        isValid = isValid && phone.length >= 8 && phone.startsWith('+');
    }

    if (isValid) {
        btn.disabled = false;
        btn.className = "w-full bg-gold-500 text-dark-900 p-3.5 rounded-xl font-bold transition hover:bg-gold-400 shadow-md cursor-pointer";
    } else {
        btn.disabled = true;
        btn.className = "w-full bg-gray-600 text-gray-400 p-3.5 rounded-xl font-bold transition shadow-md cursor-not-allowed";
    }
}

function initSupabaseSafe() {
    if (supabaseClient) return;
    try {
        if (window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            checkSession();
        } else {
            setTimeout(initSupabaseSafe, 500);
        }
    } catch (err) { console.error("Supabase Init Error:", err); }
}

async function handleAuthSubmit() {
    if (!supabaseClient) return;
    const email = document.getElementById('email-input').value.trim();
    const password = document.getElementById('password-input').value.trim();
    const phone = document.getElementById('phone-input') ? document.getElementById('phone-input').value.trim() : '';
    const btn = document.getElementById('btn-submit-auth');
    
    if(btn) { btn.innerText = "..."; btn.disabled = true; }

    try {
        if (currentAuthMode === 'login') {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) throw error;
            currentUser = data.user;
        } else {
            const { data, error } = await supabaseClient.auth.signUp({
                email, password, options: { data: { phone_number: phone } }
            });
            if (error) throw error;
            currentUser = data.user;
            
            if (currentUser) {
                await supabaseClient.from('profiles').upsert({
                    id: currentUser.id, email: email, phone_number: phone, updated_at: new Date()
                });
            }
        }
        playAudioTone('login');
        startApp();
    } catch (err) {
        alert("Auth Error: " + err.message);
    } finally {
        switchAuthTab(currentAuthMode); 
    }
}

async function checkSession() {
    try {
        const { data } = await supabaseClient.auth.getSession();
        if (data?.session) {
            currentUser = data.session.user;
            startApp();
        }
    } catch (e) {}
}

async function logoutUser() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
        currentUser = null;
        closeSettings();
        showView('auth-view');
        
        document.getElementById('email-input').value = '';
        document.getElementById('password-input').value = '';
        validateForm();
    }
}

/* ==========================================================================
   4. إدارة الدردشة (chat.js)
   ========================================================================== */
function showView(viewId) {
    const views = ['language-view', 'auth-view', 'main-chat-view'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === viewId) el.classList.remove('hidden-view');
            else el.classList.add('hidden-view');
        }
    });
}

function startApp() {
    showView('main-chat-view');
    loadMessages();
    subscribeToMessages();
}

async function loadMessages() {
    const chatContainer = document.getElementById('chat-messages');
    if(!chatContainer) return;
    chatContainer.innerHTML = ''; 

    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('channel_id', activeChannel)
            .order('created_at', { ascending: true })
            .limit(100);

        if (error) throw error;
        data.forEach(msg => renderMessage(msg));
        scrollToBottom();
    } catch (err) { console.error("Error loading messages:", err); }
}

function subscribeToMessages() {
    if (realtimeChannel) supabaseClient.removeChannel(realtimeChannel);
    
    realtimeChannel = supabaseClient.channel('custom-all-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannel}` },
        (payload) => {
            renderMessage(payload.new);
            scrollToBottom();
            if(payload.new.user_id !== currentUser.id) playAudioTone('receive');
        }
      ).subscribe();
}

function renderMessage(msg) {
    const chatContainer = document.getElementById('chat-messages');
    if(!chatContainer) return;

    const isMine = msg.user_id === currentUser?.id;
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex flex-col max-w-[85%] mb-4 ${isMine ? 'self-end items-end' : 'self-start items-start'}`;

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = `p-3 rounded-2xl break-words ${isMine ? 'bg-gold-500 text-dark-900 rounded-br-none shadow-md' : 'glass-panel text-white rounded-bl-none shadow-md'}`;
    
    if (msg.content && msg.content.trim() !== '') {
        const textSpan = document.createElement('span');
        textSpan.innerText = msg.content;
        bubbleDiv.appendChild(textSpan);
    }

    if (msg.media_url) {
        const mediaWrapper = document.createElement('div');
        mediaWrapper.className = msg.content ? "mt-2" : ""; 
        
        if (msg.media_type === 'image') {
            mediaWrapper.innerHTML = `<img src="${msg.media_url}" class="max-w-full h-auto rounded-lg cursor-pointer" onclick="window.open('${msg.media_url}')" loading="lazy" />`;
        } else if (msg.media_type === 'video') {
            mediaWrapper.innerHTML = `<video src="${msg.media_url}" controls class="max-w-full rounded-lg h-48 bg-black"></video>`;
        } else if (msg.media_type === 'audio') {
            mediaWrapper.innerHTML = `<audio src="${msg.media_url}" controls class="max-w-full mt-1"></audio>`;
        }
        bubbleDiv.appendChild(mediaWrapper);
    }

    const timeSpan = document.createElement('span');
    timeSpan.className = `text-[10px] mt-1 px-1 ${isMine ? 'text-gray-400' : 'text-gray-500'}`;
    timeSpan.innerText = formatTime(msg.created_at);

    msgDiv.appendChild(bubbleDiv);
    msgDiv.appendChild(timeSpan);
    chatContainer.appendChild(msgDiv);
}

async function sendMessage() {
    const input = document.getElementById('msg-input');
    if(!input || !input.value.trim()) return;

    const content = input.value.trim();
    input.value = '';

    try {
        const { error } = await supabaseClient
            .from('messages')
            .insert([{ channel_id: activeChannel, user_id: currentUser.id, content: content, media_url: null, media_type: null }]);

        if (error) throw error;
        playAudioTone('send');
    } catch (err) { console.error("Error sending message:", err); }
}

async function handleFileUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    if (type === 'video') {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = async function() {
            window.URL.revokeObjectURL(video.src);
            if (video.duration > 180) {
                alert(uiDict[currentLang].videoLong);
                return;
            }
            await uploadMediaToSupabase(file, type);
        }
        video.src = URL.createObjectURL(file);
        return; 
    }
    await uploadMediaToSupabase(file, type);
}

async function uploadMediaToSupabase(file, type) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `uploads/${currentUser.id}/${fileName}`;

    try {
        const input = document.getElementById('msg-input');
        const originalPlaceholder = input ? input.placeholder : '';
        if(input) input.placeholder = "جاري الرفع...";

        const { error: uploadError } = await supabaseClient.storage
            .from('chat-media')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabaseClient.storage.from('chat-media').getPublicUrl(filePath);
        
        const { error: msgError } = await supabaseClient
            .from('messages')
            .insert([{ channel_id: activeChannel, user_id: currentUser.id, content: '', media_url: data.publicUrl, media_type: type }]);

        if (msgError) throw msgError;
        playAudioTone('send');
        if(input) input.placeholder = originalPlaceholder;

    } catch (err) { alert("حدث خطأ أثناء رفع الملف."); }
}

function scrollToBottom() {
    const chatContainer = document.getElementById('chat-messages');
    if(chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
}

function formatTime(dateString) {
    const d = new Date(dateString);
    let hours = d.getHours();
    let minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
}

function playAudioTone(type) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if(!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === 'send') {
            osc.frequency.setValueAtTime(500, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.1);
        } else if (type === 'receive') {
            osc.frequency.setValueAtTime(700, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1);
        } else if (type === 'login') {
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
        }

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    } catch(e) {}
}

/* ==========================================================================
   6. المنسق الرئيسي والأحداث العامة (main.js)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // إصلاح الخطأ: استدعاء دالة التهيئة الصحيحة للغات
    initLanguagesDropdown();

    ['email-input', 'password-input', 'phone-input'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', validateForm);
    });

    const msgInput = document.getElementById('msg-input');
    if(msgInput) {
        msgInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') sendMessage();
        });
    }

    if (typeof initSupabaseSafe === 'function') initSupabaseSafe();

    const tabLogin = document.getElementById('tab-login-btn');
    const tabSignup = document.getElementById('tab-signup-btn');
    const btnSubmitAuth = document.getElementById('btn-submit-auth');

    if (tabLogin) tabLogin.addEventListener('click', () => switchAuthTab('login'));
    if (tabSignup) tabSignup.addEventListener('click', () => switchAuthTab('signup'));
    if (btnSubmitAuth) btnSubmitAuth.addEventListener('click', handleAuthSubmit);

    const btnSend = document.getElementById('btn-send');
    if (btnSend) btnSend.addEventListener('click', sendMessage);

    const uploadImg = document.getElementById('upload-img');
    const uploadVid = document.getElementById('upload-vid');
    const uploadAud = document.getElementById('upload-aud');

    if (uploadImg) uploadImg.addEventListener('change', (e) => handleFileUpload(e, 'image'));
    if (uploadVid) uploadVid.addEventListener('change', (e) => handleFileUpload(e, 'video'));
    if (uploadAud) uploadAud.addEventListener('change', (e) => handleFileUpload(e, 'audio'));

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.addEventListener('click', logoutUser);

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();
});

function updateNetworkStatus() {
    const isOnline = navigator.onLine;
    const body = document.body;
    if (isOnline) {
        body.classList.remove('grayscale', 'opacity-90');
    } else {
        body.classList.add('grayscale', 'opacity-90');
        const d = typeof uiDict !== 'undefined' ? uiDict[currentLang] : null;
    }
}

function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel) panel.classList.toggle('translate-x-full');
}

function closeSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel && !panel.classList.contains('translate-x-full')) {
        panel.classList.add('translate-x-full');
    }
}
