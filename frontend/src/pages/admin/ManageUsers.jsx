import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminNavbar from "../../components/admin/AdminNavbar";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE MODAL ---
  const [modal, setModal] = useState({
    show: false,
    type: "", 
    title: "",
    message: "",
    userData: null,
    inputValue: ""
  });

  // --- STATE NOTIFIKASI ---
  const [notif, setNotif] = useState({ show: false, status: "", message: "" });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      showNotif("error", "Gagal mengambil daftar user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const showNotif = (status, msg) => {
    setNotif({ show: true, status, message: msg });
    setTimeout(() => setNotif({ show: false, status: "", message: "" }), 3000);
  };

  const openRoleModal = (user) => {
    const newRole = user.role === "admin" ? "satpam" : "admin";
    setModal({
      show: true, type: "role", title: "Ubah Hak Akses",
      message: `Ubah peran user "${user.name}" menjadi ${newRole.toUpperCase()}?`,
      userData: { ...user, newRole }
    });
  };

  const openPasswordModal = (user) => {
    setModal({
      show: true, type: "password", title: "Reset Password",
      message: `Masukkan password baru untuk user "${user.username}":`,
      userData: user, inputValue: ""
    });
  };

  const openDeleteModal = (user) => {
    setModal({
      show: true, type: "delete", title: "Hapus User",
      message: `Hapus akun "${user.name}" secara permanen?`,
      userData: user
    });
  };

  const handleConfirmAction = async () => {
    const { type, userData, inputValue } = modal;
    
    try {
      if (type === "role") {
        await api.put(`/admin/users/${userData.id}/role`, { role: userData.newRole });
        showNotif("success", "Hak akses berhasil diperbarui");
      } 
      else if (type === "password") {
        if (!inputValue) return showNotif("error", "Password tidak boleh kosong!");
        await api.put(`/admin/users/${userData.id}/password`, { password: inputValue });
        showNotif("success", "Password berhasil diubah!");
      } 
      else if (type === "delete") {
        await api.delete(`/admin/users/${userData.id}`);
        showNotif("success", "User berhasil dihapus permanent");
      }
      
      setModal({ ...modal, show: false });
      fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal memproses permintaan";
      setModal({ ...modal, show: false });
      showNotif("error", `Gagal: ${errorMsg}`);
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <AdminNavbar />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 15px" : "40px 20px" }}>
        
        {/* --- HEADER SECTION DENGAN AKSEN EMAS BERDIRI --- */}
        <div style={{ marginBottom: 30, display: "flex", gap: "15px", alignItems: "flex-start" }}>
          {/* Aksen emas vertikal */}
          <div style={{ width: "6px", backgroundColor: "#b08d00", alignSelf: "stretch", borderRadius: "2px" }}></div>
          <div>
            <h1 style={{ fontSize: isMobile ? 26 : 32, fontWeight: "800", color: "#1e293b", margin: 0 }}>Kelola User 👥</h1>
            <p style={{ color: "#64748b", fontSize: 14 }}>Manajemen personil RS Islam Fatimah</p>
          </div>
        </div>

        {/* --- CARD CONTAINER DENGAN HEADER HIJAU & AKSEN EMAS --- */}
        <div style={styles.cardContainer}>
          {loading ? (
            <div style={{ padding: 50, textAlign: 'center' }}>Memuat...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              {isMobile ? (
                <div style={{ padding: '10px' }}>
                  {users.map((u) => (
                    <div key={u.id} style={styles.mobileCard}>
                      <div style={styles.mobileRow}><span style={styles.mobileLabel}>NAMA</span><span style={{ fontWeight: '800' }}>{u.name}</span></div>
                      <div style={styles.mobileRow}><span style={styles.mobileLabel}>ROLE</span><span style={u.role === "admin" ? styles.badgeAdmin : styles.badgeSatpam}>{u.role.toUpperCase()}</span></div>
                      <div style={styles.mobileActions}>
                        <button onClick={() => openRoleModal(u)} style={styles.btnUbahMobile}>Role</button>
                        <button onClick={() => openPasswordModal(u)} style={styles.btnResetMobile}>Pass</button>
                        <button onClick={() => openDeleteModal(u)} style={styles.btnHapusMobile}>Hapus</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <table width="100%" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    {/* Header Tabel Hijau dengan garis emas atas */}
                    <tr style={styles.tableHeader}>
                      <th align="left" style={styles.thStyle}>NAMA LENGKAP</th>
                      <th align="left" style={styles.thStyle}>USERNAME</th>
                      <th align="center" style={styles.thStyle}>HAK AKSES</th>
                      <th align="center" style={styles.thStyle}>TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={styles.trStyle}>
                        <td style={{ ...styles.tdStyle, fontWeight: '700' }}>{u.name}</td>
                        <td style={styles.tdStyle}>{u.username}</td>
                        <td align="center" style={styles.tdStyle}><span style={u.role === "admin" ? styles.badgeAdmin : styles.badgeSatpam}>{u.role.toUpperCase()}</span></td>
                        <td style={styles.tdStyle}>
                          <div style={styles.actionGroupWeb}>
                            <button onClick={() => openRoleModal(u)} style={styles.btnUbah}>Ubah Role</button>
                            <button onClick={() => openPasswordModal(u)} style={styles.btnReset}>Reset Pass</button>
                            <button onClick={() => openDeleteModal(u)} style={styles.btnHapus}>Hapus</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL POP-UP KONFIRMASI --- */}
      {modal.show && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={modal.type === 'delete' ? styles.modalIconRed : styles.modalIconGold}>
              {modal.type === 'delete' ? '🗑️' : modal.type === 'password' ? '🔑' : '👤'}
            </div>
            <h3 style={styles.modalTitle}>{modal.title}</h3>
            <p style={styles.modalBody}>{modal.message}</p>
            {modal.type === "password" && (
              <input 
                type="text" 
                placeholder="Ketik password baru..." 
                style={styles.modalInput} 
                value={modal.inputValue} 
                onChange={(e) => setModal({ ...modal, inputValue: e.target.value })} 
              />
            )}
            <div style={styles.modalFooter}>
              <button onClick={() => setModal({ ...modal, show: false })} style={styles.btnCancel}>Batal</button>
              <button onClick={handleConfirmAction} style={modal.type === 'delete' ? styles.btnConfirmRed : styles.btnConfirmGreen}>Konfirmasi</button>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING NOTIFICATION --- */}
      {notif.show && (
        <div style={{...styles.notifToast, backgroundColor: notif.status === "success" ? "#064e3b" : "#be123c"}}>
          {notif.status === "success" ? "✅" : "❌"} {notif.message}
        </div>
      )}

      <footer style={styles.footer}>© 2026 <b>RS ISLAM FATIMAH</b></footer>
    </div>
  );
}

const styles = {
  // Card Container dengan sudut tumpul dan overflow hidden agar header tidak meluber
  cardContainer: { 
    backgroundColor: "#fff", 
    borderRadius: "16px", 
    overflow: 'hidden', 
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)", 
    marginBottom: 25 
  },
  
  // Header Tabel: Background Hijau dengan garis atas Emas
  tableHeader: { 
    backgroundColor: "#064e3b", 
    borderTop: '6px solid #b08d00' 
  },
  
  // Th Style: Teks Putih agar kontras dengan background hijau
  thStyle: { 
    padding: "18px 25px", 
    fontSize: "11px", 
    color: "#fff", 
    fontWeight: "800", 
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  
  tdStyle: { padding: "18px 25px", fontSize: "14px", borderBottom: "1px solid #f8fafc" },
  trStyle: { transition: 'background 0.2s' },
  actionGroupWeb: { display: "flex", gap: "8px", justifyContent: "center" },
  mobileCard: { padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '10px' },
  mobileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  mobileLabel: { fontSize: '10px', fontWeight: '800', color: '#94a3b8' },
  mobileActions: { display: 'flex', gap: '8px', marginTop: '10px' },
  badgeSatpam: { padding: "4px 10px", borderRadius: "6px", backgroundColor: "#f0fdf4", color: "#166534", fontSize: "10px", fontWeight: "800" },
  badgeAdmin: { padding: "4px 10px", borderRadius: "6px", backgroundColor: "#fff1f2", color: "#be123c", fontSize: "10px", fontWeight: "800" },
  btnUbah: { padding: "8px 14px", backgroundColor: "#064e3b", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: '700' },
  btnReset: { padding: "8px 14px", backgroundColor: "#b08d00", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: '700' },
  btnHapus: { padding: "8px 14px", backgroundColor: "#fff", color: "#be123c", border: "1.5px solid #ffe4e6", borderRadius: "8px", cursor: "pointer", fontWeight: '700' },
  btnUbahMobile: { flex: 1, padding: '12px', borderRadius: '10px', background: '#064e3b', color: '#fff', border: 'none', fontWeight: '700' },
  btnResetMobile: { flex: 1, padding: '12px', borderRadius: '10px', background: '#b08d00', color: '#fff', border: 'none', fontWeight: '700' },
  btnHapusMobile: { flex: 1, padding: '12px', borderRadius: '10px', background: '#fff', color: '#be123c', border: '1.5px solid #ffe4e6', fontWeight: '700' },
  footer: { textAlign: 'center', color: "#94a3b8", fontSize: "10px", paddingBottom: "30px" },

  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 },
  modalContent: { backgroundColor: "#fff", width: "90%", maxWidth: "400px", padding: "30px", borderRadius: "24px", textAlign: "center", boxShadow: "0 20px 25px rgba(0,0,0,0.1)" },
  modalIconGold: { width: "60px", height: "60px", backgroundColor: "#fef3c7", color: "#b08d00", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 15px", fontSize: "24px" },
  modalIconRed: { width: "60px", height: "60px", backgroundColor: "#fef2f2", color: "#be123c", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 15px", fontSize: "24px" },
  modalTitle: { fontSize: "20px", fontWeight: "800", color: "#1e293b" },
  modalBody: { fontSize: "14px", color: "#64748b", margin: "10px 0 20px" },
  modalInput: { width: "100%", padding: "12px", borderRadius: "10px", border: "1.5px solid #e2e8f0", marginBottom: "20px", outline: "none", boxSizing: 'border-box' },
  modalFooter: { display: "flex", gap: "10px" },
  btnCancel: { flex: 1, padding: "12px", borderRadius: "12px", border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#64748b", fontWeight: "700" },
  btnConfirmGreen: { flex: 1, padding: "12px", borderRadius: "12px", border: "none", backgroundColor: "#064e3b", color: "#fff", fontWeight: "700" },
  btnConfirmRed: { flex: 1, padding: "12px", borderRadius: "12px", border: "none", backgroundColor: "#be123c", color: "#fff", fontWeight: "700" },

  notifToast: { position: "fixed", top: "20px", right: "20px", color: "#fff", padding: "15px 25px", borderRadius: "12px", fontWeight: "700", boxShadow: "0 10px 15px rgba(0,0,0,0.2)", zIndex: 3000 }
};