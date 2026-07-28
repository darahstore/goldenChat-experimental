// main.js - المنسق الرئيسي للتطبيق

document.addEventListener('DOMContentLoaded', () => {
    // 1. تهيئة اللغات وواجهة المستخدم
    if (typeof renderLanguageOptions === 'function') renderLanguageOptions();
    if (typeof updateUI === 'function') updateUI();

    // 2. تهيئة قاعدة البيانات (Supabase)
    if (typeof initSupabaseSafe === 'function') initSupabaseSafe();

    // 3. ربط أحداث شاشة اختيار اللغة
    const btnContinue = document.getElementById('btn-continue');
    if (btnContinue) {
        btnContinue.addEventListener('click', () => {
            if (typeof showView === 'function') showView('auth-view');
        });
    }

    // 4. ربط أحداث تبويبات وأزرار المصادقة
    const tabLogin = document.getElementById('tab-login-btn');
    const tabSignup = document.getElementById('tab-signup-btn');
    const btnSubmitAuth = document.getElementById('btn-submit-auth');

    if (tabLogin) tabLogin.addEventListener('click', () => switchAuthTab('login'));
    if (tabSignup) tabSignup.addEventListener('click', () => switchAuthTab('signup'));
    if (btnSubmitAuth) btnSubmitAuth.addEventListener('click', handleAuthSubmit);

    // 5. ربط أحداث واجهة الدردشة (إرسال، رفع ملفات، تسجيل خروج)
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

    // 6. ربط أحداث المكالمات (Agora)
    const btnCallAudio = document.getElementById('btn-call-audio');
    const btnCallVideo = document.getElementById('btn-call-video');
    const btnEndCall = document.getElementById('btn-end-call');
    const btnToggleMic = document.getElementById('btn-toggle-mic');
    const btnToggleCam = document.getElementById('btn-toggle-cam');

    if (btnCallAudio) btnCallAudio.addEventListener('click', () => joinCall(false));
    if (btnCallVideo) btnCallVideo.addEventListener('click', () => joinCall(true));
    if (btnEndCall) btnEndCall.addEventListener('click', leaveCall);
    if (btnToggleMic) btnToggleMic.addEventListener('click', toggleAudio);
    if (btnToggleCam) btnToggleCam.addEventListener('click', toggleVideo);

    // 7. مراقبة حالة الاتصال بالإنترنت
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // التحقق الأولي من حالة الشبكة عند تحميل التطبيق
    updateNetworkStatus();
});

// تحديث واجهة المستخدم بناءً على حالة الاتصال بالإنترنت
function updateNetworkStatus() {
    const isOnline = navigator.onLine;
    const body = document.body;
    
    if (isOnline) {
        body.classList.remove('grayscale', 'opacity-90');
        console.log("App is Online");
    } else {
        body.classList.add('grayscale', 'opacity-90');
        // عرض تنبيه من قاموس اللغات إن وجد، أو نص افتراضي
        const d = typeof uiDict !== 'undefined' ? uiDict[currentLang] : null;
        alert(d ? (d.offlineMsg || "No internet connection") : "No internet connection. Please check your network.");
    }
}

// إعدادات القائمة الجانبية (Settings)
function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel) {
        panel.classList.toggle('translate-x-full');
    }
}

function closeSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel && !panel.classList.contains('translate-x-full')) {
        panel.classList.add('translate-x-full');
    }
}
