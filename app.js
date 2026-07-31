// ==========================================
// 1. المتغيرات الصوتية العامة وإدارة التخزين
// ==========================================
const sebhaClickSound = new Audio('sebha-click.mp3'); 
const adhanAudio = new Audio('adhan.mp3');            

// إدارة حالة التطبيق والتخزين المحلي
const StorageManager = {
    state: {
        lang: 'ar',
        fontSize: 24,
        soundVib: true,
        sebhaTheme: 'default',
        sebhaSize: 'md',
        lastSurahMushaf: 1,
        activeTab: 'tab-mushaf',
        country: '',
        city: '',
        isProUser: false,
        isDarkMode: false
    },
    load() {
        const saved = localStorage.getItem('nourAlIslamState');
        if (saved) {
            try { this.state = { ...this.state, ...JSON.parse(saved) }; } catch (e) { console.error(e); }
        }
    },
    save() { 
        localStorage.setItem('nourAlIslamState', JSON.stringify(this.state)); 
    },
    update(key, value) { 
        this.state[key] = value; 
        this.save(); 
    }
};

// ==========================================
// 2. منطق فحص الصلاحيات والاشتراكات (Paywall & Ads Logic)
// ==========================================
let pendingFeatureCallback = null;

function checkFeatureAccess(featureType, featureName, onSuccess) {
    if (StorageManager.state.isProUser) {
        if (onSuccess) onSuccess();
        return true;
    }

    if (featureType === 'pro') {
        const modalDonate = document.getElementById('modal-donate');
        if (modalDonate) modalDonate.classList.remove('hidden');
        return false;
    }

    if (featureType === 'ad') {
        const unlockedKey = `ad_unlocked_${featureName}`;
        const unlockedExpiry = localStorage.getItem(unlockedKey);
        
        if (unlockedExpiry && Date.now() < parseInt(unlockedExpiry, 10)) {
            if (onSuccess) onSuccess();
            return true;
        }

        const modalAd = document.getElementById('modal-ad-reward');
        pendingFeatureCallback = () => {
            localStorage.setItem(unlockedKey, (Date.now() + 24 * 60 * 60 * 1000).toString());
            if (onSuccess) onSuccess();
        };

        if (modalAd) modalAd.classList.remove('hidden');
        return false;
    }

    if (onSuccess) onSuccess();
    return true;
}

function initMonetizationLogic() {
    const modalAd = document.getElementById('modal-ad-reward');
    const btnWatchAd = document.getElementById('btn-watch-ad');
    const btnCloseAdModal = document.getElementById('btn-close-ad-modal');
    const modalDonate = document.getElementById('modal-donate');

    if (btnWatchAd) {
        btnWatchAd.addEventListener('click', () => {
            btnWatchAd.innerText = 'جاري تحضير الإعلان... ⏳';
            btnWatchAd.disabled = true;

            setTimeout(() => {
                alert('✅ شكراً لمشاهدة الإعلان! تم فتح الميزة لمدة 24 ساعة.');
                btnWatchAd.innerText = 'شاهد الإعلان للفتح ▶️';
                btnWatchAd.disabled = false;
                if (modalAd) modalAd.classList.add('hidden');
                
                if (pendingFeatureCallback) {
                    pendingFeatureCallback();
                    pendingFeatureCallback = null;
                }
            }, 1500);
        });
    }

    if (btnCloseAdModal) {
        btnCloseAdModal.addEventListener('click', () => {
            if (modalAd) modalAd.classList.add('hidden');
            pendingFeatureCallback = null;
        });
    }

    document.querySelectorAll('[data-subscribe-pro]').forEach(btn => {
        btn.addEventListener('click', () => {
            StorageManager.update('isProUser', true);
            alert('🎉 مبروك! تم تفعيل النسخة الاحترافية Pro بنجاح. استمتع بكل الميزات بدون إعلانات.');
            if (modalDonate) modalDonate.classList.add('hidden');
            location.reload();
        });
    });

    document.querySelectorAll('.btn-pro-feature').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            checkFeatureAccess('pro', 'Pro Feature', null);
        });
    });
}

// ==========================================
// 3. تطبيق الوضع الداكن وحجم الخط والسبحة
// ==========================================
function applyDarkMode() {
    if (StorageManager.state.isDarkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
    } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    }
}

function applySebhaSize(sizeValue) {
    const mainContainer = document.getElementById('digital-tally-counter');
    if (mainContainer) {
        mainContainer.className = mainContainer.className.replace(/\bsebha-size-\S+/g, '');
        mainContainer.classList.add(`sebha-size-${sizeValue || 'md'}`);
    }
}

function applyFontSize() {
    const container = document.getElementById('mushaf-container');
    if (container) container.style.fontSize = `${StorageManager.state.fontSize}px`;
    const display = document.getElementById('font-size-display');
    if (display) display.innerText = StorageManager.state.fontSize + 'px';
}

// ==========================================
// 4. محرك الأذكار ومكتبة الأحاديث ومتابع الختمة
// ==========================================
const AzkarData = [
    { text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ.", count: 1 },
    { text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ.", count: 1 },
    { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.", count: 3 },
    { text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.", count: 3 }
];

const HadithData = [
    { text: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى.", source: "صحيح البخاري" },
    { text: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَاليَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ.", source: "صحيح البخاري ومسلم" },
    { text: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.", source: "صحيح البخاري" }
];

function initAzkarEngine() {
    const listContainer = document.getElementById('azkar-list-container');
    if (listContainer) {
        listContainer.innerHTML = '';
        AzkarData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 space-y-2';
            card.innerHTML = `
                <p class="font-[Amiri] text-base leading-relaxed">${item.text}</p>
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-400">التكرار: ${item.count}</span>
                    <button class="zekr-btn bg-primary text-white px-3 py-1 rounded-lg text-xs font-bold">قرأت (<span>${item.count}</span>)</button>
                </div>
            `;
            const btn = card.querySelector('.zekr-btn');
            let c = item.count;
            btn.addEventListener('click', () => {
                if (c > 0) {
                    c--;
                    btn.querySelector('span').innerText = c;
                    if (c === 0) {
                        btn.className = 'bg-gray-300 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold cursor-not-allowed';
                        btn.innerText = '✓ تم';
                    }
                }
            });
            listContainer.appendChild(card);
        });
    }

    // مكتبة الأحاديث
    const hadithContainer = document.getElementById('hadith-results-container');
    if (hadithContainer) {
        hadithContainer.innerHTML = '';
        HadithData.forEach(h => {
            const div = document.createElement('div');
            div.className = 'p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-sm space-y-1';
            div.innerHTML = `<p class="font-[Amiri] font-bold">"${h.text}"</p><p class="text-xs text-primary font-semibold">(${h.source})</p>`;
            hadithContainer.appendChild(div);
        });
    }

    //تابع الختمة
    const khatmaPageInput = document.getElementById('khatma-current-page');
    const khatmaDaysInput = document.getElementById('khatma-days');
    const khatmaFill = document.getElementById('khatma-progress-fill');
    const khatmaText = document.getElementById('khatma-progress-text');
    const btnSaveKhatma = document.getElementById('btn-save-khatma');

    if (khatmaPageInput && khatmaDaysInput) {
        const savedPage = localStorage.getItem('khatma_page') || '1';
        const savedDays = localStorage.getItem('khatma_days') || '30';
        khatmaPageInput.value = savedPage;
        khatmaDaysInput.value = savedDays;
        updateKhatmaProgress(savedPage);

        if (btnSaveKhatma) {
            btnSaveKhatma.addEventListener('click', () => {
                localStorage.setItem('khatma_page', khatmaPageInput.value);
                localStorage.setItem('khatma_days', khatmaDaysInput.value);
                updateKhatmaProgress(khatmaPageInput.value);
                alert('✅ تم حفظ تقدم الختمة بنجاح!');
            });
        }
    }

    function updateKhatmaProgress(page) {
        const pct = Math.min(100, Math.round((parseInt(page || 1) / 604) * 100));
        if (khatmaFill) khatmaFill.style.width = pct + '%';
        if (khatmaText) khatmaText.innerText = pct + '%';
    }

    // حاسبة الزكاة
    const btnCalcZakat = document.getElementById('btn-calc-zakat');
    if (btnCalcZakat) {
        btnCalcZakat.addEventListener('click', () => {
            const amount = parseFloat(document.getElementById('zakat-money-input').value) || 0;
            const zakatVal = amount * 0.025;
            const resEl = document.getElementById('zakat-result');
            if (resEl) resEl.innerText = `الزكاة المستحقة الواجب إخراجها: ${zakatVal.toFixed(2)}`;
        });
    }
}

// ==========================================
// 5. محرك الصوتيات (Audio Engine & Pro Downloads)
// ==========================================
let currentRecitersData = [];

function initAudioEngine() {
    const selectReciter = document.getElementById('select-reciter');
    const selectRiwaya = document.getElementById('select-riwaya');
    const selectSurah = document.getElementById('select-surah-audio');
    const audioPlayer = document.getElementById('core-audio-player');
    const playBtn = document.getElementById('btn-audio-play');
    const audioTitle = document.getElementById('audio-title');
    const audioTime = document.getElementById('audio-time');
    const progressBar = document.getElementById('audio-progress');
    const downloadBtn = document.getElementById('download-surah-btn');

    async function fetchReciters() {
        try {
            const res = await fetch('https://mp3quran.net/api/v3/reciters?language=ar');
            const data = await res.json();
            currentRecitersData = data.reciters || [];
            
            if (selectReciter) {
                selectReciter.innerHTML = '<option value="">اختر القارئ...</option>';
                currentRecitersData.forEach(r => {
                    selectReciter.innerHTML += `<option value="${r.id}">${r.name}</option>`;
                });
            }
        } catch(e) { console.error("خطأ جلب القراء:", e); }
    }

    if (selectReciter) {
        selectReciter.addEventListener('change', (e) => {
            const reciterId = e.target.value;
            const reciter = currentRecitersData.find(r => r.id == reciterId);
            if (!reciter || !selectRiwaya) return;

            selectRiwaya.innerHTML = '<option value="">اختر الرواية...</option>';
            reciter.moshaf.forEach(m => {
                selectRiwaya.innerHTML += `<option value="${m.id}">${m.name}</option>`;
            });
        });
    }

    if (selectRiwaya) {
        selectRiwaya.addEventListener('change', () => {
            if (!selectSurah) return;
            selectSurah.innerHTML = '<option value="">اختر السورة...</option>';
            SuwarNames.forEach((name, index) => {
                selectSurah.innerHTML += `<option value="${index + 1}">${index + 1}. سورة ${name}</option>`;
            });
        });
    }

    if (selectSurah) {
        selectSurah.addEventListener('change', () => {
            const reciterId = selectReciter.value;
            const moshafId = selectRiwaya.value;
            const surahNum = selectSurah.value;

            const reciter = currentRecitersData.find(r => r.id == reciterId);
            if (!reciter) return;
            const moshaf = reciter.moshaf.find(m => m.id == moshafId);
            if (!moshaf) return;

            const formattedSurah = surahNum.padStart(3, '0');
            const audioUrl = `${moshaf.server}${formattedSurah}.mp3`;

            if (audioPlayer) {
                audioPlayer.src = audioUrl;
                audioPlayer.play();
                if (playBtn) playBtn.innerText = '⏸';
                if (audioTitle) audioTitle.innerText = `${reciter.name} - سورة ${SuwarNames[surahNum - 1]}`;
            }
        });
    }

    if (playBtn && audioPlayer) {
        playBtn.addEventListener('click', () => {
            if (audioPlayer.paused) {
                audioPlayer.play();
                playBtn.innerText = '⏸';
            } else {
                audioPlayer.pause();
                playBtn.innerText = '▶';
            }
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            checkFeatureAccess('pro', 'تنزيل الصوتيات', () => {
                if (audioPlayer && audioPlayer.src) {
                    const link = document.createElement('a');
                    link.href = audioPlayer.src;
                    link.download = 'surah.mp3';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    alert('يرجى اختيار سورة وتشغيلها أولاً للتنزيل.');
                }
            });
        });
    }

    if (audioPlayer && progressBar) {
        audioPlayer.addEventListener('timeupdate', () => {
            if (!isNaN(audioPlayer.duration)) {
                const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                progressBar.value = pct;
                
                const curM = Math.floor(audioPlayer.currentTime / 60);
                const curS = Math.floor(audioPlayer.currentTime % 60).toString().padStart(2, '0');
                const durM = Math.floor(audioPlayer.duration / 60);
                const durS = Math.floor(audioPlayer.duration % 60).toString().padStart(2, '0');
                if (audioTime) audioTime.innerText = `${curM}:${curS} / ${durM}:${durS}`;
            }
        });

        progressBar.addEventListener('input', (e) => {
            if (!isNaN(audioPlayer.duration)) {
                audioPlayer.currentTime = (e.target.value / 100) * audioPlayer.duration;
            }
        });
    }

    fetchReciters();
}

// ==========================================
// 6. محرك المصحف المكتوب
// ==========================================
const SuwarNames = [
    "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
    "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
    "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
    "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
    "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
    "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
    "الصف", "الجُمُعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
    "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
    "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
    "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
    "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
    "المسد", "الإخلاص", "الفلق", "الناس"
];

function initMushafEngine() {
    const selectMushaf = document.getElementById('select-surah-mushaf');
    const mushafContainer = document.getElementById('mushaf-container');
    const mushafHeader = document.getElementById('mushaf-header');
    const surahNameEl = document.getElementById('mushaf-surah-name');
    const searchInput = document.getElementById('search-surah');
    
    if (!selectMushaf || !mushafContainer) return;

    function populateSelect(filter = '') {
        selectMushaf.innerHTML = '<option value="">اختر السورة من الـ 114 سورة...</option>';
        SuwarNames.forEach((name, index) => {
            if (name.includes(filter) || (index + 1).toString().includes(filter)) {
                const option = document.createElement('option');
                option.value = index + 1;
                option.innerText = `${index + 1}. سورة ${name}`;
                selectMushaf.appendChild(option);
            }
        });
    }

    populateSelect();

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            populateSelect(e.target.value.trim());
        });
    }

    if (StorageManager.state.lastSurahMushaf) {
        selectMushaf.value = StorageManager.state.lastSurahMushaf;
        fetchSurahText(StorageManager.state.lastSurahMushaf);
    }

    selectMushaf.addEventListener('change', (e) => {
        if (e.target.value) fetchSurahText(e.target.value);
    });

    async function fetchSurahText(surahId) {
        mushafContainer.innerHTML = '<div class="text-center py-10">جاري تحميل السورة...</div>';
        try {
            const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}`);
            const data = await response.json();
            
            if (mushafHeader) mushafHeader.classList.remove('hidden');
            if (surahNameEl) surahNameEl.innerText = `سورة ${data.data.name.replace('سُورَةُ ', '')}`;
            
            const numericSurahId = parseInt(surahId, 10);
            let htmlText = '<div class="quran-text mushaf-page p-6 rounded-xl">';
            
            data.data.ayahs.forEach(ayah => {
                let text = ayah.text;
                if (numericSurahId !== 1 && numericSurahId !== 9 && ayah.numberInSurah === 1) {
                    text = text.replace(/^بِسْمِ\s+اللَّهِ\s+الرَّحْمَٰنِ\s+الرَّحِيمِ\s*|^بۡسۡمِ\s+ٱللَّهِ\s+ٱلرَّحۡمَٰنِ\s+ٱلرَّحِيمِ\s*/ui, "");
                }
                htmlText += `${text} <span class="ayah-number">۝${ayah.numberInSurah}</span> `;
            });
            htmlText += '</div>';
            
            mushafContainer.innerHTML = htmlText;
            StorageManager.update('lastSurahMushaf', surahId);
            applyFontSize();
        } catch(err) {
            mushafContainer.innerHTML = '<div class="text-center py-10 text-red-500">حدث خطأ في تحميل السورة. تأكد من الاتصال بالإنترنت.</div>';
        }
    }
}

// ==========================================
// 7. اتجاه القبلة
// ==========================================
function initPrayerEngine() {
    const btnQibla = document.getElementById('btn-get-qibla');
    const resultText = document.getElementById('qibla-result-text');

    if (btnQibla && resultText) {
        btnQibla.addEventListener('click', () => {
            if (navigator.geolocation) {
                resultText.innerText = 'جاري تحديد موقعك الجغرافي لحساب القبلة... ⏳';
                navigator.geolocation.getCurrentPosition(pos => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    // حساب اتجاه الكعبة المشرفة (مكة: 21.4225° N, 39.8262° E)
                    const kaabaLat = 21.4225;
                    const kaabaLng = 39.8262;

                    const phiK = kaabaLat * Math.PI / 180;
                    const lambdaK = kaabaLng * Math.PI / 180;
                    const phi = lat * Math.PI / 180;
                    const lambda = lng * Math.PI / 180;

                    const y = Math.sin(lambdaK - lambda);
                    const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
                    let qibla = Math.atan2(y, x) * 180 / Math.PI;
                    qibla = (qibla + 360) % 360;

                    resultText.innerHTML = `✅ اتجاه القبلة من موقعك هو: <span class="text-primary text-lg font-bold">${qibla.toFixed(2)}°</span> (باعتبار الشمال الجغرافي 0°).`;
                }, () => {
                    resultText.innerText = '❌ تعذر تحديد موقعك. يرجى السماح بالوصول للموقع الجغرافي.';
                });
            } else {
                resultText.innerText = 'متصفحك لا يدعم خاصية تحديد الموقع.';
            }
        });
    }
}

// ==========================================
// 8. محرك المسبحة الرقمية والثيمات
// ==========================================
let currentSebhaCount = 0;
const dhikrList = ["سُبْحَانَ اللَّهِ", "الْحَمْدُ لِلَّهِ", "لَا إِلَهَ إِلَّا اللَّهُ", "اللَّهُ أَكْبَرُ", "أَسْتَغْفِرُ اللَّهَ"];
let currentDhikrIndex = 0;

function initSebha() {
    const tallyBtn = document.getElementById('tally-btn');
    const resetBtn = document.getElementById('reset-btn');
    const countDisplay = document.querySelector('#sebha-count-display span');
    const themeSelect = document.getElementById('sebha-theme-select');
    const dhikrText = document.getElementById('current-dhikr-text');
    const btnNextDhikr = document.getElementById('btn-next-dhikr');
    const btnPrevDhikr = document.getElementById('btn-prev-dhikr');

    function updateCount() {
        if(countDisplay) countDisplay.innerText = currentSebhaCount.toString();
    }

    if(tallyBtn) {
        tallyBtn.addEventListener('click', () => {
            currentSebhaCount++;
            updateCount();
            if (StorageManager.state.soundVib) {
                sebhaClickSound.currentTime = 0;
                sebhaClickSound.play().catch(() => {});
                if (navigator.vibrate) navigator.vibrate(30);
            }
        });
    }

    if(resetBtn) {
        resetBtn.addEventListener('click', () => {
            currentSebhaCount = 0;
            updateCount();
            if (StorageManager.state.soundVib) {
                sebhaClickSound.currentTime = 0;
                sebhaClickSound.play().catch(() => {});
                if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
            }
        });
    }

    if (btnNextDhikr && btnPrevDhikr && dhikrText) {
        btnNextDhikr.addEventListener('click', () => {
            currentDhikrIndex = (currentDhikrIndex + 1) % dhikrList.length;
            dhikrText.innerText = dhikrList[currentDhikrIndex];
        });
        btnPrevDhikr.addEventListener('click', () => {
            currentDhikrIndex = (currentDhikrIndex - 1 + dhikrList.length) % dhikrList.length;
            dhikrText.innerText = dhikrList[currentDhikrIndex];
        });
    }
}

// ==========================================
// 9. واجهة المستخدم والتنقل وإدارة الحالة
// ==========================================
function initUI() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('main section');
    
    function switchTab(targetId) {
        sections.forEach(s => { s.classList.add('hidden'); s.classList.remove('block', 'flex'); });
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add(targetId === 'tab-sebha' ? 'flex' : 'block');
        }

        navBtns.forEach(b => {
            if (b.dataset.target === targetId) {
                b.classList.remove('text-gray-400');
                b.classList.add('text-primary');
            } else {
                b.classList.remove('text-primary');
                b.classList.add('text-gray-400');
            }
        });

        StorageManager.update('activeTab', targetId);
    }

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.target);
        });
    });

    if (StorageManager.state.activeTab) {
        switchTab(StorageManager.state.activeTab);
    }

    const btnSettings = document.getElementById('btn-settings');
    const modalSettings = document.getElementById('modal-settings');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    
    if(btnSettings) btnSettings.addEventListener('click', () => modalSettings.classList.remove('hidden'));
    if(btnCloseSettings) btnCloseSettings.addEventListener('click', () => modalSettings.classList.add('hidden'));

    const btnDonate = document.getElementById('btn-donate');
    const modalDonate = document.getElementById('modal-donate');
    const btnCloseDonate = document.getElementById('btn-close-donate');

    if(btnDonate) btnDonate.addEventListener('click', () => modalDonate.classList.remove('hidden'));
    if(btnCloseDonate) btnCloseDonate.addEventListener('click', () => modalDonate.classList.add('hidden'));

    const darkModeToggle = document.getElementById('toggle-dark-mode');
    if (darkModeToggle) {
        darkModeToggle.checked = StorageManager.state.isDarkMode;
        darkModeToggle.addEventListener('change', (e) => {
            StorageManager.update('isDarkMode', e.target.checked);
            applyDarkMode();
        });
    }

    document.getElementById('btn-font-plus')?.addEventListener('click', () => {
        if(StorageManager.state.fontSize < 40) { StorageManager.update('fontSize', StorageManager.state.fontSize + 2); applyFontSize(); }
    });
    document.getElementById('btn-font-minus')?.addEventListener('click', () => {
        if(StorageManager.state.fontSize > 16) { StorageManager.update('fontSize', StorageManager.state.fontSize - 2); applyFontSize(); }
    });
}

// ==========================================
// 10. تشغيل التطبيق عند التحميل
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    StorageManager.load();
    applyDarkMode();
    applyFontSize();
    applySebhaSize(StorageManager.state.sebhaSize);
    
    initMonetizationLogic();
    initAudioEngine();
    initMushafEngine();
    initAzkarEngine();
    initPrayerEngine();
    initSebha();
    initUI();
});
