// بدء الانضمام إلى المكالمة الصوتية أو المرئية
async function joinCall(withVideo = false) {
    try {
        // إظهار واجهة الاتصال (حاوية الفيديو إن وجدت)
        const callContainer = document.getElementById('call-container');
        if (callContainer) callContainer.classList.remove('hidden-view');

        // إنشاء عميل Agora
        agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

        // الاستماع لدخول وبث المستخدمين الآخرين
        agoraClient.on("user-published", handleUserPublished);
        agoraClient.on("user-unpublished", handleUserUnpublished);

        // الانضمام إلى القناة (نستخدم activeChannel من config.js كاسم القناة)
        await agoraClient.join(AGORA_APP_ID, activeChannel, AGORA_PERMANENT_TOKEN, currentUser.id);

        // إنشاء المسار الصوتي المحلي
        localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        
        // إذا طلب المستخدم مكالمة فيديو، نقوم بإنشاء وعرض مسار الفيديو
        if (withVideo) {
            localVideoTrack = await AgoraRTC.createCameraVideoTrack();
            const localPlayerContainer = document.createElement("div");
            localPlayerContainer.id = `video-${currentUser.id}`;
            localPlayerContainer.className = "w-full h-48 bg-black rounded-lg overflow-hidden relative shadow-lg";
            
            const videoStreamsDiv = document.getElementById("video-streams");
            if (videoStreamsDiv) {
                videoStreamsDiv.appendChild(localPlayerContainer);
                localVideoTrack.play(localPlayerContainer);
            }
            
            // بث الصوت والفيديو معاً
            await agoraClient.publish([localAudioTrack, localVideoTrack]);
        } else {
            // بث الصوت فقط
            await agoraClient.publish([localAudioTrack]);
        }

    } catch (error) {
        console.error("خطأ في الانضمام للمكالمة:", error);
        alert("فشل الاتصال. يرجى التأكد من صلاحيات المايكروفون/الكاميرا.");
    }
}

// التعامل مع المستخدمين الآخرين عند تشغيلهم للصوت أو الفيديو
async function handleUserPublished(user, mediaType) {
    await agoraClient.subscribe(user, mediaType);
    
    // تشغيل فيديو الطرف الآخر
    if (mediaType === "video") {
        const remoteVideoTrack = user.videoTrack;
        let remotePlayerContainer = document.getElementById(`video-${user.uid}`);
        
        if (!remotePlayerContainer) {
            remotePlayerContainer = document.createElement("div");
            remotePlayerContainer.id = `video-${user.uid}`;
            remotePlayerContainer.className = "w-full h-48 bg-black rounded-lg overflow-hidden relative shadow-lg mt-2";
            
            const videoStreamsDiv = document.getElementById("video-streams");
            if (videoStreamsDiv) videoStreamsDiv.appendChild(remotePlayerContainer);
        }
        remoteVideoTrack.play(remotePlayerContainer);
    }

    // تشغيل صوت الطرف الآخر
    if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
    }
}

// التعامل مع المستخدمين عند إيقافهم للبث أو مغادرتهم
function handleUserUnpublished(user, mediaType) {
    if (mediaType === "video") {
        const remotePlayerContainer = document.getElementById(`video-${user.uid}`);
        if (remotePlayerContainer) {
            remotePlayerContainer.remove();
        }
    }
}

// كتم / إلغاء كتم الصوت
async function toggleAudio() {
    if (!localAudioTrack) return;
    const isMuted = !localAudioTrack.enabled;
    await localAudioTrack.setEnabled(isMuted); // يعكس الحالة
    
    const micBtn = document.getElementById('btn-toggle-mic');
    if (micBtn) {
        micBtn.classList.toggle('text-red-500', !isMuted);
    }
}

// تشغيل / إيقاف الكاميرا محلياً
async function toggleVideo() {
    if (!localVideoTrack) return;
    const isVideoEnabled = !localVideoTrack.enabled;
    await localVideoTrack.setEnabled(isVideoEnabled);
    
    const camBtn = document.getElementById('btn-toggle-cam');
    if (camBtn) {
        camBtn.classList.toggle('text-red-500', !isVideoEnabled);
    }
}

// مغادرة وإغلاق المكالمة بالكامل
async function leaveCall() {
    // إيقاف وإغلاق المسارات المحلية
    if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
        localAudioTrack = null;
    }
    if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
        localVideoTrack = null;
    }

    // إفراغ حاوية الفيديو
    const videoStreamsDiv = document.getElementById("video-streams");
    if (videoStreamsDiv) videoStreamsDiv.innerHTML = "";

    // مغادرة القناة وإيقاف العميل
    if (agoraClient) {
        await agoraClient.leave();
        agoraClient = null;
    }

    // إخفاء واجهة المكالمة
    const callContainer = document.getElementById('call-container');
    if (callContainer) callContainer.classList.add('hidden-view');
}
