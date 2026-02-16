import { useEffect, useState } from "react";
import api from "../../api/axios";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";
import logoImg from "../../assets/logo_patroli.png"; 

export default function AdminDashboard() {
  const nav = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [notif, setNotif] = useState({ show: false, status: "", message: "" });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [stats, setStats] = useState({ todayCount: 0, lastPatrolTime: "Belum ada data" });
  const [qrUrl, setQrUrl] = useState("");
  const [qrMeta, setQrMeta] = useState(null);

  // ✅ KITA HAPUS MY_LAPTOP_IP manual agar tidak perlu ganti-ganti lagi

  useEffect(() => {
    fetchPosts();
    fetchStats(); 
  }, []);

  const showNotif = (status, msg) => {
    setNotif({ show: true, status, message: msg });
    setTimeout(() => setNotif({ show: false, status: "", message: "" }), 3000);
  };

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await api.get("/admin/posts");
      setPosts(res.data?.data || []);
    } catch (e) {
      showNotif("error", "Gagal memuat data pos");
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const res = await api.get("/admin/reports");
      const allReports = res.data?.data || [];
      if (allReports.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const todayReports = allReports.filter(r => (r.captured_at_server || r.created_at).startsWith(today));
        const latestDate = new Date(allReports[0].captured_at_server || allReports[0].created_at);
        const now = new Date();
        const diffMs = now - latestDate;
        const diffMins = Math.floor(diffMs / 60000);
        let timeText = diffMins < 1 ? "Baru saja" : diffMins < 60 ? `${diffMins} Menit Lalu` : diffMins < 1440 ? `${Math.floor(diffMins / 60)} Jam Lalu` : latestDate.toLocaleDateString("id-ID");
        setStats({ todayCount: todayReports.length, lastPatrolTime: timeText });
      }
    } catch (e) { console.error(e); }
  }

  async function handleGenerateQR(postId) {
    try {
      const res = await api.get(`/admin/posts/${postId}/qr`);
      const data = res.data;
      setQrMeta(data);
      if (data?.url) {
        // ✅ JURUS SAKTI: Menggunakan window.location.origin agar otomatis 
        // mengikuti apakah kamu buka di localhost atau di IP
        const urlObj = new URL(data.url); 
        setQrUrl(`${window.location.origin}${urlObj.pathname}${urlObj.search}`);
      }
    } catch (e) { showNotif("error", "Gagal generate QR"); }
  }

  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${qrMeta?.post?.post_name || 'Patrol'}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showNotif("success", "QR Berhasil diunduh!");
  };

  const confirmDelete = (post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  async function handleDeleteAction() {
    try {
      await api.delete(`/admin/posts/${selectedPost.id}`);
      showNotif("success", `Pos "${selectedPost.post_name}" dihapus`);
      setShowDeleteModal(false);
      fetchPosts();
    } catch (e) { 
      showNotif("error", "Gagal hapus pos");
      setShowDeleteModal(false);
    }
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <AdminNavbar />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 15px" : "40px 20px" }}>
        
        <div style={{ ...styles.headerFlex, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 20 : 0 }}>
          <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
            <div style={{ width: "6px", backgroundColor: "#b08d00", alignSelf: "stretch", borderRadius: "2px" }}></div>
            <div>
              <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: "800", color: "#1e293b", margin: 0 }}>
                Admin Dashboard <span style={{ color: "#10b981" }}>👨🏻‍💻</span>
              </h1>
              <p style={{ color: "#64748b", margin: "5px 0 0 0", fontSize: 14 }}>
                Pantau keamanan dan kelola titik pos secara real-time.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, width: isMobile ? "100%" : "auto" }}>
            <button onClick={() => nav("/admin/reports")} style={{ ...styles.btnDark, flex: isMobile ? 1 : "none" }}>📄 Laporan Patroli</button>
            <button onClick={() => nav("/admin/posts/new")} style={{ ...styles.btnGoldOutline, flex: isMobile ? 1 : "none" }}>⊕ Tambah Pos</button>
          </div>
        </div>

        {qrUrl && (
          <div style={{ ...styles.qrTopGrid, gridTemplateColumns: isMobile ? "1fr" : "380px 1fr" }}>
            <div style={styles.qrBoxCard}>
              <div style={styles.qrFrame}>
                <QRCodeCanvas id="qr-canvas" value={qrUrl} size={isMobile ? 150 : 200} level="H" imageSettings={{ src: logoImg, height: 40, width: 40, excavate: true }} />
              </div>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                <button onClick={() => { navigator.clipboard.writeText(qrUrl); showNotif("success", "Link disalin!"); }} style={styles.btnCopy}>📝 Copy Link</button>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={downloadQR} style={styles.btnActionSmall}>📥 PNG</button>
                  <button onClick={() => { setQrUrl(""); setQrMeta(null); }} style={styles.btnActionSmall}>🗑 Clear</button>
                </div>
              </div>
            </div>

            <div style={styles.detailCard}>
              <div style={styles.detailHeader}>Detail QR Jaga</div>
              <div style={{ padding: "20px" }}>
                 <label style={styles.miniLabel}>INFORMASI POS</label>
                 <div style={styles.posInfoDetail}>
                    <div style={styles.iconMarker}>📍</div>
                    <div>
                      <div style={{ fontWeight: "800", color: "#1e293b", fontSize: 15 }}>Pos: {qrMeta?.post?.post_name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>ID: {qrMeta?.post?.id}</div>
                    </div>
                 </div>
                 <label style={{ ...styles.miniLabel, marginTop: 20 }}>TOKEN KEAMANAN</label>
                 <div style={styles.tokenBox}>
                    <code style={{ flex: 1, fontSize: 12, fontWeight: "700", wordBreak: 'break-all' }}>{qrMeta?.token}</code>
                 </div>
              </div>
            </div>
          </div>
        )}

        <div style={styles.mainCard}>
          <div style={styles.cardHeaderStyle}>
            <strong>📝 Daftar Pos Patroli Aktif</strong>
          </div>
          <div style={{ padding: isMobile ? "10px" : "10px 25px" }}>
            {posts.map((p) => (
              <div key={p.id} style={{ ...styles.listItem, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 15 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                  <div style={styles.iconBox}>🏢</div>
                  <div>
                    <div style={{ fontWeight: "800", color: "#1e293b" }}>{p.post_name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>ID: {p.id} • {p.location_desc || "LOKASI"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, width: isMobile ? "100%" : "auto" }}>
                  <button onClick={() => handleGenerateQR(p.id)} style={{ ...styles.btnActionGreen, flex: isMobile ? 1 : "none" }}>Generate QR</button>
                  <button onClick={() => nav(`/admin/posts/${p.id}/edit`)} style={{ ...styles.btnActionWhite, flex: isMobile ? 1 : "none" }}>Edit</button>
                  <button onClick={() => confirmDelete(p)} style={{ ...styles.btnActionRed, flex: isMobile ? 1 : "none" }}>Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...styles.statsGrid, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr" }}>
          <div style={styles.statsCard}>
            <div style={styles.statsIconGreen}>✔</div>
            <div><div style={styles.statsLabel}>Sistem</div><div style={styles.statsValue}>Online</div></div>
          </div>
          <div style={styles.statsCard}>
            <div style={styles.statsIconBlue}>🕒</div>
            <div><div style={styles.statsLabel}>Terakhir</div><div style={styles.statsValue}>{stats.lastPatrolTime}</div></div>
          </div>
          <div style={styles.statsCard}>
            <div style={styles.statsIconGold}>📋</div>
            <div><div style={styles.statsLabel}>Hari Ini</div><div style={styles.statsValue}>{stats.todayCount} Lap.</div></div>
          </div>
        </div>

        <footer style={styles.footerStyle}>
          © 2026 <b>RS Islam Fatimah</b>. Security System.
        </footer>
      </div>

      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalIconBox}>🗑️</div>
            <h3 style={styles.modalTitle}>Hapus Pos Jaga?</h3>
            <p style={styles.modalBody}>
              Yakin menghapus pos <b>"{selectedPost?.post_name}"</b>? 
            </p>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowDeleteModal(false)} style={styles.btnCancel}>Batal</button>
              <button onClick={handleDeleteAction} style={styles.btnConfirmRed}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {notif.show && (
        <div style={{ ...styles.notifToast, backgroundColor: notif.status === "success" ? "#064e3b" : "#be123c" }}>
          {notif.status === "success" ? "✅" : "❌"} {notif.message}
        </div>
      )}
    </div>
  );
}

const styles = {
  headerFlex: { display: "flex", justifyContent: "space-between", marginBottom: 30 },
  btnDark: { backgroundColor: "#064e3b", color: "#fff", padding: "12px 20px", borderRadius: 10, border: "none", fontWeight: "700", cursor: "pointer", fontSize: 13 },
  btnGoldOutline: { backgroundColor: "#fff", color: "#064e3b", border: "2px solid #064e3b", padding: "10px 20px", borderRadius: 10, fontWeight: "700", cursor: "pointer", fontSize: 13 },
  qrTopGrid: { display: "grid", gap: 20, marginBottom: 30 },
  qrBoxCard: { backgroundColor: "#fff", borderRadius: 20, padding: "25px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", textAlign: "center" },
  qrFrame: { padding: 10, border: "2px dashed #e2e8f0", borderRadius: 15, display: "inline-block", backgroundColor: "#fff" },
  btnCopy: { width: "100%", backgroundColor: "#064e3b", color: "#fff", padding: "12px", borderRadius: 10, border: "none", fontWeight: "700", cursor: "pointer" },
  btnActionSmall: { flex: 1, backgroundColor: "#fff", color: "#b08d00", border: "1.5px solid #fde68a", padding: "10px", borderRadius: 10, fontWeight: "700", cursor: "pointer", fontSize: 12 },
  detailCard: { backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" },
  detailHeader: { backgroundColor: "#064e3b", color: "#fff", padding: "15px 20px", fontWeight: "800", fontSize: 14 },
  miniLabel: { display: "block", fontSize: 10, fontWeight: "800", color: "#94a3b8", marginBottom: 8 },
  posInfoDetail: { display: "flex", alignItems: "center", gap: 15, padding: "15px", backgroundColor: "#f8fafc", borderRadius: 12 },
  iconMarker: { fontSize: 18 },
  tokenBox: { padding: "15px", backgroundColor: "#f8fafc", borderRadius: 12, border: "1px solid #f1f5f9" },
  mainCard: { backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", marginBottom: 30, overflow: "hidden" },
  cardHeaderStyle: { padding: "15px 25px", backgroundColor: "#064e3b", borderTop: "6px solid #b08d00", color: "#fff", display: "flex", alignItems: "center" },
  listItem: { display: "flex", justifyContent: "space-between", padding: "15px 0", borderBottom: "1px solid #f8fafc" },
  iconBox: { width: 40, height: 40, backgroundColor: "#f8fafc", borderRadius: 10, display: "flex", justifyContent: "center", alignItems: "center" },
  btnActionGreen: { backgroundColor: "#064e3b", color: "#fff", border: "none", padding: "8px 15px", borderRadius: 8, fontWeight: "700", fontSize: 12 },
  btnActionWhite: { backgroundColor: "#fff", color: "#334155", border: "1px solid #e2e8f0", padding: "8px 15px", borderRadius: 8, fontWeight: "700", fontSize: 12 },
  btnActionRed: { backgroundColor: "#fff", color: "#be123c", border: "1px solid #ffe4e6", padding: "8px 15px", borderRadius: 8, fontWeight: "700", fontSize: 12 },
  statsGrid: { display: "grid", gap: 15 },
  statsCard: { backgroundColor: "#fff", padding: "20px", borderRadius: 15, display: "flex", alignItems: "center", gap: 15, border: "1px solid #f1f5f9" },
  statsIconGreen: { color: "#059669", fontSize: 20 },
  statsIconBlue: { color: "#2563eb", fontSize: 20 },
  statsIconGold: { color: "#d97706", fontSize: 20 },
  statsLabel: { fontSize: 11, color: "#64748b", fontWeight: "600" },
  statsValue: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  footerStyle: { marginTop: 40, paddingBottom: 30, color: "#94a3b8", fontSize: 11 },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 },
  modalContent: { backgroundColor: "#fff", width: "90%", maxWidth: "400px", padding: "30px", borderRadius: "24px", textAlign: "center", boxShadow: "0 20px 25px rgba(0,0,0,0.1)" },
  modalIconBox: { width: "60px", height: "60px", backgroundColor: "#fef2f2", color: "#be123c", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 15px", fontSize: "24px" },
  modalTitle: { fontSize: "20px", fontWeight: "800", color: "#1e293b" },
  modalBody: { fontSize: "14px", color: "#64748b", margin: "10px 0 25px", lineHeight: '1.5' },
  modalFooter: { display: "flex", gap: "10px" },
  btnCancel: { flex: 1, padding: "12px", borderRadius: "12px", border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#64748b", fontWeight: "700", cursor: 'pointer' },
  btnConfirmRed: { flex: 1, padding: "12px", borderRadius: "12px", border: "none", backgroundColor: "#be123c", color: "#fff", fontWeight: "700", cursor: 'pointer' },
  notifToast: { position: "fixed", top: "20px", right: "20px", color: "#fff", padding: "15px 25px", borderRadius: "12px", fontWeight: "700", boxShadow: "0 10px 15px rgba(0,0,0,0.2)", zIndex: 3000 }
};