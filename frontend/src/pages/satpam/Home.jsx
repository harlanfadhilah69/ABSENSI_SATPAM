import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import SatpamNavbar from "../../components/satpam/SatpamNavbar";
// ✅ IMPORT useNavigate untuk pindah halaman
import { useNavigate } from "react-router-dom";

export default function SatpamHome() {
  const navigate = useNavigate(); //
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pos, setPos] = useState(""); 
  const [msg, setMsg] = useState("");
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
    setMsg("");
    try {
      const params = { date_from: dateFrom, date_to: dateTo, pos: pos.trim() };
      const res = await api.get("/satpam/patrol/logs", { params });
      setRows(res.data?.data || []);
      setCurrentPage(1);
    } catch (e) {
      setMsg("Gagal memuat data");
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
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <SatpamNavbar />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 15px" : "30px 20px" }}>
        
        {/* ✅ TOMBOL NAVIGASI MENUJU MISI PATROLI */}
        <div 
          onClick={() => navigate("/satpam/missions")}
          style={styles.missionLinkCard}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={styles.missionIconBg}>🛡️</div>
            <div>
              <h4 style={{ margin: 0, color: '#064e3b', fontSize: '16px' }}>Misi Patroli Hari Ini</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Cek daftar checkpoint harian Anda</p>
            </div>
          </div>
          <span style={{ fontSize: '20px', color: '#064e3b' }}>➜</span>
        </div>

        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
             <button onClick={fetchLogs} style={styles.btnRefresh}>
                {loading ? "..." : "🔄 Refresh Data"}
            </button>
        </div>

        {/* --- FILTER SECTION --- */}
        <div style={styles.cardContainer}>
          <div style={styles.cardHeaderHijau}>
              <span style={{marginRight: 8}}>⏳</span> Filter Histori
          </div>
          
          <div style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 2fr auto", 
              gap: "15px", 
              alignItems: "end", 
              padding: '20px' 
          }}>
              <div style={styles.inputContainer}>
                  <label style={styles.labelStyle}>Dari Tanggal</label>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={styles.inputStyle} />
              </div>
              <div style={styles.inputContainer}>
                  <label style={styles.labelStyle}>Sampai Tanggal</label>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={styles.inputStyle} />
              </div>
              <div style={styles.inputContainer}>
                  <label style={styles.labelStyle}>Nama Pos</label>
                  <input value={pos} onChange={(e) => setPos(e.target.value)} placeholder="Cari pos..." style={styles.inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 10, width: isMobile ? '100%' : 'auto' }}>
                  <button onClick={fetchLogs} style={{...styles.btnCari, flex: isMobile ? 1 : 'none'}}>Cari</button>
                  <button onClick={handleReset} style={{...styles.btnReset, flex: isMobile ? 1 : 'none'}}>Reset</button>
              </div>
          </div>
        </div>

        {/* --- TABLE SECTION --- */}
        <div style={styles.cardContainer}>
            <div style={styles.cardHeaderHijau}>
                <span style={{marginRight: 8}}>📋</span> Histori Patroli Saya
            </div>
            
            {loading ? (
              <div style={{padding: 50, textAlign: 'center', color: '#94a3b8'}}>Memuat data...</div>
            ) : currentRows.length === 0 ? (
              <div style={{padding: 50, textAlign: 'center', color: '#94a3b8'}}>Tidak ada riwayat.</div>
            ) : isMobile ? (
              <div style={{ padding: '15px' }}>
                {currentRows.map((r) => (
                  <div key={r.id} style={styles.mobileCard}>
                    <div style={styles.mobileCardRow}>
                      <span style={styles.mobileLabel}>WAKTU</span>
                      <span style={styles.mobileValue}>{formatWaktu(r.captured_at_server || r.created_at)}</span>
                    </div>
                    <div style={styles.mobileCardRow}>
                      <span style={styles.mobileLabel}>POS</span>
                      <span style={{...styles.mobileValue, color: '#064e3b', fontWeight: '800'}}>{r.post_name}</span>
                    </div>
                    <div style={styles.mobileCardRow}>
                      <span style={styles.mobileLabel}>CATATAN</span>
                      <span style={styles.mobileValue}>{r.note || "Aman"}</span>
                    </div>
                    <div style={styles.mobileCardActions}>
                      {r.lat && (
                        <button onClick={() => window.open(`http://maps.google.com/?q=${r.lat},${r.lng}`)} style={styles.btnActionMobile}>
                          📍 Lihat Peta
                        </button>
                      )}
                      {r.photo_path && (
                        <button onClick={() => setSelectedImg(fotoUrl(r.photo_path))} style={styles.btnActionMobile}>
                          📷 Lihat Foto
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                  <table width="100%" style={{ borderCollapse: "collapse" }}>
                  <thead>
                      <tr style={styles.tableHeader}>
                          <th align="left" style={styles.thStyle}>WAKTU</th>
                          <th align="left" style={styles.thStyle}>POS</th>
                          <th align="left" style={styles.thStyle}>CATATAN</th>
                          <th align="left" style={styles.thStyle}>LOKASI (GPS)</th>
                          <th align="center" style={styles.thStyle}>FOTO</th>
                      </tr>
                  </thead>
                  <tbody>
                      {currentRows.map((r) => (
                        <tr key={r.id} style={styles.trStyle}>
                            <td style={styles.tdStyle}>{formatWaktu(r.captured_at_server || r.created_at)}</td>
                            <td style={{...styles.tdStyle, fontWeight: '700', color: '#111827'}}>{r.post_name}</td>
                            <td style={{...styles.tdStyle, color: '#4b5563'}}>{r.note || "Aman"}</td>
                            <td style={styles.tdStyle}>
                                {r.lat ? (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <a href={`http://maps.google.com/?q=${r.lat},${r.lng}`} target="_blank" rel="noreferrer" style={styles.linkMaps}>
                                          🗏 Buka Peta
                                      </a>
                                      <span style={{ fontSize: '10px', color: '#9ca3af' }}>Akurasi: ±{Math.round(r.accuracy || 0)}m</span>
                                    </div>
                                ) : <span style={{color: '#ccc'}}>Tanpa GPS</span>}
                            </td>
                            <td align="center" style={styles.tdStyle}>
                                {r.photo_path ? (
                                    <img 
                                      src={fotoUrl(r.photo_path)} 
                                      alt="foto" 
                                      style={styles.imgThumb} 
                                      onClick={() => setSelectedImg(fotoUrl(r.photo_path))} 
                                    />
                                ) : "-"}
                            </td>
                        </tr>
                      ))}
                  </tbody>
                  </table>
              </div>
            )}

            {/* Pagination remains the same */}
            {rows.length > 0 && (
              <div style={styles.paginationArea}>
                <div style={styles.pageInfo}>
                  {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, rows.length)} dari {rows.length}
                </div>
                <div style={styles.pageButtons}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} style={styles.navBtn}>‹</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)} style={{ ...styles.pageBtn, backgroundColor: currentPage === i + 1 ? "#b08d00" : "transparent", color: currentPage === i + 1 ? "#fff" : "#6b7280" }}>{i + 1}</button>
                  ))}
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} style={styles.navBtn}>›</button>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* --- MODAL SECTION --- */}
      {selectedImg && (
        <div style={styles.modalOverlayImg} onClick={() => setSelectedImg(null)}>
          <div style={styles.modalContentImg} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeaderImg}>
              <span style={{fontWeight: '800', fontSize: '14px'}}>Pratinjau Foto Patroli</span>
              <button onClick={() => setSelectedImg(null)} style={styles.btnCloseImg}>✕</button>
            </div>
            <div style={styles.modalBodyImg}>
              <img src={selectedImg} alt="Patrol Full" style={styles.fullImg} />
            </div>
          </div>
        </div>
      )}

      <footer style={{textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px'}}>
          © 2026 <b>RS Islam Fatimah</b>. Security Patrol Monitoring.
      </footer>
    </div>
  );
}

const styles = {
  // ✅ STYLES UNTUK KARTU LINK MISI
  missionLinkCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px', backgroundColor: '#fff', borderRadius: '18px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '25px',
    cursor: 'pointer', border: '1.5px solid #ecfdf5', transition: 'all 0.2s'
  },
  missionIconBg: {
    width: '45px', height: '45px', backgroundColor: '#ecfdf5', borderRadius: '12px',
    display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px'
  },

  cardContainer: { backgroundColor: "#fff", borderRadius: "18px", overflow: 'hidden', boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: 25 },
  cardHeaderHijau: { padding: '15px 20px', backgroundColor: '#064e3b', borderTop: '6px solid #b08d00', fontWeight: '800', color: '#fff', fontSize: '15px', display: 'flex', alignItems: 'center' },
  inputContainer: { display: 'flex', flexDirection: 'column', gap: '5px' },
  labelStyle: { fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
  inputStyle: { padding: "12px 15px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "14px", width: '100%', boxSizing: 'border-box', outline: 'none' },
  btnCari: { padding: "12px 25px", borderRadius: 12, border: "none", background: "#064e3b", color: "white", fontWeight: "800", cursor: "pointer", boxShadow: '0 4px 6px rgba(6,78,59,0.2)' },
  btnReset: { padding: "12px 20px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: "700", cursor: "pointer" },
  btnRefresh: { padding: "10px 20px", borderRadius: 12, border: "none", background: "#fff", color: "#1e293b", fontWeight: "800", boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer' },
  tableHeader: { background: "#f8fafc" },
  thStyle: { padding: "15px 20px", fontSize: "11px", color: "#94a3b8", fontWeight: "800" },
  tdStyle: { padding: "18px 20px", fontSize: "14px", borderBottom: "1px solid #f1f5f9" },
  trStyle: { transition: 'background 0.2s' },
  linkMaps: { color: "#b08d00", textDecoration: "none", fontWeight: "800", fontSize: "13px" },
  imgThumb: { width: "50px", height: "50px", objectFit: "cover", borderRadius: "12px", border: "2px solid #f1f5f9", cursor: 'pointer' },
  mobileCard: { padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' },
  mobileCardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  mobileLabel: { fontSize: '10px', fontWeight: '800', color: '#94a3b8' },
  mobileValue: { fontSize: '13px', fontWeight: '600', color: '#1e293b' },
  mobileCardActions: { display: 'flex', gap: '10px', marginTop: '5px' },
  btnActionMobile: { flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#1e293b', fontSize: '12px', fontWeight: '800', cursor: 'pointer' },
  paginationArea: { padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" },
  pageInfo: { fontSize: "12px", color: "#94a3b8", fontWeight: '600' },
  pageButtons: { display: "flex", gap: "5px", alignItems: "center" },
  pageBtn: { border: "none", width: "32px", height: "32px", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: "800" },
  navBtn: { border: "none", background: "transparent", color: "#94a3b8", fontSize: "22px", cursor: "pointer" },
  modalOverlayImg: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
  modalContentImg: { backgroundColor: '#064e3b', borderRadius: '24px', width: '90%', maxWidth: '650px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
  modalHeaderImg: { padding: '15px 25px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' },
  btnCloseImg: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'white' },
  modalBodyImg: { padding: '15px', backgroundColor: '#f8fafc' },
  fullImg: { width: '100%', height: 'auto', maxHeight: '70vh', borderRadius: '15px', objectFit: 'contain', display: 'block' },
};