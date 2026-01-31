import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function History() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        // kalau backend belum ada endpoint history satpam, nanti kita buat.
        const res = await api.get("/satpam/history");
        setRows(res.data?.data || []);
      } catch (e) {
        setMsg(e?.response?.data?.message || "Endpoint riwayat belum ada di backend");
      }
    };
    run();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h2>Riwayat Patroli Saya</h2>
      {msg && <div style={{ color: "crimson", marginBottom: 10 }}>{msg}</div>}

      <table width="100%" border="1" cellPadding="10" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Waktu</th>
            <th>Pos</th>
            <th>Catatan</th>
            <th>Foto</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="4" align="center">Tidak ada data</td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id}>
                <td>{r.captured_at_server || "-"}</td>
                <td>{r.post_name || r.post_id || "-"}</td>
                <td>{r.note || "-"}</td>
                <td>{r.photo_path ? "Ada" : "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
