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

  // ✅ LOGIKA DETEKSI LAYAR
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      <div style={{...styles.wrapper, maxWidth: isMobile ? '100%' : '800px'}}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logoWrapper}>
               <img src={logoImg} style={styles.logo} alt="logo" />
            </div>
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
              <div style={styles.infoValue}>{postInfo?.post_name || "Lobby IGD"}</div>
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

        {/* ✅ GPS LOKASI DIKEMBALIKAN */}
        <div style={styles.card}>
          <div style={styles.cardHeaderFlex}>
            <span><span style={styles.headerIcon}>📍</span> GPS Lokasi <span style={styles.badgeGps}>TERDETEKSI</span></span>
            <button onClick={() => window.open(`https://www.google.com/maps?q=${gps.lat},${gps.lng}`)} style={styles.btnMaps}>Buka di Maps</button>
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
            Lat: {gps.lat?.toFixed(7) || '-'}   Lng: {gps.lng?.toFixed(7) || '-'}   Akurasi: {gps.accuracy ? gps.accuracy.toFixed(1) : '-'}m
          </div>
        </div>

        {/* FOTO SELFIE SECTION */}
        <div style={styles.card}>
          <div style={styles.cardHeaderFlex}>
            <span><span style={styles.headerIcon}>📷</span> Foto Selfie (Kamera)</span>
            <span style={styles.camReady}>📶 Kamera siap</span>
          </div>
          
          <div style={isMobile ? styles.camVerticalLayout : styles.camHorizontalLayout}>
            <div style={isMobile ? styles.camSectionMobile : styles.camSectionWeb}>
              <div style={styles.subLabel}>PREVIEW KAMERA</div>
              <div style={isMobile ? styles.videoBoxMobile : styles.videoBoxWeb}>
                <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
              </div>
              {!isMobile && (
                <button type="button" onClick={capturePhoto} style={styles.btnCaptureWeb}>
                  📸 Ambil Foto
                </button>
              )}
            </div>

            {isMobile && (
              <button type="button" onClick={capturePhoto} style={styles.btnCaptureMobile}>
                📸 Ambil Foto
              </button>
            )}

            <div style={isMobile ? styles.camSectionMobile : styles.camSectionWeb}>
              <div style={styles.subLabel}>HASIL FOTO</div>
              <div style={isMobile ? styles.previewBoxMobile : styles.previewBoxWeb}>
                {photoPreview ? (
                  <img src={photoPreview} style={styles.previewImg} alt="selfie" />
                ) : (
                  <div style={styles.placeholderBox}>
                    <span style={{fontSize: '32px', color: '#e2e8f0'}}>📷</span>
                    <div style={{fontSize: '11px', color: '#94a3b8', marginTop: '10px', textAlign: 'center'}}>
                      <b>Belum ada foto</b><br/>
                      Foto akan dikirim sebagai file photo ke backend
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KETERANGAN */}
        <div style={styles.card}>
          <div style={styles.cardHeader}><span style={styles.headerIcon}>📝</span> Keterangan Kondisi</div>
          <textarea 
            style={styles.textarea} 
            placeholder="Contoh: Kondisi aman terkendali..."
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
            Kembali
          </button>
        </div>

        <footer style={styles.footer}>
          © 2026 RS Islam Fatimah. Security Department.
        </footer>
      </div>
      <canvas ref={canvasRef} style={{display: 'none'}} />
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "20px 10px", fontFamily: "'Inter', sans-serif" },
  wrapper: { width: "100%" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  
  logoWrapper: { 
    width: "45px", 
    height: "45px", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "transparent"
  },
  
  logo: { width: "100%", height: "100%", objectFit: "contain" },
  title: { fontSize: "16px", fontWeight: "800", color: "#064e3b" },
  subtitle: { fontSize: "10px", color: "#94a3b8", fontWeight: "600" },
  headerRight: { textAlign: "right" },
  sessionTitle: { fontSize: "12px", fontWeight: "800", color: "#1e293b" },
  sessionId: { fontSize: "9px", color: "#64748b" },
  card: { backgroundColor: "#fff", borderRadius: "20px", padding: "20px", marginBottom: "15px", border: "1px solid #e2e8f0", borderTop: "5px solid #b08d00", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
  cardHeader: { fontSize: "14px", fontWeight: "800", color: "#334155", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "15px" },
  cardHeaderFlex: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", fontWeight: "800", color: "#334155", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "15px" },
  headerIcon: { marginRight: "8px", color: "#b08d00" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" },
  infoLabel: { fontSize: "9px", fontWeight: "800", color: "#94a3b8", marginBottom: "4px" },
  infoValue: { fontSize: "13px", fontWeight: "700", color: "#1e293b" },
  statusOk: { fontSize: "12px", fontWeight: "700", color: "#10b981" },
  
  // ✅ STYLES MAPS
  mapContainer: { height: "180px", backgroundColor: "#f1f5f9", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" },
  mapFooter: { fontSize: "10px", color: "#94a3b8", marginTop: "10px" },
  badgeGps: { fontSize: "8px", backgroundColor: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "4px", marginLeft: "8px", fontWeight: '800' },
  btnMaps: { fontSize: "10px", border: "1.5px solid #b08d00", background: "#fff", color: "#b08d00", padding: "5px 10px", borderRadius: "8px", fontWeight: "800", cursor: "pointer" },

  // STYLES LAYOUT DINAMIS
  camVerticalLayout: { display: "flex", flexDirection: "column", gap: "15px" },
  camHorizontalLayout: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" },
  camSectionMobile: { width: "100%" },
  camSectionWeb: { width: "100%", display: "flex", flexDirection: "column", gap: "10px" },
  subLabel: { fontSize: "10px", fontWeight: "800", color: "#94a3b8", marginBottom: "8px" },
  videoBoxMobile: { width: "100%", aspectRatio: "3/4", backgroundColor: "#000", borderRadius: "15px", overflow: "hidden" },
  previewBoxMobile: { width: "100%", aspectRatio: "3/4", borderRadius: "15px", border: "2px dashed #e2e8f0", backgroundColor: "#fcfdfe", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  videoBoxWeb: { width: "100%", aspectRatio: "16/9", backgroundColor: "#000", borderRadius: "15px", overflow: "hidden" },
  previewBoxWeb: { width: "100%", aspectRatio: "16/9", borderRadius: "15px", border: "2px dashed #e2e8f0", backgroundColor: "#fcfdfe", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  video: { width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" },
  previewImg: { width: "100%", height: "100%", objectFit: "cover" },
  btnCaptureMobile: { width: "100%", backgroundColor: "#064e3b", color: "#fff", border: "none", borderRadius: "12px", padding: "15px 0", fontWeight: "800", cursor: "pointer" },
  btnCaptureWeb: { width: "100%", backgroundColor: "#064e3b", color: "#fff", border: "none", borderRadius: "12px", padding: "12px 0", fontWeight: "800", cursor: "pointer", marginTop: "5px" },
  camReady: { fontSize: "11px", color: "#10b981", fontWeight: "700" },
  placeholderBox: { textAlign: "center", padding: "20px" },
  textarea: { width: "100%", border: "2px solid #f1f5f9", borderRadius: "12px", padding: "12px", fontSize: "14px", minHeight: "100px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  actionArea: { marginTop: "10px" },
  btnSubmit: { width: "100%", backgroundColor: "#064e3b", color: "#fff", border: "none", borderRadius: "16px", padding: "18px", fontWeight: "800", fontSize: "16px", marginBottom: "12px", cursor: "pointer" },
  btnBack: { width: "100%", backgroundColor: "#fff", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "12px", fontWeight: "700", fontSize: "14px" },
  footer: { textAlign: "center", fontSize: "10px", color: "#cbd5e1", marginTop: "30px" }
};