import { useEffect, useMemo, useState } from "react";
// Hapus import useNavigate karena navigasi scan/logout sudah pindah ke Navbar
import api from "../../api/axios";
import SatpamNavbar from "../../components/satpam/SatpamNavbar"; // <--- IMPORT NAVBAR BARU

export default function SatpamHome() {
  // const nav = useNavigate(); // Tidak butuh lagi disini

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pos, setPos] = useState(""); 
  const [msg, setMsg] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Fungsi Helper & Fetching tetap sama ---
  const baseApi = useMemo(() => {
    const raw = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
  }, []);

  const fotoUrl = (photoPath) => {
    if (!photoPath) return "";
    const clean = String(photoPath).startsWith("/")
      ? String(photoPath).slice(1)
      : String(photoPath);
    return `${baseApi}/${clean}`;
  };

  const formatWaktu = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleString("id-ID", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  const hasGPS = (r) => {
    const latOk = r.lat !== null && r.lat !== undefined && r.lat !== "";
    const lngOk = r.lng !== null && r.lng !== undefined && r.lng !== "";
    return latOk && lngOk;
  };

  const fetchLogs = async () => {
    setMsg("");
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (pos.trim()) params.pos = pos.trim(); 

      const res = await api.get("/satpam/patrol/logs", { params });
      setRows(res.data?.data || []);
    } catch (e) {
      setRows([]);
      setMsg(e?.response?.data?.message || "Gagal ambil histori patroli");
    } finally {
      setLoading(false);
    }
  };

  const resetFilter = () => {
    setDateFrom("");
    setDateTo("");
    setPos("");
    setMsg("");
    setTimeout(fetchLogs, 0);
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      
      {/* 1. PASANG NAVBAR DI PALING ATAS */}
      <SatpamNavbar />

      {/* 2. KONTEN DASHBOARD */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        
        {/* Tombol Refresh (Sisa tombol lokal) */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
             <button onClick={fetchLogs} style={btn} disabled={loading}>
                {loading ? "Loading..." : "🔄 Refresh Data"}
            </button>
        </div>

        {/* Filter Section */}
        <div style={card}>
            <b style={{display: 'block', marginBottom: 10, fontSize: 16}}>🔍 Filter Histori</b>
            <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
            <div>
                <div style={{ fontSize: 12, marginBottom: 4, color: '#555' }}>Dari Tanggal</div>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} />
            </div>
            <div>
                <div style={{ fontSize: 12, marginBottom: 4, color: '#555' }}>Sampai Tanggal</div>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flexGrow: 1 }}> {/* Agar input Pos melebar */}
                <div style={{ fontSize: 12, marginBottom: 4, color: '#555' }}>Nama Pos</div>
                <input
                value={pos}
                onChange={(e) => setPos(e.target.value)}
                placeholder="Cari pos..."
                style={{...inputStyle, width: '100%', boxSizing: 'border-box'}}
                />
            </div>
            <div style={{display: 'flex', gap: 8}}>
                <button onClick={fetchLogs} style={{...btn, background: '#111827', color: 'white', border: 'none'}}>
                    Cari
                </button>
                <button onClick={resetFilter} style={{ ...btn, background: "#fff", color: "#dc2626" }} disabled={loading}>
                    Reset
                </button>
            </div>
            </div>
            {msg && <div style={{ marginTop: 10, color: "crimson", fontWeight: "bold", fontSize: 14 }}>{msg}</div>}
        </div>

        {/* Table Section */}
        <div style={{ ...card, marginTop: 20 }}>
            <b style={{display: 'block', marginBottom: 10, fontSize: 16}}>📝 Histori Patroli Saya</b>
            
            <div style={{ overflowX: "auto" }}>
                <table width="100%" cellPadding="12" style={{ borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                    <tr style={{ background: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                    <th align="left">Waktu</th>
                    <th align="left">Pos</th>
                    <th align="left">Catatan</th>
                    <th align="left">Lokasi (GPS)</th>
                    <th align="center">Foto</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                    <tr>
                        <td colSpan="5" align="center" style={{ padding: 30, color: "#666" }}>
                        {loading ? "Sedang memuat data..." : "Belum ada riwayat patroli."}
                        </td>
                    </tr>
                    ) : (
                    rows.map((r) => {
                        const gpsOk = hasGPS(r);
                        return (
                        <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                            <td style={{fontSize: 14}}>{formatWaktu(r.captured_at_server || r.created_at)}</td>
                            <td style={{fontWeight: 600, color: '#374151'}}>{r.post_name || `#${r.post_id}`}</td>
                            <td style={{fontSize: 14, color: '#555'}}>{r.note || "-"}</td>
                            <td>
                            {gpsOk ? (
                                <div>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500, fontSize: 13 }}
                                >
                                    🗺️ Buka Peta
                                </a>
                                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                                    Akurasi: ±{r.accuracy ? Math.round(r.accuracy) : "?"}m
                                </div>
                                </div>
                            ) : (
                                <span style={{color: '#9ca3af'}}>-</span>
                            )}
                            </td>
                            <td align="center">
                            {r.photo_path ? (
                                <a href={fotoUrl(r.photo_path)} target="_blank" rel="noreferrer">
                                <img
                                    src={fotoUrl(r.photo_path)}
                                    alt="foto"
                                    style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb" }}
                                />
                                </a>
                            ) : "-"}
                            </td>
                        </tr>
                        );
                    })
                    )}
                </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}

// --- STYLES ---
const card = {
  padding: 20,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
};

const btn = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "#ffffff",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "13px",
  transition: "all 0.2s"
};

const inputStyle = {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none"
};