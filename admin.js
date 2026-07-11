// ══════════════════════════════════════
//  ADMIN PANEL — Firebase Realtime DB
// ══════════════════════════════════════

const ADMIN_PASSWORD = 'om123'; // ← पासवर्ड बदलें

// ─── LOGIN / LOGOUT ───
function adminLogin() {
    const pw = document.getElementById('adminPassword').value;
    const err = document.getElementById('loginError');
    if (pw === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadAllAdmin();
    } else {
        err.textContent = '❌ गलत पासवर्ड! कृपया पुनः प्रयास करें।';
    }
}

function adminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminPassword').value = '';
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

// ─── LOAD ALL ───
function loadAllAdmin() {
    listenPhotos();
    listenVideos();
    listenServices();
}

function addPhoto() {
    const url = document.getElementById('photoUrl').value.trim();
    const caption = document.getElementById('photoCaption').value.trim();
    if (!url) { alert('कृपया फोटो URL डालें!'); return; }
    
    db.ref('photos').push({ url, caption, createdAt: Date.now() })
        .then(() => {
            document.getElementById('photoUrl').value = '';
            document.getElementById('photoCaption').value = '';
            alert('✅ फोटो सफलतापूर्वक जोड़ी गई!');
        })
        .catch(err => alert('❌ Error: ' + err.message));
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
        container.innerHTML = Object.entries(data).map(([key, p]) => `
            <div class="admin-item">
                <img src="${p.url}" alt="${p.caption || ''}" class="admin-thumb">
                <div class="admin-item-info">
                    <strong>${p.caption || 'No Caption'}</strong>
                    <small>${p.url.substring(0, 50)}...</small>
                </div>
                <button class="admin-delete-btn" onclick="deletePhoto('${key}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `).join('');
    });
}

// ═══════════════════════════
//  VIDEOS — Firebase
// ═══════════════════════════
function addVideo() {
    const url = document.getElementById('videoUrl').value.trim();
    const title = document.getElementById('videoTitle').value.trim();
    if (!url) { alert('कृपया Video URL डालें!'); return; }
    
    db.ref('videos').push({ url, title, createdAt: Date.now() })
        .then(() => {
            document.getElementById('videoUrl').value = '';
            document.getElementById('videoTitle').value = '';
            alert('✅ वीडियो सफलतापूर्वक जोड़ा गया!');
        })
        .catch(err => alert('❌ Error: ' + err.message));
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
        container.innerHTML = Object.entries(data).map(([key, v]) => `
            <div class="admin-item">
                <video src="${v.url}" class="admin-thumb video-thumb" muted></video>
                <div class="admin-item-info">
                    <strong>${v.title || 'No Title'}</strong>
                    <small>Direct Video</small>
                </div>
                <button class="admin-delete-btn" onclick="deleteVideo('${key}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `).join('');
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
