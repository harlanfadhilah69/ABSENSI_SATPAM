import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminNavbar from "../../components/admin/AdminNavbar";

export default function MonitorMisi() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Di dalam MonitorMisi.jsx
const fetchStatus = async () => {
  try {
    setLoading(true);
    // ✅ PERBAIKAN: Jalurnya sekarang adalah /missions/monitor
    const res = await api.get("/missions/monitor"); 
    setData(res.data.data || []);
  } catch (err) {
    console.error("Gagal monitor misi:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <AdminNavbar />
      
      <div style={styles.container}>
        <h2 style={styles.title}>Monitoring Patroli Satpam 🛡️</h2>
        <p style={styles.subtitle}>Status real-time hari ini di RSI Fatimah Cilacap</p>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Memuat status satpam...</p>
        ) : data.length === 0 ? (
          <div style={styles.emptyBox}>Belum ada satpam yang terdaftar atau melakukan login hari ini.</div>
        ) : (
          <div style={styles.grid}>
            {data.map((item) => (
              <div key={item.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.name}>{item.name}</span>
                  <span style={item.progress === 100 ? styles.badgeDone : styles.badgeProcess}>
                    {item.progress === 100 ? "SELESAI" : "PROSES"}
                  </span>
                </div>

                <div style={styles.progressBg}>
                  <div style={{ ...styles.progressFill, width: `${item.progress || 0}%` }} />
                </div>

                <div style={styles.detail}>
                  <span>Progress: {item.progress || 0}%</span>
                  <span>{item.completed_pos || 0}/{item.total_pos || 0} Pos Selesai</span>
                </div>

                {item.total_pos === 0 && (
                  <p style={styles.warning}>⚠️ Belum Login / Misi Belum Digenerate</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "30px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif" },
  title: { color: "#1e293b", fontWeight: "800", marginBottom: "5px" },
  subtitle: { color: "#64748b", fontSize: "14px", marginBottom: "30px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" },
  card: { backgroundColor: "#fff", padding: "25px", borderRadius: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" },
  cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" },
  name: { fontWeight: "800", fontSize: "16px", color: "#1e293b" },
  badgeDone: { backgroundColor: "#dcfce7", color: "#166534", padding: "5px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "800" },
  badgeProcess: { backgroundColor: "#fef9c3", color: "#854d0e", padding: "5px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "800" },
  progressBg: { backgroundColor: "#f1f5f9", height: "12px", borderRadius: "10px", overflow: "hidden" },
  progressFill: { backgroundColor: "#064e3b", height: "100%", transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)" },
  detail: { display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "12px", color: "#64748b", fontWeight: "600" },
  warning: { marginTop: "15px", fontSize: "11px", color: "#ef4444", fontWeight: "800", textAlign: 'center', backgroundColor: '#fef2f2', padding: '8px', borderRadius: '8px' },
  emptyBox: { textAlign: 'center', padding: '50px', color: '#94a3b8', backgroundColor: '#fff', borderRadius: '20px' }
};