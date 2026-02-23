import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { 
  CheckCircle, 
  XCircle, 
  Send, 
  User, 
  Loader2, 
  ShieldCheck, 
  MapPin, 
  Edit3, 
  Trash2 
} from "lucide-react";
import Swal from 'sweetalert2';

export default function MonitorMisi() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]); 
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedSatpam, setSelectedSatpam] = useState(null);
  const [selectedPostIds, setSelectedPostIds] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await api.get("/admin/monitor");
      setData(res.data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get("/admin/posts");
      setPosts(res.data?.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchStatus(); fetchPosts();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const openAssignModal = (satpam) => {
    setSelectedSatpam(satpam);
    setSelectedPostIds([]);
    setShowAssignModal(true);
  };

  const handleEditInitiate = async () => {
    setShowDetailModal(false);
    setSelectedSatpam(selectedDetail);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/missions/assigned-ids/${selectedDetail.id}`);
      setSelectedPostIds(res.data.data || []);
      setShowAssignModal(true);
    } catch (err) { Swal.fire('Error', 'Gagal memuat data', 'error'); } finally { setLoadingDetail(false); }
  };

  const handleDeleteSingle = async (postId, postName) => {
    Swal.fire({
      title: 'Hapus Pos?',
      text: `Tarik tugas "${postName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#be123c',
      confirmButtonText: 'Ya, Hapus'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/missions/delete/${selectedDetail.id}/${postId}`);
          Swal.fire('Terhapus!', 'Pos berhasil ditarik.', 'success');
          openDetailModal(selectedDetail); fetchStatus();
        } catch (err) { Swal.fire('Gagal', err.response?.data?.message || 'Gagal', 'error'); }
      }
    });
  };

  const handleDeleteAllMissions = async () => {
    Swal.fire({
      title: 'Kosongkan Misi?',
      text: `Semua tugas ${selectedDetail.name} hari ini akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#be123c',
      confirmButtonText: 'Ya, Hapus Semua'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.post("/admin/assign-mission", {
            user_id: selectedDetail.id,
            post_ids: [] 
          });
          Swal.fire('Berhasil!', 'Misi telah dikosongkan.', 'success');
          setShowDetailModal(false); fetchStatus();
        } catch (err) { Swal.fire('Gagal', 'Gagal mengosongkan misi.', 'error'); }
      }
    });
  };

  const openDetailModal = async (satpam) => {
    setLoadingDetail(true); setSelectedDetail(satpam); setShowDetailModal(true);
    try {
      const res = await api.get(`/admin/monitor/detail/${satpam.id}`);
      setSelectedDetail({ ...satpam, posts: res.data.data });
    } catch (err) { Swal.fire({ icon: 'error', title: 'Gagal Memuat' }); setShowDetailModal(false); } finally { setLoadingDetail(false); }
  };

  const handleAssignMission = async () => {
    try {
      if (isAssigning) return; setIsAssigning(true);
      await api.post("/admin/assign-mission", { user_id: selectedSatpam.id, post_ids: selectedPostIds });
      Swal.fire({ icon: 'success', title: 'Berhasil!', timer: 2000, showConfirmButton: false });
      setShowAssignModal(false); fetchStatus();
    } catch (err) { Swal.fire({ icon: 'error', title: 'Gagal' }); } finally { setIsAssigning(false); }
  };

  const togglePostSelection = (id) => {
    setSelectedPostIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <AdminNavbar />
      <div style={styles.container}>
        <div style={styles.headerFlex}>
          <div style={styles.barGold}></div>
          <div>
            <h2 style={styles.title}>Monitoring Patroli Satpam <span style={{color: '#064e3b'}}>🛡️</span></h2>
            <p style={styles.subtitle}>Pantau progress patroli real-time atau kelola penugasan.</p>
          </div>
        </div>
        {loading ? (
          <div style={styles.loaderCenter}><Loader2 className="animate-spin" size={48} color="#064e3b" /></div>
        ) : (
          <div style={styles.grid}>
            {data.map((item) => (
              /* ✅ HAPUS onClick dari card agar area kosong tidak bisa diklik */
              <div key={item.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={styles.avatarMini}><User size={18}/></div>
                    <span style={styles.name}>{item.name}</span>
                  </div>
                  <span style={item.progress === 100 ? styles.badgeDone : styles.badgeProcess}>
                    {item.progress === 100 ? "SELESAI" : "DIJALANKAN"}
                  </span>
                </div>
                <div style={styles.progressBg}>
                  <div style={{ ...styles.progressFill, width: `${item.progress || 0}%`, backgroundColor: item.progress === 100 ? '#059669' : '#b08d00' }} />
                </div>
                <div style={styles.detail}>
                  <span>Progress: <b>{item.progress || 0}%</b></span>
                  <span>{item.completed_pos || 0}/{item.total_pos || 0} Pos Selesai</span>
                </div>

                {/* ✅ Pindah fungsi klik HANYA ke button di bawah ini */}
                {item.total_pos === 0 ? (
                  <button 
                    style={styles.warningBtn} 
                    onClick={() => openAssignModal(item)}
                  >
                    <Send size={14} /> Beri Tugas Hari Ini
                  </button>
                ) : (
                  <button 
                    style={styles.activeTag} 
                    onClick={() => openDetailModal(item)}
                  >
                    <ShieldCheck size={14} /> Misi Aktif (Klik Detail)
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL PENUGASAN */}
      {showAssignModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Kelola Misi: <span style={{color: '#b08d00'}}>{selectedSatpam?.name}</span></h3>
              <button onClick={() => setShowAssignModal(false)} style={styles.btnClose}><XCircle/></button>
            </div>
            <div style={styles.postList}>
              {posts.filter(p => p.is_active === 1).map(post => (
                <label key={post.id} style={styles.postItem}>
                  <input type="checkbox" checked={selectedPostIds.includes(post.id)} onChange={() => togglePostSelection(post.id)} style={styles.checkbox} />
                  <span>{post.post_name}</span>
                </label>
              ))}
            </div>
            <button onClick={handleAssignMission} style={styles.btnConfirm} disabled={isAssigning}>
              {isAssigning ? <Loader2 className="animate-spin" size={18}/> : <ShieldCheck size={18} />} Simpan Perubahan
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {showDetailModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Progress: {selectedDetail?.name}</h3>
              <button onClick={() => setShowDetailModal(false)} style={styles.btnClose}><XCircle/></button>
            </div>
            {loadingDetail ? (
              <div style={styles.loaderCenter}><Loader2 className="animate-spin" size={32} color="#064e3b" /></div>
            ) : (
              <>
                <div style={styles.scrollArea}>
                  {selectedDetail?.posts?.length > 0 ? selectedDetail.posts.map((post, idx) => (
                    <div key={idx} style={styles.detailRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {post.status === 1 ? <CheckCircle size={18} color="#10b981" /> : <MapPin size={18} color="#cbd5e1" />}
                        <span style={{ fontSize: '14px', fontWeight: '600', color: post.status === 1 ? '#1e293b' : '#94a3b8' }}>{post.post_name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {post.status === 1 ? <span style={styles.timeBadge}>{post.check_time}</span> : (
                          <button onClick={() => handleDeleteSingle(post.post_id, post.post_name)} style={styles.btnTrashSingle}><Trash2 size={16} /></button>
                        )}
                      </div>
                    </div>
                  )) : <p style={styles.emptyText}>Belum ada misi.</p>}
                </div>
                <div style={styles.modalFooterActions}>
                  <button onClick={handleEditInitiate} style={styles.btnEditAction}><Edit3 size={16}/> Edit</button>
                  <button onClick={handleDeleteAllMissions} style={styles.btnDeleteAction}><Trash2 size={16}/> Kosongkan</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" },
  headerFlex: { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '30px' },
  barGold: { width: '6px', height: '45px', backgroundColor: '#b08d00', borderRadius: '10px' },
  title: { color: "#1e293b", fontWeight: "900", fontSize: '28px', margin: 0 },
  subtitle: { color: "#64748b", fontSize: "14px", margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" },
  
  /* ✅ Cursor card diubah ke default karena sudah tidak ada fungsi klik */
  card: { backgroundColor: "#fff", padding: "25px", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", cursor: 'default' },
  
  cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" },
  avatarMini: { width: 36, height: 36, backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#064e3b' },
  name: { fontWeight: "800", fontSize: "16px", color: "#1e293b" },
  badgeDone: { backgroundColor: "#dcfce7", color: "#065f46", padding: "5px 12px", borderRadius: "20px", fontSize: "10px", fontWeight: "800" },
  badgeProcess: { backgroundColor: "#fffbeb", color: "#b08d00", padding: "5px 12px", borderRadius: "20px", fontSize: "10px", fontWeight: "800" },
  progressBg: { backgroundColor: "#f1f5f9", height: "12px", borderRadius: "10px", overflow: "hidden", margin: '10px 0' },
  progressFill: { height: "100%", transition: "width 0.8s ease" },
  detail: { display: "flex", justifyContent: "space-between", fontSize: "12px", marginTop: "12px", color: "#64748b" },
  
  /* ✅ Styling tombol ditingkatkan (menggunakan elemen button asli) */
  warningBtn: { 
    width: '100%', 
    marginTop: "20px", 
    fontSize: "13px", 
    color: "#fff", 
    fontWeight: "800", 
    textAlign: 'center', 
    backgroundColor: '#b08d00', 
    padding: '12px', 
    borderRadius: '14px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '8px', 
    border: 'none', 
    cursor: 'pointer',
    transition: '0.2s transform active',
  },
  activeTag: { 
    width: '100%', 
    marginTop: "20px", 
    fontSize: "13px", 
    color: "#064e3b", 
    fontWeight: "800", 
    textAlign: 'center', 
    padding: '12px', 
    backgroundColor: '#f0fdf4', 
    borderRadius: '14px', 
    border: '1px solid #dcfce7', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '8px', 
    cursor: 'pointer' 
  },
  
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', padding: '30px', borderRadius: '28px', width: '90%', maxWidth: '450px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  btnClose: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' },
  postList: { maxHeight: '300px', overflowY: 'auto', marginBottom: '25px', padding: '10px', border: '1px solid #f1f5f9', borderRadius: '16px', backgroundColor: '#f8fafc' },
  postItem: { display: 'flex', gap: '15px', padding: '12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '14px', fontWeight: '700' },
  checkbox: { accentColor: '#064e3b', width: '18px', height: '18px' },
  btnConfirm: { width: '100%', backgroundColor: '#064e3b', color: '#fff', border: 'none', padding: '16px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f8fafc' },
  scrollArea: { maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' },
  timeBadge: { fontSize: '10px', color: '#64748b', fontWeight: 'bold', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' },
  modalFooterActions: { display: 'flex', gap: '10px', marginTop: '10px' },
  btnEditAction: { flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#064e3b', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' },
  btnDeleteAction: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#fef2f2', color: '#be123c', border: '1px solid #fee2e2', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' },
  btnTrashSingle: { background: 'none', border: 'none', color: '#be123c', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  loaderCenter: { display: 'flex', justifyContent: 'center', padding: '40px' },
  emptyText: { textAlign: 'center', padding: '20px', color: '#94a3b8' }
};