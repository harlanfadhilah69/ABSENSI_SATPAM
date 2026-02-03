import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode"; 
import api from "../../api/axios";

export default function Scan() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  const urlPostId = params.get("post_id");
  const urlToken = params.get("token");

  const [status, setStatus] = useState("Menyiapkan Kamera...");
  const [manualId, setManualId] = useState(""); 
  
  const html5QrCodeRef = useRef(null);
  const isCameraRunning = useRef(false);

  // --- LOGIKA 1: PROSES DATA ---
  useEffect(() => {
    if (urlPostId && urlToken) {
        stopCamera();
        processScan(urlPostId, urlToken);
    }
  }, [urlPostId, urlToken]);

  const processScan = async (pid, tok) => {
    setStatus("⏳ Memeriksa data...");
    
    // 1. Matikan kamera scanner dulu sampai benar-benar mati
    await stopCamera(); 

    try {
      // 2. Validasi ke Backend
      await api.get(`/patrol/scan?post_id=${pid}&token=${tok}`);
      setStatus("✅ BERHASIL! Masuk...");
      
      // 3. PINDAH HALAMAN DENGAN CARA "HARD RELOAD"
      // Ini SOLUSI anti-macet/black screen.
      // Kita paksa browser refresh total agar hardware kamera di-reset.
      setTimeout(() => {
        window.location.href = `/satpam/patrol?post_id=${pid}&token=${tok}`;
      }, 1000);

    } catch (e) {
      setStatus("❌ Gagal: " + (e?.response?.data?.message || "Token Invalid"));
    }
  };

  const stopCamera = async () => {
      if (html5QrCodeRef.current && isCameraRunning.current) {
          try {
              await html5QrCodeRef.current.stop();
              html5QrCodeRef.current.clear();
              isCameraRunning.current = false;
          } catch (e) {
              // Ignore error jika kamera sudah mati duluan
          }
      }
  };

  // --- LOGIKA 2: KAMERA (AUTO RETRY & ANTI-SPAM) ---
  useEffect(() => {
    if (urlPostId || urlToken) return;

    // ✅ FITUR BARU: Variabel "Gembok" agar tidak loop saat scan
    let isProcessingQR = false; 

    const startCamera = async (retryCount = 0) => {
        const scannerId = "reader";
        
        // Pastikan bersih sebelum mulai
        if (html5QrCodeRef.current) {
            await stopCamera();
        }

        const html5QrCode = new Html5Qrcode(scannerId);
        html5QrCodeRef.current = html5QrCode;

        try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length) {
                // Logika Pilih Kamera
                let cameraId = devices[0].id; 
                const backCamera = devices.find(d => 
                    d.label.toLowerCase().includes("back") || 
                    d.label.toLowerCase().includes("belakang") ||
                    d.label.toLowerCase().includes("environment")
                );
                if (backCamera) cameraId = backCamera.id;

                await html5QrCode.start(
                    cameraId, 
                    { 
                        fps: 10, 
                        qrbox: 250,
                        aspectRatio: 1.0 // Paksa Rasio Kotak
                    },
                    (decodedText) => {
                        // ✅ FITUR BARU: Jika sudah memproses 1 QR, abaikan scan berikutnya
                        if (isProcessingQR) return; 

                        console.log(`Scan Ditemukan: ${decodedText}`);
                        if (decodedText.includes("post_id=") && decodedText.includes("token=")) {
                            
                            // ✅ Kunci gemboknya!
                            isProcessingQR = true; 
                            
                            stopCamera();
                            try {
                                const urlObj = new URL(decodedText);
                                const pid = urlObj.searchParams.get("post_id");
                                const tok = urlObj.searchParams.get("token");
                                if (pid && tok) {
                                    nav(`/scan?post_id=${pid}&token=${tok}`, { replace: true });
                                }
                            } catch (err) {}
                        }
                    },
                    (errorMessage) => {}
                );
                
                isCameraRunning.current = true;
                setStatus("Arahkan ke QR Code...");
            } else {
                setStatus("Kamera tidak terdeteksi.");
            }
        } catch (err) {
            const errStr = JSON.stringify(err) || "";
            // Auto Retry jika kamera macet (NotReadable)
            if (errStr.includes("NotReadable") || errStr.includes("Could not start video source")) {
                if (retryCount < 3) { 
                    setStatus(`Kamera sibuk, mencoba lagi (${retryCount + 1}/3)...`);
                    setTimeout(() => startCamera(retryCount + 1), 1500);
                    return; 
                }
            }
            setStatus("Gagal membuka kamera. Coba refresh manual.");
        }
    };

    setTimeout(() => startCamera(0), 800);

    return () => { stopCamera(); };
  }, [nav, urlPostId, urlToken]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if(manualId) {
        // Pindah manual juga pakai Hard Reload biar aman
        window.location.href = `/satpam/patrol?post_id=${manualId}&token=manual_entry`;
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: "20px auto", padding: 16, textAlign: "center", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 15 }}>Scan QR Pos</h2>

      {urlPostId ? (
        <div style={{ padding: 20, background: "#dbeafe", color: "#1e40af", borderRadius: 8 }}>
            <h3>{status}</h3>
            <p>Mohon tunggu...</p>
        </div>
      ) : (
        <>
            {/* AREA KAMERA DIKUNCI JADI KOTAK */}
            <div style={{ 
                width: "100%", 
                maxWidth: "350px", 
                height: "350px",   
                margin: "0 auto",  
                background: "#000",
                borderRadius: 16,
                overflow: "hidden", 
                border: "4px solid #3b82f6",
                position: "relative"
            }}>
                <div id="reader" style={{ width: "100%", height: "100%" }}></div>
            </div>
            
            <p style={{ fontWeight: 'bold', marginTop: 10, color: '#333', fontSize: 14 }}>{status}</p>

            <hr style={{ margin: "20px 0", borderTop: "1px solid #eee" }} />

            <div style={{ background: "#f8fafc", padding: 15, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <p style={{ fontWeight: "bold", margin: "0 0 10px 0", fontSize: 14 }}>Input Manual</p>
                <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: 10 }}>
                    <input 
                        type="number" placeholder="ID Pos" value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                        style={{ flex: 1, padding: 10, borderRadius: 5, border: "1px solid #ccc" }}
                        required
                    />
                    <button type="submit" style={{ padding: "10px 20px", background: "#333", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" }}>
                        Masuk
                    </button>
                </form>
            </div>
        </>
      )}
    </div>
  );
}