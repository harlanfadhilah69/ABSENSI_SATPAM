import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import AdminNavbar from "../../components/admin/AdminNavbar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Search, RotateCcw, FileText, Download, MapPin, Camera, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
// ✅ Import SweetAlert2
import Swal from 'sweetalert2';

export default function Reports() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [satpam, setSatpam] = useState("");
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
  const itemsPerPage = 6;

  const baseApi = useMemo(() => {
    const raw = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
  }, []);

  const fotoUrl = (photoPath) => {
    if (!photoPath) return "";
    const clean = String(photoPath).startsWith("/") ? String(photoPath).slice(1) : String(photoPath);
    return `${baseApi}/${clean}`;
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
      Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal mengambil laporan patroli.', confirmButtonColor: '#be123c' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setDateFrom("");
    setDateTo("");
    setSatpam("");
    setPos("");
    fetchData();
  };

  const exportToExcel = () => {
    if (rows.length === 0) return Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Tidak ada data untuk di-export.', confirmButtonColor: '#b08d00' });
    try {
      const excelData = rows.map((r, i) => ({
        "No": i + 1,
        "Waktu Patroli": formatDateTime(r.captured_at_server || r.created_at),
        "Nama Satpam": r.satpam_name || r.username || "-",
        "Titik Pos": r.post_name || "-",
        "Catatan Laporan": r.note || "Aman",
        "Koordinat GPS": r.lat ? `${r.lat}, ${r.lng}` : "Tidak Ada GPS",
        "Akurasi (m)": Math.round(r.accuracy || 0)
      }));
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan_Patroli");
      XLSX.writeFile(workbook, `Laporan_RSIFC_${new Date().toISOString().split('T')[0]}.xlsx`);
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Excel berhasil diunduh.', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Ekspor Excel bermasalah.', confirmButtonColor: '#be123c' });
    }
  };

  const exportPDF = () => {
    const doc = jsPDF("l", "mm", "a4");
    doc.text(`LAPORAN PATROLI RSI FATIMAH CILACAP - HALAMAN ${currentPage}`, 14, 15);
    autoTable(doc, {
      head: [["No", "Waktu", "Satpam", "Pos", "Catatan", "GPS"]],
      body: currentRows.map((r, i) => [
        (indexOfFirstItem + i + 1),
        formatDateTime(r.captured_at_server || r.created_at),
        r.satpam_name || r.username, r.post_name || "-", r.note || "-", r.lat ? `${r.lat}, ${r.lng}` : "-"
      ]),
      startY: 25,
      headStyles: { fillColor: [6, 78, 59] }
    });
    doc.save(`Laporan_Patroli_Page_${currentPage}.pdf`);
  };

  const triggerDelete = (row) => {
    Swal.fire({
      title: 'Hapus Histori?',
      text: `Yakin ingin menghapus patroli di "${row.post_name}" oleh ${row.satpam_name || row.username}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#be123c',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      borderRadius: '20px'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin/reports/${row.id}`);
          Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Laporan berhasil dihilangkan.', timer: 1500, showConfirmButton: false });
          fetchData();
        } catch (e) {
          Swal.fire({ icon: 'error', title: 'Gagal', text: 'Data gagal dihapus dari server.', confirmButtonColor: '#be123c' });
        }
      }
    });
  };

  useEffect(() => { fetchData(); }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = rows.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(rows.length / itemsPerPage);

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <AdminNavbar />
      
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 15px" : "40px 20px" }}>
        
        {/* HEADER SECTION */}
        <div style={{ marginBottom: 35, display: "flex", gap: "15px", alignItems: "center" }}>
          <div style={styles.barGold}></div>
          <div>
            <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: "900", color: "#1e293b", margin: 0 }}>
            Laporan Patroli <span style={{ color: "#064e3b" }}>📋</span>
            </h1>
            <p style={{ color: "#64748b", fontSize: 13, fontWeight: '500' }}>Pusat Arsip Keamanan RS Islam Fatimah</p>
          </div>
        </div>

        {/* FILTER BOX */}
        <div style={styles.cardContainer}>
          <div style={styles.gridFilter}>
            <div style={styles.inputGroup}><label style={styles.labelStyle}>DARI TANGGAL</label><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={styles.inputStyle} /></div>
            <div style={styles.inputGroup}><label style={styles.labelStyle}>SAMPAI TANGGAL</label><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={styles.inputStyle} /></div>
            <div style={styles.inputGroup}><label style={styles.labelStyle}>NAMA SATPAM</label><input value={satpam} onChange={(e) => setSatpam(e.target.value)} placeholder="Cari..." style={styles.inputStyle} /></div>
            <div style={styles.inputGroup}><label style={styles.labelStyle}>LOKASI POS</label><input value={pos} onChange={(e) => setPos(e.target.value)} placeholder="Cari..." style={styles.inputStyle} /></div>
          </div>
          
          <div style={{ ...styles.filterActions, flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ display: "flex", gap: 10, width: isMobile ? '100%' : 'auto' }}>
              <button onClick={fetchData} style={{ ...styles.btnFilter, flex: isMobile ? 1 : 'none' }}><Search size={16}/> FILTER</button>
              <button onClick={handleReset} style={{ ...styles.btnReset, flex: isMobile ? 1 : 'none' }}><RotateCcw size={16}/> RESET</button>
            </div>
            <div style={{ display: "flex", gap: 10, width: isMobile ? '100%' : 'auto' }}>
              <button onClick={exportPDF} style={{ ...styles.btnExport, flex: isMobile ? 1 : 'none' }}><FileText size={16}/> PDF</button>
              <button onClick={exportToExcel} style={{ ...styles.btnExcel, flex: isMobile ? 1 : 'none' }}><Download size={16}/> EXCEL</button>
            </div>
          </div>
        </div>

        {/* DATA TABLE / CARDS */}
        <div style={styles.cardContainer}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}><Loader2 className="animate-spin" size={40} color="#064e3b" style={{margin: '0 auto'}}/></div>
          ) : currentRows.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Belum ada laporan terekam.</div>
          ) : isMobile ? (
            <div style={{ padding: '10px' }}>
              {currentRows.map((r) => (
                <div key={r.id} style={styles.mobileCard}>
                  <div style={styles.mobileRow}><span style={styles.mobileLabel}>SATPAM</span><span style={{ fontWeight: '800', color: '#064e3b' }}>{r.satpam_name || r.username}</span></div>
                  <div style={styles.mobileRow}><span style={styles.mobileLabel}>WAKTU</span><span>{formatDateTime(r.captured_at_server || r.created_at)}</span></div>
                  <div style={styles.mobileRow}><span style={styles.mobileLabel}>POS</span><span style={{ fontWeight: '800' }}>{r.post_name}</span></div>
                  <div style={styles.mobileRow}><span style={styles.mobileLabel}>CATATAN</span><span style={{ fontStyle: 'italic', fontSize: '11px' }}>"{r.note || "Aman"}"</span></div>
                  <div style={styles.mobileActions}>
                    {r.lat && <button onClick={() => window.open(`https://www.google.com/maps?q=${r.lat},${r.lng}`)} style={styles.btnActionSmall}><MapPin size={14}/> Peta</button>}
                    {r.photo_path && <button onClick={() => setSelectedImg(fotoUrl(r.photo_path))} style={styles.btnActionSmall}><Camera size={14}/> Foto</button>}
                    <button onClick={() => triggerDelete(r)} style={styles.btnActionDelete}><Trash2 size={14}/> Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table width="100%" style={{ borderCollapse: "collapse" }}>
                <thead>
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
                    <td style={{ ...styles.tdStyle, fontWeight: "700", color: "#064e3b" }}>{r.satpam_name || r.username}</td>
                    <td style={styles.tdStyle}>{r.post_name || "-"}</td>
                    <td style={{ ...styles.tdStyle, color: "#64748b", fontSize: '12px' }}>"{r.note || "-"}"</td>
                    <td style={styles.tdStyle}>
                      {r.lat && (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <a href={`https://www.google.com/maps?q=${r.lat},${r.lng}`} target="_blank" rel="noreferrer" style={styles.linkMaps}>📍 Lihat Lokasi</a>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>±{Math.round(r.accuracy || 0)}m</span>
                        </div>
                      )}
                    </td>
                    <td style={styles.tdStyle}>
                      {r.photo_path && (
                        <img src={fotoUrl(r.photo_path)} alt="patrol" style={styles.imgThumb} onClick={() => setSelectedImg(fotoUrl(r.photo_path))} />
                      )}
                    </td>
                    <td style={styles.tdStyle}><button onClick={() => triggerDelete(r)} style={styles.btnHapus}><Trash2 size={14}/></button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {rows.length > 0 && (
            <div style={styles.paginationArea}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: '600' }}>Data {indexOfFirstItem + 1} s/d {Math.min(indexOfLastItem, rows.length)} dari {rows.length}</div>
              <div style={{ display: "flex", gap: 5 }}>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={styles.btnNav}><ChevronLeft size={16}/></button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i+1} onClick={() => setCurrentPage(i+1)} style={currentPage === i+1 ? styles.btnPageActive : styles.btnPage}>{i+1}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={styles.btnNav}><ChevronRight size={16}/></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL FOTO RESPONSIVE */}
      {selectedImg && (
        <div style={styles.modalOverlayImg} onClick={() => setSelectedImg(null)}>
          <div style={styles.modalContentImg} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeaderImg}>
              <span style={{fontWeight: '800', fontSize: '14px'}}>📷 Pratinjau Foto Patroli</span>
              <button onClick={() => setSelectedImg(null)} style={styles.btnCloseImg}>✕</button>
            </div>
            <div style={styles.modalBodyImg}>
              <img src={selectedImg} alt="Patrol Full" style={styles.fullImg} />
            </div>
          </div>
        </div>
      )}

      <footer style={styles.footerStyle}>© 2026 <b>RS ISLAM FATIMAH CILACAP</b></footer>
    </div>
  );
}

const styles = {
  barGold: { width: '6px', height: '45px', backgroundColor: '#b08d00', borderRadius: '10px' },
  cardContainer: { backgroundColor: "#fff", borderRadius: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", marginBottom: 30, overflow: "hidden", border: "1px solid #f1f5f9" },
  gridFilter: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, padding: 25 },
  inputGroup: { display: "flex", flexDirection: "column", gap: 8 },
  labelStyle: { fontSize: 10, fontWeight: "900", color: "#94a3b8", letterSpacing: '0.5px' },
  inputStyle: { padding: "12px", borderRadius: "12px", border: "1.5px solid #f1f5f9", backgroundColor: "#f8fafc", fontSize: 14, outline: "none", transition: '0.2s border' },
  filterActions: { padding: "0 25px 25px", display: "flex", justifyContent: "space-between", gap: 15 },
  btnFilter: { display: 'flex', alignItems: 'center', gap: 8, backgroundColor: "#064e3b", color: "#fff", padding: "12px 25px", borderRadius: 12, border: "none", fontWeight: "800", cursor: "pointer", boxShadow: '0 4px 10px rgba(6,78,59,0.2)' },
  btnReset: { display: 'flex', alignItems: 'center', gap: 8, backgroundColor: "#fff", color: "#64748b", padding: "12px 25px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontWeight: "800", cursor: "pointer" },
  btnExport: { display: 'flex', alignItems: 'center', gap: 8, backgroundColor: "#064e3b", color: "#fff", padding: "12px 20px", borderRadius: 12, border: "none", fontWeight: "800", cursor: "pointer", fontSize: 12 },
  btnExcel: { display: 'flex', alignItems: 'center', gap: 8, backgroundColor: "#15803d", color: "#fff", padding: "12px 20px", borderRadius: 12, border: "none", fontWeight: "800", cursor: "pointer", fontSize: 12 },
  tableHeader: { backgroundColor: "#064e3b" },
  thStyle: { padding: "18px 20px", color: "#fff", fontSize: 11, fontWeight: "900", textAlign: "left", textTransform: "uppercase", letterSpacing: "1px" },
  tdStyle: { padding: "18px 20px", fontSize: 14, color: "#1e293b", borderBottom: "1px solid #f8fafc" },
  trStyle: { transition: 'background 0.2s' },
  imgThumb: { width: 45, height: 45, borderRadius: 12, objectFit: "cover", cursor: 'pointer', border: '2px solid #f1f5f9' },
  linkMaps: { color: "#b08d00", fontSize: 12, fontWeight: "800", textDecoration: "none" },
  btnHapus: { backgroundColor: "#fef2f2", color: "#be123c", border: "none", padding: "10px", borderRadius: 10, cursor: "pointer" },
  mobileCard: { padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' },
  mobileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  mobileLabel: { fontSize: '10px', fontWeight: '900', color: '#94a3b8' },
  mobileActions: { display: 'flex', gap: '10px', marginTop: '10px' },
  btnActionSmall: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#fff', fontSize: '12px', fontWeight: '800', cursor: 'pointer' },
  btnActionDelete: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', borderRadius: '12px', border: 'none', background: '#fef2f2', color: '#be123c', fontSize: '12px', fontWeight: '800', cursor: 'pointer' },
  paginationArea: { padding: "20px 25px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: '#f8fafc' },
  btnNav: { border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", borderRadius: 10, padding: "8px", cursor: "pointer", display: 'flex', alignItems: 'center' },
  btnPage: { border: "1.5px solid #e2e8f0", background: "transparent", minWidth: 35, height: 35, borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: '700' },
  btnPageActive: { border: "none", background: "#064e3b", color: "#fff", minWidth: 35, height: 35, borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: '800' },
  footerStyle: { textAlign: "center", marginTop: 60, paddingBottom: 40, color: "#94a3b8", fontSize: 11, letterSpacing: 1.5 },
  modalOverlayImg: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' },
  modalContentImg: { backgroundColor: '#064e3b', borderRadius: '28px', width: '100%', maxWidth: '550px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
  modalHeaderImg: { padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' },
  btnCloseImg: { background: 'rgba(255,255,255,0.1)', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'white', width: '30px', height: '30px', borderRadius: '50%' },
  modalBodyImg: { padding: '15px', backgroundColor: '#f8fafc' },
  fullImg: { width: '100%', height: 'auto', maxHeight: '70vh', borderRadius: '20px', objectFit: 'contain', display: 'block' },
};