import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function SatpamHome() {
  const nav = useNavigate();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pos, setPos] = useState(""); // ✅ filter pos

  const [msg, setMsg] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

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
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
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
      if (pos.trim()) params.pos = pos.trim(); // ✅ kirim filter pos

      // ✅ endpoint satpam histori
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
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: 16 }}>
      <h2>Dashboard Satpam</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button onClick={() => nav("/scan")} style={btn}>
          Scan QR
        </button>

        <button onClick={fetchLogs} style={btn} disabled={loading}>
          {loading ? "Loading..." : "Refresh Histori"}
        </button>
      </div>

      <div style={card}>
        <b>Filter Histori</b>

        <div style={{ display: "flex", gap: 12, alignItems: "end", marginTop: 10, flexWrap: "wrap" }}>
          <div>
            <div>Dari</div>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>

          <div>
            <div>Sampai</div>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>

          <div>
            <div>Pos</div>
            <input
              value={pos}
              onChange={(e) => setPos(e.target.value)}
              placeholder="contoh: lobby"
            />
          </div>

          <button onClick={fetchLogs} style={btn} disabled={loading}>
            Terapkan
          </button>

          <button onClick={resetFilter} style={{ ...btn, background: "#fff" }} disabled={loading}>
            Reset
          </button>

          {msg && <div style={{ marginLeft: 10, color: "crimson" }}>{msg}</div>}
        </div>
      </div>

      <div style={{ ...card, marginTop: 16 }}>
        <b>Histori Patroli Saya</b>

        <table
          width="100%"
          border="1"
          cellPadding="10"
          style={{ borderCollapse: "collapse", marginTop: 12 }}
        >
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Pos</th>
              <th>Catatan</th>
              <th>GPS</th>
              <th>Foto</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="5" align="center">
                  {loading ? "Memuat..." : "Belum ada histori"}
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const gpsOk = hasGPS(r);
                const acc =
                  r.accuracy !== null && r.accuracy !== undefined && r.accuracy !== ""
                    ? Number(r.accuracy)
                    : null;

                return (
                  <tr key={r.id}>
                    <td>{formatWaktu(r.captured_at_server || r.created_at)}</td>
                    <td>{r.post_name || (r.post_id ? `#${r.post_id}` : "-")}</td>
                    <td>{r.note || "-"}</td>

                    <td>
                      {gpsOk ? (
                        <>
                          {Number(r.lat).toFixed(6)}, {Number(r.lng).toFixed(6)}
                          <br />
                          <a
                            href={`https://www.google.com/maps?q=${r.lat},${r.lng}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Lihat Maps
                          </a>
                          {acc !== null && Number.isFinite(acc) ? (
                            <div style={{ fontSize: 12, color: "#666" }}>±{Math.round(acc)}m</div>
                          ) : null}
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
                            alt="foto"
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 8,
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
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
          Tips: kalau GPS tidak muncul, cek response API <code>/satpam/patrol/logs</code> apakah field{" "}
          <code>lat</code> &amp; <code>lng</code> ikut terkirim.
        </div>
      </div>
    </div>
  );
}

const card = {
  padding: 12,
  border: "1px solid #ddd",
  borderRadius: 10,
  background: "#fff",
};

const btn = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #ccc",
  background: "#f6f6f6",
  cursor: "pointer",
};
