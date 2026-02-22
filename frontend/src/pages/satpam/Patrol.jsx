import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Asset Logo
import logoImg from "../../assets/logo_patroli.png";

// Fix icon marker Leaflet di Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ✅ FUNGSI HITUNG JARAK (HAVERSINE)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radius bumi dalam meter
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Hasil dalam meter
}

export default function Patrol() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  const urlPostId = params.get("post_id");
  const tokenQR = params.get("token");

  const [manualPostId, setManualPostId] = useState("");
  const finalPostId = tokenQR ? urlPostId : manualPostId;

  const [note, setNote] = useState("");
  const [postInfo, setPostInfo] = useState(null); 
  const [gps, setGps] = useState({ lat: 0, lng: 0, accuracy: 0 });

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusType, setStatusType] = useState("success");
  const [errorMsg, setErrorMsg] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ LOGIKA JARAK & CAN SUBMIT (NGUNCI RADIUS)
  const currentDistance = useMemo(() => {
    if (gps.lat && gps.lng && postInfo?.lat && postInfo?.lng) {
      return getDistance(gps.lat, gps.lng, postInfo.lat, postInfo.lng);
    }
    return null;
  }, [gps, postInfo]);

  const canSubmit = useMemo(() => {
    // Syarat 1: Kelengkapan data (ID, Foto, GPS Aktif, Note)
    const baseValid = !!finalPostId && !!photoBlob && gps.lat !== 0 && note.trim().length > 0;
    
    // Syarat 2: Ngunci Radius (Maksimal 50 meter)
    const radiusValid = currentDistance !== null && currentDistance <= 50;
    
    return baseValid && radiusValid;
  }, [finalPostId, photoBlob, gps, note, currentDistance]);

  useEffect(() => {
    const fetchPostInfo = async () => {
      if (!urlPostId || !tokenQR) return;
      try {
        const res = await api.get("/patrol/scan", { params: { post_id: urlPostId, token: tokenQR } });
        setPostInfo(res.data?.post || null);
      } catch (err) { console.error(err); }
    };
    fetchPostInfo();
  }, [urlPostId, tokenQR]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setGps({ 
        lat: pos.coords.latitude, 
        lng: pos.coords.longitude, 
        accuracy: pos.coords.accuracy 
      }),
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { console.error("Kamera Error:", err); }
    };
    start();
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const capturePhoto = (e) => {
    e.preventDefault();
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1); 
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    canvas.toBlob((blob) => {
      if (blob) {
        setPhotoBlob(blob);
        setPhotoPreview(URL.createObjectURL(blob));
      }
    }, "image/jpeg", 0.8);
  };

  const submit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("post_id", String(finalPostId));
      if (tokenQR) fd.append("token", tokenQR);
      fd.append("note", note.trim());
      fd.append("lat", String(gps.lat));
      fd.append("lng", String(gps.lng));
      fd.append("accuracy", String(gps.accuracy || 0)); 
      fd.append("photo", photoBlob, "selfie.jpg");

      await api.post("/patrol/submit", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setStatusType("success");
      setShowStatusModal(true);
      setTimeout(() => nav("/satpam"), 2000);
    } catch (err) { 
      const msg = err.response?.data?.message || "Gagal mengirim laporan.";
      setErrorMsg(msg);
      setIsSubmitting(false);
      setStatusType("error");
      setShowStatusModal(true);
    }
  };

  return (
    <div style={styles.page}>
      <div style={{...styles.wrapper, maxWidth: isMobile ? '100%' : '800px'}}>
        
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logoWrapper}><img src={logoImg} style={styles.logo} alt="logo" /></div>
            <div>
              <div style={styles.title}>RS Islam Fatimah</div>
              <div style={styles.subtitle}>Sistem Patroli Keamanan</div>
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.sessionTitle}>Submit Patroli</div>
            <div style={styles.sessionId}>ID Sesi: #8821-X2</div>
          </div>
        </div>

        {/* INFO POS & VALIDASI JARAK */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>🛈 Informasi Pos & Lokasi</div>
          <div style={styles.infoGrid}>
            <div><div style={styles.infoLabel}>NAMA POS</div><div style={styles.infoValue}>{postInfo?.post_name || "Lobby IGD"}</div></div>
            <div><div style={styles.infoLabel}>STATUS QR</div><div style={styles.statusOk}>● Terdeteksi</div></div>
          </div>
          
          {/* ✅ INDIKATOR RADIUS */}
          <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f1f5f9'}}>
            <div style={styles.infoLabel}>VERIFIKASI RADIUS (MAKS. 50M)</div>
            {currentDistance !== null ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{currentDistance <= 50 ? '✅' : '❌'}</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: currentDistance <= 50 ? '#059669' : '#be123c' }}>
                    Jarak: {Math.round(currentDistance)} Meter
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {currentDistance <= 50 ? 'Anda berada dalam jangkauan.' : 'Anda terlalu jauh dari pos!'}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{fontSize: '10px', color: '#b08d00', fontStyle: 'italic'}}>Menunggu koordinat GPS...</div>
            )}
          </div>
        </div>

        {/* MAPS */}
        <div style={styles.card}>
          <div style={styles.cardHeaderFlex}>
            <span>📍 GPS Lokasi <span style={styles.badgeGps}>TERKUNCI</span></span>
          </div>
          <div style={styles.mapContainer}>
            {gps.lat !== 0 && (
              <MapContainer center={[gps.lat, gps.lng]} zoom={17} style={{height: '100%', width: '100%'}} zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[gps.lat, gps.lng]} />
              </MapContainer>
            )}
          </div>
        </div>

        {/* KAMERA RESPONSIVE */}
        <div style={styles.card}>
          <div style={styles.cardHeaderFlex}>
            <span>📷 Foto Selfie (Kamera)</span>
            <span style={{color: photoBlob ? '#10b981' : '#3b82f6', fontSize: '10px', fontWeight: 'bold'}}>
               {photoBlob ? '✅ FOTO DIAMBIL' : '📶 Kamera siap'}
            </span>
          </div>
          <div style={isMobile ? styles.camStack : styles.camSideBySide}>
            <div style={styles.camBox}>
               <div style={styles.boxLabel}>PREVIEW KAMERA</div>
               <div style={{...styles.videoWrapper, aspectRatio: isMobile ? "1/1" : "4/3"}}>
                  <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
               </div>
               <button type="button" onClick={capturePhoto} style={styles.btnCapture}>📸 Ambil Foto</button>
            </div>
            <div style={styles.camBox}>
               <div style={styles.boxLabel}>HASIL FOTO</div>
               <div style={{...styles.videoWrapper, aspectRatio: isMobile ? "1/1" : "4/3", borderStyle: 'dashed', backgroundColor: '#fcfdfe'}}>
                  {photoPreview ? <img src={photoPreview} style={styles.previewImg} alt="selfie" /> : <div style={{textAlign: 'center', color: '#cbd5e1', fontSize: '10px', padding: '20px'}}>Klik tombol "Ambil Foto"</div>}
               </div>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>📝 Keterangan Kondisi</div>
          <textarea style={styles.textarea} placeholder="Wajib diisi..." value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <div style={styles.actionArea}>
          <button 
            onClick={submit} 
            disabled={!canSubmit || isSubmitting} 
            style={{...styles.btnSubmit, backgroundColor: canSubmit ? "#064e3b" : "#94a3b8"}}
          >
            {isSubmitting ? "MENGIRIM..." : canSubmit ? "➤ Submit Laporan Patroli" : "❌ Luar Radius / Belum Lengkap"}
          </button>
          <button onClick={() => nav("/satpam")} style={styles.btnBack}>Kembali</button>
        </div>
      </div>

      {showStatusModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{...styles.modalIcon, color: statusType === 'success' ? '#059669' : '#be123c', backgroundColor: statusType === 'success' ? '#f0fdf4' : '#fef2f2'}}>
              {statusType === 'success' ? '✅' : '❌'}
            </div>
            <h3 style={styles.modalTitle}>{statusType === 'success' ? 'Berhasil' : 'Gagal'}</h3>
            <p style={styles.modalText}>{statusType === 'success' ? 'Laporan tersimpan.' : `Gagal: ${errorMsg}`}</p>
            {statusType === 'error' && <button onClick={() => setShowStatusModal(false)} style={styles.btnCapture}>Coba Lagi</button>}
          </div>
        </div>
      )}
      <canvas ref={canvasRef} style={{display: 'none'}} />
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "20px 10px", fontFamily: "'Inter', sans-serif" },
  wrapper: { width: "100%" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  logoWrapper: { width: "60px", height: "60px" },
  logo: { width: "120%", height: "120%", objectFit: "contain" },
  title: { fontSize: "15px", fontWeight: "800", color: "#064e3b" },
  subtitle: { fontSize: "9px", color: "#94a3b8" },
  headerRight: { textAlign: "right" },
  sessionTitle: { fontSize: "11px", fontWeight: "800", color: "#1e293b" },
  sessionId: { fontSize: "9px", color: "#64748b" },
  card: { backgroundColor: "#fff", borderRadius: "15px", padding: "18px", marginBottom: "15px", border: "1.5px solid #e2e8f0", borderTop: "4px solid #b08d00" },
  cardHeader: { fontSize: "13px", fontWeight: "800", color: "#334155", marginBottom: "12px" },
  cardHeaderFlex: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: "800", color: "#334155", marginBottom: "12px" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  infoLabel: { fontSize: "9px", color: "#94a3b8", fontWeight: "800", marginBottom: "4px" },
  infoValue: { fontSize: "12px", fontWeight: "700" },
  statusOk: { fontSize: "11px", color: "#10b981", fontWeight: "700" },
  mapContainer: { height: "160px", borderRadius: "10px", overflow: "hidden", border: "1px solid #f1f5f9" },
  badgeGps: { fontSize: "8px", backgroundColor: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: "4px", marginLeft: "6px" },
  camStack: { display: "flex", flexDirection: "column", gap: "15px" },
  camSideBySide: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  camBox: { width: "100%" },
  boxLabel: { fontSize: "10px", fontWeight: "800", color: "#94a3b8", marginBottom: "8px" },
  videoWrapper: { width: "100%", backgroundColor: "#000", borderRadius: "15px", overflow: "hidden", border: "1px solid #e2e8f0", display: 'flex', alignItems: 'center', justifyContent: 'center' },
  video: { width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" },
  previewImg: { width: "100%", height: "100%", objectFit: "cover" },
  btnCapture: { width: "100%", backgroundColor: "#064e3b", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", fontWeight: "800", fontSize: "12px", marginTop: "10px", cursor: "pointer" },
  textarea: { width: "100%", border: "1.5px solid #f1f5f9", borderRadius: "10px", padding: "12px", fontSize: "13px", minHeight: "80px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  btnSubmit: { width: "100%", color: "#fff", border: "none", borderRadius: "12px", padding: "16px", fontWeight: "800", fontSize: "14px", marginBottom: "10px", transition: '0.3s' },
  btnBack: { width: "100%", backgroundColor: "#fff", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px", fontWeight: "700", fontSize: "13px" },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', width: '80%', maxWidth: '300px', textAlign: 'center' },
  modalIcon: { width: '50px', height: '50px', borderRadius: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 15px', fontSize: '20px' },
  modalTitle: { fontSize: '18px', fontWeight: '800', marginBottom: '8px' },
  modalText: { fontSize: '12px', color: '#64748b' }
};