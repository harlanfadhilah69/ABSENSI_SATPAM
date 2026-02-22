import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { 
  AlertTriangle, 
  CheckCircle, 
  MapPin, 
  ClipboardList 
} from "lucide-react"; 

export default function AdminDashboard() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ 
    todayCount: 0, 
    recentActivities: [], 
    alerts: [] 
  });

  const fetchDashboardData = async () => {
    try {
      // ✅ Mengambil data statistik dari rute yang sudah kita perbaiki di backend
      const res = await api.get("/missions/dashboard-stats"); 
      
      if (res.data.success) {
        setData({
          todayCount: res.data.todayCount,
          recentActivities: res.data.recentActivities || [],
          alerts: res.data.alerts || []
        });
      }
    } catch (e) {
      console.error("Gagal sinkronisasi dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // ✅ Refresh otomatis tiap 10 detik agar laporan Carmen langsung masuk
    const interval = setInterval(fetchDashboardData, 10000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <AdminNavbar />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        
        {/* HEADER SECTION */}
        <div style={styles.headerFlex}>
          <div>
            <h1 style={styles.mainTitle}>Admin Dashboard 👨🏻‍💻</h1>
            <p style={styles.subTitle}>Pantau keamanan RSIFC secara real-time.</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
             <button onClick={() => nav("/admin/monitor")} style={styles.btnMonitor}>🛡️ Monitor Misi</button>
             <button onClick={() => nav("/admin/posts")} style={styles.btnPosts}>🏢 Daftar Pos</button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div style={styles.statsGrid}>
          <div style={styles.statsCard}>
            <div style={styles.iconGold}><ClipboardList size={24} /></div>
            <div>
              <div style={styles.statsLabel}>Laporan Hari Ini</div>
              {/* ✅ Angka ini sekarang sinkron dengan tabel patrol_logs */}
              <div style={styles.statsValue}>{data.todayCount} Lap.</div>
            </div>
          </div>
          <div style={styles.statsCard}>
            <div style={styles.iconGreen}><CheckCircle size={24} /></div>
            <div>
              <div style={styles.statsLabel}>Status Sistem</div>
              <div style={styles.statsValue}>Online</div>
            </div>
          </div>
        </div>

        {/* LIVE NOTIFICATION PANELS */}
        <div style={styles.alertGrid}>
          
          {/* PANEL KIRI: BELUM PATROLI (RED) */}
          <div style={styles.panelCard}>
            <div style={{ ...styles.panelHeader, borderBottom: "3px solid #ef4444" }}>
              <AlertTriangle size={18} color="#ef4444" />
              <span style={{ fontWeight: "800", color: "#b91c1c" }}>Belum Terlaksana (Belum Patroli)</span>
            </div>
            <div style={styles.panelBody}>
              {data.alerts.length === 0 ? (
                <div style={styles.emptyMsgGreen}>✅ Semua pos terjadwal sudah aman.</div>
              ) : (
                data.alerts.map((a, i) => (
                  <div key={i} style={styles.alertItem}>
                    ⚠️ <b>{a.satpam_name}</b> belum patroli di <b>{a.post_name}</b>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PANEL KANAN: AKTIVITAS TERBARU (GREEN) */}
          <div style={styles.panelCard}>
            <div style={{ ...styles.panelHeader, borderBottom: "3px solid #10b981" }}>
              <CheckCircle size={18} color="#10b981" />
              <span style={{ fontWeight: "800", color: "#064e3b" }}>Aktivitas Terbaru (Sudah Patroli)</span>
            </div>
            <div style={styles.panelBody}>
              {data.recentActivities.length === 0 ? (
                <div style={styles.emptyMsgGray}>Belum ada aktivitas terekam.</div>
              ) : (
                data.recentActivities.map((r, i) => (
                  <div key={i} style={styles.logItem}>
                    <div style={styles.logText}>
                      <b>{r.satpam_name}</b> memantau <b>{r.post_name}</b>
                    </div>
                    <div style={styles.logTime}>
                      {/* ✅ PERBAIKAN JAM: Ambil langsung dari string created_at database */}
                      {r.created_at.includes('T') ? r.created_at.split('T')[1].substring(0, 8) : r.created_at}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        <footer style={styles.footerStyle}>
          © 2026 <b>RS Islam Fatimah</b>. Security System.
        </footer>
      </div>
    </div>
  );
}

const styles = {
  headerFlex: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
  mainTitle: { fontSize: 32, fontWeight: "800", color: "#1e293b", margin: 0 },
  subTitle: { color: "#64748b", marginTop: 5, fontSize: 14 },
  btnMonitor: { backgroundColor: "#b08d00", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: "700", cursor: "pointer" },
  btnPosts: { backgroundColor: "#064e3b", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: "700", cursor: "pointer" },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 30 },
  statsCard: { backgroundColor: "#fff", padding: 25, borderRadius: 15, display: "flex", alignItems: "center", gap: 15, border: "1px solid #f1f5f9" },
  statsLabel: { fontSize: 12, color: "#64748b", fontWeight: "600" },
  statsValue: { fontSize: 22, fontWeight: "800", color: "#1e293b" },
  iconGold: { color: "#d97706" },
  iconGreen: { color: "#059669" },
  alertGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  panelCard: { backgroundColor: "#fff", borderRadius: 20, border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" },
  panelHeader: { padding: "18px 20px", display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fff" },
  panelBody: { padding: "15px 20px" },
  alertItem: { padding: "12px", backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: "10px", fontSize: "13px", marginBottom: "8px", borderLeft: "4px solid #ef4444" },
  logItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f8fafc" },
  logText: { fontSize: "13px", color: "#334155" },
  logTime: { fontSize: "11px", color: "#94a3b8", fontWeight: "700" },
  emptyMsgGreen: { textAlign: "center", padding: "30px", color: "#059669", fontSize: "13px", fontWeight: "700" },
  emptyMsgGray: { textAlign: "center", padding: "30px", color: "#94a3b8", fontSize: "13px" },
  footerStyle: { marginTop: 50, paddingBottom: 30, textAlign: "center", color: "#94a3b8", fontSize: 12 }
};