document.addEventListener('DOMContentLoaded', initDeviceTracking);
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initNavbar();
    initMobileNav();
    initBackToTop();
    initContactForm();
});

function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;
    let storedTheme;
    try { storedTheme = localStorage.getItem('theme'); } catch { /* Use light mode when storage is unavailable. */ }
    const initialTheme = storedTheme === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', initialTheme);

    if (!toggleBtn) return;

    let switchingTheme = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    toggleBtn.addEventListener('click', async () => {
        if (switchingTheme) return;
        const currentTheme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        const applyTheme = () => {
            root.setAttribute('data-theme', nextTheme);
            try { localStorage.setItem('theme', nextTheme); } catch { /* Keep the theme for this visit. */ }
        };

        if (reducedMotion.matches) {
            applyTheme();
            return;
        }

        switchingTheme = true;
        if (!document.startViewTransition) {
            root.classList.add('theme-fading');
            requestAnimationFrame(() => requestAnimationFrame(() => {
                applyTheme();
                setTimeout(() => {
                    root.classList.remove('theme-fading');
                    switchingTheme = false;
                }, 600);
            }));
            return;
        }

        const { left, top, width, height } = toggleBtn.getBoundingClientRect();
        const x = left + width / 2;
        const y = top + height / 2;
        const radius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );
        // The opaque part of the feathered mask must reach every viewport corner.
        const diameter = Math.ceil(radius * 2 / 0.84);
        root.classList.add('theme-revealing');
        let transition;
        try {
            transition = document.startViewTransition(applyTheme);
            await transition.ready;
            await root.animate([
                { maskSize: '0px 0px', maskPosition: `${x}px ${y}px` },
                {
                    maskSize: `${diameter}px ${diameter}px`,
                    maskPosition: `${x - diameter / 2}px ${y - diameter / 2}px`
                }
            ], {
                duration: 900,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards',
                pseudoElement: '::view-transition-new(root)'
            }).finished;
        } catch {
            transition?.skipTransition();
            applyTheme();
        } finally {
            if (transition) await transition.finished.catch(() => {});
            root.classList.remove('theme-revealing');
            switchingTheme = false;
        }
    });
}

function initNavbar() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        let currentSectionId = 'hero';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

function initMobileNav() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!mobileToggle || !navMenu) return;

    const setMenuOpen = (open) => {
        mobileToggle.classList.toggle('active', open);
        navMenu.classList.toggle('active', open);
        mobileToggle.setAttribute('aria-expanded', String(open));
        mobileToggle.setAttribute('aria-label', portfolioText(open ? 'Tutup menu navigasi' : 'Buka menu navigasi'));
    };

    mobileToggle.addEventListener('click', () => {
        setMenuOpen(!navMenu.classList.contains('active'));
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            setMenuOpen(false);
        });
    });

    document.addEventListener('click', (e) => {
        if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
            setMenuOpen(false);
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navMenu.classList.contains('active')) {
            setMenuOpen(false);
            mobileToggle.focus();
        }
    });
    window.matchMedia('(min-width: 1101px)').addEventListener('change', () => setMenuOpen(false));
}

function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
    });
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('form-submit-btn');
    const formStatus = document.getElementById('form-status');

    if (!form || !submitBtn || !formStatus) return;

    let isSubmitting = false;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        if (!name || !email || !message) return;

        isSubmitting = true;
        submitBtn.disabled = true;
        const originalBtnNodes = Array.from(submitBtn.childNodes);
        submitBtn.innerHTML = `${portfolioText('Mempersiapkan Email...')} <i class="fa-solid fa-spinner fa-spin"></i>`;
        formStatus.innerHTML = '';
        formStatus.className = 'form-status';
        formStatus.style.opacity = '1';

        const mailtoUrl = `mailto:brnfznlkmn@gmail.com?subject=${encodeURIComponent(`${portfolioText('Pesan Portofolio dari')} ${name}`)}&body=${encodeURIComponent(`${portfolioText('Nama')}: ${name}\nEmail: ${email}\n\n${portfolioText('Pesan')}:\n${message}`)}`;

        window.location.href = mailtoUrl;
        formStatus.classList.add('success');
        formStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span data-translation="Membuka aplikasi email Anda...">${portfolioText('Membuka aplikasi email Anda...')}</span>`;
        form.reset();

        submitBtn.disabled = false;
        submitBtn.replaceChildren(...originalBtnNodes);
        isSubmitting = false;

        setTimeout(() => {
            formStatus.style.transition = 'opacity 0.8s';
            formStatus.style.opacity = '0';
            setTimeout(() => {
                formStatus.innerHTML = '';
                formStatus.style.opacity = '1';
            }, 800);
        }, 5000);
    });
}

function initDeviceTracking() {
    const root = document.documentElement;
    if (root.dataset.trackingStarted === 'true') return;
    root.dataset.trackingStarted = 'true';
    root.dataset.trackingStatus = 'initializing';
    // ============================================================
    // Konfigurasi
    // ============================================================
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxI1tFTz9niBcuf1uc6Oe42JrvmkaOIVaDEpg4BDVhgpHEjhGoNUhcci1BorzKmRTS7Bg/exec";

    // ============================================================
    // Deteksi OS, Browser, & Engine Detail
    // ============================================================
    function getDetailedSpecs() {
        const ua = navigator.userAgent;
        let osDetail = "Unknown OS";
        let browserDetail = "Unknown Browser";
        let engine = "Unknown Engine";

        // Deteksi Engine
        if (/WebKit/i.test(ua)) engine = "WebKit";
        if (/Gecko/i.test(ua) && !/WebKit/i.test(ua)) engine = "Gecko";
        if (/Chrome/i.test(ua)) engine = "Blink";

        // Deteksi OS
        if (/iPhone|iPad|iPod/.test(ua)) {
            const v = (ua.match(/OS (\d+)_(\d+)_?(\d+)?/));
            osDetail = v ? `iOS ${v[1]}.${v[2]}.${v[3] || '0'}` : 'iOS';
        } else if (/Android/.test(ua)) {
            const v = (ua.match(/Android (\d+)/));
            osDetail = `Android ${v ? v[1] : 'Unknown'}`;
        } else if (/Windows NT/.test(ua)) {
            const v = ua.match(/Windows NT (\d+\.\d+)/);
            const winMap = {
                "10.0": "10/11",
                "6.3": "8.1",
                "6.2": "8",
                "6.1": "7"
            };
            osDetail = `Windows ${v ? winMap[v[1]] || v[1] : 'Unknown'}`;
        } else {
            osDetail = navigator.platform;
        }

        // Deteksi Browser
        let M = ua.match(/(opera|chrome|safari|firefox|msie|trident|edg(?=\/))\/?\s*(\d+)/i) || [];
        let name = M[1] ? M[1].toLowerCase() : "Unknown";
        let version = M[2] || "0";

        if (name === 'edg') name = 'Edge';
        if (name === 'trident') name = 'IE';

        browserDetail = `${name.charAt(0).toUpperCase() + name.slice(1)} ${version} (${engine})`;

        return { osDetail, browserDetail };
    }

    // ============================================================
    // Deteksi Model Perangkat (khusus iPhone)
    // ============================================================
    function getDeviceModel() {
        const w = window.screen.width;
        const h = window.screen.height;
        const ua = navigator.userAgent;

        if (!/iPhone|iPad|iPod/.test(ua)) return navigator.platform;

        const models = {
            "440:956": "iPhone 16/17 Pro Max",
            "402:874": "iPhone 16/17 Pro",
            "430:932": "iPhone 15/16 Plus / 14 Pro Max",
            "393:852": "iPhone 15/16 / 14 Pro",
            "390:844": "iPhone 12/13/14",
            "428:926": "iPhone 12/13/14 Pro Max",
            "414:896": "iPhone 11/XR/XS Max",
            "375:812": "iPhone X/XS/11Pro",
            "375:667": "iPhone SE/6/7/8",
            "414:736": "iPhone 6/7/8 Plus"
        };

        return models[`${w}:${h}`] || "Apple iPhone";
    }

    // ============================================================
    // Tracking Engine Utama
    // ============================================================
    function startTracker() {
        const specs = getDetailedSpecs();

        const payload = {
            ip: "Hidden/VPN",
            osDetail: specs.osDetail,
            browserDetail: specs.browserDetail,
            ram: navigator.deviceMemory ? navigator.deviceMemory + " GB" : "N/A",
            deviceName: getDeviceModel(),
            lat: null,
            long: null
        };

        const ipReady = resolveVisitorIp().then(ip => { payload.ip = ip; });
        const baseRequest = ipReady.then(() => sendDataToServer(payload));

        async function resolveVisitorIp() {
            const sources = [
                { url: 'https://api.ipify.org?format=json', name: 'ipify' },
                { url: 'https://ipwho.is/?fields=success,ip', name: 'ipwhois' }
            ];
            for (const source of sources) {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 2500);
                try {
                    const response = await fetch(source.url, {
                        signal: controller.signal,
                        credentials: 'omit',
                        referrerPolicy: 'no-referrer'
                    });
                    if (!response.ok) continue;
                    const data = await response.json();
                    if (data.success === false || typeof data.ip !== 'string' || !/^[0-9a-fA-F:.]+$/.test(data.ip)) continue;
                    root.dataset.trackingIpSource = source.name;
                    return data.ip;
                } catch { /* Try the backup when a provider is blocked or times out. */ }
                finally { clearTimeout(timeout); }
            }
            root.dataset.trackingIpSource = 'unavailable';
            return 'Hidden/VPN';
        }

        // Fungsi kirim data
        async function sendDataToServer(data) {
            root.dataset.trackingStatus = 'sending';
            try {
                await fetch(WEB_APP_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    credentials: 'omit',
                    redirect: 'follow',
                    keepalive: true,
                    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
                    body: JSON.stringify(data)
                });
                // An opaque response confirms request completion, not a Sheet write.
                root.dataset.trackingStatus = 'request-complete';
            } catch {
                root.dataset.trackingStatus = 'network-error';
                console.warn('[Tracking] Permintaan ke Google Apps Script gagal. Periksa jaringan dan akses deployment.');
            }
        }

        // Dapatkan lokasi GPS jika diizinkan
        if (navigator.geolocation) {
            try {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        baseRequest.then(() => sendDataToServer({
                            ...payload,
                            lat: pos.coords.latitude,
                            long: pos.coords.longitude
                        }));
                    },
                    () => {},
                    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
                );
            } catch { /* Base tracking does not depend on GPS permission or availability. */ }
        }
    }

    // ============================================================
    // Mulai saat DOM siap, tanpa menunggu gambar, font, atau pergantian bahasa.
    // ============================================================
    startTracker();
}


// --- BLINK EFFECT (Easter Egg) ---
document.addEventListener('DOMContentLoaded', () => {
    const avatarImg = document.getElementById('avatar-img');
    let isBlinking = false;

    if (avatarImg) {
        // Pre-load the closed-eyes image to avoid delay on first blink
        const preloadImage = new Image();
        preloadImage.src = 'assets/brian2.jpeg';

        function blink() {
            if (isBlinking) return;
            isBlinking = true;
            
            // Swap to closed eyes
            avatarImg.src = 'assets/brian2.jpeg';
            
            // A natural human blink lasts around 150ms
            setTimeout(() => {
                // Revert to open eyes
                avatarImg.src = 'assets/brian1.jpeg';
                
                // Add a short cooldown (300ms) before the next blink is allowed
                setTimeout(() => {
                    isBlinking = false;
                }, 300);
            }, 150);
        }

        avatarImg.addEventListener('mouseenter', blink);
        avatarImg.addEventListener('click', blink);
        
        // Auto-blink every 4 seconds
        setInterval(blink, 4000);
    }
});
