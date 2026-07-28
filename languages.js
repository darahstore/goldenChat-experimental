// محرك اللغات المصغر للواجهة (كامل بدون أي اختصار)
const uiDict = {
    ar: { loginTab: "تسجيل الدخول", signupTab: "إنشاء حساب", email: "البريد الإلكتروني", pass: "كلمة المرور", phone: "رقم الهاتف (إجباري مع رمز الدولة +)", btnLogin: "دخول", btnSignup: "إنشاء حساب", offline: "انقطع الاتصال بالإنترنت...", online: "متصل", msgPlaceholder: "اكتب رسالة...", settings: "الإعدادات", langSelect: "لغة التطبيق", myGroups: "مجموعاتي النشطة", logout: "تسجيل الخروج", leave: "مغادرة وحذف", videoLong: "الفيديو يتجاوز 3 دقائق ومرفوض", dir: "rtl" },
    en: { loginTab: "Log In", signupTab: "Sign Up", email: "Email Address", pass: "Password", phone: "Phone Number (Required with +)", btnLogin: "Log In", btnSignup: "Sign Up", offline: "No Internet Connection...", online: "Online", msgPlaceholder: "Type a message...", settings: "Settings", langSelect: "App Language", myGroups: "My Active Groups", logout: "Log Out", leave: "Leave & Delete", videoLong: "Video exceeds 3 minutes", dir: "ltr" },
    fr: { loginTab: "Connexion", signupTab: "S'inscrire", email: "Adresse e-mail", pass: "Mot de passe", phone: "Numéro de téléphone (Obligatoire +)", btnLogin: "Connexion", btnSignup: "S'inscrire", offline: "Connexion interrompue...", online: "En ligne", msgPlaceholder: "Écrire un message...", settings: "Paramètres", langSelect: "Langue de l'application", myGroups: "Mes groupes actifs", logout: "Déconnexion", leave: "Quitter et supprimer", videoLong: "La vidéo dépasse 3 minutes", dir: "ltr" },
    es: { loginTab: "Iniciar sesión", signupTab: "Registrarse", email: "Correo electrónico", pass: "Contraseña", phone: "Número de teléfono (Requerido con +)", btnLogin: "Entrar", btnSignup: "Registrarse", offline: "Sin conexión...", online: "En línea", msgPlaceholder: "Escribe un mensaje...", settings: "Ajustes", langSelect: "Idioma de la aplicación", myGroups: "Mis grupos activos", logout: "Cerrar sesión", leave: "Salir y eliminar", videoLong: "El video supera los 3 minutos", dir: "ltr" },
    de: { loginTab: "Anmelden", signupTab: "Registrieren", email: "E-Mail-Adresse", pass: "Passwort", phone: "Telefonnummer (Erforderlich mit +)", btnLogin: "Anmelden", btnSignup: "Registrieren", offline: "Keine Internetverbindung...", online: "Online", msgPlaceholder: "Nachricht schreiben...", settings: "Einstellungen", langSelect: "App-Sprache", myGroups: "Meine aktiven Gruppen", logout: "Abmelden", leave: "Verlassen & Löschen", videoLong: "Video überschreitet 3 Minuten", dir: "ltr" },
    it: { loginTab: "Accedi", signupTab: "Registrati", email: "Indirizzo e-mail", pass: "Password", phone: "Numero di telefono (Obbligatorio con +)", btnLogin: "Accedi", btnSignup: "Registrati", offline: "Connessione assente...", online: "Online", msgPlaceholder: "Scrivi un messaggio...", settings: "Impostazioni", langSelect: "Lingua app", myGroups: "I miei gruppi attivi", logout: "Esci", leave: "Lascia ed elimina", videoLong: "Il video supera i 3 minuti", dir: "ltr" },
    pt: { loginTab: "Entrar", signupTab: "Cadastrar", email: "E-mail", pass: "Senha", phone: "Número de telefone (Obrigatório com +)", btnLogin: "Entrar", btnSignup: "Cadastrar", offline: "Sem conexão...", online: "Online", msgPlaceholder: "Digite uma mensagem...", settings: "Configurações", langSelect: "Idioma do aplicativo", myGroups: "Meus grupos ativos", logout: "Sair", leave: "Sair e excluir", videoLong: "O vídeo excede 3 minutos", dir: "ltr" },
    ru: { loginTab: "Вход", signupTab: "Регистрация", email: "Эл. почта", pass: "Пароль", phone: "Номер телефона (Обязательно с +)", btnLogin: "Войти", btnSignup: "Регистрация", offline: "Нет интернета...", online: "В сети", msgPlaceholder: "Введите сообщение...", settings: "Настройки", langSelect: "Язык приложения", myGroups: "Мои группы", logout: "Выйти", leave: "Покинуть и удалить", videoLong: "Видео превышает 3 минуты", dir: "ltr" },
    zh: { loginTab: "登录", signupTab: "注册", email: "电子邮箱", pass: "密码", phone: "手机号 (须带 +)", btnLogin: "登录", btnSignup: "注册", offline: "无网络连接...", online: "在线", msgPlaceholder: "输入消息...", settings: "设置", langSelect: "应用语言", myGroups: "我的群组", logout: "登出", leave: "离开并删除", videoLong: "视频超过3分钟", dir: "ltr" },
    ja: { loginTab: "ログイン", signupTab: "登録", email: "メールアドレス", pass: "パスワード", phone: "電話番号 (+付き)", btnLogin: "ログイン", btnSignup: "登録", offline: "接続なし...", online: "オンライン", msgPlaceholder: "メッセージを入力...", settings: "設定", langSelect: "アプリ言語", myGroups: "参加グループ", logout: "ログアウト", leave: "退出して削除", videoLong: "動画が3分を超えています", dir: "ltr" },
    ko: { loginTab: "로그인", signupTab: "회원가입", email: "이메일", pass: "비밀번호", phone: "전화번호 (+ 포함 필수)", btnLogin: "로그인", 정Signup: "회원가입", offline: "연결 끊김...", online: "온라인", msgPlaceholder: "메시지 입력...", settings: "설정", langSelect: "앱 언어", myGroups: "내 활성 그룹", logout: "로그아웃", leave: "나가기 및 삭제", videoLong: "영상이 3분을 초과함", dir: "ltr" },
    hi: { loginTab: "लॉग इन", signupTab: "सााइन अप", email: "ईमेल पता", pass: "पासवर्ड", phone: "फ़ोन नंबर (+ के साथ आवश्यक)", btnLogin: "लॉग इन", btnSignup: "सााइन अप", offline: "इंटरनेट नहीं है...", online: "ऑनलाइन", msgPlaceholder: "संदेश लिखें...", settings: "सेटिंग्स", langSelect: "ऐप भाषा", myGroups: "मेरे सक्रिय समूह", logout: "लॉग आउट", leave: "छोड़ें और हटाएं", videoLong: "वीडियो 3 मिनट से अधिक है", dir: "ltr" },
    ur: { loginTab: "لاگ ان", signupTab: "سائن اپ", email: "ای میل پتہ", pass: "پاس ورڈ", phone: "فون نمبر (+ کے ساتھ ضروری)", btnLogin: "لاگ ان", btnSignup: "سائن اپ", offline: "انٹرنیٹ نہیں ہے...", online: "آن لائن", msgPlaceholder: "پیغام لکھیں...", settings: "ترتیبات", langSelect: "پہچان کی زبان", myGroups: "میرے گروپس", logout: "لاگ آؤٹ", leave: "چھوڑیں اور حذف کریں", videoLong: "ویڈیو 3 منٹ سے زیادہ ہے", dir: "rtl" },
    tr: { loginTab: "Giriş Yap", signupTab: "Kayıt Ol", email: "E-posta Adresi", pass: "Şifre", phone: "Telefon Numarası (+ ile zorunlu)", btnLogin: "Giriş", btnSignup: "Kayıt Ol", offline: "Bağlantı yok...", online: "Çevrimiçi", msgPlaceholder: "Bir mesaj yazın...", settings: "Ayarlar", langSelect: "Uygulama Dili", myGroups: "Aktif Gruplarım", logout: "Çıkış Yap", leave: "Ayrıl ve Sil", videoLong: "Video 3 dakikayı aşıyor", dir: "ltr" },
    id: { loginTab: "Masuk", signupTab: "Daftar", email: "Alamat Email", pass: "Kata Sandi", phone: "Nomor Telepon (Wajib dengan +)", btnLogin: "Masuk", btnSignup: "Daftar", offline: "Tidak ada internet...", online: "Online", msgPlaceholder: "Ketik pesan...", settings: "Pengaturan", langSelect: "Bahasa Aplikasi", myGroups: "Grup Aktif Saya", logout: "Keluar", leave: "Keluar & Hapus", videoLong: "Video melebihi 3 menit", dir: "ltr" },
    nl: { loginTab: "Inloggen", signupTab: "Aanmelden", email: "E-mailadres", pass: "Wachtwoord", phone: "Telefoonnummer (Verplicht met +)", btnLogin: "Inloggen", btnSignup: "Aanmelden", offline: "Geen internetverbinding...", online: "Online", msgPlaceholder: "Typ een bericht...", settings: "Instellingen", langSelect: "App-taal", myGroups: "Mijn actieve groepen", logout: "Uitloggen", leave: "Verlaten & verwijderen", videoLong: "Video is langer dan 3 minuten", dir: "ltr" },
    pl: { loginTab: "Zaloguj", signupTab: "Zarejestruj", email: "Adres e-mail", pass: "Hasło", phone: "Numer telefonu (Wymagany z +)", btnLogin: "Zaloguj", btnSignup: "Zarejestruj", offline: "Brak połączenia...", online: "Online", msgPlaceholder: "Wpisz wiadomość...", settings: "Ustawienia", langSelect: "Język aplikacji", myGroups: "Moje aktywne grupy", logout: "Wyloguj", leave: "Opuść i usuń", videoLong: "Wideo przekracza 3 minuty", dir: "ltr" },
    sv: { loginTab: "Logga in", signupTab: "Registrera", email: "E-postadress", pass: "Lösenord", phone: "Telefonnummer (Krävs med +)", btnLogin: "Logga in", btnSignup: "Registrera", offline: "Ingen internetanslutning...", online: "Online", msgPlaceholder: "Skriv ett meddelande...", settings: "Inställningar", langSelect: "App-språk", myGroups: "Mina aktiva grupper", logout: "Logga ut", leave: "Lämna & radera", videoLong: "Videon överstiger 3 minuter", dir: "ltr" },
    fa: { loginTab: "ورود", signupTab: "ثبت‌نام", email: "ایمیل", pass: "رمز عبور", phone: "شماره تلفن (الزامی با +)", btnLogin: "ورود", btnSignup: "ثبت‌نام", offline: "قطع ارتباط با اینترنت...", online: "آنلاین", msgPlaceholder: "پیامی بنویسید...", settings: "تنظیمات", langSelect: "زبان برنامه", myGroups: "گروه‌های فعال من", logout: "خروج", leave: "ترك و حذف", videoLong: "ویدیو بیش از ۳ دقیقه است", dir: "rtl" },
    bn: { loginTab: "লগইন", signupTab: "সাইন আপ", email: "ইমেইল ঠিকানা", pass: "পাসওয়ার্ড", phone: "ফোন নম্বর (+ সহ আবশ্যক)", btnLogin: "লগইন", btnSignup: "সাইন আপ", offline: "ইন্টারনেট সংযোগ বিচ্ছিন্ন...", online: "অনলাইন", msgPlaceholder: "একটি বার্তা লিখুন...", settings: "সেটিংস", langSelect: "অ্যাপের ভাষা", myGroups: "আমার সক্রিয় গ্রুপ", logout: "লগআউট", leave: "ত্যাগ করুন এবং মুছুন", videoLong: "ভিডিওটি ৩ মিনিটের বেশি", dir: "ltr" }
};

// توليد قائمة اللغات الممتدة
const extendedLanguages = [
    { code: 'ar', name: 'العربية (Arabic)' }, { code: 'en', name: 'English (UK/US)' }, { code: 'fr', name: 'Français (French)' },
    { code: 'es', name: 'Español (Spanish)' }, { code: 'de', name: 'Deutsch (German)' }, { code: 'it', name: 'Italiano (Italian)' },
    { code: 'pt', name: 'Português (Portuguese)' }, { code: 'ru', name: 'Русский (Russian)' }, { code: 'zh', name: '中文 (Chinese)' },
    { code: 'ja', name: '日本語 (Japanese)' }, { code: 'ko', name: '한국어 (Korean)' }, { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'ur', name: 'اردو (Urdu)' }, { code: 'tr', name: 'Türkçe (Turkish)' }, { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'nl', name: 'Nederlands (Dutch)' }, { code: 'pl', name: 'Polski (Polish)' }, { code: 'sv', name: 'Svenska (Swedish)' },
    { code: 'fa', name: 'فارسی (Persian)' }, { code: 'bn', name: 'বাংলা (Bengali)' }
];

// تهيئة قائمة اللغات في الإعدادات
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
    }
}

// اختيار اللغة والمتابعة للتسجيل
function setLanguageAndProceed(langCode) {
    applyLanguage(langCode);
    if(typeof showView === 'function') showView('auth-view');
    if(typeof switchAuthTab === 'function') switchAuthTab('login');
    if(typeof initSupabaseSafe === 'function') initSupabaseSafe();
}

// تغيير اللغة من الإعدادات
function changeGlobalLanguage(langCode) {
    applyLanguage(langCode);
    if(typeof closeSettings === 'function') closeSettings();
}

// تطبيق اللغة على واجهة المستخدم
function applyLanguage(langCode) {
    currentLang = uiDict[langCode] ? langCode : 'en'; 
    const d = uiDict[currentLang];
    
    const htmlRoot = document.getElementById('html-root');
    if(htmlRoot) {
        htmlRoot.setAttribute('dir', d.dir);
        htmlRoot.setAttribute('lang', currentLang);
    }
    
    const langSelect = document.getElementById('global-lang-select');
    if(langSelect) langSelect.value = currentLang;
    
    // تحديث النصوص في الواجهة
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
        'btn-logout': d.logout
    };

    for (const [id, text] of Object.entries(elementsToUpdate)) {
        const el = document.getElementById(id);
        if(el) el.innerText = text;
    }

    const msgInput = document.getElementById('msg-input');
    if(msgInput) msgInput.placeholder = d.msgPlaceholder;

    // تحديث زر الإرسال بناءً على وضع المصادقة الحالي
    if(typeof switchAuthTab === 'function') switchAuthTab(currentAuthMode);
}
