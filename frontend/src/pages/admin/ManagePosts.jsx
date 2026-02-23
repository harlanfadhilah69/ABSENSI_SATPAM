import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { QRCodeCanvas } from "qrcode.react"; 
import { 
  QrCode, Edit2, PlusCircle, 
  Download, Copy, XCircle, CheckCircle, Power, MapPin, Loader2
} from "lucide-react";
import logoImg from "../../assets/logo_patroli.png"; 
// ✅ Import SweetAlert2
import Swal from 'sweetalert2';

export default function ManagePosts() {
  const nav = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState("");
  const [qrMeta, setQrMeta] = useState(null);

  // ✅ State Responsif
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    fetchPosts();
    return () => window.removeEventListener('resize', handleResize);
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

  const handleToggleStatus = async (postId, postName, isActive) => {
    Swal.fire({
      title: isActive ? 'Nonaktifkan Pos?' : 'Aktifkan Kembali?',
      text: `Apakah Anda yakin ingin mengubah status "${postName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: isActive ? '#be123c' : '#064e3b',
      confirmButtonText: isActive ? 'Ya, Matikan' : 'Ya, Aktifkan',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.patch(`/admin/posts/${postId}/toggle`);
          if (res.data.success) {
            Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Status pos telah diperbarui.', timer: 1500, showConfirmButton: false });
            fetchPosts(); 
          }
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan sistem.', confirmButtonColor: '#be123c' });
        }
      }
    });
  };

  const handleGenerateQR = async (postId) => {
    try {
      const res = await api.get(`/admin/posts/${postId}/qr`);
      if (res.data && res.data.url) {
        setQrUrl(res.data.url);
        setQrMeta({ post: res.data.post || { post_name: "Pos Patroli" } });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'QR Gagal', text: 'Tidak dapat membuat kode QR.', confirmButtonColor: '#be123c' });
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${qrMeta?.post?.post_name}.png`;
    downloadLink.click();
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'QR Code berhasil diunduh.', timer: 1500, showConfirmButton: false });
  };

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <AdminNavbar />
      
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: isMobile ? "20px 15px" : "40px 20px" }}>
        
        {/* ✅ HEADER SECTION DENGAN AKSEN EMAS */}
        <div style={{ ...styles.header, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '15px' : '0' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={styles.barGold}></div>
            <div>
              <h2 style={{ margin: 0, fontWeight: "900", color: "#1e293b", fontSize: isMobile ? '22px' : '28px' }}>Kelola Pos Patroli <span style={{color: '#064e3b'}}>🏢</span></h2>
              <p style={{ color: "#64748b", fontSize: 13, fontWeight: '500' }}>Manajemen titik pengecekan RSIFC</p>
            </div>
          </div>
          <button onClick={() => nav("/admin/posts/new")} style={styles.btnAdd}>
            <PlusCircle size={18} /> Tambah Pos
          </button>
        </div>

        {/* ✅ QR PREVIEW CARD (RESPONSIF) */}
        {qrUrl && (
          <div style={styles.qrContainer}>
            <div style={styles.qrCard}>
              <div style={styles.qrHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle size={18} /> <span>QR Code Siap Cetak</span>
                </div>
                <button onClick={() => setQrUrl("")} style={styles.btnClose}><XCircle size={20} /></button>
              </div>
              <div style={{ ...styles.qrBody, flexDirection: isMobile ? 'column' : 'row', textAlign: isMobile ? 'center' : 'left' }}>
                <div style={styles.qrFrame}>
                  <QRCodeCanvas id="qr-canvas" value={qrUrl} size={isMobile ? 200 : 250} level="M" includeMargin={true} 
                    imageSettings={{ src: logoImg, height: 40, width: 40, excavate: true }} 
                  />
                </div>
                <div style={styles.qrDetails}>
                  <div style={styles.miniLabel}>NAMA TITIK PATROLI</div>
                  <h3 style={{ margin: "5px 0 20px 0", color: "#1e293b", fontSize: '20px' }}>{qrMeta?.post?.post_name}</h3>
                  <div style={{ display: "flex", gap: 10, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                    <button onClick={downloadQR} style={styles.btnDownload}><Download size={16} /> Unduh PNG</button>
                    <button onClick={() => { navigator.clipboard.writeText(qrUrl); Swal.fire({title: 'Tersalin!', icon: 'success', timer: 1000, showConfirmButton: false}) }} style={styles.btnCopy}><Copy size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={styles.card}>
          <div style={styles.cardHeader}>📝 Daftar Seluruh Pos</div>
          <div style={{ padding: isMobile ? "5px" : "10px 20px" }}>
            {loading ? (
              <div style={{textAlign: 'center', padding: '40px'}}><Loader2 className="animate-spin" color="#064e3b" size={32} /></div>
            ) : (
              posts.map((p) => (
                <div key={p.id} style={{ 
                  ...styles.listItem, 
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  opacity: p.is_active ? 1 : 0.6, 
                  backgroundColor: p.is_active ? 'transparent' : '#f8fafc' 
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: isMobile ? '12px' : '0' }}>
                    <div style={{ ...styles.iconBox, backgroundColor: p.is_active ? "#f0fdf4" : "#f1f5f9", color: p.is_active ? "#166534" : "#94a3b8" }}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: "800", color: p.is_active ? "#1e293b" : "#94a3b8", fontSize: '15px' }}>
                        {p.post_name} {!p.is_active && <span style={styles.archiveTag}>(Nonaktif)</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: '2px' }}>{p.location_desc || "Lokasi RSIFC"}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: 8, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
                    {p.is_active && (
                      <button onClick={() => handleGenerateQR(p.id)} style={styles.btnQr}><QrCode size={16} /> {isMobile ? '' : 'QR'}</button>
                    )}
                    <button onClick={() => nav(`/admin/posts/${p.id}/edit`)} style={styles.btnEdit}><Edit2 size={16} /></button>
                    <button onClick={() => handleToggleStatus(p.id, p.post_name, p.is_active)} style={p.is_active ? styles.btnDelete : styles.btnActivate}>
                      <Power size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", marginBottom: 35 },
  barGold: { width: '6px', height: '45px', backgroundColor: '#b08d00', borderRadius: '10px' },
  btnAdd: { display: "flex", alignItems: "center", gap: 8, backgroundColor: "#064e3b", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "12px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 12px rgba(6,78,59,0.2)" },
  
  qrContainer: { marginBottom: 35 },
  qrCard: { backgroundColor: "#fff", borderRadius: "24px", border: "2px solid #b08d00", overflow: "hidden", boxShadow: "0 10px 25px rgba(176,141,0,0.15)" },
  qrHeader: { padding: "15px 25px", backgroundColor: "#fffbeb", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "800", color: "#b08d00", fontSize: "13px" },
  btnClose: { background: "none", border: "none", color: "#ef4444", cursor: "pointer" },
  qrBody: { padding: "30px", display: "flex", gap: "30px", alignItems: "center" },
  qrFrame: { padding: "15px", border: "1px solid #f1f5f9", borderRadius: "20px", backgroundColor: '#fff' },
  qrDetails: { flex: 1 },
  miniLabel: { fontSize: "10px", fontWeight: "800", color: "#94a3b8", letterSpacing: '1px' },
  btnDownload: { display: "flex", alignItems: "center", gap: 8, backgroundColor: "#064e3b", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "13px" },
  btnCopy: { display: "flex", alignItems: "center", backgroundColor: "#f1f5f9", color: "#475569", border: "none", padding: "12px", borderRadius: "10px", cursor: "pointer" },

  card: { backgroundColor: "#fff", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", overflow: "hidden", border: "1px solid #f1f5f9" },
  cardHeader: { padding: "18px 25px", backgroundColor: "#064e3b", color: "#fff", fontWeight: "800", fontSize: "14px", letterSpacing: '0.5px' },
  listItem: { display: "flex", justifyContent: "space-between", padding: "15px 20px", borderBottom: "1px solid #f8fafc", transition: "0.2s" },
  iconBox: { width: 44, height: 44, borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center" },
  archiveTag: { fontSize: "10px", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#64748b", marginLeft: "5px" },

  btnQr: { display: "flex", alignItems: "center", gap: 5, padding: "10px 15px", borderRadius: "10px", border: "1.5px solid #b08d00", backgroundColor: "#fffbeb", color: "#b08d00", cursor: "pointer", fontWeight: "800", fontSize: "12px" },
  btnEdit: { padding: "10px", borderRadius: "10px", border: "1.5px solid #e2e8f0", backgroundColor: "#fff", cursor: "pointer", color: "#64748b" },
  btnDelete: { padding: "10px", borderRadius: "10px", border: "none", backgroundColor: "#fef2f2", color: "#be123c", cursor: "pointer" },
  btnActivate: { padding: "10px", borderRadius: "10px", border: "none", backgroundColor: "#f0fdf4", color: "#166534", cursor: "pointer" }
};