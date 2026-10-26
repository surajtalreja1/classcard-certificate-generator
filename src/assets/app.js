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
    refreshLayoutUi();
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
let currentSkin = 'plain';
let currentOrientation = 'landscape';

// Returns the artwork URL for a skin in the given orientation. Skins without a
// portrait variant fall back to their landscape art. Also accepts the older
// flat SKINS map ({ name: url }) in case it is ever loaded.
function getSkinUrl(skinName, orientation) {
    if (typeof SKINS === 'undefined') return '';
    const set = SKINS[orientation];
    if (set && set[skinName]) return set[skinName];
    if (SKINS.landscape && SKINS.landscape[skinName]) return SKINS.landscape[skinName];
    return typeof SKINS[skinName] === 'string' ? SKINS[skinName] : '';
}

const UPLOAD_HINTS = {
    landscape: 'Landscape image recommended (1123×794px or larger). Image will fill the certificate canvas.',
    portrait: 'Portrait image recommended (794×1123px or larger). Image will fill the certificate canvas.',
};

function applyPrintPageSize() {
    let styleEl = document.getElementById('print-page-size');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'print-page-size';
        document.head.appendChild(styleEl);
    }
    styleEl.textContent = `@media print { @page { size: A4 ${currentOrientation}; margin: 0; } }`;
}

function setOrientation(orientation) {
    currentOrientation = orientation === 'portrait' ? 'portrait' : 'landscape';
    const isPortrait = currentOrientation === 'portrait';

    document.getElementById('certificate-preview').classList.toggle('orient-portrait', isPortrait);

    // Swap the background picker thumbnails to the matching artwork
    const skinGrid = document.getElementById('skin-grid');
    if (skinGrid) skinGrid.classList.toggle('thumbs-portrait', isPortrait);
    document.querySelectorAll('.card-radio-thumb[data-skin]').forEach(thumb => {
        const url = getSkinUrl(thumb.dataset.skin, currentOrientation);
        if (url) thumb.style.backgroundImage = `url("${url}")`;
    });

    const hint = document.getElementById('bg-upload-hint');
    if (hint) hint.innerText = UPLOAD_HINTS[currentOrientation];

    applyPrintPageSize();
    setSkin(currentSkin);
    applyLayoutOffsets();
    scalePreview();
}

function setSkin(skinName) {
    const preview = document.getElementById('certificate-preview');
    const bgLayer = document.getElementById('preview-bg-layer');

    currentSkin = skinName;
    // Drop only the previous skin class so the orientation class survives
    Array.from(preview.classList)
        .filter(c => c.startsWith('skin-'))
        .forEach(c => preview.classList.remove(c));
    bgLayer.src = '';
    bgLayer.style.display = 'none';

    preview.classList.add(`skin-${skinName}`);
    if (skinName === 'plain') {
        bgLayer.style.display = 'none';
        preview.style.backgroundColor = '#ffffff';
        bgLayer.style.objectFit = 'fill';
    } else if (skinName === 'custom') {
        const customUrl = activeCustomBackground();
        if (customUrl) {
            bgLayer.src = customUrl;
            bgLayer.style.display = 'block';
            bgLayer.style.objectFit = 'cover';
            preview.style.backgroundColor = 'transparent';
        } else {
            // No image uploaded yet — show white canvas
            preview.style.backgroundColor = '#ffffff';
        }
    } else {
        const url = getSkinUrl(skinName, currentOrientation);
        if (url) {
            bgLayer.src = url;
            bgLayer.style.display = 'block';
            bgLayer.style.objectFit = 'fill';
            preview.style.backgroundColor = 'transparent';
        }
    }
}

// --- Background upload modal ---
// Picking the Upload card opens this modal. The chosen image previews live on
// the certificate behind the dimmed backdrop; Cancel puts everything back the
// way it was, "Use background" commits it.

let customBgMeta = null;          // { name, width, height } of the committed image
let bgModalSnapshot = null;       // state to restore on Cancel
let bgModalPending = '';          // image shown while the modal is open
let bgModalPendingMeta = null;
let bgModalReturnFocus = null;
let bgModalPointerOnBackdrop = false;

function isBgModalOpen() {
    const overlay = document.getElementById('bg-modal-overlay');
    return !!overlay && overlay.classList.contains('open');
}

// The custom image the certificate should show right now.
function activeCustomBackground() {
    return isBgModalOpen() ? bgModalPending : customBgDataUrl;
}

function checkRadio(name, value) {
    const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (input) input.checked = true;
}

function openBgModal() {
    if (isBgModalOpen()) return;
    bgModalSnapshot = {
        skin: currentSkin,
        dataUrl: customBgDataUrl,
        meta: customBgMeta,
        orientation: currentOrientation,
    };
    bgModalPending = customBgDataUrl;
    bgModalPendingMeta = customBgMeta;
    bgModalReturnFocus = document.querySelector('input[name="skin"][value="custom"]');

    document.getElementById('bg-modal-overlay').classList.add('open');
    document.body.classList.add('modal-open');
    checkRadio('skin', 'custom');
    setSkin('custom');
    renderBgModal();
    setBgModalError('');
    requestAnimationFrame(() => {
        const target = bgModalPending ? document.getElementById('bg-apply-btn') : document.getElementById('bg-dropzone');
        if (target) target.focus();
    });
}

function hideBgModal() {
    document.getElementById('bg-modal-overlay').classList.remove('open');
    document.body.classList.remove('modal-open');
    const dropzone = document.getElementById('bg-dropzone');
    if (dropzone) dropzone.classList.remove('dragging');
    const fileInput = document.getElementById('bg-upload');
    if (fileInput) fileInput.value = '';
    bgModalPending = '';
    bgModalPendingMeta = null;
    bgModalSnapshot = null;
    if (bgModalReturnFocus) bgModalReturnFocus.focus({ preventScroll: true });
    bgModalReturnFocus = null;
}

// apply = true commits the pending image; false (Cancel, Esc, backdrop, ×)
// restores the background, skin and orientation from before the modal opened.
function closeBgModal(apply) {
    if (!isBgModalOpen()) return;
    const snap = bgModalSnapshot;
    const pending = bgModalPending;
    const pendingMeta = bgModalPendingMeta;

    if (apply && pending) {
        customBgDataUrl = pending;
        customBgMeta = pendingMeta;
        hideBgModal();
        checkRadio('skin', 'custom');
        setSkin('custom');
        updateUploadCard();
        showToast('Background added. Use “Adjust layout” to line things up.', 3500);
        return;
    }

    customBgDataUrl = snap.dataUrl;
    customBgMeta = snap.meta;
    hideBgModal();
    if (currentOrientation !== snap.orientation) {
        checkRadio('orientation', snap.orientation);
        setOrientation(snap.orientation);
    }
    checkRadio('skin', snap.skin);
    setSkin(snap.skin);
    updateUploadCard();
}

// Removes the custom image entirely and falls back to the previous skin.
function removeBackgroundUpload() {
    const snap = bgModalSnapshot;
    const fallback = snap && snap.skin !== 'custom' ? snap.skin : 'plain';
    customBgDataUrl = '';
    customBgMeta = null;
    if (isBgModalOpen()) hideBgModal();
    checkRadio('skin', fallback);
    setSkin(fallback);
    updateUploadCard();
}

function handleBackgroundUpload(event) {
    loadBackgroundFile(event.target.files && event.target.files[0]);
}

function loadBackgroundFile(file) {
    if (!file) return;
    if (!/^image\//.test(file.type)) {
        setBgModalError('Please choose an image file (PNG, JPG, SVG or WebP).');
        return;
    }
    setBgModalError('');
    const reader = new FileReader();
    reader.onload = function (e) {
        const url = e.target.result;
        const img = new Image();
        img.onload = function () {
            setPendingBackground(url, { name: file.name, width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = function () {
            setBgModalError('That image could not be read. Try a PNG or JPG.');
        };
        img.src = url;
    };
    reader.readAsDataURL(file);
}

function setPendingBackground(url, meta) {
    // The user may have cancelled while the file was still loading.
    if (!isBgModalOpen()) return;
    bgModalPending = url;
    bgModalPendingMeta = meta;
    setSkin('custom');
    renderBgModal();
}

function setBgModalError(message) {
    const el = document.getElementById('bg-modal-error');
    if (!el) return;
    el.textContent = message;
    el.hidden = !message;
}

// Orientation the image itself suggests, or null for square-ish/unknown images.
function imageOrientation(meta) {
    if (!meta || !meta.width || !meta.height) return null;
    const ratio = meta.width / meta.height;
    if (ratio > 1.1) return 'landscape';
    if (ratio < 0.9) return 'portrait';
    return null;
}

function renderBgModal() {
    const hasImage = !!bgModalPending;
    const committed = bgModalSnapshot && bgModalSnapshot.dataUrl;
    const meta = bgModalPendingMeta;

    document.getElementById('bg-modal-title').textContent = committed ? 'Change background' : 'Upload background';
    document.getElementById('bg-dropzone').hidden = hasImage;
    document.getElementById('bg-modal-preview').hidden = !hasImage;
    document.getElementById('bg-preview-thumb').src = hasImage ? bgModalPending : '';
    document.getElementById('bg-file-status').textContent = meta && meta.name ? meta.name : 'Your image';
    document.getElementById('bg-file-dims').textContent = meta && meta.width && meta.height ? `${meta.width} × ${meta.height}px` : '';
    document.getElementById('bg-apply-btn').disabled = !hasImage;
    document.getElementById('bg-remove-btn').hidden = !(hasImage || committed);

    const warning = document.getElementById('bg-orient-warning');
    const suggested = hasImage ? imageOrientation(meta) : null;
    if (suggested && suggested !== currentOrientation) {
        const imageWord = suggested === 'portrait' ? 'tall (portrait)' : 'wide (landscape)';
        const certWord = currentOrientation === 'portrait' ? 'vertical' : 'horizontal';
        document.getElementById('bg-orient-warning-text').textContent =
            `This image is ${imageWord}, but your certificate is ${certWord}, so it will be cropped.`;
        document.getElementById('bg-orient-switch').textContent =
            suggested === 'portrait' ? 'Switch to Vertical' : 'Switch to Horizontal';
        warning.hidden = false;
    } else {
        warning.hidden = true;
    }
}

function switchOrientationToImage() {
    const suggested = imageOrientation(bgModalPendingMeta);
    if (!suggested) return;
    checkRadio('orientation', suggested);
    setOrientation(suggested);
    renderBgModal();
    document.getElementById('bg-apply-btn').focus();
}

// The Upload card shows the committed image so it is clear a custom
// background exists; clicking it again reopens the modal to change it.
function updateUploadCard() {
    const thumb = document.getElementById('upload-card-thumb');
    const text = document.getElementById('upload-card-text');
    if (!thumb || !text) return;
    thumb.classList.toggle('has-image', !!customBgDataUrl);
    thumb.style.backgroundImage = customBgDataUrl ? `url("${customBgDataUrl}")` : '';
    text.textContent = customBgDataUrl ? 'Custom' : 'Upload';
}

function bgModalFocusables() {
    const panel = document.querySelector('#bg-modal-overlay .modal-panel');
    return Array.from(panel.querySelectorAll('button, [href], input:not([type="file"]), [tabindex]:not([tabindex="-1"])'))
        .filter(el => !el.disabled && !el.hidden && el.offsetParent !== null);
}

function initBgModal() {
    const overlay = document.getElementById('bg-modal-overlay');
    const panel = overlay.querySelector('.modal-panel');
    const dropzone = document.getElementById('bg-dropzone');

    // Close on backdrop click, but not when a drag that began inside the
    // panel happens to end on the backdrop.
    overlay.addEventListener('pointerdown', (e) => { bgModalPointerOnBackdrop = e.target === overlay; });
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay && bgModalPointerOnBackdrop) closeBgModal(false);
        bgModalPointerOnBackdrop = false;
    });

    // Drag and drop anywhere on the panel.
    let dragDepth = 0;
    panel.addEventListener('dragenter', (e) => { e.preventDefault(); dragDepth++; dropzone.classList.add('dragging'); });
    panel.addEventListener('dragover', (e) => { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; });
    panel.addEventListener('dragleave', () => { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) dropzone.classList.remove('dragging'); });
    panel.addEventListener('drop', (e) => {
        e.preventDefault();
        dragDepth = 0;
        dropzone.classList.remove('dragging');
        const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        loadBackgroundFile(file);
    });
    // A file dropped on the dimmed backdrop should not navigate away.
    overlay.addEventListener('dragover', (e) => e.preventDefault());
    overlay.addEventListener('drop', (e) => e.preventDefault());

    document.addEventListener('keydown', (e) => {
        if (!isBgModalOpen()) return;
        if (e.key === 'Escape') {
            e.preventDefault();
            closeBgModal(false);
        } else if (e.key === 'Tab') {
            const items = bgModalFocusables();
            if (!items.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
                e.preventDefault();
                first.focus();
            }
        }
    });
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
        refreshLayoutUi();
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
    refreshLayoutUi();
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
        refreshLayoutUi();
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
    refreshLayoutUi();
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

// Builds one printable page by cloning the live preview, so whatever the user
// sees (including dragged positions, the seal and the logo spacing) is exactly
// what prints. Only the recipient name changes between batch pages.
function buildPrintCertificate(name) {
    const cert = document.getElementById('certificate-preview').cloneNode(true);
    cert.querySelectorAll('.move-frame').forEach(n => n.remove());
    cert.removeAttribute('id');
    cert.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    cert.querySelectorAll('[data-move]').forEach(n => {
        n.removeAttribute('tabindex');
        n.removeAttribute('aria-label');
        n.classList.remove('is-dragging', 'is-empty');
    });
    cert.querySelector('.cert-recipient').textContent = name;
    cert.style.transform = 'none';
    cert.style.margin = '0 auto';
    cert.style.pageBreakAfter = 'always';
    return cert;
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
    batchZone.replaceChildren(...names.map(buildPrintCertificate));

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

    // A scale transform does not shrink the layout box, so the canvas would
    // keep its full 794/1123px height in the pane and push the layout toolbar
    // and the canvas out of place. Pull the bottom margin in so the layout
    // height matches the visual height.
    const fitLayoutToScale = (s) => {
        const cert = document.querySelector('.cert-render-area');
        const h = cert ? cert.offsetHeight : 794;
        scaler.style.marginBottom = `${h * (s - 1)}px`;
    };
    // On mobile the toolbar sits above the canvas, so leave room for it.
    // On desktop it floats over the pane's enlarged bottom padding instead.

    if (manualScale) {
        scaler.style.transform = `scale(${manualScale})`;
        fitLayoutToScale(manualScale);
        setUiScale(manualScale);
        return;
    }

    const availableWidth = container.offsetWidth || window.innerWidth - 400;
    const availableHeight = container.offsetHeight || window.innerHeight - 100;
    const cert = document.querySelector('.cert-render-area');
    const targetWidth = cert ? cert.offsetWidth : 1123;
    const targetHeight = cert ? cert.offsetHeight : 794;
    
    const isMobile = window.matchMedia('(max-width: 850px)').matches;
    const pad = isMobile ? 0 : 40;
    const scaleX = (availableWidth - pad) / targetWidth;
    // Fit the height inside the pane's padding so the toolbar and canvas
    // both stay fully visible.
    const paneStyle = getComputedStyle(container);
    const innerHeight = availableHeight - parseFloat(paneStyle.paddingTop) - parseFloat(paneStyle.paddingBottom);
    const scaleY = innerHeight / targetHeight;
    const scale = isMobile ? scaleX : Math.min(scaleX, scaleY, 0.9);
    scaler.style.zoom = '';
    if (isMobile) {
        const mobilePad = 10;
        const mobileScale = (availableWidth - mobilePad * 2) / targetWidth;
        const scaledHeight = targetHeight * mobileScale;
        scaler.style.transformOrigin = 'top center';
        scaler.style.transform = `scale(${mobileScale})`;
        scaler.style.marginLeft = '';
        scaler.style.marginBottom = '';
        const toolbar = document.getElementById('layout-toolbar');
        const toolbarSpace = toolbar ? toolbar.offsetHeight + 10 : 0;
        container.style.height = (scaledHeight + 20 + toolbarSpace) + 'px';
        setUiScale(mobileScale);
    } else {
        scaler.style.transformOrigin = '';
        scaler.style.marginLeft = '';
        scaler.style.transform = `scale(${scale})`;
        fitLayoutToScale(scale);
        container.style.height = '';
        setUiScale(scale);
    }
}

function setUiScale(scale) {
    const scaler = document.getElementById('preview-scaler');
    if (scaler && scale > 0) scaler.style.setProperty('--ui-scale', (1 / scale).toFixed(4));
}

window.onload = function() {
    initTheme();
    initResizer();
    const savedWidth = localStorage.getItem('classcard-sidebar-width');
    if (savedWidth) updateSidebarWidth(savedWidth);
    window.addEventListener('resize', scalePreview);
    scalePreview();
    initLayoutEditor();
    initBgModal();
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
    refreshLayoutUi();
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

// --- Layout editor ---
// "Adjust layout" lets people drag each certificate element so it lines up
// with their own background. Elements keep their normal flow position and
// get an extra offset via the CSS `translate` property, so the default design
// is untouched until something is moved. Offsets are kept per orientation,
// because a position tuned for Horizontal is wrong for Vertical.

const MOVABLE_LABELS = {
    logo: 'Logo',
    badge: 'Badge',
    seal: 'Rank seal',
    title: 'Award title',
    presented: 'Presented line',
    recipient: 'Recipient name',
    description: 'Description',
    signature: 'Signature',
    business: 'Business details',
    contact: 'Contact details',
};
const DRAG_THRESHOLD_PX = 3;
const NUDGE_PX = 1;
const NUDGE_LARGE_PX = 10;

const layoutOffsets = { landscape: {}, portrait: {} };
let layoutEditing = false;
let layoutActiveEl = null;
let layoutHoverEl = null;
let layoutDrag = null;

function previewCert() {
    return document.getElementById('certificate-preview');
}

function movableElements() {
    return Array.from(previewCert().querySelectorAll('[data-move]'));
}

function offsetsForOrientation() {
    return layoutOffsets[currentOrientation];
}

function getMoveOffset(key) {
    return offsetsForOrientation()[key] || { x: 0, y: 0 };
}

function writeTranslate(el, x, y) {
    el.style.translate = x || y ? `${x}px ${y}px` : '';
}

function setMoveOffset(el, x, y) {
    const key = el.dataset.move;
    x = Math.round(x);
    y = Math.round(y);
    if (x === 0 && y === 0) delete offsetsForOrientation()[key];
    else offsetsForOrientation()[key] = { x, y };
    writeTranslate(el, x, y);
    updateLayoutControls();
    refreshMoveFrame();
}

function applyLayoutOffsets() {
    movableElements().forEach(el => {
        const o = getMoveOffset(el.dataset.move);
        writeTranslate(el, o.x, o.y);
    });
    refreshLayoutUi();
}

// Rendered size ÷ layout size: the preview's current zoom.
function previewScale() {
    const cert = previewCert();
    const s = cert.getBoundingClientRect().width / cert.offsetWidth;
    return s > 0 ? s : 1;
}

// An element's box in unscaled certificate pixels (includes its offset).
function boxInCert(el, scale) {
    const s = scale || previewScale();
    const c = previewCert().getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { left: (r.left - c.left) / s, top: (r.top - c.top) / s, width: r.width / s, height: r.height / s };
}

// Keeps an element on the canvas: its box may touch the edges but not leave.
function clampMoveOffset(el, x, y, scale) {
    const cert = previewCert();
    const current = getMoveOffset(el.dataset.move);
    const box = boxInCert(el, scale);
    const baseLeft = box.left - current.x;
    const baseTop = box.top - current.y;
    const clamp = (v, a, b) => Math.min(Math.max(v, Math.min(a, b)), Math.max(a, b));
    return {
        x: clamp(x, -baseLeft, cert.offsetWidth - baseLeft - box.width),
        y: clamp(y, -baseTop, cert.offsetHeight - baseTop - box.height),
    };
}

function isMovableEmpty(el) {
    const key = el.dataset.move;
    if (key === 'logo') return document.getElementById('preview-logo').style.display !== 'block';
    if (key === 'seal') return !el.classList.contains('active');
    return el.offsetWidth === 0 || el.offsetHeight === 0;
}

// Re-syncs empty flags, tab stops and the selection frame after content changes.
function refreshLayoutUi() {
    if (!previewCert()) return;
    movableElements().forEach(el => {
        const empty = isMovableEmpty(el);
        el.classList.toggle('is-empty', empty);
        if (layoutEditing && !empty) {
            el.setAttribute('tabindex', '0');
            el.setAttribute('aria-label', `${MOVABLE_LABELS[el.dataset.move]}. Use arrow keys to move.`);
        } else {
            el.removeAttribute('tabindex');
            el.removeAttribute('aria-label');
        }
    });
    if (layoutActiveEl && isMovableEmpty(layoutActiveEl)) layoutActiveEl = null;
    updateLayoutControls();
    refreshMoveFrame();
}

function updateLayoutControls() {
    const toggle = document.getElementById('layout-toggle');
    const reset = document.getElementById('layout-reset');
    if (toggle) {
        toggle.setAttribute('aria-pressed', layoutEditing ? 'true' : 'false');
        // Active state uses the same black button as Print Certificate.
        toggle.classList.toggle('btn-primary', layoutEditing);
        toggle.classList.toggle('btn-outline', !layoutEditing);
        document.getElementById('layout-toggle-text').textContent = layoutEditing ? 'Done' : 'Adjust layout';
    }
    if (reset) {
        reset.hidden = !layoutEditing;
        reset.disabled = Object.keys(offsetsForOrientation()).length === 0;
    }
}

function refreshMoveFrame() {
    const frame = document.getElementById('move-frame');
    if (!frame) return;
    const el = layoutEditing ? ((layoutDrag && layoutDrag.el) || layoutHoverEl || layoutActiveEl) : null;
    if (!el || isMovableEmpty(el)) {
        frame.classList.remove('visible');
        return;
    }
    const pad = 6;
    const box = boxInCert(el);
    frame.style.left = `${box.left - pad}px`;
    frame.style.top = `${box.top - pad}px`;
    frame.style.width = `${box.width + pad * 2}px`;
    frame.style.height = `${box.height + pad * 2}px`;
    frame.classList.add('visible');
    frame.classList.toggle('is-selected', el === layoutActiveEl);

    const label = document.getElementById('move-frame-label');
    label.textContent = MOVABLE_LABELS[el.dataset.move] || '';
    // Flip the label inside the canvas when it would be clipped.
    frame.classList.toggle('label-below', box.top - pad - label.offsetHeight - 4 < 0);
    frame.classList.toggle('label-right', box.left - pad + label.offsetWidth > previewCert().offsetWidth);
}

function selectMovable(el) {
    layoutActiveEl = el;
    if (el) el.focus({ preventScroll: true });
    refreshMoveFrame();
}

function setLayoutMode(on) {
    layoutEditing = !!on;
    document.body.classList.toggle('layout-editing', layoutEditing);
    if (!layoutEditing) {
        layoutActiveEl = null;
        layoutHoverEl = null;
        layoutDrag = null;
        document.body.classList.remove('layout-dragging');
        if (document.activeElement && document.activeElement.closest && document.activeElement.closest('[data-move]')) {
            document.activeElement.blur();
        }
    }
    refreshLayoutUi();
}

function toggleLayoutMode() {
    setLayoutMode(!layoutEditing);
    if (layoutEditing) {
        showToast('Drag any element to move it. Arrow keys nudge, double-click resets.', 3500);
    }
}

function resetLayout() {
    layoutOffsets[currentOrientation] = {};
    applyLayoutOffsets();
}

function onLayoutPointerDown(e) {
    if (!layoutEditing || e.button !== 0) return;
    const el = e.target.closest('[data-move]');
    if (!el || el.classList.contains('is-empty')) {
        selectMovable(null);
        return;
    }
    e.preventDefault();
    selectMovable(el);
    const o = getMoveOffset(el.dataset.move);
    layoutDrag = { el, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, ox: o.x, oy: o.y, scale: previewScale(), moved: false };
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* pointer already released */ }
}

function onLayoutPointerMove(e) {
    if (!layoutDrag || e.pointerId !== layoutDrag.pointerId) return;
    const d = layoutDrag;
    const screenDx = e.clientX - d.startX;
    const screenDy = e.clientY - d.startY;
    if (!d.moved) {
        if (Math.hypot(screenDx, screenDy) < DRAG_THRESHOLD_PX) return;
        d.moved = true;
        d.el.classList.add('is-dragging');
        document.body.classList.add('layout-dragging');
    }
    const next = clampMoveOffset(d.el, d.ox + screenDx / d.scale, d.oy + screenDy / d.scale, d.scale);
    setMoveOffset(d.el, next.x, next.y);
}

function onLayoutPointerUp(e) {
    if (!layoutDrag || e.pointerId !== layoutDrag.pointerId) return;
    const el = layoutDrag.el;
    el.classList.remove('is-dragging');
    document.body.classList.remove('layout-dragging');
    try { el.releasePointerCapture(e.pointerId); } catch (err) { /* already released */ }
    layoutDrag = null;
    refreshMoveFrame();
}

function onLayoutKeyDown(e) {
    if (!layoutEditing) return;
    const el = e.target.closest && e.target.closest('[data-move]');
    if (!el || !previewCert().contains(el)) return;
    if (e.key === 'Escape') {
        el.blur();
        selectMovable(null);
        return;
    }
    const step = e.shiftKey ? NUDGE_LARGE_PX : NUDGE_PX;
    const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!delta) return;
    e.preventDefault();
    const o = getMoveOffset(el.dataset.move);
    const next = clampMoveOffset(el, o.x + delta[0], o.y + delta[1]);
    layoutActiveEl = el;
    setMoveOffset(el, next.x, next.y);
}

function initLayoutEditor() {
    const cert = previewCert();
    if (!cert) return;
    cert.addEventListener('pointerdown', onLayoutPointerDown);
    cert.addEventListener('pointermove', onLayoutPointerMove);
    cert.addEventListener('pointerup', onLayoutPointerUp);
    cert.addEventListener('pointercancel', onLayoutPointerUp);
    cert.addEventListener('keydown', onLayoutKeyDown);
    cert.addEventListener('focusin', (e) => {
        const el = layoutEditing && e.target.closest('[data-move]');
        if (el) { layoutActiveEl = el; refreshMoveFrame(); }
    });
    cert.addEventListener('pointerover', (e) => {
        if (!layoutEditing || e.pointerType === 'touch') return;
        const el = e.target.closest('[data-move]');
        layoutHoverEl = el && !el.classList.contains('is-empty') ? el : null;
        refreshMoveFrame();
    });
    cert.addEventListener('pointerleave', () => {
        layoutHoverEl = null;
        refreshMoveFrame();
    });
    cert.addEventListener('dblclick', (e) => {
        if (!layoutEditing) return;
        const el = e.target.closest('[data-move]');
        if (el && !el.classList.contains('is-empty')) {
            layoutActiveEl = el;
            setMoveOffset(el, 0, 0);
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && layoutEditing && !isBgModalOpen() && !(e.target.closest && e.target.closest('[data-move]'))) {
            setLayoutMode(false);
        }
    });
    refreshLayoutUi();
}
