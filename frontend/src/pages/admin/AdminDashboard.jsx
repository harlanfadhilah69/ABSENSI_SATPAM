import { useEffect, useState } from "react";
import api from "../../api/axios";
import { QRCodeCanvas } from "qrcode.react";
import { Link, useNavigate } from "react-router-dom";

import AdminNavbar from "../../components/admin/AdminNavbar";

export default function AdminDashboard() {
  const nav = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [msg, setMsg] = useState("");

  // QR state
  const [qrUrl, setQrUrl] = useState("");
  const [qrMeta, setQrMeta] = useState(null); // {post, token, url}
  const [qrStatus, setQrStatus] = useState("");

  const logoSrc = "/logo.png";

  // --- GANTI IP INI SESUAI IP LAPTOP KAMU ---
  const MY_LAPTOP_IP = "http://192.168.0.113:5173"; 
  // ------------------------------------------

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await api.get("/admin/posts");
      setPosts(res.data?.data || []);
    } catch (e) {
      console.error(e);
      setMsg(e?.response?.data?.message || "Gagal memuat data pos");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateQR(postId) {
    setQrStatus("");
    try {
      // 1. Minta data token dari backend
      const res = await api.get(`/admin/posts/${postId}/qr`);
      const data = res.data;

      setQrMeta(data);

      // 2. MODIFIKASI URL DI SINI
      // Backend mungkin mengirim url seperti: "http://localhost:5173/scan?..."
      // Kita harus paksa ubah bagian depannya menjadi IP Laptop.
      
      if (data?.url) {
        // Ambil path dan query stringnya saja (misal: /scan?post_id=1&token=xyz)
        const urlObj = new URL(data.url); 
        const pathAndQuery = urlObj.pathname + urlObj.search;
        
        // Gabungkan dengan IP Laptop
        const finalUrl = `${MY_LAPTOP_IP}${pathAndQuery}`;
        
        setQrUrl(finalUrl);

        
      }

    } catch (e) {
      console.error(e); // Cek error di console
      setQrStatus(e?.response?.data?.message || "Gagal generate QR");
    }
  }

  async function handleDeletePost(post) {
    setMsg("");
    setQrStatus("");

    const ok = window.confirm(
      `Hapus pos "${post.post_name}" (ID: ${post.id})?\n\nAksi ini tidak bisa dibatalkan.`
    );
    if (!ok) return;

    try {
      await api.delete(`/admin/posts/${post.id}`);

      if (qrMeta?.post?.id === post.id) {
        setQrUrl("");
        setQrMeta(null);
        setQrStatus("");
      }

      setMsg("✅ Pos berhasil dihapus");
      fetchPosts();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Gagal menghapus pos");
    }
  }

  function downloadQR() {
    const canvas = document.getElementById("qr-canvas");
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = `qr-pos-${qrMeta?.post?.id || "unknown"}.png`;
    a.click();
  }

  const selectedPostLabel = qrMeta?.post
    ? `${qrMeta.post.post_name || "Pos"} (ID: ${qrMeta.post.id})`
    : "";

  return (
    <div>
      <AdminNavbar />

      <div style={{ maxWidth: 980, margin: "24px auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <h1 style={{ marginBottom: 8 }}>Admin Dashboard ✅</h1>
            <p style={{ color: "#333", marginTop: 0 }}>
              Kelola pos, generate QR, edit, hapus, dan akses laporan patroli.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Link
              to="/admin/reports"
              style={{ ...btn, textDecoration: "none", display: "inline-block" }}
            >
              📄 Lihat Laporan Patroli
            </Link>

            <button onClick={() => nav("/admin/posts/new")} style={btn}>
              ➕ Tambah Pos
            </button>
          </div>
        </div>

        {msg && (
          <div style={{ marginTop: 12, color: msg.startsWith("✅") ? "#0a0" : "crimson", fontWeight: 700 }}>
            {msg}
          </div>
        )}

        {qrStatus && (
          <div style={{ marginTop: 16 }}>
            <div style={{ color: "#0a0", fontWeight: 700 }}>{qrStatus}</div>
            {qrUrl && (
              <div
                style={{
                  marginTop: 8,
                  background: "#111",
                  color: "#0f0",
                  padding: 12,
                  borderRadius: 8,
                  overflowX: "auto",
                  fontFamily: "monospace",
                }}
              >
                {qrUrl}
              </div>
            )}
          </div>
        )}

        {qrUrl && (
          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "360px 1fr",
              gap: 16,
              alignItems: "start",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "inline-block", background: "#fff", padding: 16, borderRadius: 12 }}>
                <QRCodeCanvas
                  id="qr-canvas"
                  value={qrUrl}
                  size={280}
                  includeMargin
                  level="H"
                  imageSettings={{
                    src: logoSrc,
                    height: 60,
                    width: 60,
                    excavate: true,
                  }}
                />
              </div>

              <div style={{ marginTop: 12 }}>
                <button onClick={() => navigator.clipboard.writeText(qrUrl)} style={btn}>
                  Copy Link
                </button>
                <button onClick={downloadQR} style={{ ...btn, marginLeft: 8 }}>
                  Download PNG
                </button>
                <button
                  onClick={() => {
                    setQrUrl("");
                    setQrMeta(null);
                    setQrStatus("");
                  }}
                  style={{ ...btn, marginLeft: 8 }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div>
              <div style={card}>
                <h3 style={{ marginTop: 0 }}>Detail QR</h3>
                <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                  <div><b>Pos:</b> {selectedPostLabel}</div>
                  <div><b>Token:</b> <code>{qrMeta?.token}</code></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 18, ...card }}>
          <h2 style={{ marginTop: 0 }}>Daftar Pos</h2>

          {loading ? (
            <div>Loading...</div>
          ) : posts.length === 0 ? (
            <div>Belum ada pos.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {posts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 10,
                    padding: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{p.post_name}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      ID: {p.id} {p.location_desc ? `• ${p.location_desc}` : ""}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleGenerateQR(p.id)} style={btn}>
                      Generate QR
                    </button>

                    <button onClick={() => nav(`/admin/posts/${p.id}/edit`)} style={{ ...btn, background: "#fff" }}>
                      Edit
                    </button>

                    <button onClick={() => handleDeletePost(p)} style={{ ...btn, background: "#fff" }}>
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <button onClick={fetchPosts} style={btn}>🔄 Refresh</button>
        </div>
      </div>
    </div>
  );
}

/* ===== styles ===== */
const card = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 16,
  background: "#fff",
};

const btn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ccc",
  background: "#f6f6f6",
  cursor: "pointer",
  color: "#111",
};