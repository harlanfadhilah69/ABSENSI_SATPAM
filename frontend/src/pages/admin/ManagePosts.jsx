import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";

// ✅ 1. PASTIKAN LIBRARY INI SUDAH TERINSTAL (npm install qrcode.react lucide-react)
import { QRCodeCanvas } from "qrcode.react"; 
import { 
  QrCode, Edit2, Trash2, PlusCircle, 
  Download, Copy, XCircle, CheckCircle 
} from "lucide-react";

// ✅ 2. IMPORT LOGO (Sesuaikan path assets kamu)
import logoImg from "../../assets/logo_patroli.png"; 

export default function ManagePosts() {
  const nav = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // ✅ STATE UNTUK QR CODE DISPLAY
  const [qrUrl, setQrUrl] = useState("");
  const [qrMeta, setQrMeta] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      setLoading(true);
      const res = await api.get("/admin/posts");
      setPosts(res.data?.data || []);
    } catch (e) {
      console.error("Gagal ambil pos");
    } finally {
      setLoading(false);
    }
  }

  // ✅ FUNGSI GENERATE QR (Sekarang memicu tampilan di halaman ini)
  const handleGenerateQR = async (postId) => {
    try {
      const res = await api.get(`/admin/posts/${postId}/qr`);
      if (res.data && res.data.url) {
        setQrUrl(res.data.url);
        setQrMeta({ 
          post: res.data.post || { post_name: "Pos Patroli" }, 
          token: res.data.token 
        });
        // Scroll ke atas agar kartu QR kelihatan
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error("Gagal generate QR:", err);
      alert("Gagal membuat QR Code. Pastikan server aktif.");
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_POS_${qrMeta?.post?.post_name || 'RSIFC'}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const confirmDelete = (post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  async function handleDelete() {
    try {
      await api.delete(`/admin/posts/${selectedPost.id}`);
      setShowDeleteModal(false);
      fetchPosts();
    } catch (e) { 
      alert("Gagal hapus pos"); 
    }
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <AdminNavbar />
      
      <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 20px" }}>
        
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h2 style={{ margin: 0, fontWeight: "800", color: "#1e293b" }}>Kelola Pos Patroli 🏢</h2>
            <p style={{ color: "#64748b", fontSize: 14 }}>Daftar titik pengecekan RSI Fatimah Cilacap</p>
          </div>
          <button onClick={() => nav("/admin/posts/new")} style={styles.btnAdd}>
            <PlusCircle size={18} /> Tambah Pos Baru
          </button>
        </div>

        {/* ✅ PANEL QR CODE (Tampil hanya jika qrUrl tidak kosong) */}
        {qrUrl && (
          <div style={styles.qrContainer}>
            <div style={styles.qrCard}>
              <div style={styles.qrHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle size={18} />
                  <span>QR Code Pos Patroli Berhasil Dibuat</span>
                </div>
                <button onClick={() => setQrUrl("")} style={styles.btnClose}>
                  <XCircle size={20} />
                </button>
              </div>
              <div style={styles.qrBody}>
                <div style={styles.qrFrame}>
                  <QRCodeCanvas 
                    id="qr-canvas" 
                    value={qrUrl} 
                    size={160} 
                    level="H" 
                    imageSettings={{ 
                      src: logoImg, 
                      height: 35, 
                      width: 35, 
                      excavate: true 
                    }} 
                  />
                </div>
                <div style={styles.qrDetails}>
                  <div style={styles.miniLabel}>DETAIL POS</div>
                  <h3 style={{ margin: "5px 0 20px 0", color: "#1e293b" }}>
                    {qrMeta?.post?.post_name || "Nama Pos"}
                  </h3>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={downloadQR} style={styles.btnDownload}>
                      <Download size={16} /> Unduh PNG
                    </button>
                    <button 
                      onClick={() => { 
                        navigator.clipboard.writeText(qrUrl); 
                        alert("Link Berhasil Disalin!"); 
                      }} 
                      style={styles.btnCopy}
                    >
                      <Copy size={16} /> Salin Link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIST POS */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>📝 Daftar Pos Aktif</div>
          <div style={{ padding: "10px 20px" }}>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>Memuat data...</p>
            ) : posts.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>Belum ada pos.</p>
            ) : (
              posts.map((p) => (
                <div key={p.id} style={styles.listItem}>
                  <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                    <div style={styles.iconBox}>🏢</div>
                    <div>
                      <div style={{ fontWeight: "800", color: "#1e293b" }}>{p.post_name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        ID: {p.id} • {p.location_desc || "Lokasi RSIFC"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {/* ✅ Tombol Generate QR */}
                    <button 
                      onClick={() => handleGenerateQR(p.id)} 
                      style={styles.btnQr}
                    >
                      <QrCode size={16} /> QR
                    </button>
                    <button 
                      onClick={() => nav(`/admin/posts/${p.id}/edit`)} 
                      style={styles.btnEdit}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => confirmDelete(p)} 
                      style={styles.btnDelete}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL HAPUS */}
      {showDeleteModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginTop: 0 }}>Hapus Pos?</h3>
            <p style={{ fontSize: 14, color: "#64748b" }}>
              Yakin menghapus <b>{selectedPost?.post_name}</b>?
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 25 }}>
              <button onClick={() => setShowDeleteModal(false)} style={styles.btnCancel}>Batal</button>
              <button onClick={handleDelete} style={styles.btnConfirm}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
  btnAdd: { display: "flex", alignItems: "center", gap: 8, backgroundColor: "#064e3b", color: "#fff", border: "none", padding: "12px 20px", borderRadius: 10, fontWeight: "700", cursor: "pointer" },
  card: { backgroundColor: "#fff", borderRadius: 15, boxShadow: "0 4px 6px rgba(0,0,0,0.05)", overflow: "hidden", border: "1px solid #f1f5f9" },
  cardHeader: { padding: "15px 20px", backgroundColor: "#064e3b", color: "#fff", fontWeight: "700", fontSize: "14px" },
  listItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderBottom: "1px solid #f8fafc" },
  iconBox: { width: 40, height: 40, backgroundColor: "#f8fafc", borderRadius: 10, display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px" },
  
  // ✅ QR STYLES
  qrContainer: { marginBottom: 35, animation: "fadeIn 0.4s ease" },
  qrCard: { backgroundColor: "#fff", borderRadius: "20px", border: "2px solid #b08d00", overflow: "hidden", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" },
  qrHeader: { padding: "12px 25px", backgroundColor: "#fffbeb", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "800", color: "#b08d00", fontSize: "13px" },
  btnClose: { background: "none", border: "none", color: "#ef4444", cursor: "pointer" },
  qrBody: { padding: "25px", display: "flex", gap: "30px", alignItems: "center", flexWrap: "wrap" },
  qrFrame: { padding: "12px", border: "1px solid #e2e8f0", borderRadius: "12px", backgroundColor: "#fff" },
  qrDetails: { flex: 1, minWidth: "200px" },
  miniLabel: { fontSize: "10px", fontWeight: "800", color: "#94a3b8", letterSpacing: "1px" },
  btnDownload: { display: "flex", alignItems: "center", gap: 8, backgroundColor: "#064e3b", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: "700", cursor: "pointer", fontSize: "12px" },
  btnCopy: { display: "flex", alignItems: "center", gap: 8, backgroundColor: "#f1f5f9", color: "#475569", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: "700", cursor: "pointer", fontSize: "12px" },

  btnQr: { display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 8, border: "1px solid #b08d00", backgroundColor: "#fff9eb", color: "#b08d00", cursor: "pointer", fontWeight: "700", fontSize: "12px" },
  btnEdit: { padding: "8px", borderRadius: 8, border: "1px solid #e2e8f0", backgroundColor: "#fff", cursor: "pointer", color: "#64748b" },
  btnDelete: { padding: "8px", borderRadius: 8, border: "none", backgroundColor: "#fef2f2", color: "#be123c", cursor: "pointer" },
  
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { backgroundColor: "#fff", padding: "30px", borderRadius: "20px", textAlign: "center", width: "320px" },
  btnCancel: { flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontWeight: "600" },
  btnConfirm: { flex: 1, padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "#be123c", color: "#fff", fontWeight: "600" }
};