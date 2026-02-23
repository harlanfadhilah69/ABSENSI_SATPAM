import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Swal from 'sweetalert2';
import { 
  Shield, 
  MapPin, 
  Camera, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Send,
  Loader2,
  XCircle
} from "lucide-react";

import logoImg from "../../assets/logo_patroli.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const currentDistance = useMemo(() => {
    if (gps.lat && gps.lng && postInfo?.lat && postInfo?.lng) {
      return getDistance(gps.lat, gps.lng, postInfo.lat, postInfo.lng);
    }
    return null;
  }, [gps, postInfo]);

  const canSubmit = useMemo(() => {
    const baseValid = !!finalPostId && !!photoBlob && gps.lat !== 0 && note.trim().length > 0;
    const radiusValid = currentDistance !== null && currentDistance <= 50;
    return baseValid && radiusValid;
  }, [finalPostId, photoBlob, gps, note, currentDistance]);

  useEffect(() => {
    const fetchPostInfo = async () => {
      if (!urlPostId) return;
      try {
        const res = await api.get("/patrol/scan", { params: { post_id: urlPostId, token: tokenQR || "manual" } });
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
      } catch (err) { 
        Swal.fire({ icon: 'error', title: 'Kamera Gagal', text: 'Izinkan akses kamera untuk patroli.', confirmButtonColor: '#be123c' });
      }
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
      
      Swal.fire({
        icon: 'success',
        title: 'Laporan Terkirim!',
        text: 'Data patroli berhasil diamankan.',
        confirmButtonColor: '#064e3b',
        timer: 2000,
        showConfirmButton: false
      }).then(() => nav("/satpam"));

    } catch (err) { 
      const msg = err.response?.data?.message || "Gagal mengirim laporan.";
      setIsSubmitting(false);
      Swal.fire({ icon: 'error', title: 'Gagal', text: msg, confirmButtonColor: '#be123c' });
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
          <button onClick={() => nav("/satpam")} style={styles.btnBackHeader}><ArrowLeft size={16}/> Batal</button>
        </div>

        {/* INFO POS */}
        <div style={styles.cardGold}>
          <div style={styles.cardHeaderGold}><Info size={16}/> Informasi Titik Patroli</div>
          <div style={styles.infoContent}>
            <div style={styles.infoBox}>
              <div style={styles.infoLabel}>NAMA POS</div>
              <div style={styles.infoValue}>{postInfo?.post_name || "Memuat..."}</div>
            </div>
            <div style={styles.radiusIndicator}>
              <div style={styles.infoLabel}>STATUS RADIUS (MAKS. 50M)</div>
              {currentDistance !== null ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                  {currentDistance <= 50 ? <CheckCircle2 color="#059669" size={24}/> : <AlertCircle color="#be123c" size={24}/>}
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: currentDistance <= 50 ? '#059669' : '#be123c' }}>
                      {Math.round(currentDistance)} Meter
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>
                      {currentDistance <= 50 ? 'Anda dalam jangkauan.' : 'Terlalu jauh dari lokasi!'}
                    </div>
                  </div>
                </div>
              ) : <div style={styles.loadingGps}><Loader2 className="animate-spin" size={14}/> Mengunci GPS...</div>}
            </div>
          </div>
        </div>

        {/* MAP AREA */}
        <div style={styles.card}>
          <div style={styles.cardHeaderFlex}>
            <span><MapPin size={16} style={{marginRight: 8}}/> Lokasi GPS Presisi</span>
            <span style={styles.badgeGps}>TERKUNCI</span>
          </div>
          <div style={styles.mapContainer}>
            {gps.lat !== 0 && (
              <MapContainer center={[gps.lat, gps.lng]} zoom={17} style={{height: '100%', width: '100%'}} zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Circle center={[postInfo?.lat || gps.lat, postInfo?.lng || gps.lng]} radius={50} pathOptions={{ color: '#064e3b', fillColor: '#064e3b' }} />
                <Marker position={[gps.lat, gps.lng]} />
              </MapContainer>
            )}
          </div>
        </div>

        {/* CAMERA SECTION */}
        <div style={styles.card}>
          <div style={styles.cardHeaderFlex}>
            <span><Camera size={16} style={{marginRight: 8}}/> Dokumentasi Selfie</span>
            {photoBlob && <span style={styles.badgeDone}>TERSIMPAN</span>}
          </div>
          <div style={isMobile ? styles.camStack : styles.camSideBySide}>
            <div style={styles.camBox}>
               <div style={styles.boxLabel}>PREVIEW KAMERA</div>
               <div style={{...styles.videoWrapper, aspectRatio: "1/1"}}>
                  <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
               </div>
               <button type="button" onClick={capturePhoto} style={styles.btnCapture}>Ambil Foto Bukti</button>
            </div>
            <div style={styles.camBox}>
               <div style={styles.boxLabel}>HASIL JEPRETAN</div>
               <div style={{...styles.videoWrapper, aspectRatio: "1/1", borderStyle: 'dashed', backgroundColor: '#f8fafc'}}>
                  {photoPreview ? <img src={photoPreview} style={styles.previewImg} alt="selfie" /> : <div style={styles.emptyPhoto}>Belum ada foto</div>}
               </div>
            </div>
          </div>
        </div>

        {/* NOTES */}
        <div style={styles.card}>
          <div style={styles.cardHeader}><Send size={16} style={{marginRight: 8}}/> Laporan Kondisi</div>
          <textarea 
            style={styles.textarea} 
            placeholder="Tuliskan temuan atau 'Aman'..." 
            value={note} 
            onChange={(e) => setNote(e.target.value)} 
          />
        </div>

        {/* SUBMIT BUTTON */}
        <div style={styles.actionArea}>
          <button 
            onClick={submit} 
            disabled={!canSubmit || isSubmitting} 
            style={{...styles.btnSubmit, background: canSubmit ? "linear-gradient(135deg, #064e3b 0%, #065f46 100%)" : "#cbd5e1"}}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : canSubmit ? "KIRIM LAPORAN SEKARANG" : "LENGKAPI DATA / MASUK RADIUS"}
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} style={{display: 'none'}} />
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f1f5f9", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "30px 15px", fontFamily: "'Inter', sans-serif" },
  wrapper: { width: "100%" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  logoWrapper: { width: "50px", height: "50px", backgroundColor: '#fff', padding: '8px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  logo: { width: "100%", height: "100%", objectFit: "contain" },
  title: { fontSize: "16px", fontWeight: "900", color: "#064e3b", textTransform: 'uppercase' },
  subtitle: { fontSize: "10px", color: "#94a3b8", fontWeight: '700' },
  btnBackHeader: { border: 'none', background: '#fff', color: '#64748b', fontWeight: '800', fontSize: '11px', padding: '8px 15px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  
  card: { backgroundColor: "#fff", borderRadius: "24px", padding: "20px", marginBottom: "20px", border: "1.5px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" },
  cardGold: { backgroundColor: "#fff", borderRadius: "24px", padding: "20px", marginBottom: "20px", border: "2px solid #b08d00", boxShadow: "0 10px 20px rgba(176,141,0,0.08)" },
  cardHeaderGold: { fontSize: "13px", fontWeight: "900", color: "#b08d00", marginBottom: "15px", display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' },
  
  infoContent: { display: 'flex', flexDirection: 'column', gap: '15px' },
  infoBox: { padding: '15px', backgroundColor: '#f8fafc', borderRadius: '15px', border: '1px solid #f1f5f9' },
  infoLabel: { fontSize: "10px", color: "#94a3b8", fontWeight: "900", letterSpacing: '0.5px', marginBottom: '4px' },
  infoValue: { fontSize: "18px", fontWeight: "900", color: "#1e293b" },
  radiusIndicator: { padding: '0 5px' },
  loadingGps: { fontSize: '11px', color: '#b08d00', fontWeight: '700', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' },

  cardHeaderFlex: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: "900", color: "#1e293b", marginBottom: "15px" },
  badgeGps: { fontSize: "9px", backgroundColor: "#064e3b", color: "#fff", padding: "4px 10px", borderRadius: "20px", fontWeight: '800' },
  badgeDone: { fontSize: "9px", backgroundColor: "#dcfce7", color: "#059669", padding: "4px 10px", borderRadius: "20px", fontWeight: '800' },

  mapContainer: { height: "180px", borderRadius: "18px", overflow: "hidden", border: "3px solid #f1f5f9" },
  
  camStack: { display: "flex", flexDirection: "column", gap: "15px" },
  camSideBySide: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  camBox: { width: "100%" },
  boxLabel: { fontSize: "10px", fontWeight: "800", color: "#94a3b8", marginBottom: "8px", textAlign: 'center' },
  videoWrapper: { width: "100%", backgroundColor: "#000", borderRadius: "20px", overflow: "hidden", border: "2px solid #f1f5f9", display: 'flex', alignItems: 'center', justifyContent: 'center' },
  video: { width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" },
  previewImg: { width: "100%", height: "100%", objectFit: "cover" },
  emptyPhoto: { textAlign: 'center', color: '#cbd5e1', fontSize: '11px', fontWeight: '700' },
  btnCapture: { width: "100%", backgroundColor: "#064e3b", color: "#fff", border: "none", borderRadius: "14px", padding: "12px", fontWeight: "800", fontSize: "12px", marginTop: "12px", cursor: "pointer", boxShadow: '0 4px 10px rgba(6,78,59,0.2)' },
  
  textarea: { width: "100%", border: "2px solid #f1f5f9", borderRadius: "15px", padding: "15px", fontSize: "14px", minHeight: "100px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: '#f8fafc' },
  
  actionArea: { marginTop: '10px' },
  btnSubmit: { width: "100%", color: "#fff", border: "none", borderRadius: "18px", padding: "18px", fontWeight: "900", fontSize: "14px", cursor: "pointer", boxShadow: '0 10px 15px -3px rgba(6,78,59,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: '0.3s' },
};