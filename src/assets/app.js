function updatePreview() {
    const tag = document.getElementById('tag-input').value;
    const recipient = document.getElementById('recipient-input').value;
    const title = document.getElementById('title-input').value;
    const sub = document.getElementById('sub-input').value;
    const coach = document.getElementById('coach-input').value;
    const coachLabel = document.getElementById('coach-label-input').value;
    const date = document.getElementById('date-input').value;
    const business = document.getElementById('business-input').value;
    const location = document.getElementById('location-input').value;
    const website = document.getElementById('website-input').value;
    const email = document.getElementById('email-input').value;
    const phone = document.getElementById('phone-input').value;

    document.getElementById('preview-tag').innerText = tag;
    document.getElementById('preview-recipient').innerText = recipient;
    document.getElementById('preview-title').innerText = title;
    document.getElementById('preview-sub').innerText = sub;
    document.getElementById('preview-coach').innerText = coach;
    document.getElementById('preview-coach-label').innerText = coachLabel;
    document.getElementById('preview-date').innerText = date;
    document.getElementById('preview-business').innerText = business;
    document.getElementById('preview-location').innerText = location;
    document.getElementById('preview-website').innerText = website;
    document.getElementById('preview-email').innerText = email;
    document.getElementById('preview-phone').innerText = phone;
}

const BADGE_COLORS = {
    zinc:   { bg: 'rgba(244,244,245,1)',   color: 'rgba(63,63,70,1)' },
    red:    { bg: 'rgba(254,226,226,1)',    color: 'rgba(185,28,28,1)' },
    amber:  { bg: 'rgba(254,243,199,1)',    color: 'rgba(146,64,14,1)' },
    green:  { bg: 'rgba(220,252,231,1)',    color: 'rgba(22,101,52,1)' },
    blue:   { bg: 'rgba(219,234,254,1)',    color: 'rgba(30,64,175,1)' },
    purple: { bg: 'rgba(243,232,255,1)',    color: 'rgba(107,33,168,1)' },
    pink:   { bg: 'rgba(252,231,243,1)',    color: 'rgba(157,23,77,1)' },
};

function setBadgeColor(color) {
    const tag = document.getElementById('preview-tag');
    const c = BADGE_COLORS[color] || BADGE_COLORS.zinc;
    tag.style.backgroundColor = c.bg;
    tag.style.color = c.color;
}

let customBgDataUrl = '';

function setSkin(skinName) {
    const preview = document.getElementById('certificate-preview');
    const bgLayer = document.getElementById('preview-bg-layer');
    const customBgContainer = document.getElementById('custom-bg-container');

    preview.className = 'cert-render-area';
    bgLayer.src = '';
    bgLayer.style.display = 'none';

    // Toggle the upload UI only when the Custom card is selected
    if (customBgContainer) {
        customBgContainer.style.display = skinName === 'custom' ? 'block' : 'none';
    }

    preview.classList.add(`skin-${skinName}`);
    if (skinName === 'plain') {
        bgLayer.style.display = 'none';
        preview.style.backgroundColor = '#ffffff';
        bgLayer.style.objectFit = 'fill';
    } else if (skinName === 'custom') {
        if (customBgDataUrl) {
            bgLayer.src = customBgDataUrl;
            bgLayer.style.display = 'block';
            bgLayer.style.objectFit = 'cover';
            preview.style.backgroundColor = 'transparent';
        } else {
            // No image uploaded yet — show white canvas
            preview.style.backgroundColor = '#ffffff';
        }
    } else if (typeof SKINS !== 'undefined' && SKINS[skinName]) {
        bgLayer.src = SKINS[skinName];
        bgLayer.style.display = 'block';
        bgLayer.style.objectFit = 'fill';
        preview.style.backgroundColor = 'transparent';
    }
}

function handleBackgroundUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const bgLayer = document.getElementById('preview-bg-layer');
    const preview = document.getElementById('certificate-preview');
    const uploadBtn = document.getElementById('bg-upload-btn');
    const previewRow = document.getElementById('bg-preview-row');
    const thumb = document.getElementById('bg-preview-thumb');
    const statusText = document.getElementById('bg-file-status');

    const reader = new FileReader();
    reader.onload = function (e) {
        customBgDataUrl = e.target.result;
        bgLayer.src = customBgDataUrl;
        bgLayer.style.display = 'block';
        bgLayer.style.objectFit = 'cover';
        preview.style.backgroundColor = 'transparent';
        thumb.src = customBgDataUrl;
        statusText.innerText = file.name;
        uploadBtn.style.display = 'none';
        previewRow.style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

function removeBackgroundUpload() {
    const bgLayer = document.getElementById('preview-bg-layer');
    const preview = document.getElementById('certificate-preview');
    const uploadBtn = document.getElementById('bg-upload-btn');
    const previewRow = document.getElementById('bg-preview-row');
    const fileInput = document.getElementById('bg-upload');

    customBgDataUrl = '';
    bgLayer.src = '';
    bgLayer.style.display = 'none';
    preview.style.backgroundColor = '#ffffff';
    uploadBtn.style.display = '';
    previewRow.style.display = 'none';
    if (fileInput) fileInput.value = '';
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const preview = document.getElementById('preview-logo');
    const uploadBtn = document.getElementById('logo-upload-btn');
    const previewRow = document.getElementById('logo-preview-row');
    const thumb = document.getElementById('logo-preview-thumb');
    const statusText = document.getElementById('logo-status-text');

    const reader = new FileReader();
    reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
        thumb.src = e.target.result;
        statusText.innerText = file.name;
        uploadBtn.style.display = 'none';
        previewRow.style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

function removeLogo() {
    const preview = document.getElementById('preview-logo');
    const uploadBtn = document.getElementById('logo-upload-btn');
    const previewRow = document.getElementById('logo-preview-row');
    const fileInput = document.getElementById('logo-upload');

    preview.src = '';
    preview.style.display = 'none';
    uploadBtn.style.display = '';
    previewRow.style.display = 'none';
    if (fileInput) fileInput.value = '';
}

function handleSignatureUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const preview = document.getElementById('preview-signature');
    const stamp = preview.parentElement;
    const uploadBtn = document.getElementById('signature-upload-btn');
    const previewRow = document.getElementById('signature-preview-row');
    const thumb = document.getElementById('signature-preview-thumb');
    const statusText = document.getElementById('signature-status-text');

    const reader = new FileReader();
    reader.onload = function (e) {
        preview.src = e.target.result;
        stamp.classList.add('has-image');
        thumb.src = e.target.result;
        statusText.innerText = file.name;
        uploadBtn.style.display = 'none';
        previewRow.style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

function removeSignature() {
    const preview = document.getElementById('preview-signature');
    const stamp = preview.parentElement;
    const uploadBtn = document.getElementById('signature-upload-btn');
    const previewRow = document.getElementById('signature-preview-row');
    const fileInput = document.getElementById('signature-upload');

    preview.src = '';
    stamp.classList.remove('has-image');
    uploadBtn.style.display = '';
    previewRow.style.display = 'none';
    if (fileInput) fileInput.value = '';
}

let toastTimer = null;
function showToast(message, duration, type) {
    const toast = document.getElementById('status-toast');
    toast.innerText = message;
    toast.classList.toggle('toast-error', type === 'error');
    toast.style.display = 'block';
    if (toastTimer) clearTimeout(toastTimer);
    if (duration) {
        toastTimer = setTimeout(() => { toast.style.display = 'none'; }, duration);
    }
}

function clearEmailError() {
    const emailInput = document.getElementById('email-input');
    emailInput.classList.remove('input-error');
    document.getElementById('email-error').classList.remove('visible');
}

function handleDownload() {
    const emailInput = document.getElementById('email-input');
    const emailValue = emailInput.value.trim();
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        emailInput.classList.add('input-error');
        document.getElementById('email-error').classList.add('visible');
        showToast('Please enter your email address to continue', 3000, 'error');
        emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => emailInput.focus(), 400);
        return;
    }
    clearEmailError();

    const isBatch = document.getElementById('batch-names-container').style.display !== 'none';
    const namesText = document.getElementById('batch-names-input').value;
    const singleName = document.getElementById('recipient-input').value || 'Athlete';

    let names = [];
    if (isBatch) {
        names = namesText.split(/[\n,]+/).map(n => n.trim()).filter(n => n !== '');
        if (names.length === 0) return alert("Please enter names.");
    } else {
        names = [singleName];
    }

    const leadKey = 'cert-lead-sent';
    const alreadySent = sessionStorage.getItem(leadKey) === emailValue;

    if (!alreadySent) {
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                content_name: 'Certificate Generator',
                content_category: 'free-tools'
            });
        }

        fetch('/free-tools/certificates/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: emailValue,
                website: document.getElementById('website-input').value,
            })
        }).then(() => {
            sessionStorage.setItem(leadKey, emailValue);
        }).catch(() => {});
    }

    showToast('Preparing Print...');

    const batchZone = document.getElementById('batch-print-zone');
    batchZone.innerHTML = '';
    
    const originalCert = document.getElementById('certificate-preview');
    const skinClasses = Array.from(originalCert.classList).join(' ');
    const bgSrc = originalCert.querySelector('#preview-bg-layer').src;
    const bgDisplay = originalCert.querySelector('#preview-bg-layer').style.display;
    const bgColor = originalCert.querySelector('#preview-bg-layer').style.backgroundColor;
    const bgObjectFit = originalCert.querySelector('#preview-bg-layer').style.objectFit || 'fill';
    
    const tag = document.getElementById('tag-input').value;
    const title = document.getElementById('title-input').value;
    const sub = document.getElementById('sub-input').value;
    const coach = document.getElementById('coach-input').value;
    const date = document.getElementById('date-input').value;
    const coachLabel = document.getElementById('coach-label-input').value;
    const business = document.getElementById('business-input').value;
    const location = document.getElementById('location-input').value;
    const website = document.getElementById('website-input').value;
    const email = document.getElementById('email-input').value;
    const phone = document.getElementById('phone-input').value;
    const sealClass = Array.from(document.getElementById('preview-seal').classList).find(c => c.startsWith('seal-')) || 'seal-none';
    const sealLabel = document.getElementById('preview-seal').getAttribute('data-label') || '';
    const logoEl = document.getElementById('preview-logo');
    const hasLogo = logoEl.style.display === 'block';
    const customLogoSrc = hasLogo ? logoEl.src : '';
    const sigEl = document.getElementById('preview-signature');
    const hasSig = sigEl.parentElement.classList.contains('has-image');
    const signatureSrc = hasSig ? sigEl.src : '';
    const tagEl = document.getElementById('preview-tag');
    const tagBg = tagEl.style.backgroundColor || '';
    const tagColor = tagEl.style.color || '';

    let batchHtml = '';
    names.forEach(name => {
        const sanitizedName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        batchHtml += `
            <div class="${skinClasses}" style="transform: none; margin: 0 auto; page-break-after: always;">
                <img class="cert-bg-layer" src="${bgSrc}" style="display: ${bgDisplay}; background-color: ${bgColor}; width: 100%; height: 100%; object-fit: ${bgObjectFit}; position: absolute; top: 0; left: 0; z-index: 0; pointer-events: none;">
                <div class="cert-content">
                    ${hasLogo ? `<div class="cert-logo-top"><img src="${customLogoSrc}" style="display:block;"></div>` : ''}
                    <div class="cert-tag" style="background-color:${tagBg};color:${tagColor};">${tag}</div>
                    <div class="cert-seal ${sealClass}" data-label="${sealLabel}"></div>
                    <h1 class="cert-headline">${title}</h1>
                    <p class="presented-text">This certificate is proudly presented to</p>
                    <div class="cert-recipient">${sanitizedName}</div>
                    <p class="cert-sub">${sub}</p>
                    <div class="signature-area">
                        ${hasSig ? `<div class="sig-stamp has-image"><img src="${signatureSrc}" style="display:block;"></div>` : ''}
                        <div class="sig-details">
                            <p class="sig-name">${coach}</p>
                            <p class="sig-label">${coachLabel}</p>
                            <p class="sig-date">${date}</p>
                        </div>
                    </div>
                    <div class="cert-org-info">
                        <span>${business}</span>
                        <span>${location}</span>
                    </div>
                </div>
                <div class="cert-contact-info">
                    <span>${website}</span>
                    <span>${email}</span>
                    <span>${phone}</span>
                </div>
                <p class="cert-generated">Generated on Classcardapp.com</p>
            </div>
        `;
    });
    batchZone.innerHTML = batchHtml;

    setTimeout(() => {
        document.getElementById('status-toast').style.display = 'none';
        batchZone.style.display = 'block';
        document.body.classList.add('printing');

        window.print();

        document.body.classList.remove('printing');
        batchZone.style.display = 'none';
    }, 500);
}

window.addEventListener('beforeprint', () => {
    document.body.classList.add('printing');
});
window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing');
    const bz = document.getElementById('batch-print-zone');
    if (bz) bz.style.display = 'none';
});

// Global state for layout
let manualScale = null;

function updateSidebarWidth(width) {
    document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
    localStorage.setItem('classcard-sidebar-width', width);
    scalePreview();
}

function updateManualScale(scale) {
    manualScale = parseFloat(scale);
    document.getElementById('preview-zoom-val').innerText = (manualScale * 100).toFixed(0) + '%';
    scalePreview();
}

function resetZoom() {
    manualScale = null;
    document.getElementById('preview-zoom-val').innerText = 'Auto';
    document.getElementById('preview-zoom-slider').value = 0.9;
    scalePreview();
}

function adjustZoom(delta) {
    const slider = document.getElementById('preview-zoom-slider');
    const current = manualScale || parseFloat(slider.value);
    const next = Math.min(1.5, Math.max(0.3, current + delta));
    slider.value = next;
    updateManualScale(next);
}

function syncThemeIcons(isDark) {
    document.getElementById('theme-icon-moon').style.display = isDark ? 'none' : '';
    document.getElementById('theme-icon-sun').style.display = isDark ? '' : 'none';
    var mm = document.querySelector('.mobile-icon-moon');
    var ms = document.querySelector('.mobile-icon-sun');
    if (mm) mm.style.display = isDark ? 'none' : '';
    if (ms) ms.style.display = isDark ? '' : 'none';
}

function toggleTheme() {
    var isDark = document.body.classList.toggle('theme-dark');
    syncThemeIcons(isDark);
    localStorage.setItem('classcard-theme', isDark ? 'dark' : 'light');
}

function initTheme() {
    var savedTheme = localStorage.getItem('classcard-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('theme-dark');
        syncThemeIcons(true);
    }
}

function initResizer() {
    const resizer = document.getElementById('sidebar-resizer');
    let isDragging = false;
    if (!resizer) return;
    resizer.addEventListener('mousedown', () => { isDragging = true; resizer.classList.add('dragging'); });
    document.addEventListener('mousemove', (e) => { if (isDragging && e.clientX >= 300 && e.clientX <= 800) updateSidebarWidth(e.clientX); });
    document.addEventListener('mouseup', () => { isDragging = false; resizer.classList.remove('dragging'); });
}

function scalePreview() {
    const scaler = document.getElementById('preview-scaler');
    const container = document.querySelector('.preview-container');
    if (!scaler || !container) return;

    if (manualScale) { scaler.style.transform = `scale(${manualScale})`; return; }

    const availableWidth = container.offsetWidth || window.innerWidth - 400;
    const availableHeight = container.offsetHeight || window.innerHeight - 100;
    const cert = document.querySelector('.cert-render-area');
    const targetWidth = cert ? cert.offsetWidth : 1123;
    const targetHeight = cert ? cert.offsetHeight : 794;
    
    const isMobile = window.matchMedia('(max-width: 850px)').matches;
    const pad = isMobile ? 0 : 40;
    const scaleX = (availableWidth - pad) / targetWidth;
    const scaleY = (availableHeight - pad) / targetHeight;
    const scale = isMobile ? scaleX : Math.min(scaleX, scaleY, 0.9);
    scaler.style.zoom = '';
    if (isMobile) {
        const mobilePad = 10;
        const mobileScale = (availableWidth - mobilePad * 2) / targetWidth;
        const scaledHeight = targetHeight * mobileScale;
        scaler.style.transformOrigin = 'top center';
        scaler.style.transform = `scale(${mobileScale})`;
        scaler.style.marginLeft = '';
        container.style.height = (scaledHeight + 20) + 'px';
    } else {
        scaler.style.transformOrigin = '';
        scaler.style.marginLeft = '';
        scaler.style.transform = `scale(${scale})`;
        container.style.height = '';
    }
}

window.onload = function() {
    initTheme();
    initResizer();
    const savedWidth = localStorage.getItem('classcard-sidebar-width');
    if (savedWidth) updateSidebarWidth(savedWidth);
    window.addEventListener('resize', scalePreview);
    scalePreview();
    updatePreview();
    setSkin('plain');
    if (window.matchMedia('(max-width: 850px)').matches) {
        switchMobileTab('edit');
        updateMobileOffsets();
        window.addEventListener('resize', updateMobileOffsets);
    }
};

function updateMobileOffsets() {
    var mobileTop = document.querySelector('.mobile-top');
    if (!mobileTop || !window.matchMedia('(max-width: 850px)').matches) return;
    var h = mobileTop.offsetHeight;
    document.documentElement.style.setProperty('--mobile-top-h', h + 'px');
}

function switchMobileTab(tab) {
    const isEdit = tab === 'edit';
    document.body.classList.toggle('show-edit', isEdit);
    document.body.classList.toggle('show-view', !isEdit);
    document.getElementById('btn-edit').classList.toggle('active', isEdit);
    document.getElementById('btn-view').classList.toggle('active', !isEdit);
    requestAnimationFrame(scalePreview);
}

function setEntryMode(mode) {
    const isBatch = mode === 'batch';
    document.getElementById('single-name-container').style.display = isBatch ? 'none' : '';
    document.getElementById('batch-names-container').style.display = isBatch ? '' : 'none';
    document.getElementById('download-btn').innerText = isBatch ? 'Print Certificates' : 'Print Certificate';
    updatePreview();
}

let currentSealType = 'none';
function setSeal(type) {
    currentSealType = type;
    const seal = document.getElementById('preview-seal');
    seal.className = 'cert-seal';
    if (type !== 'none') {
        seal.classList.add('active', `seal-${type}`);
        updateSealLabel();
    }
}

function updateSealLabel() {
    const seal = document.getElementById('preview-seal');
    if (currentSealType === 'none') return;
    const selected = document.querySelector('#seal-label-listbox .listbox-option.selected');
    const style = selected ? selected.getAttribute('data-value') : 'ordinal';
    let label = style === 'ordinal' ? (currentSealType === 'gold' ? '1st' : (currentSealType === 'silver' ? '2nd' : '3rd')) : currentSealType.toUpperCase();
    seal.setAttribute('data-label', label);
}

function toggleListbox(id) {
    const listbox = document.getElementById(id);
    const wasOpen = listbox.classList.contains('open');
    document.querySelectorAll('.listbox.open').forEach(lb => lb.classList.remove('open'));
    if (!wasOpen) listbox.classList.add('open');
}

function selectListboxOption(el) {
    const listbox = el.closest('.listbox');
    listbox.querySelectorAll('.listbox-option').forEach(opt => opt.classList.remove('selected'));
    el.classList.add('selected');
    listbox.querySelector('.listbox-selected').textContent = el.querySelector('span').textContent;
    listbox.classList.remove('open');
    updateSealLabel();
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.listbox')) {
        document.querySelectorAll('.listbox.open').forEach(lb => lb.classList.remove('open'));
    }
});