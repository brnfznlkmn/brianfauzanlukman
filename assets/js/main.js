(async function() {
  // === 1. KONFIGURASI ===
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw3-WO2usqD2ojvMOKdeebahOAOF4SFSoIn1qgUNEKey87BZ3JNyqCHogrBeCw_fRACCQ/exec"; 

  // === 2. DETEKSI OS, BROWSER, & ENGINE DETAIL ===
  const getDetailedSpecs = () => {
    const ua = navigator.userAgent;
    let osDetail = "Unknown OS";
    let browserDetail = "Unknown Browser";
    let engine = "Unknown Engine";

    // Deteksi Engine
    if (/WebKit/i.test(ua)) engine = "WebKit";
    if (/Gecko/i.test(ua) && !/WebKit/i.test(ua)) engine = "Gecko";
    if (/Chrome/i.test(ua)) engine = "Blink";

    // Deteksi OS & Versi
    if (/iPhone|iPad|iPod/.test(ua)) {
      const v = (ua.match(/OS (\d+)_(\d+)_?(\d+)?/));
      osDetail = `iOS ${v[1]}.${v[2]}.${v[3] || '0'}`;
    } else if (/Android/.test(ua)) {
      const v = (ua.match(/Android (\d+)/));
      osDetail = `Android ${v ? v[1] : 'Unknown'}`;
    } else if (/Windows NT/.test(ua)) {
      const v = ua.match(/Windows NT (\d+\.\d+)/);
      const winMap = {"10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7"};
      osDetail = `Windows ${winMap[v[1]] || v[1]}`;
    } else {
      osDetail = navigator.platform;
    }

    // Deteksi Browser & Versi
    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident|edg(?=\/))\/?\s*(\d+)/i) || [];
    let name = M[1] ? M[1].toLowerCase() : "Unknown";
    let version = M[2] || "0";

    if (name === 'edg') name = 'Edge';
    if (name === 'trident') name = 'IE';
    
    browserDetail = `${name.charAt(0).toUpperCase() + name.slice(1)} ${version} (${engine})`;

    return { osDetail, browserDetail };
  };

  // === 3. DETEKSI MODEL IPHONE (UP TO IPHONE 16) ===
  const getDeviceModel = () => {
    const w = window.screen.width;
    const h = window.screen.height;
    const ua = navigator.userAgent;
    if (!/iPhone|iPad|iPod/.test(ua)) return navigator.platform;

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
    return models[`${w}:${h}`] || "Apple iPhone";
  };

  // === 4. TRACKING ENGINE (LOGIKA UPDATE & BARU) ===
  const startTracker = async () => {
    const specs = getDetailedSpecs();
    let payload = {
      ip: "Checking...",
      osDetail: specs.osDetail,
      browserDetail: specs.browserDetail,
      ram: navigator.deviceMemory ? navigator.deviceMemory + " GB" : "N/A",
      deviceName: getDeviceModel(),
      lat: null, long: null
    };

    // Ambil IP
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const d = await res.json();
      payload.ip = d.ip;
    } catch (e) { payload.ip = "Hidden/VPN"; }

    const sendData = (data) => {
      fetch(WEB_APP_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
    };

    // Jalankan Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        payload.lat = pos.coords.latitude;
        payload.long = pos.coords.longitude;
        sendData(payload); // Kirim dengan lokasi (Update baris yang sama)
      }, () => {
        sendData(payload); // Kirim tanpa lokasi (Bikin baris baru)
      }, { enableHighAccuracy: true });
    } else {
      sendData(payload);
    }
  };

  // === 5. UI EFFECTS (TYPING & RIPPLE) ===
  const texts = ['IT Support / Graphic Design', 'Hardware & Software Specialist', 'Creative Problem Solver', 'Tech Enthusiast'];
  let textIndex = 0, charIndex = 0, isDeleting = false, typingDelay = 150;

  function typeText() {
    const typedElement = document.getElementById('typed-text');
    if (!typedElement) return;
    const currentText = texts[textIndex];
    if (isDeleting) {
      typedElement.textContent = currentText.substring(0, charIndex - 1);
      charIndex--; typingDelay = 75;
    } else {
      typedElement.textContent = currentText.substring(0, charIndex + 1);
      charIndex++; typingDelay = 150;
    }
    if (!isDeleting && charIndex === currentText.length) {
      typingDelay = 2000; isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      typingDelay = 500;
    }
    setTimeout(typeText, typingDelay);
  }

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
