function updatePreview() {
    const tag = document.getElementById('tag-input').value;
    const recipient = document.getElementById('recipient-input').value;
    const title = document.getElementById('title-input').value;
    const sub = document.getElementById('sub-input').value;
    const coach = document.getElementById('coach-input').value;
    const coachLabel = document.getElementById('coach-label-input').value;
    const date = document.getElementById('date-input').value;
    const dateLabel = document.getElementById('date-label-input').value;

    document.getElementById('preview-tag').innerText = tag;
    document.getElementById('preview-recipient').innerText = recipient;
    document.getElementById('preview-title').innerText = title;
    document.getElementById('preview-sub').innerText = sub;
    document.getElementById('preview-coach').innerText = coach;
    document.getElementById('preview-coach-label').innerText = coachLabel;
    document.getElementById('preview-date').innerText = date;
    document.getElementById('preview-date-label').innerText = dateLabel;
}

function setSkin(skinName) {
    const preview = document.getElementById('certificate-preview');
    const bgLayer = document.getElementById('preview-bg-layer');
    const options = document.querySelectorAll('.skin-option');

    // Reset
    preview.className = 'cert-render-area';
    bgLayer.src = '';
    bgLayer.style.display = 'none';

    // Apply Skin
    preview.classList.add(`skin-${skinName}`);
    if (skinName === 'plain') {
        bgLayer.style.display = 'none';
        preview.style.backgroundColor = '#ffffff';
    } else if (typeof SKINS !== 'undefined' && SKINS[skinName]) {
        bgLayer.src = SKINS[skinName];
        bgLayer.style.display = 'block';
        preview.style.backgroundColor = 'transparent';
    }
    
    options.forEach(opt => {
        opt.classList.remove('active');
        if (opt.getAttribute('data-skin') === skinName) opt.classList.add('active');
    });
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('preview-logo');
    const status = document.getElementById('file-status');

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            status.innerText = file.name;
        };
        reader.readAsDataURL(file);
    }
}

function handleDownload() {
    const isBatch = document.getElementById('batch-names-container').style.display === 'block';
    const namesText = document.getElementById('batch-names-input').value;
    const singleName = document.getElementById('recipient-input').value || 'Athlete';
    
    let names = [];
    if (isBatch) {
        names = namesText.split('\n').map(n => n.trim()).filter(n => n !== '');
        if (names.length === 0) return alert("Please enter names.");
    } else {
        names = [singleName];
    }

    const toast = document.getElementById('status-toast');
    toast.style.display = 'block';
    toast.innerText = 'Preparing Print...';

    const batchZone = document.getElementById('batch-print-zone');
    batchZone.innerHTML = '';
    
    const originalCert = document.getElementById('certificate-preview');
    const skinClasses = Array.from(originalCert.classList).join(' ');
    const bgSrc = originalCert.querySelector('#preview-bg-layer').src;
    const bgDisplay = originalCert.querySelector('#preview-bg-layer').style.display;
    const bgColor = originalCert.querySelector('#preview-bg-layer').style.backgroundColor;
    
    const tag = document.getElementById('tag-input').value;
    const title = document.getElementById('title-input').value;
    const sub = document.getElementById('sub-input').value;
    const coach = document.getElementById('coach-input').value;
    const date = document.getElementById('date-input').value;
    const coachLabel = document.getElementById('coach-label-input').value;
    const dateLabel = document.getElementById('date-label-input').value;
    const sealClass = Array.from(document.getElementById('preview-seal').classList).find(c => c.startsWith('seal-')) || 'seal-none';
    const sealLabel = document.getElementById('preview-seal').getAttribute('data-label') || '';
    const classcardLogoSrc = document.getElementById('preview-classcard-logo').src;
    const customLogoSrc = document.getElementById('preview-logo').src;

    let batchHtml = '';
    names.forEach(name => {
        // Sanitize name to prevent simple HTML injection via textContent logic
        const sanitizedName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        
        batchHtml += `
            <div class="${skinClasses}" style="width: 841px; height: 595px; transform: none; margin: 0 auto; display: flex; page-break-after: always;">
                <img class="cert-bg-layer" src="${bgSrc}" style="display: ${bgDisplay}; background-color: ${bgColor}; width: 100%; height: 100%; object-fit: fill; position: absolute; top: 0; left: 0; z-index: 0; pointer-events: none;">
                <div class="cert-content">
                    <div class="cert-tag">${tag}</div>
                    <div class="cert-seal ${sealClass}" data-label="${sealLabel}"></div>
                    <h1 class="cert-headline">${title}</h1>
                    <p class="presented-text">This certificate is proudly presented to</p>
                    <div class="cert-recipient">${sanitizedName}</div>
                    <p class="cert-sub">${sub}</p>
                    <div class="signature-area">
                        <div class="sig-box">
                            <div class="sig-line"></div>
                            <p class="sig-name">${coach}</p>
                            <p class="sig-label">${coachLabel}</p>
                        </div>
                        <div class="sig-box">
                            <div class="sig-line"></div>
                            <p class="sig-name">${date}</p>
                            <p class="sig-label">${dateLabel}</p>
                        </div>
                    </div>
                </div>
                <div class="cert-logo-container left">
                    <img src="${classcardLogoSrc}" style="display: block;">
                </div>
                <div class="cert-logo-container">
                    <img src="${customLogoSrc}" style="display: ${customLogoSrc ? 'block' : 'none'};">
                </div>
            </div>
        `;
    });
    batchZone.innerHTML = batchHtml;

    setTimeout(() => {
        toast.style.display = 'none';
        window.print();
    }, 500);
}

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
    scalePreview();
}

function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.toggle('theme-dark');
    document.getElementById('theme-icon').innerText = isDark ? '☀️' : '🌙';
    localStorage.setItem('classcard-theme', isDark ? 'dark' : 'light');
}

function initTheme() {
    const savedTheme = localStorage.getItem('classcard-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('theme-dark');
        document.getElementById('theme-icon').innerText = '☀️';
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
    const targetWidth = 841;
    const targetHeight = 595;
    
    const scaleX = (availableWidth - 40) / targetWidth;
    const scaleY = (availableHeight - 40) / targetHeight;
    const scale = window.innerWidth < 850 ? scaleX : Math.min(scaleX, scaleY, 0.9);
    scaler.style.transform = `scale(${scale})`;
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
    if (typeof SKINS !== 'undefined' && SKINS.logo) {
        document.getElementById('ui-logo').src = SKINS.logo;
        document.getElementById('preview-classcard-logo').src = SKINS.logo;
    }
};

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
    document.getElementById('single-name-container').style.display = isBatch ? 'none' : 'block';
    document.getElementById('batch-names-container').style.display = isBatch ? 'block' : 'none';
    document.getElementById('mode-batch').classList.toggle('active', isBatch);
    document.getElementById('mode-single').classList.toggle('active', !isBatch);
    document.getElementById('download-btn').innerText = isBatch ? 'Print / Save Batch' : 'Print / Save PDF';
    updatePreview();
}

let currentSealType = 'none';
function setSeal(type) {
    currentSealType = type;
    const seal = document.getElementById('preview-seal');
    const buttons = document.querySelectorAll('.seal-btn');
    seal.className = 'cert-seal';
    buttons.forEach(btn => btn.classList.remove('active'));
    if (type !== 'none') {
        seal.classList.add('active', `seal-${type}`);
        const activeBtn = Array.prototype.find.call(buttons, b => b.innerText.toLowerCase().includes(type));
        if (activeBtn) activeBtn.classList.add('active');
        updateSealLabel();
    } else {
        document.getElementById('btn-seal-none').classList.add('active');
    }
}

function updateSealLabel() {
    const seal = document.getElementById('preview-seal');
    if (currentSealType === 'none') return;
    const style = document.getElementById('seal-label-style').value;
    let label = style === 'ordinal' ? (currentSealType === 'gold' ? '1st' : (currentSealType === 'silver' ? '2nd' : '3rd')) : currentSealType.toUpperCase();
    seal.setAttribute('data-label', label);
}
