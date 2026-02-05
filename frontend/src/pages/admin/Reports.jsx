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
  const [msg, setMsg] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- STATE PAGINATION ---
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
      setMsg("Gagal ambil laporan");
    } finally {
      setLoading(false);
    }
  };

  const resetFilter = () => {
    setDateFrom(""); setDateTo(""); setSatpam(""); setPos("");
    fetchData();
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

  const handleDelete = async (row) => {
    if (!window.confirm("Hapus histori ini?")) return;
    try {
      await api.delete(`/admin/reports/${row.id}`);
      fetchData();
    } catch (e) { alert("Gagal menghapus"); }
  };

  useEffect(() => { fetchData(); }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = rows.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(rows.length / itemsPerPage);

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
          <AdminNavbar />
      
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        {/* HEADER */}
        <div style={{ marginBottom: 30, borderLeft: "8px solid #b08d00", paddingLeft: 20 }}>
          <h1 style={{ fontSize: 32, fontWeight: "800", color: "#1e293b", margin: 0 }}>Jadwal / Laporan Patroli</h1>
          <p style={{ color: "#64748b", margin: "5px 0 0 0", fontSize: 14 }}>Sistem Pemantauan Keamanan RS Islam Fatimah</p>
        </div>

        {/* FILTER CARD */}
        <div style={filterCard}>
          <div style={gridFilter}>
            <div style={inputGroup}>
              <label style={labelStyle}>DARI TANGGAL</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>SAMPAI TANGGAL</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>NAMA SATPAM</label>
              <input value={satpam} onChange={(e) => setSatpam(e.target.value)} placeholder="Cari nama..." style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>LOKASI POS</label>
              <input value={pos} onChange={(e) => setPos(e.target.value)} placeholder="Cari pos..." style={inputStyle} />
            </div>
          </div>
          
          <div style={{ marginTop: 25, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={fetchData} style={btnFilter}>FILTER</button>
              <button onClick={resetFilter} style={btnReset}>RESET</button>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => exportPDF(true)} style={btnExportPage}>📄 CETAK PDF (HALAMAN INI)</button>
              <button onClick={() => exportPDF(false)} style={btnExportAll}>📄 CETAK PDF (SEMUA)</button>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div style={tableContainer}>
          <table width="100%" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={tableHeader}>
                <th style={thStyle}>WAKTU</th>
                <th style={thStyle}>SATPAM</th>
                <th style={thStyle}>POS</th>
                <th style={thStyle}>CATATAN</th>
                <th style={thStyle}>GPS</th>
                <th style={thStyle}>FOTO</th>
                <th style={thStyle}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((r) => (
                <tr key={r.id} style={trStyle}>
                  <td style={tdStyle}>{formatDateTime(r.captured_at_server || r.created_at)}</td>
                  <td style={{ ...tdStyle, fontWeight: "700" }}>{r.satpam_name || r.username}</td>
                  <td style={tdStyle}>{r.post_name || "-"}</td>
                  <td style={{ ...tdStyle, fontStyle: "italic", color: "#64748b" }}>"{r.note || "-"}"</td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{r.lat ? `${r.lat}, ${r.lng}` : "-"}</div>
                    {r.lat && <a href={`http://googleusercontent.com/maps.google.com/5{r.lat},${r.lng}`} target="_blank" style={linkMaps}>📍 Lihat Maps</a>}
                  </td>
                  <td style={tdStyle}>
                    {r.photo_path ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <img src={fotoUrl(r.photo_path)} style={imgThumb} alt="foto" />
                        <a href={fotoUrl(r.photo_path)} target="_blank" style={linkAction}>Lihat Foto</a>
                      </div>
                    ) : "-"}
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => handleDelete(r)} style={btnHapus}>HAPUS</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div style={paginationArea}>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              Menampilkan <b>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, rows.length)}</b> dari <b>{rows.length}</b> laporan patroli
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={btnNav}>PREV</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i+1} onClick={() => setCurrentPage(i+1)} style={currentPage === i+1 ? btnPageActive : btnPage}>
                  {i+1}
                </button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={btnNav}>NEXT</button>
            </div>
          </div>
        </div>

        {/* INFO BOX */}
        <div style={infoBox}>
          <div style={infoIcon}>?</div>
          <div>
            <div style={{ fontWeight: "800", fontSize: 12, marginBottom: 5 }}>CATATAN TEKNIS:</div>
            <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
              Jika koordinat GPS menampilkan "-", mohon pastikan perangkat mobile petugas telah mengaktifkan layanan lokasi (GPS) dan memberikan izin akses lokasi untuk aplikasi.
            </div>
          </div>
        </div>

        <footer style={footerStyle}>
          © 2026 <b>RS ISLAM FATIMAH</b> — UNIT KEAMANAN & KETERTIBAN
        </footer>
      </div>
    </div>
  );
}

// --- STYLES ---
const filterCard = { backgroundColor: "#fff", borderRadius: 15, padding: "25px 30px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", borderTop: "5px solid #b08d00", marginBottom: 30 };
const gridFilter = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 };
const inputGroup = { display: "flex", flexDirection: "column", gap: 8 };
const labelStyle = { fontSize: 11, fontWeight: "800", color: "#64748b" };
const inputStyle = { padding: "12px 15px", borderRadius: 10, border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", fontSize: 14, outline: "none" };

const btnFilter = { backgroundColor: "#064e3b", color: "#fff", padding: "12px 30px", borderRadius: 8, border: "none", fontWeight: "800", cursor: "pointer" };
const btnReset = { backgroundColor: "#fff", color: "#64748b", padding: "12px 25px", borderRadius: 8, border: "1px solid #e2e8f0", fontWeight: "800", cursor: "pointer" };
const btnExportPage = { backgroundColor: "#064e3b", color: "#fff", padding: "12px 20px", borderRadius: 8, border: "none", fontWeight: "700", cursor: "pointer", fontSize: 13 };
const btnExportAll = { backgroundColor: "#064e3b", color: "#fff", padding: "12px 20px", borderRadius: 8, border: "none", fontWeight: "700", cursor: "pointer", fontSize: 13 };

const tableContainer = { backgroundColor: "#fff", borderRadius: 15, overflow: "hidden", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", border: "1px solid #f1f5f9" };
const tableHeader = { backgroundColor: "#064e3b" };
const thStyle = { padding: "18px 20px", color: "#fff", fontSize: 11, fontWeight: "700", textAlign: "left", textTransform: "uppercase" };
const trStyle = { borderBottom: "1px solid #f1f5f9" };
const tdStyle = { padding: "18px 20px", fontSize: 14, color: "#1e293b" };

const imgThumb = { width: 35, height: 35, borderRadius: 8, objectFit: "cover", border: "1px solid #e2e8f0" };
const linkAction = { color: "#b08d00", fontSize: 12, fontWeight: "700", textDecoration: "none" };
const linkMaps = { ...linkAction, display: "block", marginTop: 4 };
const btnHapus = { backgroundColor: "#fff", color: "#be123c", border: "1.5px solid #ffe4e6", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: "800", cursor: "pointer" };

const paginationArea = { padding: "20px 25px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9" };
const btnNav = { padding: "8px 15px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", borderRadius: 6, fontWeight: "700", fontSize: 11, cursor: "pointer" };
const btnPage = { ...btnNav, minWidth: 35 };
const btnPageActive = { ...btnPage, backgroundColor: "#064e3b", color: "#fff", borderColor: "#064e3b" };

const infoBox = { marginTop: 30, backgroundColor: "#f0fdfa", border: "1.5px solid #ccfbf1", borderRadius: 12, padding: 20, display: "flex", gap: 15, alignItems: "flex-start" };
const infoIcon = { backgroundColor: "#b08d00", color: "#fff", width: 22, height: 22, borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "900", fontSize: 12, flexShrink: 0 };
const footerStyle = { textAlign: "center", marginTop: 60, paddingBottom: 40, borderTop: "1.5px solid #e2e8f0", paddingTop: 30, color: "#94a3b8", fontSize: 12, letterSpacing: 1 };