import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import SatpamNavbar from "../../components/satpam/SatpamNavbar";

export default function SatpamHome() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pos, setPos] = useState(""); 
  const [msg, setMsg] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Menampilkan 5 data per halaman sesuai mockup

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

  const hasGPS = (r) => r.lat && r.lng;

  const fetchLogs = async () => {
    setLoading(true);
    setMsg("");
    try {
      const params = { date_from: dateFrom, date_to: dateTo, pos: pos.trim() };
      const res = await api.get("/satpam/patrol/logs", { params });
      setRows(res.data?.data || []);
      setCurrentPage(1); // Reset ke halaman 1 setiap kali filter berubah
    } catch (e) {
      setMsg("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  // --- LOGIKA PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = rows.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(rows.length / itemsPerPage);

  return (
    <div style={{ backgroundColor: "#f3f4f6", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <SatpamNavbar />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 20px" }}>
        
        {/* Tombol Refresh Float */}
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
             <button onClick={fetchLogs} style={btnRefresh}>
                {loading ? "..." : "🔄 Perbarui Data"}
            </button>
        </div>

        {/* Filter Section */}
        <div style={filterCard}>
          <div style={cardHeaderEmas}>
              <span style={{marginRight: 8}}>⏳</span> Filter Histori
          </div>
          
          <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr 2fr auto", 
              gap: "16px", 
              alignItems: "end", 
              padding: '20px' 
          }}>
              <div style={inputContainer}>
                  <label style={labelStyle}>Dari Tanggal</label>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} />
              </div>
              
              <div style={inputContainer}>
                  <label style={labelStyle}>Sampai Tanggal</label>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} />
              </div>
              
              <div style={inputContainer}>
                  <label style={labelStyle}>Nama Pos</label>
                  <input 
                      value={pos} 
                      onChange={(e) => setPos(e.target.value)} 
                      placeholder="Cari lokasi pos..." 
                      style={inputStyle} 
                  />
              </div>
              
              <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={fetchLogs} style={btnCari}>Cari</button>
                  <button onClick={() => { setDateFrom(""); setDateTo(""); setPos(""); fetchLogs(); }} style={btnReset}>Reset</button>
              </div>
          </div>
          {msg && <div style={{ padding: '0 20px 20px', color: "crimson", fontWeight: "bold", fontSize: 14 }}>{msg}</div>}
        </div>

        {/* Table Section */}
        <div style={tableCard}>
            <div style={cardHeaderEmas}>
                <span style={{marginRight: 8}}>📋</span> Histori Patroli Saya
            </div>
            
            <div style={{ overflowX: "auto" }}>
                <table width="100%" style={{ borderCollapse: "collapse" }}>
                <thead>
                    <tr style={tableHeader}>
                        <th align="left" style={thStyle}>WAKTU</th>
                        <th align="left" style={thStyle}>POS</th>
                        <th align="left" style={thStyle}>CATATAN</th>
                        <th align="left" style={thStyle}>LOKASI (GPS)</th>
                        <th align="center" style={thStyle}>FOTO</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRows.length === 0 ? (
                        <tr><td colSpan="5" align="center" style={{ padding: 50, color: "#999" }}>{loading ? "Memuat..." : "Tidak ada riwayat."}</td></tr>
                    ) : (
                        currentRows.map((r) => (
                        <tr key={r.id} style={trStyle}>
                            <td style={tdStyle}>{formatWaktu(r.captured_at_server || r.created_at)}</td>
                            <td style={{...tdStyle, fontWeight: '700', color: '#111827'}}>{r.post_name}</td>
                            <td style={{...tdStyle, color: '#4b5563'}}>{r.note || "Aman"}</td>
                            <td style={tdStyle}>
                                {hasGPS(r) ? (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <a href={`https://www.google.com/maps?q=${r.lat},${r.lng}`} target="_blank" rel="noreferrer" style={linkMaps}>
                                          🗏 Buka Peta
                                      </a>
                                      <span style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>Akurasi: ±{Math.round(r.accuracy || 0)}m</span>
                                    </div>
                                ) : <span style={{color: '#ccc'}}>Tanpa GPS</span>}
                            </td>
                            <td align="center" style={tdStyle}>
                                {r.photo_path ? (
                                    <a href={fotoUrl(r.photo_path)} target="_blank" rel="noreferrer">
                                        <img src={fotoUrl(r.photo_path)} alt="foto" style={imgThumb} />
                                    </a>
                                ) : "-"}
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
                </table>
            </div>

            {/* --- BAGIAN PAGINATION --- */}
            {rows.length > 0 && (
              <div style={paginationArea}>
                <div style={pageInfo}>
                  Menampilkan <b>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, rows.length)}</b> dari <b>{rows.length}</b> histori
                </div>
                <div style={pageButtons}>
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(currentPage - 1)}
                    style={navBtn}
                  >
                    ‹
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      style={{
                        ...pageBtn,
                        backgroundColor: currentPage === i + 1 ? "#b08d00" : "transparent",
                        color: currentPage === i + 1 ? "#fff" : "#6b7280",
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(currentPage + 1)}
                    style={navBtn}
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
        </div>

      </div>
      <footer style={{textAlign: 'center', padding: '20px', color: '#999', fontSize: '12px'}}>
         © 2026 <b>RS Islam Fatimah</b>. Sistem Manajemen Keamanan Digital.
      </footer>
    </div>
  );
}

// --- STYLES ---
const filterCard = { backgroundColor: "#fff", borderRadius: "15px", overflow: 'hidden', boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", borderTop: '5px solid #b08d00' };
const tableCard = { backgroundColor: "#fff", borderRadius: "15px", overflow: 'hidden', boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", marginTop: 30, borderTop: '5px solid #b08d00' };
const cardHeaderEmas = { padding: '15px 20px', backgroundColor: '#fff', borderBottom: '1px solid #eee', fontWeight: '800', color: '#1f2937', fontSize: '16px' };
const inputContainer = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle = { fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' };
const inputStyle = { padding: "10px 15px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "14px", width: '100%', boxSizing: 'border-box' };

const btnCari = { padding: "10px 25px", borderRadius: 10, border: "none", background: "#064e3b", color: "white", fontWeight: "700", cursor: "pointer" };
const btnReset = { padding: "10px 20px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", fontWeight: "700", cursor: "pointer" };
const btnRefresh = { padding: "8px 16px", borderRadius: 10, border: "none", background: "#fff", color: "#374151", fontWeight: "700", boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer' };

const tableHeader = { background: "#f9fafb" };
const thStyle = { padding: "15px 20px", fontSize: "11px", color: "#6b7280", fontWeight: "700", textTransform: 'uppercase' };
const tdStyle = { padding: "15px 20px", fontSize: "14px", borderBottom: "1px solid #f3f4f6" };
const trStyle = { transition: 'background 0.2s' };
const linkMaps = { color: "#b08d00", textDecoration: "none", fontWeight: "700", fontSize: "13px" };
const imgThumb = { width: 45, height: 45, objectFit: "cover", borderRadius: 10, border: "2px solid #eee" };

// --- PAGINATION STYLES ---
const paginationArea = { padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderTop: "1px solid #f3f4f6" };
const pageInfo = { fontSize: "12px", color: "#9ca3af" };
const pageButtons = { display: "flex", gap: "5px", alignItems: "center" };
const pageBtn = { border: "none", width: "30px", height: "30px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "700", transition: "all 0.2s" };
const navBtn = { border: "none", background: "transparent", color: "#9ca3af", fontSize: "20px", cursor: "pointer", padding: "0 10px" };