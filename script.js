// ── Scroll Reveal ──
const fadeEls = document.querySelectorAll('.fade-in-up');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
fadeEls.forEach(el => revealObserver.observe(el));

// ── Modal open/close ──
function openBooking(serviceName) {
    const modal   = document.getElementById('bookingModal');
    const display = document.getElementById('selectedServiceDisplay');
    const input   = document.getElementById('selectedService');
    if (!modal) return;
    if (display) display.innerText = '📌 ' + serviceName;
    if (input)   input.value       = serviceName;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeBooking() {
    const modal = document.getElementById('bookingModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on overlay click & Escape key
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeBooking();
        });
    }

    // ── WhatsApp Booking Form Submit ──
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const name    = document.getElementById('fullName')?.value.trim()  || '';
            const mobile  = document.getElementById('mobile')?.value.trim()    || '';
            const city    = document.getElementById('city')?.value.trim()      || '';
            const date    = document.getElementById('date')?.value             || '';
            const address = document.getElementById('address')?.value.trim()   || '';
            const message = document.getElementById('message')?.value.trim()   || '';
            const service = document.getElementById('selectedService')?.value  || 'सेवा';

            let text = `🙏 *नमस्कार — नई बुकिंग अनुरोध*\n\n`;
            text += `*सेवा:* ${service}\n`;
            text += `*नाम:* ${name}\n`;
            text += `*मोबाइल:* ${mobile}\n`;
            text += `*शहर:* ${city}\n`;
            text += `*दिनांक:* ${date}\n`;
            text += `*पता:* ${address}\n`;
            if (message) text += `*संदेश:* ${message}\n`;
            text += `\nधन्यवाद। कृपया जल्द संपर्क करें। 🙏`;

            const url = `https://wa.me/916268725050?text=${encodeURIComponent(text)}`;
            window.open(url, '_blank');
            closeBooking();
        });
    }

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeBooking();
    });

    // ── Load from Firebase ──
    loadGalleryFirebase();
    loadCustomServicesFirebase();
});

// ═══════════════════════════════════════
//  GALLERY — Load from Firebase (Real-time)
// ═══════════════════════════════════════
function loadGalleryFirebase() {
    const grid = document.getElementById('galleryGrid');
    const emptyMsg = document.getElementById('galleryEmpty');
    if (!grid || typeof db === 'undefined') return;

    // Listen for photos
    db.ref('photos').on('value', (photoSnap) => {
        db.ref('videos').once('value', (videoSnap) => {
            const photos = photoSnap.val() ? Object.values(photoSnap.val()) : [];
            const videos = videoSnap.val() ? Object.values(videoSnap.val()) : [];

            if (photos.length === 0 && videos.length === 0) {
                if (emptyMsg) emptyMsg.style.display = 'block';
                // Clear any previous items but keep empty message
                grid.innerHTML = '<p class="gallery-empty" id="galleryEmpty">गैलरी में अभी कोई फोटो/वीडियो नहीं है।</p>';
                return;
            }
            if (emptyMsg) emptyMsg.style.display = 'none';

            let html = '';

            photos.forEach(p => {
                let u = p.url || '';
                // Convert Google Drive link to direct image link
                if (u.includes('drive.google.com')) {
                    const driveMatch = u.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                    if (driveMatch && driveMatch[1]) {
                        u = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
                    }
                }
                html += `
                <div class="gallery-item fade-in-up">
                    <img src="${u}" alt="${p.caption || ''}" loading="lazy">
                    <div class="gallery-caption">${p.caption || ''}</div>
                </div>`;
            });

            videos.forEach(v => {
                let videoHtml = '';
                let u = v.url || '';
                
                // Check if YouTube
                if (u.includes('youtube.com') || u.includes('youtu.be')) {
                    const ytMatch = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
                    if (ytMatch && ytMatch[1]) {
                        videoHtml = `<iframe src="https://www.youtube.com/embed/${ytMatch[1]}" frameborder="0" allowfullscreen loading="lazy"></iframe>`;
                    }
                } 
                // Check if Google Drive
                else if (u.includes('drive.google.com')) {
                    const driveMatch = u.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                    if (driveMatch && driveMatch[1]) {
                        videoHtml = `<iframe src="https://drive.google.com/file/d/${driveMatch[1]}/preview" frameborder="0" allowfullscreen loading="lazy"></iframe>`;
                    }
                }
                
                // Fallback to normal video player (for direct .mp4 links)
                if (!videoHtml) {
                    videoHtml = `<video src="${u}" controls controlsList="nodownload"></video>`;
                }

                html += `
                <div class="gallery-item video-item fade-in-up">
                    ${videoHtml}
                    <div class="gallery-caption">${v.title || ''}</div>
                </div>`;
            });

            grid.innerHTML = html;

            // Re-observe new elements for scroll reveal
            grid.querySelectorAll('.fade-in-up').forEach(el => revealObserver.observe(el));
        });
    });
}

// ═══════════════════════════════════════
//  CUSTOM SERVICES — Load from Firebase
// ═══════════════════════════════════════
function loadCustomServicesFirebase() {
    const container = document.querySelector('.services-container');
    if (!container || typeof db === 'undefined') return;

    db.ref('custom_services').on('value', (snapshot) => {
        // Remove previously added custom cards
        container.querySelectorAll('.custom-service-card').forEach(el => el.remove());

        const data = snapshot.val();
        if (!data) return;

        Object.values(data).forEach(s => {
            const card = document.createElement('div');
            card.className = 'service-row fade-in-up custom-service-card';
            card.onclick = () => openBooking(s.name);
            card.innerHTML = `
                <div class="service-icon-box">${s.emoji}</div>
                <div class="service-text">
                    <h3>${s.name}</h3>
                    <p>${s.desc || ''}</p>
                </div>
                <div class="service-action">
                    <button class="book-btn"><i class="fab fa-whatsapp"></i> बुक करें</button>
                </div>`;
            container.appendChild(card);
            revealObserver.observe(card);
        });
    });
}
