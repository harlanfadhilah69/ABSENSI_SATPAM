import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import SatpamNavbar from "../../components/satpam/SatpamNavbar";

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
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <SatpamNavbar />

      <div style={styles.container}>
        <button 
          onClick={() => navigate("/satpam")} 
          style={styles.btnBack}
        >
          ⬅️ Kembali ke Histori
        </button>

        <div style={styles.headerCard}>
          <h2 style={styles.title}>Misi Patroli Hari Ini 🛡️</h2>
          <p style={styles.subtitle}>RS Islam Fatimah Cilacap</p>
          
          <div style={styles.progressContainer}>
            <div style={styles.progressText}>
              <span>Progress Keamanan</span>
              <span>{stats.progress}%</span>
            </div>
            <div style={styles.progressBarBg}>
              <div style={{ ...styles.progressBarFill, width: `${stats.progress}%` }}></div>
            </div>
            <p style={styles.statDetail}>
              {stats.completed} dari {stats.total} Pos Selesai
            </p>
          </div>
        </div>

        <div style={styles.missionList}>
          <h3 style={styles.listTitle}>Daftar Checkpoint</h3>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>Memuat tugas...</p>
          ) : missions.length === 0 ? (
            <p style={styles.emptyText}>Tidak ada misi hari ini.</p>
          ) : (
            missions.map((misi) => (
              <div 
                key={misi.id} 
                style={misi.status === 'completed' ? styles.cardDone : styles.cardPending}
              >
                <div style={styles.cardInfo}>
                  <span style={styles.postName}>{misi.post_name}</span>
                  <span style={styles.location}>{misi.location_desc || "Lantai 1"}</span>
                </div>
                
                <div style={styles.cardAction}>
                  {misi.status === 'completed' ? (
                    <span style={styles.badgeDone}>✅ SELESAI</span>
                  ) : (
                    // ✅ Link ini sekarang sinkron dengan AppRoutes.jsx
                    <button 
                      onClick={() => navigate(`/satpam/scan?post=${misi.post_id}`)} 
                      style={styles.btnScan}
                    >
                      SCAN QR
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.footer}>
          <p>"Keamanan RS adalah tanggung jawab kita bersama."</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "'Inter', sans-serif" },
  btnBack: { marginBottom: '20px', border: 'none', background: 'none', color: '#064e3b', fontWeight: '800', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center' },
  headerCard: { backgroundColor: "#064e3b", color: "#fff", padding: "25px", borderRadius: "20px", boxShadow: "0 10px 15px rgba(6, 78, 59, 0.2)", marginBottom: "30px" },
  title: { margin: 0, fontSize: "22px", fontWeight: "800" },
  subtitle: { margin: "5px 0 20px", fontSize: "14px", opacity: 0.8 },
  progressContainer: { marginTop: "10px" },
  progressText: { display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "700", marginBottom: "8px" },
  progressBarBg: { backgroundColor: "rgba(255,255,255,0.2)", height: "12px", borderRadius: "10px", overflow: "hidden" },
  progressBarFill: { backgroundColor: "#fbbf24", height: "100%", transition: "width 0.5s ease-in-out" },
  statDetail: { marginTop: "10px", fontSize: "12px", textAlign: "right", opacity: 0.9 },
  missionList: { display: "flex", flexDirection: "column", gap: "15px" },
  listTitle: { fontSize: "16px", fontWeight: "800", color: "#1e293b", marginBottom: "5px" },
  cardPending: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px", backgroundColor: "#fff", borderRadius: "16px", borderLeft: "6px solid #fbbf24", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" },
  cardDone: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px", backgroundColor: "#f0fdf4", borderRadius: "16px", borderLeft: "6px solid #22c55e", opacity: 0.9 },
  postName: { display: "block", fontSize: "15px", fontWeight: "800", color: "#1e293b" },
  location: { fontSize: "12px", color: "#64748b" },
  btnScan: { backgroundColor: "#064e3b", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "10px", fontWeight: "700", fontSize: "12px", cursor: "pointer" },
  badgeDone: { color: "#166534", fontWeight: "800", fontSize: "12px" },
  footer: { textAlign: "center", marginTop: "40px", color: "#94a3b8", fontStyle: "italic", fontSize: "12px" },
  emptyText: { textAlign: "center", padding: "40px", color: "#94a3b8" }
};