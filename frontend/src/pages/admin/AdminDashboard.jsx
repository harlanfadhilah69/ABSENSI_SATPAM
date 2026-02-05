import { useEffect, useState } from "react";
import api from "../../api/axios";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";
// ✅ Import logo untuk di tengah QR
import logoImg from "../../assets/logo_patroli.png"; 

export default function AdminDashboard() {
  const nav = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // QR state
  const [qrUrl, setQrUrl] = useState("");
  const [qrMeta, setQrMeta] = useState(null);
  
  const MY_LAPTOP_IP = "http://192.168.18.75:5173"; 

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await api.get("/admin/posts");
      setPosts(res.data?.data || []);
    } catch (e) {
      setMsg("Gagal memuat data pos");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateQR(postId) {
    try {
      const res = await api.get(`/admin/posts/${postId}/qr`);
      const data = res.data;
      setQrMeta(data);

      if (data?.url) {
        const urlObj = new URL(data.url); 
        const pathAndQuery = urlObj.pathname + urlObj.search;
        setQrUrl(`${MY_LAPTOP_IP}${pathAndQuery}`);
      }
    } catch (e) {
      alert("Gagal generate QR");
    }
  }

  async function handleDeletePost(post) {
    if (!window.confirm(`Hapus pos "${post.post_name}"?`)) return;
    try {
      await api.delete(`/admin/posts/${post.id}`);
      setMsg("✅ Pos berhasil dihapus");
      fetchPosts();
    } catch (e) {
      setMsg("Gagal menghapus pos");
    }
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <AdminNavbar />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        
        {/* --- HEADER SECTION --- */}
        <div style={headerFlex}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={logoCircleSmall}>
              <img src={logoImg} alt="Logo" style={{ width: "70%" }} />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: "800", color: "#1e293b", margin: 0 }}>
                Admin Dashboard <span style={{ color: "#10b981" }}>✔</span>
              </h1>
              <p style={{ color: "#64748b", margin: "5px 0 0 0", fontSize: 14 }}>
                Kelola pos, generate QR, edit, hapus, dan akses laporan patroli secara real-time.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => nav("/admin/reports")} style={btnDark}>
              📄 Lihat Laporan Patroli
            </button>
            <button onClick={() => nav("/admin/posts/new")} style={btnGoldOutline}>
              <span style={{ fontSize: 18 }}>⊕</span> Tambah Pos
            </button>
          </div>
        </div>

        {/* --- TOP SECTION: QR & DETAIL QR (BERDAMPINGAN) --- */}
        {qrUrl && (
          <div style={qrTopGrid}>
            {/* Box QR Code */}
            <div style={qrBoxCard}>
              <div style={qrFrame}>
                <QRCodeCanvas
                  id="qr-canvas"
                  value={qrUrl}
                  size={180}
                  level="H"
                  imageSettings={{ src: logoImg, height: 40, width: 40, excavate: true }}
                />
              </div>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                <button onClick={() => navigator.clipboard.writeText(qrUrl)} style={btnCopy}>📝 Copy Link</button>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => window.print()} style={btnActionSmall}>📥 PNG</button>
                  <button onClick={() => { setQrUrl(""); setQrMeta(null); }} style={btnActionSmall}>🗑 Clear</button>
                </div>
              </div>
            </div>

            {/* Box Detail QR (Di Samping Kanan QR) */}
            <div style={detailCard}>
              <div style={detailHeader}>
                <span style={{ marginRight: 10 }}>ℹ</span> Detail QR
              </div>
              <div style={{ padding: "20px 25px" }}>
                 <label style={miniLabel}>INFORMASI POS</label>
                 <div style={posInfoDetail}>
                    <div style={iconMarker}>📍</div>
                    <div>
                      <div style={{ fontWeight: "800", color: "#1e293b", fontSize: 16 }}>Pos: {qrMeta?.post?.post_name}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: "600" }}>Identifier ID: {qrMeta?.post?.id}</div>
                    </div>
                 </div>

                 <label style={{ ...miniLabel, marginTop: 25 }}>TOKEN KEAMANAN</label>
                 <div style={tokenBox}>
                    <span style={{ marginRight: 12 }}>🔑</span>
                    <code style={{ flex: 1, fontSize: 14, fontWeight: "700", color: "#334155" }}>{qrMeta?.token}</code>
                    <span style={{ color: "#b08d00", fontSize: 11, cursor: "pointer", fontWeight: "800" }}>↻ Regenerate</span>
                 </div>

                 <div style={warningBox}>
                    ⚠️ QR Code ini digunakan khusus untuk patroli di area <b>{qrMeta?.post?.post_name}</b>. Pastikan petugas melakukan scan sesuai jadwal yang ditentukan.
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* --- BOTTOM SECTION: DAFTAR POS --- */}
        <div style={mainCard}>
          <div style={cardHeaderStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#064e3b", fontSize: 18 }}>📋</span>
              <strong>Daftar Pos Patroli</strong>
            </div>
            <div style={searchWrapper}>
               <span style={{ marginRight: 8 }}>🔍</span>
               <input type="text" placeholder="Cari pos..." style={searchInput} />
            </div>
          </div>

          <div style={{ padding: "10px 25px" }}>
            {posts.map((p) => (
              <div key={p.id} style={listItem}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={iconBox}>🏢</div>
                  <div>
                    <div style={{ fontWeight: "800", color: "#1e293b", fontSize: 16 }}>{p.post_name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: "600" }}>
                      ID: {p.id} • {p.location_desc?.toUpperCase() || "LANTAI DASAR"}
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi dengan Tulisan (Bukan Hanya Ikon) */}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => handleGenerateQR(p.id)} style={btnActionGreen}>
                    <span style={{ marginRight: 6 }}>🧱</span> Generate QR
                  </button>
                  <button onClick={() => nav(`/admin/posts/${p.id}/edit`)} style={btnActionWhite}>
                    <span style={{ marginRight: 6, color: "#b08d00" }}>📝</span> Edit
                  </button>
                  <button onClick={() => handleDeletePost(p)} style={btnActionRed}>
                    <span style={{ marginRight: 6 }}>🗑</span> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "15px 25px", borderTop: "1px solid #f1f5f9" }}>
            <button onClick={fetchPosts} style={refreshBtn}>
              <span style={{ marginRight: 8 }}>🔄</span> Refresh Data Pos
            </button>
          </div>
        </div>

        {/* --- STATISTICS CARDS --- */}
        <div style={statsGrid}>
          <div style={statsCard}>
            <div style={statsIconGreen}>✔</div>
            <div><div style={statsLabel}>Status Sistem</div><div style={statsValue}>Online</div></div>
          </div>
          <div style={statsCard}>
            <div style={statsIconBlue}>🕒</div>
            <div><div style={statsLabel}>Patroli Terakhir</div><div style={statsValue}>5 Menit Lalu</div></div>
          </div>
          <div style={statsCard}>
            <div style={statsIconGold}>📋</div>
            <div><div style={statsLabel}>Laporan Hari Ini</div><div style={statsValue}>12 Laporan</div></div>
          </div>
        </div>

        <footer style={footerStyle}>
          © 2026 RS Islam Fatimah. Security Management System.
          <div style={{ display: "flex", gap: 20 }}>
            <span>Kebijakan Privasi</span>
            <span>Bantuan</span>
            <span>🌙 Switch Theme</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

// --- STYLES OBJECTS ---
const headerFlex = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 35 };
const logoCircleSmall = { width: 55, height: 55, backgroundColor: "#064e3b", borderRadius: 12, display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 4px 10px rgba(6, 78, 59, 0.2)" };
const btnDark = { backgroundColor: "#064e3b", color: "#fff", padding: "12px 24px", borderRadius: 10, border: "none", fontWeight: "700", cursor: "pointer", fontSize: 13 };
const btnGoldOutline = { backgroundColor: "#064e3b", color: "#fff", padding: "12px 24px", borderRadius: 10, border: "none", fontWeight: "700", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 8 };

// ✅ Style Grid Baru untuk QR & Detail berjejeran
const qrTopGrid = { display: "grid", gridTemplateColumns: "380px 1fr", gap: 25, marginBottom: 30, alignItems: "stretch" };
const qrBoxCard = { backgroundColor: "#fff", borderRadius: 25, padding: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" };
const qrFrame = { padding: 15, border: "2px dashed #e2e8f0", borderRadius: 20, backgroundColor: "#fff" };
const btnCopy = { width: "100%", backgroundColor: "#064e3b", color: "#fff", padding: "14px", borderRadius: 12, border: "none", fontWeight: "700", cursor: "pointer", fontSize: 14 };
const btnActionSmall = { flex: 1, backgroundColor: "#fff", color: "#b08d00", border: "1.5px solid #fde68a", padding: "10px", borderRadius: 12, fontWeight: "700", cursor: "pointer", fontSize: 12 };

const detailCard = { backgroundColor: "#fff", borderRadius: 25, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" };
const detailHeader = { backgroundColor: "#064e3b", color: "#fff", padding: "15px 25px", fontWeight: "800", fontSize: 15, display: "flex", alignItems: "center" };
const miniLabel = { display: "block", fontSize: 11, fontWeight: "800", color: "#94a3b8", letterSpacing: "0.5px", marginBottom: 10 };
const posInfoDetail = { display: "flex", alignItems: "center", gap: 18, padding: "18px", backgroundColor: "#f8fafc", borderRadius: 15 };
const iconMarker = { width: 38, height: 38, backgroundColor: "#e2e8f0", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 18 };
const tokenBox = { display: "flex", alignItems: "center", padding: "18px", backgroundColor: "#f8fafc", borderRadius: 15, border: "1px solid #f1f5f9" };
const warningBox = { marginTop: 25, padding: 18, backgroundColor: "#fffbeb", borderRadius: 15, color: "#b45309", fontSize: 12, lineHeight: "1.6", border: "1px solid #fef3c7" };

const mainCard = { backgroundColor: "#fff", borderRadius: 25, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", overflow: "hidden", marginBottom: 30 };
const cardHeaderStyle = { padding: "20px 25px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" };
const searchWrapper = { display: "flex", alignItems: "center", backgroundColor: "#f8fafc", padding: "8px 15px", borderRadius: 10, border: "1px solid #f1f5f9" };
const searchInput = { border: "none", background: "none", outline: "none", fontSize: 13, color: "#1e293b", width: 150 };

const listItem = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", borderBottom: "1px solid #f8fafc" };
const iconBox = { width: 45, height: 45, backgroundColor: "#f8fafc", borderRadius: 12, display: "flex", justifyContent: "center", alignItems: "center", fontSize: 20, border: "1px solid #f1f5f9" };

// ✅ Tombol Aksi yang Diperbaiki (Ada tulisannya)
const btnActionGreen = { backgroundColor: "#064e3b", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, fontWeight: "700", cursor: "pointer", fontSize: 12 };
const btnActionWhite = { backgroundColor: "#fff", color: "#334155", border: "1.5px solid #e2e8f0", padding: "10px 18px", borderRadius: 8, fontWeight: "700", cursor: "pointer", fontSize: 12 };
const btnActionRed = { backgroundColor: "#fff", color: "#be123c", border: "1.5px solid #ffe4e6", padding: "10px 18px", borderRadius: 8, fontWeight: "700", cursor: "pointer", fontSize: 12 };

const refreshBtn = { background: "none", border: "none", color: "#064e3b", fontWeight: "800", cursor: "pointer", fontSize: 14 };
const statsGrid = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 25 };
const statsCard = { backgroundColor: "#fff", padding: "25px", borderRadius: 20, display: "flex", alignItems: "center", gap: 20, border: "1px solid #f1f5f9" };
const statsIconGreen = { width: 50, height: 50, backgroundColor: "#dcfce7", color: "#059669", borderRadius: 12, display: "flex", justifyContent: "center", alignItems: "center", fontSize: 20 };
const statsIconBlue = { width: 50, height: 50, backgroundColor: "#dbeafe", color: "#2563eb", borderRadius: 12, display: "flex", justifyContent: "center", alignItems: "center", fontSize: 20 };
const statsIconGold = { width: 50, height: 50, backgroundColor: "#fef3c7", color: "#d97706", borderRadius: 12, display: "flex", justifyContent: "center", alignItems: "center", fontSize: 20 };
const statsLabel = { fontSize: 12, color: "#64748b", fontWeight: "600" };
const statsValue = { fontSize: 18, fontWeight: "800", color: "#1e293b" };
const footerStyle = { marginTop: 60, paddingBottom: 40, borderTop: "1px solid #e2e8f0", paddingTop: 30, display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: 12 };