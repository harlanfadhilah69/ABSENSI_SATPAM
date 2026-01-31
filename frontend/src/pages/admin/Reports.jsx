import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import AdminNavbar from "../../components/admin/AdminNavbar";

export default function Reports() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [satpam, setSatpam] = useState("");
  const [pos, setPos] = useState("");

  const [msg, setMsg] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

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
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
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

  // ✅ hapus 1 histori
  const handleDelete = async (row) => {
    setMsg("");

    const ok = window.confirm(
      `Hapus histori patroli ini?\n\nSatpam: ${row.satpam_name || row.username || row.user_id}\nPos: ${
        row.post_name || row.post_id
      }\nWaktu: ${formatDateTime(row.captured_at_server || row.created_at)}`
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

  return (
    <div>
      <AdminNavbar />

      <div style={{ maxWidth: 1200, margin: "24px auto", padding: 16 }}>
        <h2 style={{ margin: 0 }}>Jadwal / Laporan Patroli</h2>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "end",
            marginTop: 14,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
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

          <button onClick={fetchData} style={btn} disabled={loading}>
            {loading ? "Loading..." : "Filter"}
          </button>

          <button onClick={resetFilter} style={{ ...btn, background: "#fff" }} disabled={loading}>
            Reset
          </button>

          {msg && <div style={{ marginLeft: 10, color: msg.startsWith("✅") ? "#0a0" : "crimson" }}>{msg}</div>}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table width="100%" border="1" cellPadding="10" style={{ borderCollapse: "collapse", minWidth: 1000 }}>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Satpam</th>
                <th>Pos</th>
                <th>Catatan</th>
                <th>GPS</th>
                <th>Foto</th>
                <th>Aksi</th> {/* ✅ */}
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="7" align="center">
                    {loading ? "Memuat..." : "Tidak ada data"}
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const gpsOk = hasGPS(r);
                  const lat = gpsOk ? Number(r.lat) : null;
                  const lng = gpsOk ? Number(r.lng) : null;
                  const acc =
                    r.accuracy !== null && r.accuracy !== undefined && r.accuracy !== ""
                      ? Number(r.accuracy)
                      : null;

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

                            {acc !== null && Number.isFinite(acc) && (
                              <div style={{ fontSize: 12, color: "#666" }}>Akurasi: ±{Math.round(acc)}m</div>
                            )}

                            <a href={`https://www.google.com/maps?q=${r.lat},${r.lng}`} target="_blank" rel="noreferrer">
                              Lihat Maps
                            </a>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td>
                        {r.photo_path ? (
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <img
                              src={fotoUrl(r.photo_path)}
                              alt="foto patroli"
                              style={{
                                width: 64,
                                height: 64,
                                objectFit: "cover",
                                borderRadius: 6,
                                border: "1px solid #ddd",
                              }}
                            />
                            <a href={fotoUrl(r.photo_path)} target="_blank" rel="noreferrer">
                              Lihat Foto
                            </a>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>

                      {/* ✅ AKSI HAPUS */}
                      <td>
                        <button onClick={() => handleDelete(r)} style={{ ...btn, background: "#fff" }} disabled={loading}>
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

        <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
          Tips: kalau GPS masih “-”, cek response API <code>/admin/reports</code> apakah field <code>lat</code> &amp;{" "}
          <code>lng</code> ikut terkirim.
        </div>
      </div>
    </div>
  );
}

const btn = {
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid #ccc",
  background: "#f6f6f6",
  cursor: "pointer",
};
