// مفاتيح الربط المحفوظة والمضمنة مع Supabase
const SUPABASE_URL = 'https://vfysgxgjahaojrtdagbj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aRu1BBu5Pb29tq-fNYSZIA_PeSrrpoC';

// مفاتيح الربط الدائمة مع Agora للمكالمات الصوتية والمرئية
const AGORA_APP_ID = '77a195757c054acaaf8da43c269b2260';
const AGORA_PERMANENT_TOKEN = '00677a195757c054acaaf8da43c269b2260IABQLMitxwtMDMd4/d5F8xLlrQ9ut+mIk0aa9jUYpm13A0UxBjEAAAAAIgBa0EoDD21kagQAAQCPHi99AgCPHi99AwCPHi99BACPHi99';

// المتغيرات العامة التي ستشاركها جميع ملفات التطبيق الأخرى
let supabaseClient = null;
let currentUser = null;
let currentAuthMode = 'login';
let currentLang = 'ar';
let agoraClient = null;
let localAudioTrack = null;
let localVideoTrack = null;
let activeChannel = 'official-golden-chat-id';
let realtimeChannel = null;
