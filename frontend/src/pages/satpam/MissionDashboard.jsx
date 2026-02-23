import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import SatpamNavbar from "../../components/satpam/SatpamNavbar";
import { 
  Shield, 
  ArrowLeft, 
  QrCode, 
  CheckCircle2, 
  MapPin, 
  Loader2,
  Info
} from "lucide-react";

export default function MissionDashboard() {
  const [missions, setMissions] = useState([]);
  const [stats, setStats] = useState({ progress: 0, completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/missions/my-missions");
      setMissions(res.data.data || []);
      setStats({
        progress: res.data.progress,
        completed: res.data.completed_pos,
        total: res.data.total_pos
      });
    } catch (err) {
      console.error("Gagal memuat misi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <SatpamNavbar />

      <div style={styles.container}>
        {/* ✅ TOMBOL KEMBALI DENGAN AKSEN HIJAU */}
        <button 
          onClick={() => navigate("/satpam")} 
          style={styles.btnBack}
        >
          <ArrowLeft size={18} /> Kembali ke Beranda
        </button>

        {/* ✅ HEADER CARD (GRADASI HIJAU TUA) */}
        <div style={styles.headerCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
             <div style={styles.iconCircle}><Shield size={24} color="#b08d00" fill="#b08d00" /></div>
             <div>
                <h2 style={styles.title}>Misi Patroli Hari Ini</h2>
                <p style={styles.subtitle}>RS Islam Fatimah Cilacap</p>
             </div>
          </div>
          
          <div style={styles.progressSection}>
            <div style={styles.progressText}>
              <span>Capaian Keamanan</span>
              <span style={{ fontWeight: '900' }}>{stats.progress}%</span>
            </div>
            <div style={styles.progressBarBg}>
              <div style={{ ...styles.progressBarFill, width: `${stats.progress}%` }}></div>
            </div>
            <div style={styles.statDetail}>
              <CheckCircle2 size={14} />
              <span><b>{stats.completed}</b> dari <b>{stats.total}</b> Pos Selesai</span>
            </div>
          </div>
        </div>

        {/* --- LIST SECTION --- */}
        <div style={styles.missionList}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
             <div style={styles.barGold}></div>
             <h3 style={styles.listTitle}>Daftar Titik Checkpoint</h3>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
               <Loader2 className="animate-spin" size={32} color="#064e3b" style={{ margin: '0 auto' }} />
               <p style={{ color: '#64748b', marginTop: '10px', fontSize: '14px' }}>Menyiapkan rute patroli...</p>
            </div>
          ) : missions.length === 0 ? (
            <div style={styles.emptyContainer}>
               <Info size={40} color="#cbd5e1" />
               <p style={styles.emptyText}>Belum ada penugasan misi hari ini.</p>
            </div>
          ) : (
            missions.map((misi) => (
              <div 
                key={misi.id} 
                style={misi.status === 'completed' ? styles.cardDone : styles.cardPending}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={misi.status === 'completed' ? styles.iconBoxDone : styles.iconBoxPending}>
                    {misi.status === 'completed' ? <CheckCircle2 size={20} /> : <MapPin size={20} />}
                  </div>
                  <div>
                    <span style={styles.postName}>{misi.post_name}</span>
                    <span style={styles.location}>{misi.location_desc || "RSIFC Security Point"}</span>
                  </div>
                </div>
                
                <div style={styles.cardAction}>
                  {misi.status === 'completed' ? (
                    <div style={styles.badgeDone}>TERPANTAU</div>
                  ) : (
                    <button 
                      onClick={() => navigate(`/satpam/scan?post=${misi.post_id}`)} 
                      style={styles.btnScan}
                    >
                      <QrCode size={16} /> SCAN
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.footer}>
          <p>"Keamanan RS adalah dedikasi kita bersama."</p>
          <div style={styles.line}></div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "30px 20px", maxWidth: "700px", margin: "0 auto" },
  barGold: { width: '4px', height: '20px', backgroundColor: '#b08d00', borderRadius: '10px' },
  btnBack: { marginBottom: '25px', border: 'none', background: 'none', color: '#064e3b', fontWeight: '800', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' },
  
  // HEADER
  headerCard: { 
    background: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)", 
    color: "#fff", padding: "30px", borderRadius: "28px", 
    boxShadow: "0 10px 25px rgba(6, 78, 59, 0.3)", marginBottom: "35px" 
  },
  iconCircle: { width: '45px', height: '45px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  title: { margin: 0, fontSize: "22px", fontWeight: "900", letterSpacing: '0.5px' },
  subtitle: { margin: "4px 0 0 0", fontSize: "13px", opacity: 0.8, fontWeight: '500' },
  
  progressSection: { marginTop: "25px" },
  progressText: { display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "700", marginBottom: "10px", textTransform: 'uppercase', letterSpacing: '0.5px' },
  progressBarBg: { backgroundColor: "rgba(255,255,255,0.15)", height: "12px", borderRadius: "10px", overflow: "hidden" },
  progressBarFill: { backgroundColor: "#b08d00", height: "100%", transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: '0 0 10px rgba(176,141,0,0.5)' },
  statDetail: { marginTop: "12px", fontSize: "12px", display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', fontWeight: '600' },

  missionList: { display: "flex", flexDirection: "column", gap: "15px" },
  listTitle: { fontSize: "16px", fontWeight: "800", color: "#1e293b", margin: 0 },
  
  // CARDS
  cardPending: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", backgroundColor: "#fff", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" },
  cardDone: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", backgroundColor: "#f8fafc", borderRadius: "20px", border: "1px solid #e2e8f0", opacity: 0.8 },
  
  iconBoxPending: { width: '42px', height: '42px', backgroundColor: '#fffbeb', color: '#b08d00', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  iconBoxDone: { width: '42px', height: '42px', backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  
  postName: { display: "block", fontSize: "15px", fontWeight: "800", color: "#1e293b" },
  location: { fontSize: "12px", color: "#94a3b8", fontWeight: '500' },
  
  btnScan: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: "#b08d00", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "12px", fontWeight: "800", fontSize: "12px", cursor: "pointer", boxShadow: '0 4px 10px rgba(176,141,0,0.2)' },
  badgeDone: { color: "#166534", fontWeight: "900", fontSize: "11px", backgroundColor: '#dcfce7', padding: '6px 12px', borderRadius: '8px', letterSpacing: '0.5px' },
  
  footer: { textAlign: "center", marginTop: "50px", paddingBottom: '30px' },
  line: { width: '40px', height: '3px', backgroundColor: '#e2e8f0', margin: '15px auto', borderRadius: '10px' },
  emptyContainer: { textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
  emptyText: { color: "#94a3b8", fontSize: '14px', fontWeight: '500' }
};