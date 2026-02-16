import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode"; 
import api from "../../api/axios";
// ✅ Import logo patroli
import logoImg from "../../assets/logo_patroli.png";

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

  // ✅ PROSES SCAN DENGAN OPTIMASI GPS AKURASI TINGGI
  const processScan = async (pid, tok) => {
    setStatus("⏳ Mengunci GPS Akurat..."); // Status baru agar satpam menunggu GPS lock
    await stopCamera(); 

    // Fungsi internal untuk mendapatkan koordinat presisi tinggi
    const getPreciseLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);

    let watchId;
    let bestCoords = null;
    let timer;

    // Kita pantau lokasi selama 5 detik untuk mencari yang TERBAIK
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = pos.coords;
        // Simpan koordinat jika ini yang paling akurat sejauh ini
        if (!bestCoords || coords.accuracy < bestCoords.accuracy) {
          bestCoords = coords;
        }
        
        // Jika akurasi sudah sangat bagus (di bawah 10 meter), langsung stop dan pakai ini
        if (coords.accuracy <= 10) {
          clearTimeout(timer);
          navigator.geolocation.clearWatch(watchId);
          resolve(coords);
        }
      },
      () => {}, // Abaikan error sementara saat proses pencarian
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    // Batasi waktu pencarian maksimal 7 detik agar satpam tidak menunggu terlalu lama
    timer = setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
      resolve(bestCoords); // Kembalikan koordinat terbaik yang sempat didapat
    }, 7000);
  });
};

    try {
      // Ambil GPS terlebih dahulu sebelum verifikasi token ke API
      const coords = await getPreciseLocation();
      const accuracyParam = coords ? `&acc=${coords.accuracy}` : "";

      // Verifikasi data ke backend
      await api.get(`/patrol/scan?post_id=${pid}&token=${tok}${accuracyParam}`);
      setStatus("✅ BERHASIL! Masuk...");
      
      setTimeout(() => {
        // Pindah ke halaman submit dengan membawa parameter akurasi
        window.location.href = `/satpam/patrol?post_id=${pid}&token=${tok}${accuracyParam}`;
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
          } catch (e) {}
      }
  };

  // --- LOGIKA 2: KAMERA ---
  useEffect(() => {
    if (urlPostId || urlToken) return;
    let isProcessingQR = false; 

    const startCamera = async (retryCount = 0) => {
        const scannerId = "reader";
        if (html5QrCodeRef.current) await stopCamera();

        const html5QrCode = new Html5Qrcode(scannerId);
        html5QrCodeRef.current = html5QrCode;

        try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length) {
                let cameraId = devices[0].id; 
                const backCamera = devices.find(d => 
                    d.label.toLowerCase().includes("back") || 
                    d.label.toLowerCase().includes("belakang") ||
                    d.label.toLowerCase().includes("environment")
                );
                if (backCamera) cameraId = backCamera.id;

                await html5QrCode.start(
                    cameraId, 
                    { fps: 10, qrbox: 250, aspectRatio: 1.0 },
                    (decodedText) => {
                        if (isProcessingQR) return; 
                        if (decodedText.includes("post_id=") && decodedText.includes("token=")) {
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
                setStatus("Mencari QR Code...");
            } else {
                setStatus("Kamera tidak terdeteksi.");
            }
        } catch (err) {
            const errStr = JSON.stringify(err) || "";
            if (errStr.includes("NotReadable") && retryCount < 3) {
                setTimeout(() => startCamera(retryCount + 1), 1500);
                return;
            }
            setStatus("Gagal membuka kamera.");
        }
    };

    setTimeout(() => startCamera(0), 800);
    return () => { stopCamera(); };
  }, [nav, urlPostId, urlToken]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualId) {
        // ✅ Panggil processScan agar melewati validasi GPS Akurat & Backend
        processScan(manualId, "manual_entry");
    }
  };

  return (
    <div style={styles.containerStyle}>
      {/* HEADER LOGO */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={styles.logoCircle}>
          <img src={logoImg} alt="Logo RS" style={styles.logoImageStyle} />
        </div>
        <h1 style={styles.titleStyle}>RS ISLAM FATIMAH</h1>
        <p style={styles.subtitleStyle}>SISTEM PATROLI KEAMANAN</p>
      </div>

      {/* MAIN CARD SCAN */}
      <div style={styles.formCard}>
        <h2 style={styles.cardTitle}>Scan QR Pos</h2>
        <p style={styles.cardSubtitle}>Pindai kode QR pada titik patroli untuk verifikasi lokasi</p>

        {urlPostId ? (
          <div style={styles.statusLoadingBox}>
              <h3 style={{margin: 0}}>{status}</h3>
              <p style={{fontSize: 12, margin: "5px 0 0 0"}}>Mohon tunggu sebentar...</p>
          </div>
        ) : (
          <>
            {/* AREA SCANNER */}
            <div style={styles.cameraWrapper}>
                <div id="reader" style={{ width: "100%", height: "100%" }}></div>
                {/* Overlay Corner Dekorasi */}
                <div style={styles.cornerTL}></div><div style={styles.cornerTR}></div>
                <div style={styles.cornerBL}></div><div style={styles.cornerBR}></div>
                {/* Animasi Scanning Line */}
                <div className="scan-line"></div>
            </div>
            
            <div style={styles.statusText}>
               <span style={styles.dotActive}></span> {status}
            </div>

            <div style={styles.divider}>
                <span style={styles.dividerText}>ATAU</span>
            </div>

            {/* INPUT MANUAL */}
            <div style={styles.manualSection}>
                <label style={styles.labelStyle}>ID POS PATROLI</label>
                <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <div style={styles.inputWrapper}>
                        <span style={styles.iconInput}>🔢</span>
                        <input 
                            type="number" 
                            placeholder="Masukkan ID Pos secara manual" 
                            value={manualId}
                            onChange={(e) => setManualId(e.target.value)}
                            style={styles.inputStyle}
                            required
                        />
                    </div>
                    <button type="submit" style={styles.btnSubmit}>
                        ➜ MASUK
                    </button>
                </form>
            </div>
          </>
        )}
      </div>

      {/* FOOTER */}
      <div style={styles.footerMenu}>
          <span>Pusat Bantuan</span>
          <span>Konfigurasi</span>
          <span>Riwayat Patroli</span>
      </div>
      <p style={styles.copyright}>© 2026 RS Islam Fatimah. Dikembangkan untuk Keamanan & Ketertiban.</p>

      {/* CSS untuk Animasi Line Scan agar tidak menyebabkan putih */}
      <style>{`
        @keyframes scan {
          0% { top: 10%; }
          100% { top: 90%; }
        }
        .scan-line {
          position: absolute;
          width: 80%;
          height: 2px;
          background: rgba(234, 179, 8, 0.6);
          left: 10%;
          box-shadow: 0 0 15px #eab308;
          animation: scan 2s infinite alternate ease-in-out;
          z-index: 5;
        }
      `}</style>
    </div>
  );
}

// --- DEFINISI STYLES ---
const styles = {
  containerStyle: { backgroundColor: "#fcfdfe", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", fontFamily: "'Inter', sans-serif" },
  logoCircle: { width: "80px", height: "80px", backgroundColor: "#064e3b", borderRadius: "18px", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 10px", boxShadow: "0 8px 16px rgba(6, 78, 59, 0.2)" },
  logoImageStyle: { width: "60%", height: "60%", objectFit: "contain" },
  titleStyle: { fontSize: "20px", fontWeight: "800", color: "#064e3b", margin: "0", letterSpacing: "1px" },
  subtitleStyle: { fontSize: "10px", fontWeight: "600", color: "#b08d00", margin: "5px 0 0 0", letterSpacing: "2px" },
  formCard: { maxWidth: "480px", width: "100%", padding: "40px 30px", borderRadius: "35px", background: "white", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)", marginTop: "25px", position: "relative", border: "1px solid #f0f0f0" },
  cardTitle: { textAlign: "center", fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0" },
  cardSubtitle: { textAlign: "center", fontSize: "13px", color: "#6b7280", margin: "10px 0 30px 0", lineHeight: "1.5" },
  cameraWrapper: { width: "100%", aspectRatio: "1/1", background: "#111", borderRadius: "24px", overflow: "hidden", position: "relative", border: "1px solid #333" },
  statusText: { marginTop: 20, fontSize: "13px", fontWeight: "600", color: "#374151", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  dotActive: { width: "8px", height: "8px", backgroundColor: "#eab308", borderRadius: "50%", display: "inline-block" },
  divider: { margin: "30px 0", textAlign: "center", position: "relative", borderTop: "1px solid #f3f4f6" },
  dividerText: { position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "white", padding: "0 15px", fontSize: "11px", fontWeight: "800", color: "#d1d5db" },
  labelStyle: { fontSize: "11px", fontWeight: "800", color: "#9ca3af", letterSpacing: "1px" },
  inputWrapper: { position: "relative", flex: 1 },
  iconInput: { position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" },
  inputStyle: { width: "100%", padding: "14px 15px 14px 45px", borderRadius: "15px", border: "1px solid #f3f4f6", backgroundColor: "#f9fafb", fontSize: "14px", boxSizing: "border-box", outline: "none" },
  btnSubmit: { padding: "0 25px", background: "#064e3b", color: "#fff", border: "none", borderRadius: "15px", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  footerMenu: { display: "flex", gap: "20px", marginTop: "30px", fontSize: "12px", color: "#9ca3af", fontWeight: "600" },
  copyright: { marginTop: "15px", fontSize: "10px", color: "#d1d5db" },
  statusLoadingBox: { padding: "40px 20px", background: "#f0fdf4", color: "#166534", borderRadius: "20px", textAlign: "center", border: "1px solid #dcfce7" },
  cornerTL: { position: "absolute", width: "30px", height: "30px", border: "4px solid #eab308", top: "20px", left: "20px", borderRight: "none", borderBottom: "none", borderRadius: "8px 0 0 0", zIndex: 10 },
  cornerTR: { position: "absolute", width: "30px", height: "30px", border: "4px solid #eab308", top: "20px", right: "20px", borderLeft: "none", borderBottom: "none", borderRadius: "0 8px 0 0", zIndex: 10 },
  cornerBL: { position: "absolute", width: "30px", height: "30px", border: "4px solid #eab308", bottom: "20px", left: "20px", borderRight: "none", borderTop: "none", borderRadius: "0 0 0 8px", zIndex: 10 },
  cornerBR: { position: "absolute", width: "30px", height: "30px", border: "4px solid #eab308", bottom: "20px", right: "20px", borderLeft: "none", borderTop: "none", borderRadius: "0 0 8px 0", zIndex: 10 },
};