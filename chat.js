// إدارة التنقل بين واجهات التطبيق
function showView(viewId) {
    const views = ['language-view', 'auth-view', 'main-chat-view'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === viewId) {
                el.classList.remove('hidden-view');
            } else {
                el.classList.add('hidden-view');
            }
        }
    });
}

// بدء التطبيق والدخول للدردشة بعد تسجيل الدخول بنجاح
function startApp() {
    showView('main-chat-view');
    loadMessages();
    subscribeToMessages();
}

// جلب الرسائل السابقة من قاعدة بيانات Supabase
async function loadMessages() {
    const chatContainer = document.getElementById('chat-messages');
    if(!chatContainer) return;
    chatContainer.innerHTML = ''; // تفريغ الدردشة

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
    } catch (err) {
        console.error("Error loading messages:", err);
    }
}

// الاشتراك في التحديثات الفورية (الاستماع للرسائل الجديدة)
function subscribeToMessages() {
    if (realtimeChannel) {
        supabaseClient.removeChannel(realtimeChannel);
    }
    
    realtimeChannel = supabaseClient.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannel}` },
        (payload) => {
            renderMessage(payload.new);
            scrollToBottom();
            
            // تشغيل صوت التنبيه إذا كانت الرسالة من شخص آخر
            if(payload.new.user_id !== currentUser.id) {
                playAudioTone('receive');
            }
        }
      )
      .subscribe();
}

// بناء وعرض الرسالة في واجهة المحادثة
function renderMessage(msg) {
    const chatContainer = document.getElementById('chat-messages');
    if(!chatContainer) return;

    const isMine = msg.user_id === currentUser?.id;
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex flex-col max-w-[80%] mb-4 ${isMine ? 'self-end items-end' : 'self-start items-start'}`;

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = `p-3 rounded-2xl break-words ${isMine ? 'bg-gold-500 text-dark-900 rounded-br-none shadow-md' : 'glass-panel text-white rounded-bl-none shadow-md'}`;
    
    // إدراج النص إن وُجد
    if (msg.content && msg.content.trim() !== '') {
        const textSpan = document.createElement('span');
        textSpan.innerText = msg.content;
        bubbleDiv.appendChild(textSpan);
    }

    // إدراج المرفقات (صورة، فيديو، صوت) إن وُجدت
    if (msg.media_url) {
        const mediaWrapper = document.createElement('div');
        mediaWrapper.className = msg.content ? "mt-2" : ""; // إضافة مسافة إذا كان هناك نص مع المرفق
        
        if (msg.media_type === 'image') {
            mediaWrapper.innerHTML = `<img src="${msg.media_url}" class="max-w-full h-auto rounded-lg cursor-pointer" onclick="window.open('${msg.media_url}')" loading="lazy" />`;
        } else if (msg.media_type === 'video') {
            mediaWrapper.innerHTML = `<video src="${msg.media_url}" controls class="max-w-full rounded-lg h-48 bg-black"></video>`;
        } else if (msg.media_type === 'audio') {
            mediaWrapper.innerHTML = `<audio src="${msg.media_url}" controls class="max-w-full mt-1"></audio>`;
        }
        bubbleDiv.appendChild(mediaWrapper);
    }

    // وقت إرسال الرسالة
    const timeSpan = document.createElement('span');
    timeSpan.className = `text-[10px] mt-1 px-1 ${isMine ? 'text-gray-400' : 'text-gray-500'}`;
    timeSpan.innerText = formatTime(msg.created_at);

    msgDiv.appendChild(bubbleDiv);
    msgDiv.appendChild(timeSpan);
    chatContainer.appendChild(msgDiv);
}

// إرسال رسالة نصية
async function sendMessage() {
    const input = document.getElementById('msg-input');
    if(!input || !input.value.trim()) return;

    const content = input.value.trim();
    input.value = '';

    try {
        const { error } = await supabaseClient
            .from('messages')
            .insert([{
                channel_id: activeChannel,
                user_id: currentUser.id,
                content: content,
                media_url: null,
                media_type: null
            }]);

        if (error) throw error;
        playAudioTone('send');
    } catch (err) {
        console.error("Error sending message:", err);
    }
}

// التعامل مع اختيار ورفع الملفات
async function handleFileUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    // فحص مدة الفيديو (الحد الأقصى 3 دقائق)
    if (type === 'video') {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = async function() {
            window.URL.revokeObjectURL(video.src);
            if (video.duration > 180) { // 180 ثانية = 3 دقائق
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

// الرفع الفعلي للملف إلى Supabase Storage
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

        // الحصول على الرابط العام للملف
        const { data } = supabaseClient.storage.from('chat-media').getPublicUrl(filePath);
        
        // إدراج الرسالة في قاعدة البيانات مع رابط المرفق
        const { error: msgError } = await supabaseClient
            .from('messages')
            .insert([{
                channel_id: activeChannel,
                user_id: currentUser.id,
                content: '',
                media_url: data.publicUrl,
                media_type: type
            }]);

        if (msgError) throw msgError;
        playAudioTone('send');
        if(input) input.placeholder = originalPlaceholder;

    } catch (err) {
        console.error("Upload Error:", err);
        alert("حدث خطأ أثناء رفع الملف.");
    }
}

// التمرير التلقائي لأسفل المحادثة
function scrollToBottom() {
    const chatContainer = document.getElementById('chat-messages');
    if(chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

// تنسيق الوقت للعرض (صيغة 12 ساعة)
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

// توليد نغمات تنبيه بسيطة للرسائل بدون الحاجة لملفات صوتية خارجية
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
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.1);
        } else if (type === 'receive') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(700, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1);
        } else if (type === 'login') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
        }

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    } catch(e) { 
        // تجاهل الخطأ إذا كان المتصفح يمنع تشغيل الصوت تلقائياً
    }
}

// ربط الضغط على زر Enter بإرسال الرسالة
document.addEventListener('DOMContentLoaded', () => {
    const msgInput = document.getElementById('msg-input');
    if(msgInput) {
        msgInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});
