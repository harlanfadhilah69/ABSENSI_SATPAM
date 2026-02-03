import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import AdminNavbar from "../../components/admin/AdminNavbar";

export default function Reports() {
  // --- STATE FILTER ---
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [satpam, setSatpam] = useState("");
  const [pos, setPos] = useState("");

  const [msg, setMsg] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- STATE PAGINATION (BARU) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Tampilkan 4 baris per halaman

  const baseApi = useMemo(() => {
    const raw = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
  }, []);

  const fotoUrl = (photoPath) => {
    if (!photoPath) return "";
    const clean = String(photoPath).startsWith("/") ? String(photoPath).slice(1) : String(photoPath);
    return `${baseApi}/${clean}`;
  };

  const hasGPS = (r) => {
    const latOk = r.lat !== null && r.lat !== undefined && r.lat !== "";
    const lngOk = r.lng !== null && r.lng !== undefined && r.lng !== "";
    return latOk && lngOk;
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleString("id-ID", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  const fetchData = async () => {
    setMsg("");
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (satpam.trim()) params.satpam = satpam.trim();
      if (pos.trim()) params.pos = pos.trim();

      const res = await api.get("/admin/reports", { params });
      setRows(res.data?.data || []);
      setCurrentPage(1); // Reset ke halaman 1 setiap kali ambil data baru
    } catch (e) {
      setMsg(e?.response?.data?.message || "Gagal ambil laporan");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFilter = () => {
    setDateFrom("");
    setDateTo("");
    setSatpam("");
    setPos("");
    setMsg("");
    setTimeout(fetchData, 0);
  };

  const handleDelete = async (row) => {
    setMsg("");
    const ok = window.confirm(
      `Hapus histori patroli ini?\n\nSatpam: ${row.satpam_name || row.username}\nPos: ${row.post_name}\nWaktu: ${formatDateTime(row.captured_at_server)}`
    );
    if (!ok) return;

    try {
      await api.delete(`/admin/reports/${row.id}`);
      setMsg("✅ Histori patroli berhasil dihapus");
      fetchData();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Gagal menghapus histori");
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- LOGIKA PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = rows.slice(indexOfFirstItem, indexOfLastItem); // Potong data
  const totalPages = Math.ceil(rows.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <AdminNavbar />

      <div style={{ maxWidth: 1200, margin: "24px auto", padding: 16, fontFamily: 'sans-serif' }}>
        <h2 style={{ margin: 0 }}>Jadwal / Laporan Patroli</h2>

        {/* --- FILTER SECTION --- */}
        <div style={{ display: "flex", gap: 12, alignItems: "end", marginTop: 14, marginBottom: 16, flexWrap: "wrap" }}>
          <div>
            <div>Dari</div>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <div>Sampai</div>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div>
            <div>Nama Satpam</div>
            <input value={satpam} onChange={(e) => setSatpam(e.target.value)} placeholder="contoh: budi" />
          </div>
          <div>
            <div>Pos</div>
            <input value={pos} onChange={(e) => setPos(e.target.value)} placeholder="contoh: lobby" />
          </div>
          <button onClick={fetchData} style={btn} disabled={loading}>{loading ? "Loading..." : "Filter"}</button>
          <button onClick={resetFilter} style={{ ...btn, background: "#fff" }} disabled={loading}>Reset</button>
          {msg && <div style={{ marginLeft: 10, color: msg.startsWith("✅") ? "#0a0" : "crimson" }}>{msg}</div>}
        </div>

        {/* --- TABEL --- */}
        <div style={{ overflowX: "auto" }}>
          <table width="100%" border="1" cellPadding="10" style={{ borderCollapse: "collapse", minWidth: 1000 }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th>Waktu</th>
                <th>Satpam</th>
                <th>Pos</th>
                <th>Catatan</th>
                <th>GPS</th>
                <th>Foto</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan="7" align="center">{loading ? "Memuat..." : "Tidak ada data"}</td>
                </tr>
              ) : (
                currentRows.map((r) => {
                  const gpsOk = hasGPS(r);
                  const lat = gpsOk ? Number(r.lat) : null;
                  const lng = gpsOk ? Number(r.lng) : null;
                  const acc = r.accuracy ? Number(r.accuracy) : null;

                  return (
                    <tr key={r.id}>
                      <td>{formatDateTime(r.captured_at_server || r.created_at)}</td>
                      <td>{r.satpam_name || r.username || (r.user_id ? `#${r.user_id}` : "-")}</td>
                      <td>{r.post_name || (r.post_id ? `#${r.post_id}` : "-")}</td>
                      <td style={{ maxWidth: 280 }}>{r.note || "-"}</td>
                      <td>
                        {gpsOk ? (
                          <>
                            <div style={{ fontSize: 13 }}>
                              {Number.isFinite(lat) ? lat.toFixed(6) : String(r.lat)},{" "}
                              {Number.isFinite(lng) ? lng.toFixed(6) : String(r.lng)}
                            </div>
                            <a href={`https://www.google.com/maps?q=${r.lat},${r.lng}`} target="_blank" rel="noreferrer" style={{color: 'blue'}}>
                              Lihat Maps
                            </a>
                             {acc && <div style={{ fontSize: 12, color: "#666" }}>Akurasi: ±{Math.round(acc)}m</div>}
                          </>
                        ) : "-"}
                      </td>
                      <td>
                        {r.photo_path ? (
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <img src={fotoUrl(r.photo_path)} alt="foto" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }} />
                            <a href={fotoUrl(r.photo_path)} target="_blank" rel="noreferrer" style={{color: 'blue'}}>Lihat Foto</a>
                          </div>
                        ) : "-"}
                      </td>
                      <td>
                        <button onClick={() => handleDelete(r)} style={{ ...btn, background: "#fff", color: "red", borderColor: "#ffcccc" }} disabled={loading}>
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* --- BAGIAN KONTROL PAGINATION (BARU) --- */}
        {rows.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
            
            {/* Info Kiri */}
            <div style={{ color: "#666", fontSize: "14px" }}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, rows.length)} of {rows.length} reports
            </div>

            {/* Tombol Kanan */}
            <div style={{ display: "flex", gap: "5px" }}>
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                style={btnPageStyle(false)}
              >
                Prev
              </button>

              {/* Loop Angka Halaman */}
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  style={btnPageStyle(currentPage === i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
                style={btnPageStyle(false)}
              >
                Next
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 20, fontSize: 12, color: "#999" }}>
          Tips: Jika GPS "-" pastikan HP satpam mengizinkan lokasi.
        </div>
      </div>
    </div>
  );
}

const btn = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "#f6f6f6",
  cursor: "pointer",
};

// Style tombol pagination
const btnPageStyle = (isActive) => ({
  padding: "6px 12px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  backgroundColor: isActive ? "#0e7490" : "#fff", // Biru Tosca jika aktif
  color: isActive ? "#fff" : "#333",
  cursor: "pointer",
  fontWeight: isActive ? "bold" : "normal",
  opacity: isActive ? 1 : 0.8
});