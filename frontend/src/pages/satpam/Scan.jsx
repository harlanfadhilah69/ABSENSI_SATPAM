import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode"; 
import api from "../../api/axios";
import logoImg from "../../assets/logo_patroli.png";
import Swal from 'sweetalert2';
import { QrCode, Navigation, Keyboard, Loader2 } from "lucide-react";

export default function Scan() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  const urlPostId = params.get("post_id");
  const urlToken = params.get("token");

  const [status, setStatus] = useState("Menyiapkan Kamera...");
  const [manualId, setManualId] = useState(""); 
  
  const html5QrCodeRef = useRef(null);
  const isCameraRunning = useRef(false);

  useEffect(() => {
    if (urlPostId && urlToken) {
        processScan(urlPostId, urlToken);
    }
  }, [urlPostId, urlToken]);

  const processScan = async (pid, tok) => {
    setStatus("⏳ Mengunci GPS Akurat..."); 
    await stopCamera(); 

    Swal.fire({
      title: 'Mengunci GPS...',
      html: 'Sedang memastikan lokasi presisi Anda di area RSIFC.',
      allowOutsideClick: false,
      confirmButtonColor: '#064e3b',
      didOpen: () => { Swal.showLoading(); }
    });

    const getPreciseLocation = () => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        let watchId;
        let bestCoords = null;
        let timer;

        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const coords = pos.coords;
            if (!bestCoords || coords.accuracy < bestCoords.accuracy) {
              bestCoords = coords;
            }
            if (coords.accuracy <= 15) { 
              clearTimeout(timer);
              navigator.geolocation.clearWatch(watchId);
              resolve(coords);
            }
          },
          () => resolve(null), 
          { enableHighAccuracy: true, maximumAge: 0 }
        );

        timer = setTimeout(() => {
          navigator.geolocation.clearWatch(watchId);
          resolve(bestCoords); 
        }, 5000); 
      });
    };

    try {
      const coords = await getPreciseLocation();
      const accuracyParam = coords ? `&acc=${coords.accuracy}` : "";
      
      Swal.fire({
        icon: 'success',
        title: 'Pos Terverifikasi!',
        text: 'Lokasi berhasil dikunci. Membuka form patroli...',
        confirmButtonColor: '#064e3b',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        nav(`/satpam/patrol?post_id=${pid}&token=${tok}${accuracyParam}`, { replace: true });
      });

    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Verifikasi Gagal', confirmButtonColor: '#be123c' });
      setStatus("❌ Gagal Verifikasi");
    }
  };

  const stopCamera = async () => {
      if (html5QrCodeRef.current && isCameraRunning.current) {
          try {
              await html5QrCodeRef.current.stop();
              html5QrCodeRef.current.clear();
              isCameraRunning.current = false;
          } catch (e) {
              console.warn("Gagal stop kamera:", e);
          }
      }
  };

  useEffect(() => {
    if (urlPostId || urlToken) return;
    let isProcessingQR = false; 

    const startCamera = async (retryCount = 0) => {
        const scannerId = "reader";
        
        try {
            // Cek apakah ada kamera yang tersedia
            const devices = await Html5Qrcode.getCameras();
            if (!devices || devices.length === 0) {
                setStatus("Kamera tidak ditemukan.");
                return;
            }

            if (html5QrCodeRef.current) await stopCamera();
            const html5QrCode = new Html5Qrcode(scannerId);
            html5QrCodeRef.current = html5QrCode;

            // Cari kamera belakang
            let selectedCameraId = devices[0].id; 
            const backCamera = devices.find(d => 
                d.label.toLowerCase().includes("back") || 
                d.label.toLowerCase().includes("belakang") ||
                d.label.toLowerCase().includes("environment")
            );
            if (backCamera) selectedCameraId = backCamera.id;

            await html5QrCode.start(
                selectedCameraId, 
                { fps: 15, qrbox: 250, aspectRatio: 1.0 },
                (decodedText) => {
                    if (isProcessingQR) return; 
                    if (decodedText.includes("post_id=") && decodedText.includes("token=")) {
                        isProcessingQR = true; 
                        stopCamera();
                        const urlObj = new URL(decodedText);
                        const pid = urlObj.searchParams.get("post_id");
                        const tok = urlObj.searchParams.get("token");
                        if (pid && tok) {
                            nav(`/scan?post_id=${pid}&token=${tok}`, { replace: true });
                        }
                    }
                },
                () => {}
            );
            isCameraRunning.current = true;
            setStatus("Arahkan kamera ke QR Code");
        } catch (err) {
            console.error("Camera error:", err);
            if (retryCount < 3) {
                setTimeout(() => startCamera(retryCount + 1), 1000);
            } else {
                setStatus("Gagal akses kamera. Pastikan izin aktif.");
            }
        }
    };

    setTimeout(() => startCamera(0), 500);
    return () => { stopCamera(); };
  }, [nav, urlPostId, urlToken]);

  return (
    <div style={styles.containerStyle}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={styles.logoWrapper}><img src={logoImg} alt="Logo" style={styles.logoImageStyle} /></div>
        <h1 style={styles.titleStyle}>RS ISLAM FATIMAH</h1>
        <p style={styles.subtitleStyle}>SISTEM PATROLI KEAMANAN</p>
      </div>

      <div style={styles.formCard}>
        <div style={styles.cardHeaderDecoration}></div>
        <h2 style={styles.cardTitle}><QrCode size={22} style={{marginRight: 10, color: '#064e3b'}}/> Verifikasi Pos</h2>
        
        {urlPostId ? (
          <div style={styles.statusLoadingBox}>
              <Loader2 className="animate-spin" size={32} style={{marginBottom: 10, color: '#064e3b'}} />
              <h3 style={{margin: 0, fontSize: '16px', color: '#166534'}}>{status}</h3>
              <p style={{fontSize: 11, marginTop: 5, color: '#166534', opacity: 0.8}}>Jangan tutup halaman ini...</p>
          </div>
        ) : (
          <>
            <div style={styles.cameraWrapper}>
                <div id="reader" style={{ width: "100%", height: "100%" }}></div>
                <div style={styles.cornerTL}></div><div style={styles.cornerTR}></div>
                <div style={styles.cornerBL}></div><div style={styles.cornerBR}></div>
                <div className="scan-line"></div>
            </div>
            
            <div style={styles.statusText}>
              <span style={styles.dotActive}></span> 
              <span>{status}</span>
            </div>

            <div style={styles.divider}><span style={styles.dividerText}>ATAU INPUT MANUAL</span></div>

            <div style={styles.manualSection}>
                <form onSubmit={(e) => { e.preventDefault(); if(manualId) processScan(manualId, "manual_entry"); }} style={styles.manualForm}>
                    <div style={styles.inputWrapper}>
                        <Keyboard size={18} style={styles.iconInput} />
                        <input 
                            type="number" 
                            placeholder="Ketik ID Pos..." 
                            value={manualId}
                            onChange={(e) => setManualId(e.target.value)}
                            style={styles.inputStyle}
                            required
                        />
                    </div>
                    <button type="submit" style={styles.btnSubmit}>MASUK</button>
                </form>
            </div>
          </>
        )}
      </div>

      <div style={styles.instructionBox}>
         <Navigation size={14} color="#b08d00" />
         <span>Pastikan GPS aktif & berada di titik pos.</span>
      </div>
      <p style={styles.copyright}>© 2026 RS Islam Fatimah Cilacap</p>

      <style>{`
        @keyframes scan { 0% { top: 10%; } 100% { top: 90%; } }
        .scan-line { position: absolute; width: 85%; height: 3px; background: linear-gradient(to right, transparent, #b08d00, transparent); left: 7.5%; box-shadow: 0 0 15px #b08d00; animation: scan 2.5s infinite alternate ease-in-out; z-index: 5; }
      `}</style>
    </div>
  );
}

const styles = {
  containerStyle: { backgroundColor: "#f1f5f9", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", fontFamily: "'Inter', sans-serif" },
  logoWrapper: { width: "70px", height: "70px", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 12px", backgroundColor: '#fff', borderRadius: '18px', padding: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  logoImageStyle: { width: "100%", height: "100%", objectFit: "contain" },
  titleStyle: { fontSize: "20px", fontWeight: "900", color: "#064e3b", margin: "0", letterSpacing: '1px' },
  subtitleStyle: { fontSize: "11px", fontWeight: "700", color: "#b08d00", margin: "4px 0 0 0", letterSpacing: '2px' },
  formCard: { maxWidth: "420px", width: "100%", padding: "35px 30px", borderRadius: "32px", background: "white", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)", marginTop: "10px", border: "1px solid #fff", position: 'relative', overflow: 'hidden' },
  cardHeaderDecoration: { position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(to right, #064e3b, #b08d00)' },
  cardTitle: { textAlign: "center", fontSize: "22px", fontWeight: "900", color: "#1e293b", marginBottom: "30px", display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cameraWrapper: { width: "100%", aspectRatio: "1/1", background: "#000", borderRadius: "24px", overflow: "hidden", position: "relative", border: '4px solid #f1f5f9' },
  statusText: { marginTop: 20, fontSize: "14px", fontWeight: "700", color: "#475569", textAlign: "center", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  dotActive: { width: "10px", height: "10px", backgroundColor: "#b08d00", borderRadius: "50%" },
  divider: { margin: "30px 0", textAlign: "center", position: "relative", borderTop: "1.5px dashed #e2e8f0" },
  dividerText: { position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "white", padding: "0 15px", fontSize: "11px", fontWeight: "900", color: "#94a3b8" },
  
  // ✅ PERBAIKAN FORM NABRAK (Responsif sesuai screenshot kamu)
  manualSection: { width: '100%', marginTop: '5px' },
  manualForm: { display: 'flex', flexDirection: window.innerWidth <= 480 ? 'column' : 'row', gap: '12px', width: '100%' },
  inputWrapper: { position: "relative", flex: 1, width: '100%' },
  iconInput: { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: '#94a3b8', zIndex: 10 },
  inputStyle: { width: "100%", padding: "14px 14px 14px 45px", borderRadius: "16px", border: "1.5px solid #f1f5f9", fontSize: "15px", outline: "none", backgroundColor: '#f8fafc', fontWeight: '600', boxSizing: 'border-box' },
  btnSubmit: { padding: "14px 25px", background: "#064e3b", color: "#fff", border: "none", borderRadius: "16px", fontWeight: "800", cursor: "pointer", boxShadow: '0 4px 10px rgba(6,78,59,0.2)', whiteSpace: 'nowrap' },
  
  instructionBox: { marginTop: '25px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fffbeb', padding: '10px 20px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', color: '#854d0e', border: '1px solid #fef3c7' },
  copyright: { marginTop: "30px", fontSize: "11px", color: "#94a3b8", fontWeight: '600' },
  statusLoadingBox: { padding: "40px 20px", background: "#f0fdf4", color: "#166534", borderRadius: "24px", textAlign: "center", display: 'flex', flexDirection: 'column', alignItems: 'center' },
  cornerTL: { position: "absolute", width: "25px", height: "25px", border: "4px solid #b08d00", top: "20px", left: "20px", borderRight: "none", borderBottom: "none", borderRadius: '4px 0 0 0', zIndex: 6 },
  cornerTR: { position: "absolute", width: "25px", height: "25px", border: "4px solid #b08d00", top: "20px", right: "20px", borderLeft: "none", borderBottom: "none", borderRadius: '0 4px 0 0', zIndex: 6 },
  cornerBL: { position: "absolute", width: "25px", height: "25px", border: "4px solid #b08d00", bottom: "20px", left: "20px", borderRight: "none", borderTop: "none", borderRadius: '0 0 0 4px', zIndex: 6 },
  cornerBR: { position: "absolute", width: "25px", height: "25px", border: "4px solid #b08d00", bottom: "20px", right: "20px", borderLeft: "none", borderTop: "none", borderRadius: '0 0 4px 0', zIndex: 6 },
};