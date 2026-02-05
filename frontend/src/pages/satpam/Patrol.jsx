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

export default function Patrol() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  const urlPostId = params.get("post_id");
  const tokenQR = params.get("token");

  const [manualPostId, setManualPostId] = useState("");
  const finalPostId = tokenQR ? urlPostId : manualPostId;

  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [postInfo, setPostInfo] = useState(null); 
  const [gps, setGps] = useState({ lat: null, lng: null, accuracy: null });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const canSubmit = useMemo(() => {
    return !!finalPostId && !!photoBlob && gps.lat && gps.lng;
  }, [finalPostId, photoBlob, gps]);

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
      (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (err) => console.error(err),
      { enableHighAccuracy: true, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) { console.error(err); }
    };
    start();
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const capturePhoto = (e) => {
    e.preventDefault(); // Mencegah form submission tidak sengaja
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.restore();
    
    canvas.toBlob((blob) => {
      setPhotoBlob(blob);
      setPhotoPreview(URL.createObjectURL(blob));
    }, "image/jpeg", 0.9);
  };

  const submit = async () => {
    try {
      const fd = new FormData();
      fd.append("post_id", finalPostId);
      if (tokenQR) fd.append("token", tokenQR);
      fd.append("note", note);
      fd.append("lat", String(gps.lat));
      fd.append("lng", String(gps.lng));
      fd.append("photo", photoBlob, "selfie.jpg");
      await api.post("/patrol/submit", fd);
      nav("/satpam");
    } catch (err) { setMsg("Gagal submit laporan"); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logoBox}><img src={logoImg} style={styles.logo} alt="logo" /></div>
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

        {/* INFORMASI POS */}
        <div style={styles.card}>
          <div style={styles.cardHeader}><span style={styles.headerIcon}>🛈</span> Informasi Pos</div>
          <div style={styles.infoGrid}>
            <div>
              <div style={styles.infoLabel}>NAMA POS</div>
              <div style={styles.infoValue}>{postInfo?.post_name || "Lobby IGD"} <span style={styles.idSub}>(ID: {urlPostId || '1'})</span></div>
            </div>
            <div>
              <div style={styles.infoLabel}>LOKASI</div>
              <div style={styles.infoValue}>{postInfo?.location_desc || "Lantai 1"}</div>
            </div>
            <div>
              <div style={styles.infoLabel}>STATUS QR</div>
              <div style={styles.statusOk}>● Terdeteksi</div>
            </div>
          </div>
        </div>

        {/* GPS LOKASI */}
        <div style={styles.card}>
          <div style={styles.cardHeaderFlex}>
            <span><span style={styles.headerIcon}>📍</span> GPS Lokasi <span style={styles.badgeGps}>LOKASI TERDETEKSI</span></span>
            <button onClick={() => window.open(`https://www.google.com/maps?q=${gps.lat},${gps.lng}`)} style={styles.btnMaps}>🗏 Buka di Maps</button>
          </div>
          <div style={styles.mapContainer}>
            {gps.lat && (
              <MapContainer center={[gps.lat, gps.lng]} zoom={17} style={{height: '100%'}} zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[gps.lat, gps.lng]} />
              </MapContainer>
            )}
          </div>
          <div style={styles.mapFooter}>
            Lat: {gps.lat?.toFixed(7) || '-'}   Lng: {gps.lng?.toFixed(7) || '-'}   Akurasi: {gps.accuracy ? gps.accuracy.toFixed(1) : '-'}m
          </div>
        </div>

        {/* FOTO SELFIE */}
        <div style={styles.card}>
          <div style={styles.cardHeaderFlex}>
            <span><span style={styles.headerIcon}>📷</span> Foto Selfie (Kamera)</span>
            <span style={styles.camReady}>🌐 Kamera siap</span>
          </div>
          <div style={styles.cameraGrid}>
            <div style={styles.camCol}>
              <div style={styles.subLabel}>PREVIEW KAMERA</div>
              <div style={styles.videoBox}>
                <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
                {/* TOMBOL DIPERBAIKI: Z-INDEX DITAMBAH */}
                <button type="button" onClick={capturePhoto} style={styles.btnCapture}>
                  📸 Ambil Foto
                </button>
              </div>
            </div>
            <div style={styles.camCol}>
              <div style={styles.subLabel}>HASIL FOTO</div>
              <div style={styles.previewBox}>
                {photoPreview ? (
                  <img src={photoPreview} style={styles.previewImg} alt="selfie" />
                ) : (
                  <div style={styles.placeholderBox}>
                    <span style={{fontSize: '32px', color: '#e2e8f0'}}>📷</span>
                    <div style={{fontSize: '11px', color: '#94a3b8', marginTop: '10px', textAlign: 'center'}}>Belum ada foto</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KETERANGAN */}
        <div style={styles.card}>
          <div style={styles.cardHeader}><span style={styles.headerIcon}>📝</span> Keterangan / Kondisi</div>
          <textarea 
            style={styles.textarea} 
            placeholder="Contoh: Patroli aman / kondisi aman / dll"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* ACTIONS */}
        <div style={styles.actionArea}>
          <button onClick={submit} disabled={!canSubmit} style={{...styles.btnSubmit, opacity: canSubmit ? 1 : 0.6}}>
            ➤ Submit Laporan Patroli
          </button>
          <button onClick={() => nav("/satpam")} style={styles.btnBack}>
            🏠 Kembali ke Dashboard
          </button>
        </div>

        <footer style={styles.footer}>
          © 2024 RS Islam Fatimah. Bagian Keamanan (Security Department).
        </footer>
      </div>
      <canvas ref={canvasRef} style={{display: 'none'}} />
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f1f5f9", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "40px 0", fontFamily: "'Inter', sans-serif" },
  wrapper: { width: "95%", maxWidth: "700px", backgroundColor: "transparent" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "15px" },
  logoBox: { width: "45px", height: "45px", backgroundColor: "#064e3b", borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
  logo: { width: "70%", height: "70%", objectFit: "contain" },
  title: { fontSize: "18px", fontWeight: "800", color: "#064e3b" },
  subtitle: { fontSize: "11px", color: "#94a3b8", fontWeight: "600" },
  headerRight: { textAlign: "right" },
  sessionTitle: { fontSize: "14px", fontWeight: "800", color: "#1e293b" },
  sessionId: { fontSize: "11px", color: "#64748b" },
  card: { backgroundColor: "#fff", borderRadius: "18px", padding: "24px", marginBottom: "20px", border: "1px solid #e2e8f0", borderTop: "6px solid #b08d00", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
  cardHeader: { fontSize: "15px", fontWeight: "800", color: "#334155", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "18px" },
  cardHeaderFlex: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "15px", fontWeight: "800", color: "#334155", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "18px" },
  headerIcon: { marginRight: "10px", color: "#b08d00" },
  infoGrid: { display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "15px" },
  infoLabel: { fontSize: "10px", fontWeight: "800", color: "#94a3b8", marginBottom: "6px", textTransform: 'uppercase' },
  infoValue: { fontSize: "14px", fontWeight: "700", color: "#1e293b" },
  idSub: { color: "#94a3b8", fontWeight: "400" },
  statusOk: { fontSize: "14px", fontWeight: "700", color: "#10b981" },
  badgeGps: { fontSize: "9px", backgroundColor: "#dcfce7", color: "#15803d", padding: "3px 10px", borderRadius: "6px", marginLeft: "10px", fontWeight: "700" },
  btnMaps: { fontSize: "11px", border: "1.5px solid #b08d00", background: "#fff", color: "#b08d00", padding: "6px 12px", borderRadius: "8px", fontWeight: "800", cursor: "pointer" },
  mapContainer: { height: "220px", backgroundColor: "#f1f5f9", borderRadius: "15px", overflow: "hidden", border: "1px solid #e2e8f0" },
  mapFooter: { fontSize: "10px", color: "#94a3b8", marginTop: "12px", fontWeight: "500" },
  cameraGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" },
  subLabel: { fontSize: "10px", fontWeight: "800", color: "#94a3b8", marginBottom: "12px" },
  videoBox: { position: "relative", width: "100%", aspectRatio: "4/3", backgroundColor: "#000", borderRadius: "15px", overflow: "hidden" },
  video: { width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" },
  btnCapture: { 
    position: "absolute", 
    bottom: "12px", 
    left: "50%", 
    transform: "translateX(-50%)", 
    width: "85%", 
    backgroundColor: "#064e3b", 
    color: "#fff", 
    border: "none", 
    borderRadius: "12px", 
    fontSize: "12px", 
    fontWeight: "800", 
    padding: "12px 0", 
    cursor: "pointer", 
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
    zIndex: 10 // ✅ PENTING: Biar gak ketutup video
  },
  previewBox: { width: "100%", aspectRatio: "4/3", borderRadius: "15px", border: "2px dashed #e2e8f0", backgroundColor: "#fcfdfe", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  previewImg: { width: "100%", height: "100%", objectFit: "cover" },
  camReady: { fontSize: "12px", color: "#10b981", fontWeight: "700" },
  placeholderBox: { textAlign: "center", padding: "20px" },
  textarea: { width: "100%", border: "2px solid #f1f5f9", borderRadius: "15px", padding: "15px", fontSize: "14px", minHeight: "100px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#334155" },
  actionArea: { marginTop: "15px" },
  btnSubmit: { width: "100%", backgroundColor: "#064e3b", color: "#fff", border: "none", borderRadius: "15px", padding: "18px", fontWeight: "800", fontSize: "16px", marginBottom: "12px", cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(6, 78, 59, 0.3)" },
  btnBack: { width: "100%", backgroundColor: "#fff", color: "#b08d00", border: "2px solid #b08d00", borderRadius: "15px", padding: "14px", fontWeight: "800", fontSize: "14px", cursor: "pointer" },
  footer: { textAlign: "center", fontSize: "11px", color: "#cbd5e1", marginTop: "50px", fontWeight: "500" }
};