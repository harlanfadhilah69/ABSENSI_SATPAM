import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import AdminNavbar from "../../components/admin/AdminNavbar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reports() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [satpam, setSatpam] = useState("");
  const [pos, setPos] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [notif, setNotif] = useState({ show: false, status: "", message: "" });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const baseApi = useMemo(() => {
    const raw = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
  }, []);

  const fotoUrl = (photoPath) => {
    if (!photoPath) return "";
    const clean = String(photoPath).startsWith("/") ? String(photoPath).slice(1) : String(photoPath);
    return `${baseApi}/${clean}`;
  };

  const showNotif = (status, msg) => {
    setNotif({ show: true, status, message: msg });
    setTimeout(() => setNotif({ show: false, status: "", message: "" }), 3000);
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    return d.toLocaleString("id-ID", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).replace(/\./g, ':');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { date_from: dateFrom, date_to: dateTo, satpam: satpam.trim(), pos: pos.trim() };
      const res = await api.get("/admin/reports", { params });
      setRows(res.data?.data || []);
      setCurrentPage(1);
    } catch (e) {
      showNotif("error", "Gagal mengambil laporan");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = (isCurrentPageOnly = false) => {
    const doc = new jsPDF("l", "mm", "a4");
    const dataToExport = isCurrentPageOnly ? currentRows : rows;
    doc.text(`LAPORAN PATROLI ${isCurrentPageOnly ? 'HALAMAN ' + currentPage : 'TOTAL'}`, 14, 15);
    autoTable(doc, {
      head: [["No", "Waktu", "Satpam", "Pos", "Catatan", "GPS"]],
      body: dataToExport.map((r, i) => [
        isCurrentPageOnly ? (indexOfFirstItem + i + 1) : (i + 1),
        formatDateTime(r.captured_at_server || r.created_at),
        r.satpam_name || "-", r.post_name || "-", r.note || "-", r.lat ? `${r.lat}, ${r.lng}` : "-"
      ]),
      startY: 25,
      headStyles: { fillColor: [6, 78, 59] }
    });
    doc.save(`Laporan_Patroli.pdf`);
  };

  const triggerDelete = (row) => {
    setSelectedRow(row);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/admin/reports/${selectedRow.id}`);
      showNotif("success", "Histori patroli berhasil dihapus");
      setShowDeleteModal(false);
      fetchData();
    } catch (e) {
      showNotif("error", "Gagal menghapus data");
      setShowDeleteModal(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = rows.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(rows.length / itemsPerPage);

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <AdminNavbar />
      
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 15px" : "40px 20px" }}>
        
        {/* --- HEADER DENGAN AKSEN EMAS BERDIRI --- */}
        <div style={{ marginBottom: 30, display: "flex", gap: "15px", alignItems: "flex-start" }}>
          {/* Aksen emas vertikal */}
          <div style={{ width: "6px", backgroundColor: "#b08d00", alignSelf: "stretch", borderRadius: "2px" }}></div>
          <div>
            <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: "800", color: "#1e293b", margin: 0 }}>Laporan Patroli</h1>
            <p style={{ color: "#64748b", fontSize: 14 }}>Monitoring Keamanan RS Islam Fatimah</p>
          </div>
        </div>

        {/* --- FILTER CARD --- */}
        <div style={styles.cardContainer}>
          <div style={styles.gridFilter}>
            <div style={styles.inputGroup}><label style={styles.labelStyle}>DARI TANGGAL</label><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={styles.inputStyle} /></div>
            <div style={styles.inputGroup}><label style={styles.labelStyle}>SAMPAI TANGGAL</label><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={styles.inputStyle} /></div>
            <div style={styles.inputGroup}><label style={styles.labelStyle}>NAMA SATPAM</label><input value={satpam} onChange={(e) => setSatpam(e.target.value)} placeholder="Cari..." style={styles.inputStyle} /></div>
            <div style={styles.inputGroup}><label style={styles.labelStyle}>LOKASI POS</label><input value={pos} onChange={(e) => setPos(e.target.value)} placeholder="Cari..." style={styles.inputStyle} /></div>
          </div>
          
          <div style={{ ...styles.filterActions, flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ display: "flex", gap: 10, width: isMobile ? '100%' : 'auto' }}>
              <button onClick={fetchData} style={{ ...styles.btnFilter, flex: isMobile ? 1 : 'none' }}>FILTER</button>
              <button onClick={() => { setDateFrom(""); setDateTo(""); setSatpam(""); setPos(""); fetchData(); }} style={{ ...styles.btnReset, flex: isMobile ? 1 : 'none' }}>RESET</button>
            </div>
            <div style={{ display: "flex", gap: 10, width: isMobile ? '100%' : 'auto' }}>
              <button onClick={() => exportPDF(true)} style={{ ...styles.btnExport, flex: isMobile ? 1 : 'none' }}>DOWNLOAD THIS PAGE PDF</button>
              <button onClick={() => exportPDF(false)} style={{ ...styles.btnExport, flex: isMobile ? 1 : 'none' }}>DOWNLOAD ALL PAGE PDF</button>
            </div>
          </div>
        </div>

        {/* --- LOGS SECTION DENGAN HEADER HIJAU & AKSEN EMAS --- */}
        <div style={styles.cardContainer}>
          {loading ? (
            <div style={{ padding: 50, textAlign: 'center', color: '#94a3b8' }}>Memuat data...</div>
          ) : currentRows.length === 0 ? (
            <div style={{ padding: 50, textAlign: 'center', color: '#94a3b8' }}>Tidak ada laporan.</div>
          ) : isMobile ? (
            <div style={{ padding: '15px' }}>
              {currentRows.map((r) => (
                <div key={r.id} style={styles.mobileCard}>
                  <div style={styles.mobileRow}><span style={styles.mobileLabel}>SATPAM</span><span style={{ fontWeight: '800' }}>{r.satpam_name || r.username}</span></div>
                  <div style={styles.mobileRow}><span style={styles.mobileLabel}>WAKTU</span><span>{formatDateTime(r.captured_at_server || r.created_at)}</span></div>
                  <div style={styles.mobileRow}><span style={styles.mobileLabel}>POS</span><span style={{ color: '#064e3b', fontWeight: '800' }}>{r.post_name}</span></div>
                  <div style={styles.mobileRow}><span style={styles.mobileLabel}>CATATAN</span><span style={{ fontStyle: 'italic' }}>{r.note || "Aman"}</span></div>
                  <div style={styles.mobileActions}>
                    {r.lat && <button onClick={() => window.open(`http://maps.google.com/?q=${r.lat},${r.lng}`)} style={styles.btnActionSmall}>📍 Peta</button>}
                    {r.photo_path && <button onClick={() => window.open(fotoUrl(r.photo_path))} style={styles.btnActionSmall}>📷 Foto</button>}
                    <button onClick={() => triggerDelete(r)} style={styles.btnActionDelete}>🗑 Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table width="100%" style={{ borderCollapse: "collapse" }}>
                <thead>
                  {/* Header Hijau dengan garis emas */}
                  <tr style={styles.tableHeader}>
                    <th style={styles.thStyle}>WAKTU</th>
                    <th style={styles.thStyle}>SATPAM</th>
                    <th style={styles.thStyle}>POS</th>
                    <th style={styles.thStyle}>CATATAN</th>
                    <th style={styles.thStyle}>GPS</th>
                    <th style={styles.thStyle}>FOTO</th>
                    <th style={styles.thStyle}>AKSI</th>
                  </tr>
                </thead>
                <tbody>{currentRows.map((r) => (
                  <tr key={r.id} style={styles.trStyle}>
                    <td style={styles.tdStyle}>{formatDateTime(r.captured_at_server || r.created_at)}</td>
                    <td style={{ ...styles.tdStyle, fontWeight: "700" }}>{r.satpam_name || r.username}</td>
                    <td style={styles.tdStyle}>{r.post_name || "-"}</td>
                    <td style={{ ...styles.tdStyle, color: "#64748b" }}>"{r.note || "-"}"</td>
                    <td style={styles.tdStyle}>{r.lat && <a href={`http://maps.google.com/?q=${r.lat},${r.lng}`} target="_blank" style={styles.linkMaps}>📍 Maps</a>}</td>
                    <td style={styles.tdStyle}>{r.photo_path && <img src={fotoUrl(r.photo_path)} style={styles.imgThumb} onClick={() => window.open(fotoUrl(r.photo_path))} />}</td>
                    <td style={styles.tdStyle}><button onClick={() => triggerDelete(r)} style={styles.btnHapus}>HAPUS</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {/* --- PAGINATION --- */}
          {rows.length > 0 && (
            <div style={styles.paginationArea}>
              <div style={{ fontSize: 13, color: "#64748b" }}>Menampilkan <b>{indexOfFirstItem + 1}</b>-<b>{Math.min(indexOfLastItem, rows.length)}</b> dari {rows.length}</div>
              <div style={{ display: "flex", gap: 5 }}>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={styles.btnNav}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => (<button key={i+1} onClick={() => setCurrentPage(i+1)} style={currentPage === i+1 ? styles.btnPageActive : styles.btnPage}>{i+1}</button>))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={styles.btnNav}>›</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL KONFIRMASI HAPUS */}
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalIconBox}>🗑️</div>
            <h3 style={styles.modalTitle}>Hapus Histori?</h3>
            <p style={styles.modalBody}>
              Apakah Anda yakin ingin menghapus histori patroli di <b>"{selectedRow?.post_name}"</b> oleh <b>{selectedRow?.satpam_name || selectedRow?.username}</b>?
            </p>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowDeleteModal(false)} style={styles.btnCancel}>Batal</button>
              <button onClick={handleConfirmDelete} style={styles.btnConfirmRed}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING NOTIFICATION */}
      {notif.show && (
        <div style={{ ...styles.notifToast, backgroundColor: notif.status === "success" ? "#064e3b" : "#be123c" }}>
          {notif.status === "success" ? "✅" : "❌"} {notif.message}
        </div>
      )}

      <footer style={styles.footerStyle}>© 2026 <b>RS ISLAM FATIMAH</b> — SECURITY MONITORING</footer>
    </div>
  );
}

const styles = {
  cardContainer: { 
    backgroundColor: "#fff", 
    borderRadius: 15, 
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", 
    marginBottom: 30, 
    overflow: "hidden" 
  },
  gridFilter: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, padding: 25 },
  inputGroup: { display: "flex", flexDirection: "column", gap: 8 },
  labelStyle: { fontSize: 11, fontWeight: "800", color: "#64748b" },
  inputStyle: { padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", fontSize: 14, outline: "none" },
  filterActions: { padding: "0 25px 25px", display: "flex", justifyContent: "space-between", gap: 15 },
  btnFilter: { backgroundColor: "#064e3b", color: "#fff", padding: "12px 25px", borderRadius: 8, border: "none", fontWeight: "800", cursor: "pointer" },
  btnReset: { backgroundColor: "#fff", color: "#64748b", padding: "12px 25px", borderRadius: 8, border: "1px solid #e2e8f0", fontWeight: "800", cursor: "pointer" },
  btnExport: { backgroundColor: "#064e3b", color: "#fff", padding: "12px 15px", borderRadius: 8, border: "none", fontWeight: "700", cursor: "pointer", fontSize: 12 },
  
  // Header Tabel: Background Hijau dengan garis atas Emas
  tableHeader: { 
    backgroundColor: "#064e3b", 
    borderTop: "6px solid #b08d00" 
  },
  
  // Th Style: Teks Putih agar kontras
  thStyle: { 
    padding: "18px 20px", 
    color: "#fff", 
    fontSize: 11, 
    fontWeight: "800", 
    textAlign: "left", 
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  
  tdStyle: { padding: "15px 20px", fontSize: 14, color: "#1e293b", borderBottom: "1px solid #f1f5f9" },
  trStyle: { transition: 'background 0.2s' },
  imgThumb: { width: 35, height: 35, borderRadius: 8, objectFit: "cover", cursor: 'pointer' },
  linkMaps: { color: "#b08d00", fontSize: 12, fontWeight: "700", textDecoration: "none" },
  btnHapus: { backgroundColor: "#fff", color: "#be123c", border: "1.5px solid #ffe4e6", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: "800", cursor: "pointer" },

  mobileCard: { padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '10px' },
  mobileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' },
  mobileLabel: { fontSize: '10px', fontWeight: '800', color: '#94a3b8' },
  mobileActions: { display: 'flex', gap: '10px', marginTop: '10px' },
  btnActionSmall: { flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '11px', fontWeight: '800' },
  btnActionDelete: { flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ffe4e6', background: '#fef2f2', color: '#be123c', fontSize: '11px', fontWeight: '800' },

  paginationArea: { padding: "20px 25px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  btnNav: { border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", borderRadius: 6, padding: "5px 10px", cursor: "pointer" },
  btnPage: { border: "1px solid #e2e8f0", background: "transparent", minWidth: 30, height: 30, borderRadius: 6, cursor: "pointer", fontSize: 12 },
  btnPageActive: { border: "none", background: "#064e3b", color: "#fff", minWidth: 30, height: 30, borderRadius: 6, cursor: "pointer", fontSize: 12 },
  footerStyle: { textAlign: "center", marginTop: 60, paddingBottom: 40, borderTop: "1px solid #e2e8f0", paddingTop: 30, color: "#94a3b8", fontSize: 11, letterSpacing: 1 },

  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 },
  modalContent: { backgroundColor: "#fff", width: "90%", maxWidth: "400px", padding: "30px", borderRadius: "24px", textAlign: "center", boxShadow: "0 20px 25px rgba(0,0,0,0.1)" },
  modalIconBox: { width: "60px", height: "60px", backgroundColor: "#fef2f2", color: "#be123c", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 15px", fontSize: "24px" },
  modalTitle: { fontSize: "20px", fontWeight: "800", color: "#1e293b" },
  modalBody: { fontSize: "14px", color: "#64748b", margin: "10px 0 25px", lineHeight: '1.5' },
  modalFooter: { display: "flex", gap: "10px" },
  btnCancel: { flex: 1, padding: "12px", borderRadius: "12px", border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#64748b", fontWeight: "700", cursor: 'pointer' },
  btnConfirmRed: { flex: 1, padding: "12px", borderRadius: "12px", border: "none", backgroundColor: "#be123c", color: "#fff", fontWeight: "700", cursor: 'pointer' },
  notifToast: { position: "fixed", top: "20px", right: "20px", color: "#fff", padding: "15px 25px", borderRadius: "12px", fontWeight: "700", boxShadow: "0 10px 15px rgba(0,0,0,0.2)", zIndex: 3000 }
};