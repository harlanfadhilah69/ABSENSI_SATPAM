import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";

export default function Scan() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  const postId = params.get("post_id");
  const tokenQR = params.get("token");

  const [status, setStatus] = useState("Memeriksa QR...");
  const [data, setData] = useState(null);

  useEffect(() => {
    const run = async () => {
      // Kalau user buka /scan tanpa parameter, tampilkan info saja
      if (!postId || !tokenQR) {
        setStatus("Silakan scan QR (link harus ada post_id dan token).");
        return;
      }

      try {
        // karena backend /patrol/scan pakai auth+role satpam, token login harus ada (via axios interceptor)
        const res = await api.get(`/patrol/scan?post_id=${postId}&token=${tokenQR}`);
        setData(res.data);
        setStatus("QR valid ✅ Mengarahkan ke presensi...");

        // auto redirect ke form presensi
        setTimeout(() => {
          nav(`/satpam/patrol?post_id=${postId}&token=${tokenQR}`, { replace: true });
        }, 600);
      } catch (e) {
        setStatus(e?.response?.data?.message || "QR tidak valid / tidak punya akses");
      }
    };

    run();
  }, [postId, tokenQR, nav]);

  return (
    <div style={{ maxWidth: 520, margin: "24px auto", padding: 16 }}>
      <h2>Scan QR</h2>
      <p>{status}</p>

      {!postId || !tokenQR ? (
        <div style={{ marginTop: 14, padding: 12, border: "1px solid #ddd" }}>
          <b>Petunjuk</b>
          <ol style={{ marginTop: 8 }}>
            <li>Login sebagai Satpam</li>
            <li>Scan QR pos menggunakan kamera HP</li>
            <li>Link akan berbentuk: <code>/scan?post_id=...&token=...</code></li>
          </ol>
        </div>
      ) : null}

      {data ? (
        <pre style={{ background: "#111", color: "#0f0", padding: 12, overflow: "auto" }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
