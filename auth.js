// تبديل تبويبات المصادقة (تسجيل الدخول / إنشاء حساب)
function switchAuthTab(mode) {
    currentAuthMode = mode;
    const d = uiDict[currentLang];
    const phoneWrapper = document.getElementById('phone-field-wrapper');
    const submitBtn = document.getElementById('btn-submit-auth');
    
    if (mode === 'login') {
        document.getElementById('tab-login-btn').className = "tab-active text-lg pb-2 transition-all";
        document.getElementById('tab-signup-btn').className = "tab-inactive text-lg pb-2 transition-all";
        if(phoneWrapper) phoneWrapper.style.display = "none";
        if(submitBtn) submitBtn.innerText = d.btnLogin;
    } else {
        document.getElementById('tab-signup-btn').className = "tab-active text-lg pb-2 transition-all";
        document.getElementById('tab-login-btn').className = "tab-inactive text-lg pb-2 transition-all";
        if(phoneWrapper) phoneWrapper.style.display = "block";
        if(submitBtn) submitBtn.innerText = d.btnSignup;
    }
    validateForm();
}

// التحقق من صحة المدخلات في النموذج
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
        isValid = isValid && phone.length >= 8 && phone.startsWith('+'); // هاتف إجباري مع +
    }

    if (isValid) {
        btn.disabled = false;
        btn.className = "w-full bg-gold-500 text-dark-900 p-3.5 rounded-xl font-bold transition hover:bg-gold-400 shadow-md cursor-pointer";
    } else {
        btn.disabled = true;
        btn.className = "w-full bg-gray-600 text-gray-400 p-3.5 rounded-xl font-bold transition shadow-md cursor-not-allowed";
    }
}

// ربط مستمعي الأحداث لحقول الإدخال
document.addEventListener('DOMContentLoaded', () => {
    ['email-input', 'password-input', 'phone-input'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', validateForm);
    });
});

// تهيئة Supabase بأمان تام
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

// معالجة إرسال نموذج المصادقة
async function handleAuthSubmit() {
    if (!supabaseClient) return;
    const email = document.getElementById('email-input').value.trim();
    const password = document.getElementById('password-input').value.trim();
    const phone = document.getElementById('phone-input') ? document.getElementById('phone-input').value.trim() : '';
    const btn = document.getElementById('btn-submit-auth');
    
    if(btn) {
        btn.innerText = "...";
        btn.disabled = true;
    }

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
        if(typeof playAudioTone === 'function') playAudioTone('login');
        if(typeof startApp === 'function') startApp();
    } catch (err) {
        alert("Auth Error: " + err.message);
    } finally {
        switchAuthTab(currentAuthMode); 
    }
}

// التحقق من الجلسة النشطة مسبقاً
async function checkSession() {
    try {
        const { data } = await supabaseClient.auth.getSession();
        if (data?.session) {
            currentUser = data.session.user;
            if(typeof startApp === 'function') startApp();
        }
    } catch (e) {}
}

// تسجيل الخروج
async function logoutUser() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
        currentUser = null;
        if(typeof closeSettings === 'function') closeSettings();
        if(typeof showView === 'function') showView('auth-view');
        
        const emailInput = document.getElementById('email-input');
        const passInput = document.getElementById('password-input');
        if(emailInput) emailInput.value = '';
        if(passInput) passInput.value = '';
        validateForm();
    }
}
