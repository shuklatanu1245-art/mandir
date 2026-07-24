// ══════════════════════════════════════
//  ADMIN PANEL — Firebase Realtime DB
// ══════════════════════════════════════

const ADMIN_EMAIL = 'devshukla1245@gmail.com';
const ADMIN_PASSWORD = 'shiv5454';

// ─── LOGIN / LOGOUT ───
function adminLogin() {
    const email = document.getElementById('adminEmail').value.trim();
    const pw = document.getElementById('adminPassword').value;
    const err = document.getElementById('loginError');
    if (email === ADMIN_EMAIL && pw === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadAllAdmin();
    } else {
        err.textContent = '❌ गलत ईमेल या पासवर्ड! कृपया पुनः प्रयास करें।';
    }
}

function adminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
    if(document.getElementById('adminEmail')) document.getElementById('adminEmail').value = '';
    document.getElementById('adminPassword').value = '';
    document.getElementById('loginError').textContent = '';
}

// Auto-login check
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadAllAdmin();
    }
    const pwInput = document.getElementById('adminPassword');
    if (pwInput) {
        pwInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') adminLogin();
        });
    }
});

// ─── TABS ───
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// ─── CLOUDINARY UPLOAD ───
const CLOUD_NAME = 'ol1ejvbp';
const API_KEY = '233933968681329';
const API_SECRET = 'y8uLxH3cyK4u5PjvE0UHZuCGOV8';

async function generateCloudinarySignature(timestamp) {
    const str = `timestamp=${timestamp}${API_SECRET}`;
    const buffer = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-1', buffer);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function uploadToCloudinary(file, resourceType) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await generateCloudinarySignature(timestamp);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
        method: 'POST',
        body: formData
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.secure_url;
}

function loadAllAdmin() {
    listenPhotos();
    listenVideos();
    listenServices();
}

async function addPhoto() {
    const fileInput = document.getElementById('photoFile');
    const caption = document.getElementById('photoCaption').value.trim();
    if (fileInput.files.length === 0) { alert('कृपया एक फोटो फाइल चुनें!'); return; }
    
    const btn = document.getElementById('addPhotoBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    
    try {
        const url = await uploadToCloudinary(fileInput.files[0], 'image');
        await db.ref('photos').push({ url, caption, createdAt: Date.now() });
        fileInput.value = '';
        document.getElementById('photoCaption').value = '';
        alert('✅ फोटो सफलतापूर्वक अपलोड की गई!');
    } catch (err) {
        alert('❌ Error: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-upload"></i> अपलोड करें';
    }
}

function deletePhoto(key) {
    if (!confirm('क्या आप यह फोटो हटाना चाहते हैं?')) return;
    db.ref('photos/' + key).remove();
}

function listenPhotos() {
    const container = document.getElementById('photosList');
    if (!container) return;
    
    db.ref('photos').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            container.innerHTML = '<p class="admin-empty">कोई फोटो नहीं जोड़ी गई है।</p>';
            return;
        }
        container.innerHTML = Object.entries(data).map(([key, p]) => {
            let u = p.url || '';
            if (u.includes('drive.google.com')) {
                const driveMatch = u.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                if (driveMatch && driveMatch[1]) {
                    u = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
                }
            }
            return `
            <div class="admin-item">
                <img src="${u}" alt="${p.caption || ''}" class="admin-thumb">
                <div class="admin-item-info">
                    <strong>${p.caption || 'No Caption'}</strong>
                    <small>${p.url.substring(0, 50)}...</small>
                </div>
                <button class="admin-delete-btn" onclick="deletePhoto('${key}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            `;
        }).join('');
    });
}

// ═══════════════════════════
//  VIDEOS — Firebase
// ═══════════════════════════
async function addVideo() {
    const fileInput = document.getElementById('videoFile');
    const title = document.getElementById('videoTitle').value.trim();
    if (fileInput.files.length === 0) { alert('कृपया एक वीडियो फाइल चुनें!'); return; }
    
    const btn = document.getElementById('addVideoBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    
    try {
        const url = await uploadToCloudinary(fileInput.files[0], 'video');
        await db.ref('videos').push({ url, title, createdAt: Date.now() });
        fileInput.value = '';
        document.getElementById('videoTitle').value = '';
        alert('✅ वीडियो सफलतापूर्वक अपलोड किया गया!');
    } catch (err) {
        alert('❌ Error: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-upload"></i> अपलोड करें';
    }
}

function deleteVideo(key) {
    if (!confirm('क्या आप यह वीडियो हटाना चाहते हैं?')) return;
    db.ref('videos/' + key).remove();
}

function listenVideos() {
    const container = document.getElementById('videosList');
    if (!container) return;
    
    db.ref('videos').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            container.innerHTML = '<p class="admin-empty">कोई वीडियो नहीं जोड़ा गया है।</p>';
            return;
        }
        container.innerHTML = Object.entries(data).map(([key, v]) => {
            let thumbHtml = '';
            let u = v.url || '';
            let typeLabel = 'Direct Video';
            
            if (u.includes('youtube.com') || u.includes('youtu.be')) {
                const ytMatch = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
                if (ytMatch && ytMatch[1]) {
                    thumbHtml = `<img src="https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg" class="admin-thumb video-thumb">`;
                    typeLabel = 'YouTube';
                }
            } else if (u.includes('drive.google.com')) {
                const driveMatch = u.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                if (driveMatch && driveMatch[1]) {
                    thumbHtml = `<iframe src="https://drive.google.com/file/d/${driveMatch[1]}/preview" class="admin-thumb video-thumb" style="pointer-events:none;"></iframe>`;
                    typeLabel = 'Google Drive';
                }
            }
            
            if (!thumbHtml) {
                thumbHtml = `<video src="${u}" class="admin-thumb video-thumb" muted></video>`;
            }

            return `
            <div class="admin-item">
                ${thumbHtml}
                <div class="admin-item-info">
                    <strong>${v.title || 'No Title'}</strong>
                    <small>${typeLabel}</small>
                </div>
                <button class="admin-delete-btn" onclick="deleteVideo('${key}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            `;
        }).join('');
    });
}

// ═══════════════════════════
//  SERVICES — Firebase
// ═══════════════════════════
function addService() {
    const emoji = document.getElementById('serviceEmoji').value.trim() || '🔸';
    const name = document.getElementById('serviceName').value.trim();
    const desc = document.getElementById('serviceDesc').value.trim();
    if (!name) { alert('कृपया सेवा का नाम डालें!'); return; }
    
    db.ref('custom_services').push({ emoji, name, desc, createdAt: Date.now() })
        .then(() => {
            document.getElementById('serviceEmoji').value = '';
            document.getElementById('serviceName').value = '';
            document.getElementById('serviceDesc').value = '';
            alert('✅ सेवा सफलतापूर्वक जोड़ी गई!');
        })
        .catch(err => alert('❌ Error: ' + err.message));
}

function deleteService(key) {
    if (!confirm('क्या आप यह सेवा हटाना चाहते हैं?')) return;
    db.ref('custom_services/' + key).remove();
}

function listenServices() {
    const container = document.getElementById('servicesList');
    if (!container) return;
    
    db.ref('custom_services').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            container.innerHTML = '<p class="admin-empty">कोई कस्टम सेवा नहीं जोड़ी गई है।</p>';
            return;
        }
        container.innerHTML = Object.entries(data).map(([key, s]) => `
            <div class="admin-item">
                <div class="admin-item-emoji">${s.emoji}</div>
                <div class="admin-item-info">
                    <strong>${s.name}</strong>
                    <small>${s.desc || ''}</small>
                </div>
                <button class="admin-delete-btn" onclick="deleteService('${key}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `).join('');
    });
}
