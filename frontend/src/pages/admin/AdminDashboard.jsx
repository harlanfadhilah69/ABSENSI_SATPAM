import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { 
  AlertTriangle, 
  CheckCircle, 
  MapPin, 
  ClipboardList,
  ShieldCheck,
  Zap
} from "lucide-react"; 

export default function AdminDashboard() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ 
    todayCount: 0, 
    recentActivities: [], 
    alerts: [] 
  });

  // ✅ State untuk deteksi Mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); 
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get("/admin/dashboard-stats"); 
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

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <AdminNavbar />

      <div style={{ 
        maxWidth: 1200, 
        margin: "0 auto", 
        padding: isMobile ? "20px 15px" : "40px 20px" // ✅ Padding lebih kecil di HP
      }}>
        
        {/* HEADER SECTION */}
        <div style={{ 
          ...styles.headerFlex, 
          flexDirection: isMobile ? "column" : "row", // ✅ Stack ke bawah di HP
          alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? "15px" : "0"
        }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ ...styles.barGold, height: isMobile ? "40px" : "50px" }}></div>
            <div>
              <h1 style={{ ...styles.mainTitle, fontSize: isMobile ? "22px" : "32px" }}>
                Admin Dashboard <span style={{color: '#064e3b'}}>👨🏻‍💻</span>
              </h1>
              <p style={styles.subTitle}>Sistem Monitoring RS Islam Fatimah</p>
            </div>
          </div>
          <div style={styles.badgeLive}><Zap size={12} fill="#ef4444" color="#ef4444"/> LIVE MONITORING</div>
        </div>

        {/* STATS CARDS (GRID RESPONSIVE) */}
        <div style={{ 
          ...styles.statsGrid, 
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" // ✅ Jadi 1 kolom di HP
        }}>
          <div style={styles.statsCardGold}>
            <div style={styles.iconBoxGold}><ClipboardList size={isMobile ? 24 : 28} /></div>
            <div>
              <div style={styles.statsLabelLight}>Laporan Hari Ini</div>
              <div style={{ ...styles.statsValueLight, fontSize: isMobile ? "20px" : "26px" }}>
                {data.todayCount} Laporan
              </div>
            </div>
          </div>
          <div style={styles.statsCardGreen}>
            <div style={styles.iconBoxGreen}><ShieldCheck size={isMobile ? 24 : 28} /></div>
            <div>
              <div style={styles.statsLabelLight}>Status Keamanan</div>
              <div style={{ ...styles.statsValueLight, fontSize: isMobile ? "20px" : "26px" }}>
                Sistem Online
              </div>
            </div>
          </div>
        </div>

        {/* PANELS (GRID RESPONSIVE) */}
        <div style={{ 
          ...styles.alertGrid, 
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(400px, 1fr))" 
        }}>
          
          {/* PANEL KIRI */}
          <div style={styles.panelCard}>
            <div style={{ ...styles.panelHeader, borderBottom: "4px solid #b08d00" }}>
              <AlertTriangle size={18} color="#b08d00" />
              <span style={{ fontWeight: "800", color: "#854d0e", fontSize: isMobile ? "13px" : "14px" }}>
                Antrian Misi (Belum Patroli)
              </span>
            </div>
            <div style={styles.panelBody}>
              {data.alerts.length === 0 ? (
                <div style={styles.emptyMsgGreen}>✅ Semua jadwal terpenuhi.</div>
              ) : (
                data.alerts.map((a, i) => (
                  <div key={i} style={styles.alertItemGold}>
                    <MapPin size={14} />
                    <span style={{ fontSize: isMobile ? "12px" : "14px" }}>
                      <b>{a.satpam_name}</b> belum datang ke <b>{a.post_name}</b>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PANEL KANAN */}
          <div style={styles.panelCard}>
            <div style={{ ...styles.panelHeader, borderBottom: "4px solid #064e3b" }}>
              <CheckCircle size={18} color="#064e3b" />
              <span style={{ fontWeight: "800", color: "#064e3b", fontSize: isMobile ? "13px" : "14px" }}>
                Log Aktivitas (Sudah Patroli)
              </span>
            </div>
            <div style={styles.panelBody}>
              {data.recentActivities.length === 0 ? (
                <div style={styles.emptyMsgGray}>Menunggu laporan...</div>
              ) : (
                data.recentActivities.map((r, i) => (
                  <div key={i} style={styles.logItem}>
                    <div style={{ ...styles.logText, fontSize: isMobile ? "12px" : "14px" }}>
                      <span style={{ color: '#064e3b', fontWeight: '800' }}>{r.satpam_name}</span> mengecek <b>{r.post_name}</b>
                    </div>
                    <div style={styles.logTime}>
                      {r.created_at.includes('T') ? r.created_at.split('T')[1].substring(0, 8) : r.created_at}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        <footer style={styles.footerStyle}>
          © 2026 <b>RS Islam Fatimah Cilacap</b>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  headerFlex: { display: "flex", justifyContent: "space-between", marginBottom: 30 },
  barGold: { width: '6px', backgroundColor: '#b08d00', borderRadius: '10px' },
  mainTitle: { fontWeight: "900", color: "#1e293b", margin: 0 },
  subTitle: { color: "#64748b", marginTop: 5, fontSize: 13, fontWeight: '500' },
  badgeLive: { backgroundColor: '#fff', padding: '6px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px', alignSelf: 'flex-start' },
  statsGrid: { display: "grid", gap: 15, marginBottom: 25 },
  statsCardGold: { background: "linear-gradient(135deg, #b08d00 0%, #d97706 100%)", padding: 20, borderRadius: 18, display: "flex", alignItems: "center", gap: 15 },
  statsCardGreen: { background: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)", padding: 20, borderRadius: 18, display: "flex", alignItems: "center", gap: 15 },
  iconBoxGold: { backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", padding: '12px', borderRadius: '12px' },
  iconBoxGreen: { backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", padding: '12px', borderRadius: '12px' },
  statsLabelLight: { fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: "600", textTransform: 'uppercase' },
  statsValueLight: { fontWeight: "900", color: "#fff" },
  alertGrid: { display: "grid", gap: 20 },
  panelCard: { backgroundColor: "#fff", borderRadius: 20, border: "1px solid #f1f5f9", overflow: "hidden" },
  panelHeader: { padding: "15px 20px", display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fff" },
  panelBody: { padding: "10px 15px 20px" },
  alertItemGold: { padding: "12px", backgroundColor: "#fffbeb", color: "#854d0e", borderRadius: "10px", marginBottom: "8px", borderLeft: "5px solid #b08d00", display: 'flex', alignItems: 'center', gap: '10px' },
  logItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f8fafc" },
  logText: { color: "#334155" },
  logTime: { fontSize: "10px", color: "#94a3b8", fontWeight: "800", backgroundColor: '#f8fafc', padding: '3px 6px', borderRadius: '5px' },
  emptyMsgGreen: { textAlign: "center", padding: "30px", color: "#059669", fontSize: "13px", fontWeight: "700" },
  emptyMsgGray: { textAlign: "center", padding: "30px", color: "#94a3b8", fontSize: "13px" },
  footerStyle: { marginTop: 40, paddingBottom: 30, textAlign: "center", color: "#94a3b8", fontSize: 11 }
};