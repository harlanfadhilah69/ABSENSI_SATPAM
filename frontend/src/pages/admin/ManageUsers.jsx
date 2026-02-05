import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminNavbar from "../../components/admin/AdminNavbar";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      alert("Gagal mengambil daftar user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "satpam" : "admin";
    if (!window.confirm(`Ubah role user ini menjadi ${newRole.toUpperCase()}?`)) return;
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      fetchUsers();
    } catch (err) { alert("Gagal memperbarui role"); }
  };

  const resetPassword = async (id) => {
    const newPass = window.prompt("Masukkan password baru untuk user ini:");
    if (!newPass) return;
    try {
      await api.put(`/admin/users/${id}/password`, { password: newPass });
      alert("Password berhasil diubah!");
    } catch (err) { alert("Gagal mengubah password"); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Hapus user ini secara permanen?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) { alert("Gagal menghapus user"); }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
          <AdminNavbar />

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Kelola User 👥</h1>
        </div>

        <div style={styles.tableCard}>
          <div style={{ overflowX: "auto" }}>
            <table width="100%" style={styles.table}>
              <thead>
                <tr>
                  <th align="left" style={styles.th}>NAMA</th>
                  <th align="left" style={styles.th}>EMAIL</th>
                  <th align="left" style={styles.th}>USERNAME</th>
                  <th align="left" style={styles.th}>ROLE</th>
                  <th align="center" style={styles.th}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" align="center" style={styles.td}>Memuat data...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="5" align="center" style={styles.td}>Tidak ada user ditemukan</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} style={styles.tr}>
                      <td style={styles.tdNama}>{u.name}</td>
                      <td style={styles.td}>{u.email || "-"}</td>
                      <td style={styles.td}>{u.username}</td>
                      <td style={styles.td}>
                        <span style={u.role === "admin" ? styles.badgeAdmin : styles.badgeSatpam}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td align="center" style={styles.tdAksi}>
                        <div style={styles.actionGroup}>
                          <button onClick={() => toggleRole(u.id, u.role)} style={styles.btnUbah}>Ubah Role</button>
                          <button onClick={() => resetPassword(u.id)} style={styles.btnReset}>Reset Pass</button>
                          <button onClick={() => deleteUser(u.id)} style={styles.btnHapus}>Hapus ▮</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <footer style={styles.footer}>
          <div>© 2026 RS ISLAM FATIMAH SECURITY SYSTEM</div>
          <div style={styles.statusArea}>
             <span style={styles.dot}></span> SYSTEM LIVE &nbsp; SUPPORT &nbsp; LEGAL
          </div>
        </footer>
      </div>
    </div>
  );
}

// --- STYLES DENGAN PAKSAAN FONT ---
const styles = {
  page: { 
    backgroundColor: "#fcfdfe", 
    minHeight: "100vh",
    /* ✅ Paksa font sans-serif modern agar Navbar tidak berubah font-nya */
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
  },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" },
  header: { marginBottom: "30px" },
  title: { fontSize: "28px", fontWeight: "800", color: "#1e293b", letterSpacing: "-0.5px" },
  tableCard: { 
    backgroundColor: "#fff", 
    borderRadius: "15px", 
    border: "1.5px solid #fde68a", 
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
    overflow: "hidden" 
  },
  table: { borderCollapse: "collapse", width: "100%" },
  th: { 
    padding: "20px 25px", 
    fontSize: "12px", 
    color: "#64748b", 
    fontWeight: "800", 
    letterSpacing: "0.5px",
    borderBottom: "1px solid #f1f5f9",
    backgroundColor: "#fff"
  },
  tr: { borderBottom: "1px solid #f8fafc" },
  td: { padding: "18px 25px", fontSize: "14px", color: "#64748b" },
  tdNama: { padding: "18px 25px", fontSize: "14px", color: "#1e293b", fontWeight: "700" },
  tdAksi: { padding: "18px 25px" },
  actionGroup: { display: "flex", gap: "8px", justifyContent: "center" },
  
  badgeSatpam: { padding: "4px 10px", borderRadius: "6px", backgroundColor: "#f0fdf4", color: "#166534", fontSize: "10px", fontWeight: "800", border: "1px solid #dcfce7" },
  badgeAdmin: { padding: "4px 10px", borderRadius: "6px", backgroundColor: "#fff1f2", color: "#be123c", fontSize: "10px", fontWeight: "800", border: "1px solid #ffe4e6" },

  btnUbah: { padding: "8px 14px", backgroundColor: "#064e3b", color: "#fff", border: "none", borderRadius: "8px", fontSize: "11px", fontWeight: "700", cursor: "pointer" },
  btnReset: { padding: "8px 14px", backgroundColor: "#b08d00", color: "#fff", border: "none", borderRadius: "8px", fontSize: "11px", fontWeight: "700", cursor: "pointer" },
  btnHapus: { padding: "8px 14px", backgroundColor: "#fff", color: "#be123c", border: "1.5px solid #ffe4e6", borderRadius: "8px", fontSize: "11px", fontWeight: "700", cursor: "pointer" },

  footer: { marginTop: "50px", display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "10px", fontWeight: "600", letterSpacing: "0.5px" },
  statusArea: { display: "flex", alignItems: "center", gap: "15px" },
  dot: { width: "6px", height: "6px", backgroundColor: "#10b981", borderRadius: "50%", display: "inline-block" }
};