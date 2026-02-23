import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { CheckCircle, XCircle, Send, User, Loader2, ShieldCheck, MapPin } from "lucide-react";
// ✅ Import SweetAlert2
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
    } catch (err) {
      console.error("Gagal monitor misi:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get("/admin/posts");
      setPosts(res.data?.data || []);
    } catch (e) {
      console.error("Gagal ambil daftar pos");
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchPosts();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const openAssignModal = (satpam) => {
    setSelectedSatpam(satpam);
    setSelectedPostIds([]);
    setShowAssignModal(true);
  };

  const openDetailModal = async (satpam) => {
    setLoadingDetail(true);
    setSelectedDetail(null);
    setShowDetailModal(true);
    try {
      const res = await api.get(`/admin/monitor/detail/${satpam.id}`);
      setSelectedDetail({
        name: satpam.name,
        posts: res.data.data 
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat',
        text: 'Detail progress tidak bisa diambil.',
        confirmButtonColor: '#be123c'
      });
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAssignMission = async () => {
    try {
      if (isAssigning) return; 

      if (!selectedSatpam || selectedPostIds.length === 0) {
        return Swal.fire({
          icon: 'warning',
          title: 'Pilih Lokasi!',
          text: 'Minimal pilih satu pos patroli sebelum mengirim tugas.',
          confirmButtonColor: '#b08d00'
        });
      }

      setIsAssigning(true);

      const res = await api.post("/admin/assign-mission", {
        user_id: selectedSatpam.id,
        post_ids: selectedPostIds
      });
      
      if (res.data) { 
         Swal.fire({
           icon: 'success',
           title: 'Misi Berhasil Dikirim!',
           text: `Tugas patroli untuk ${selectedSatpam.name} sudah aktif.`,
           confirmButtonColor: '#064e3b',
           timer: 2000,
           showConfirmButton: false
         });
         setShowAssignModal(false);
         fetchStatus();
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengirim',
        text: err.response?.data?.message || 'Terjadi gangguan koneksi.',
        confirmButtonColor: '#be123c'
      });
    } finally {
      setIsAssigning(false); 
    }
  };

  const togglePostSelection = (id) => {
    setSelectedPostIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <AdminNavbar />
      
      <div style={styles.container}>
        {/* ✅ HEADER AKSEN EMAS */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '30px' }}>
          <div style={styles.barGold}></div>
          <div>
            <h2 style={styles.title}>Monitoring Patroli Satpam <span style={{color: '#064e3b'}}>🛡️</span></h2>
            <p style={styles.subtitle}>Pantau progress patroli real-time atau berikan tugas baru.</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
             <Loader2 className="animate-spin" size={48} color="#064e3b" style={{ margin: '0 auto' }} />
             <p style={{ color: '#64748b', marginTop: '15px', fontWeight: '600' }}>Menyinkronkan data misi...</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {data.map((item) => (
              <div 
                key={item.id} 
                style={styles.card} 
                onClick={() => item.total_pos === 0 ? openAssignModal(item) : openDetailModal(item)}
              >
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
                  <span style={{color: '#1e293b'}}>Progress: <b>{item.progress || 0}%</b></span>
                  <span>{item.completed_pos || 0}/{item.total_pos || 0} Pos Selesai</span>
                </div>

                {item.total_pos === 0 ? (
                  <div style={styles.warningBtn}>
                    <Send size={14} /> Beri Tugas Hari Ini
                  </div>
                ) : (
                  <div style={styles.activeTag}>
                    <ShieldCheck size={14} /> Misi Aktif (Klik Detail)
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ MODAL PENUGASAN (AKSEN EMAS) */}
      {showAssignModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Tugaskan: <span style={{color: '#b08d00'}}>{selectedSatpam?.name}</span></h3>
              <button onClick={() => setShowAssignModal(false)} style={styles.btnClose}><XCircle/></button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Pilih lokasi patroli untuk shift hari ini:
            </p>
            
            <div style={styles.postList}>
              {posts.filter(post => post.is_active === 1).map(post => (
                <label key={post.id} style={styles.postItem}>
                  <input 
                    type="checkbox" 
                    checked={selectedPostIds.includes(post.id)}
                    onChange={() => togglePostSelection(post.id)}
                    style={{ accentColor: '#064e3b', width: '18px', height: '18px' }}
                  />
                  <span>{post.post_name}</span>
                </label>
              ))}
            </div>

            <button 
               onClick={handleAssignMission} 
               style={{...styles.btnConfirm, opacity: isAssigning ? 0.7 : 1}}
               disabled={isAssigning}
            >
              {isAssigning ? <Loader2 className="animate-spin" size={18}/> : <Send size={18} />} 
              {isAssigning ? "Mengirim..." : "Kirim Perintah Patroli"}
            </button>
          </div>
        </div>
      )}

      {/* ✅ MODAL DETAIL PROGRESS */}
      {showDetailModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#064e3b' }}>Detail: {selectedDetail?.name}</h3>
              <button onClick={() => setShowDetailModal(false)} style={styles.btnClose}><XCircle/></button>
            </div>

            {loadingDetail ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader2 className="animate-spin" size={32} color="#064e3b" />
              </div>
            ) : (
              <div style={{ marginTop: '15px' }}>
                {selectedDetail?.posts?.map((post, idx) => (
                  <div key={idx} style={styles.detailRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {post.status === 1 ? (
                        <CheckCircle size={20} color="#10b981" />
                      ) : (
                        <MapPin size={18} color="#cbd5e1" />
                      )}
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '600',
                        color: post.status === 1 ? '#1e293b' : '#94a3b8' 
                      }}>
                        {post.post_name}
                      </span>
                    </div>
                    {post.status === 1 && (
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                        {post.check_time} 
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" },
  barGold: { width: '6px', height: '45px', backgroundColor: '#b08d00', borderRadius: '10px' },
  title: { color: "#1e293b", fontWeight: "900", marginBottom: "5px", fontSize: '28px' },
  subtitle: { color: "#64748b", fontSize: "14px", fontWeight: '500' },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" },
  
  card: { backgroundColor: "#fff", padding: "25px", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", cursor: 'pointer', transition: '0.3s all' },
  cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" },
  avatarMini: { width: 36, height: 36, backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#064e3b' },
  name: { fontWeight: "800", fontSize: "16px", color: "#1e293b" },
  
  badgeDone: { backgroundColor: "#dcfce7", color: "#065f46", padding: "5px 12px", borderRadius: "20px", fontSize: "10px", fontWeight: "800" },
  badgeProcess: { backgroundColor: "#fffbeb", color: "#b08d00", padding: "5px 12px", borderRadius: "20px", fontSize: "10px", fontWeight: "800" },
  
  progressBg: { backgroundColor: "#f1f5f9", height: "12px", borderRadius: "10px", overflow: "hidden", margin: '10px 0' },
  progressFill: { height: "100%", transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)" },
  
  detail: { display: "flex", justifyContent: "space-between", fontSize: "12px", marginTop: "12px", color: "#64748b", fontWeight: "600" },
  
  warningBtn: { marginTop: "20px", fontSize: "13px", color: "#fff", fontWeight: "800", textAlign: 'center', backgroundColor: '#b08d00', padding: '12px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(176,141,0,0.2)' },
  activeTag: { marginTop: "20px", fontSize: "13px", color: "#064e3b", fontWeight: "800", textAlign: 'center', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '14px', border: '1px solid #dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', padding: '30px', borderRadius: '28px', width: '90%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  btnClose: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' },
  
  postList: { maxHeight: '250px', overflowY: 'auto', marginBottom: '25px', padding: '10px', border: '1px solid #f1f5f9', borderRadius: '16px', backgroundColor: '#f8fafc' },
  postItem: { display: 'flex', gap: '15px', padding: '12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#334155' },
  btnConfirm: { width: '100%', backgroundColor: '#064e3b', color: '#fff', border: 'none', padding: '16px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(6,78,59,0.3)' },
  
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f8fafc' }
};