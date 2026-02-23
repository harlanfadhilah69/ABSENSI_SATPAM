import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import SatpamNavbar from "../../components/satpam/SatpamNavbar";
import { useNavigate } from "react-router-dom";
import { 
  Shield, 
  History, 
  Calendar, 
  MapPin, 
  Camera, 
  ChevronRight, 
  Search, 
  RotateCcw, 
  Loader2,
  XCircle
} from "lucide-react";
import Swal from 'sweetalert2';

export default function SatpamHome() {
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pos, setPos] = useState(""); 
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const baseApi = useMemo(() => {
    const raw = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
  }, []);

  const fotoUrl = (photoPath) => {
    if (!photoPath) return "";
    const clean = String(photoPath).startsWith("/") ? String(photoPath).slice(1) : String(photoPath);
    return `${baseApi}/${clean}`;
  };

  const formatWaktu = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    return d.toLocaleString("id-ID", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }).replace(/\./g, ':');
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { date_from: dateFrom, date_to: dateTo, pos: pos.trim() };
      const res = await api.get("/satpam/patrol/logs", { params });
      setRows(res.data?.data || []);
      setCurrentPage(1);
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal memuat histori patroli.', confirmButtonColor: '#be123c' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setDateFrom("");
    setDateTo("");
    setPos("");
    fetchLogs();
  };

  useEffect(() => { fetchLogs(); }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = rows.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(rows.length / itemsPerPage);

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <SatpamNavbar />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: isMobile ? "25px 15px" : "40px 20px" }}>
        
        {/* ✅ HEADER SECTION */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '30px' }}>
          <div style={styles.barGold}></div>
          <div>
            <h2 style={styles.mainTitle}>Dashboard Satpam <span style={{color: '#064e3b'}}>🛡️</span></h2>
            <p style={styles.subTitle}>Sistem Monitoring Keamanan RSIFC</p>
          </div>
        </div>

        {/* ✅ MENU UTAMA: MISI PATROLI (AKSEN EMAS) */}
        <div onClick={() => navigate("/satpam/missions")} style={styles.missionCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={styles.missionIconBox}><Shield size={28} color="#fff" /></div>
            <div>
              <h4 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '900' }}>MISI PATROLI HARI INI</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>Cek titik checkpoint & mulai patroli</p>
            </div>
          </div>
          <ChevronRight size={24} color="#fff" />
        </div>

        {/* --- FILTER SECTION --- */}
        <div style={styles.cardContainer}>
          <div style={styles.cardHeader}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={18} />
                <span>Filter Histori</span>
             </div>
          </div>
          
          <div style={{ ...styles.filterBody, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr" }}>
              <div style={styles.inputGroup}>
                  <label style={styles.labelStyle}>Dari Tanggal</label>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={styles.inputStyle} />
              </div>
              <div style={styles.inputGroup}>
                  <label style={styles.labelStyle}>Sampai Tanggal</label>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={styles.inputStyle} />
              </div>
              <div style={styles.inputGroup}>
                  <label style={styles.labelStyle}>Cari Titik Pos</label>
                  <input value={pos} onChange={(e) => setPos(e.target.value)} placeholder="Misal: Lobby..." style={styles.inputStyle} />
              </div>
          </div>
          
          <div style={styles.filterActions}>
              <button onClick={fetchLogs} style={styles.btnCari}><Search size={16}/> Cari Histori</button>
              <button onClick={handleReset} style={styles.btnReset}><RotateCcw size={16}/> Reset</button>
          </div>
        </div>

        {/* --- TABLE / LOG SECTION --- */}
        <div style={styles.cardContainer}>
            <div style={{ ...styles.cardHeader, backgroundColor: '#064e3b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <History size={18} />
                   <span>Riwayat Patroli Saya</span>
                </div>
            </div>
            
            {loading ? (
              <div style={{padding: 60, textAlign: 'center'}}><Loader2 className="animate-spin" size={32} color="#064e3b" style={{margin: '0 auto'}}/></div>
            ) : currentRows.length === 0 ? (
              <div style={{padding: 60, textAlign: 'center', color: '#94a3b8', fontWeight: '500'}}>Tidak ada riwayat patroli ditemukan.</div>
            ) : isMobile ? (
              <div style={{ padding: '10px' }}>
                {currentRows.map((r) => (
                  <div key={r.id} style={styles.mobileCard}>
                    <div style={styles.mobileRow}><span style={styles.mobileLabel}>WAKTU</span><span style={styles.mobileValue}>{formatWaktu(r.captured_at_server || r.created_at)}</span></div>
                    <div style={styles.mobileRow}><span style={styles.mobileLabel}>TITIK POS</span><span style={{...styles.mobileValue, color: '#064e3b', fontWeight: '900'}}>{r.post_name}</span></div>
                    <div style={styles.mobileRow}><span style={styles.mobileLabel}>CATATAN</span><span style={{...styles.mobileValue, fontStyle: 'italic', fontSize: '12px'}}>"{r.note || "Aman"}"</span></div>
                    <div style={styles.mobileActions}>
                      {r.lat && <button onClick={() => window.open(`http://maps.google.com/?q=${r.lat},${r.lng}`)} style={styles.btnActionSmall}><MapPin size={14}/> Peta</button>}
                      {r.photo_path && <button onClick={() => setSelectedImg(fotoUrl(r.photo_path))} style={styles.btnActionSmall}><Camera size={14}/> Foto</button>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                  <table width="100%" style={{ borderCollapse: "collapse" }}>
                  <thead>
                      <tr style={{ backgroundColor: '#f8fafc' }}>
                          <th align="left" style={styles.thStyle}>WAKTU</th>
                          <th align="left" style={styles.thStyle}>POS PATROLI</th>
                          <th align="left" style={styles.thStyle}>CATATAN</th>
                          <th align="left" style={styles.thStyle}>GPS</th>
                          <th align="center" style={styles.thStyle}>DOKUMENTASI</th>
                      </tr>
                  </thead>
                  <tbody>
                      {currentRows.map((r) => (
                        <tr key={r.id} style={styles.trStyle}>
                            <td style={styles.tdStyle}>{formatWaktu(r.captured_at_server || r.created_at)}</td>
                            <td style={{...styles.tdStyle, fontWeight: '800', color: '#111827'}}>{r.post_name}</td>
                            <td style={{...styles.tdStyle, color: '#4b5563', fontSize: '13px'}}>"{r.note || "Aman"}"</td>
                            <td style={styles.tdStyle}>
                                {r.lat ? (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <a href={`http://maps.google.com/?q=${r.lat},${r.lng}`} target="_blank" rel="noreferrer" style={styles.linkMaps}>📍 Buka Peta</a>
                                      <span style={{ fontSize: '10px', color: '#9ca3af' }}>Akurasi: ±{Math.round(r.accuracy || 0)}m</span>
                                    </div>
                                ) : <span style={{color: '#ccc'}}>N/A</span>}
                            </td>
                            <td align="center" style={styles.tdStyle}>
                                {r.photo_path ? (
                                    <img src={fotoUrl(r.photo_path)} alt="foto" style={styles.imgThumb} onClick={() => setSelectedImg(fotoUrl(r.photo_path))} />
                                ) : "-"}
                            </td>
                        </tr>
                      ))}
                  </tbody>
                  </table>
              </div>
            )}

            {rows.length > 0 && (
              <div style={styles.paginationArea}>
                <div style={styles.pageInfo}>Data {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, rows.length)} dari {rows.length}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={styles.btnPageNav}>‹</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)} style={{ ...styles.btnPageNum, backgroundColor: currentPage === i + 1 ? "#b08d00" : "transparent", color: currentPage === i + 1 ? "#fff" : "#64748b" }}>{i + 1}</button>
                  ))}
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p + 1)} style={styles.btnPageNav}>›</button>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* ✅ MODAL FOTO RESPONSIVE */}
      {selectedImg && (
        <div style={styles.modalOverlay} onClick={() => setSelectedImg(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={{fontWeight: '900', fontSize: '15px'}}>📷 Foto Patroli</span>
              <button onClick={() => setSelectedImg(null)} style={styles.btnClose}><XCircle size={22}/></button>
            </div>
            <div style={styles.modalBody}>
              <img src={selectedImg} alt="Patrol Full" style={styles.fullImg} />
            </div>
          </div>
        </div>
      )}

      <footer style={styles.footer}>
          © 2026 <b>RS Islam Fatimah Cilacap</b> — <i>Security Patrol</i>
      </footer>
    </div>
  );
}

const styles = {
  barGold: { width: '6px', height: '45px', backgroundColor: '#b08d00', borderRadius: '10px' },
  mainTitle: { fontSize: '28px', fontWeight: "900", color: "#1e293b", margin: 0 },
  subTitle: { color: "#64748b", marginTop: 5, fontSize: 13, fontWeight: '500' },
  
  // CARD MISI UTAMA
  missionCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '25px', background: 'linear-gradient(135deg, #b08d00 0%, #d97706 100%)', 
    borderRadius: '24px', boxShadow: '0 10px 20px rgba(176,141,0,0.3)', 
    marginBottom: '30px', cursor: 'pointer', transition: '0.2s'
  },
  missionIconBox: {
    width: '55px', height: '55px', backgroundColor: 'rgba(255,255,255,0.2)', 
    borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center'
  },

  cardContainer: { backgroundColor: "#fff", borderRadius: "24px", overflow: 'hidden', boxShadow: "0 4px 20px rgba(0,0,0,0.04)", marginBottom: 30, border: "1px solid #f1f5f9" },
  cardHeader: { padding: '18px 25px', backgroundColor: '#b08d00', fontWeight: '900', color: '#fff', fontSize: '14px', letterSpacing: '0.5px' },
  
  filterBody: { display: "grid", gap: "20px", padding: '25px 25px 15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  labelStyle: { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
  inputStyle: { padding: "12px 15px", borderRadius: "14px", border: "1.5px solid #f1f5f9", fontSize: "14px", width: '100%', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f8fafc' },
  
  filterActions: { padding: '0 25px 25px', display: 'flex', gap: '12px' },
  btnCari: { display: 'flex', alignItems: 'center', gap: 8, padding: "12px 25px", borderRadius: 14, border: "none", background: "#064e3b", color: "white", fontWeight: "800", cursor: "pointer", boxShadow: '0 4px 12px rgba(6,78,59,0.2)' },
  btnReset: { display: 'flex', alignItems: 'center', gap: 8, padding: "12px 20px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: "700", cursor: "pointer" },
  
  thStyle: { padding: "15px 20px", fontSize: "11px", color: "#94a3b8", fontWeight: "900", letterSpacing: '0.5px' },
  tdStyle: { padding: "18px 20px", fontSize: "14px", borderBottom: "1px solid #f8fafc" },
  trStyle: { transition: 'background 0.2s' },
  linkMaps: { color: "#b08d00", textDecoration: "none", fontWeight: "800", fontSize: "12px" },
  imgThumb: { width: "45px", height: "45px", objectFit: "cover", borderRadius: "12px", border: "2px solid #f1f5f9", cursor: 'pointer' },
  
  mobileCard: { padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' },
  mobileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  mobileLabel: { fontSize: '10px', fontWeight: '900', color: '#94a3b8' },
  mobileValue: { fontSize: '13px', fontWeight: '700', color: '#1e293b' },
  mobileActions: { display: 'flex', gap: '10px', marginTop: '5px' },
  btnActionSmall: { flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#fff', color: '#1e293b', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  
  paginationArea: { padding: "20px 25px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" },
  pageInfo: { fontSize: "12px", color: "#94a3b8", fontWeight: '700' },
  btnPageNav: { border: "none", background: "none", color: "#94a3b8", fontSize: "24px", cursor: "pointer" },
  btnPageNum: { border: "none", width: "35px", height: "35px", borderRadius: "12px", cursor: "pointer", fontSize: "13px", fontWeight: "800" },
  
  footer: { textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: '11px', letterSpacing: '1px' },
  
  // MODAL STYLES
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' },
  modalContent: { backgroundColor: '#fff', borderRadius: '28px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' },
  modalHeader: { padding: '15px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#064e3b', color: 'white' },
  btnClose: { background: 'none', border: 'none', color: 'white', cursor: 'pointer' },
  modalBody: { padding: '15px', backgroundColor: '#f8fafc' },
  fullImg: { width: '100%', height: 'auto', maxHeight: '65vh', borderRadius: '20px', objectFit: 'contain', display: 'block' },
};