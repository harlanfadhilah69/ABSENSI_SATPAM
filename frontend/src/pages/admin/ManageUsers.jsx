import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminNavbar from "../../components/admin/AdminNavbar";
// ✅ Import SweetAlert2
import Swal from 'sweetalert2';
import { Power, Trash2, Key, Shield, UserPlus, Loader2 } from "lucide-react";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isViewer = currentUser.role?.toLowerCase().trim() === "viewer";

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    username: "", 
    password: "", 
    role: "satpam" 
  });

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
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Tidak dapat memuat daftar pengguna.', confirmButtonColor: '#be123c' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isViewer) return;
    try {
      await api.post("/admin/users", formData);
      Swal.fire({ icon: 'success', title: 'User Terdaftar!', text: 'Akun baru berhasil ditambahkan.', confirmButtonColor: '#064e3b', timer: 2000, showConfirmButton: false });
      setShowAddModal(false);
      setFormData({ name: "", email: "", username: "", password: "", role: "satpam" });
      fetchUsers();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Registrasi Gagal', text: err.response?.data?.message || 'Gagal mendaftarkan user.', confirmButtonColor: '#be123c' });
    }
  };

  const handleToggleStatus = async (user) => {
    if (isViewer) return;
    const isActive = user.is_active === 1;

    Swal.fire({
      title: isActive ? 'Nonaktifkan User?' : 'Aktifkan Kembali?',
      text: `User "${user.name}" ${isActive ? 'tidak akan bisa login sementara.' : 'akan bisa login kembali.'}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: isActive ? '#be123c' : '#064e3b',
      confirmButtonText: isActive ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan',
      cancelButtonText: 'Batal',
      borderRadius: '20px'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.patch(`/admin/users/${user.id}/toggle`);
          Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Status akses user telah diperbarui.', confirmButtonColor: '#064e3b', timer: 1500, showConfirmButton: false });
          fetchUsers();
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal mengubah status user.', confirmButtonColor: '#be123c' });
        }
      }
    });
  };

  const openRoleModal = (user) => {
    if (isViewer) return;
    let newRole = user.role === "satpam" ? "viewer" : user.role === "viewer" ? "admin" : "satpam";
    Swal.fire({
      title: 'Ubah Hak Akses?',
      text: `Ganti peran "${user.name}" menjadi ${newRole.toUpperCase()}?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#064e3b',
      confirmButtonText: 'Ya, Ganti!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.put(`/admin/users/${user.id}/role`, { role: newRole });
          Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Role user diperbarui.', confirmButtonColor: '#064e3b', timer: 1500, showConfirmButton: false });
          fetchUsers();
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal mengubah role.', confirmButtonColor: '#be123c' });
        }
      }
    });
  };

  const openPasswordModal = (user) => {
    if (isViewer) return;
    Swal.fire({
      title: 'Reset Password',
      text: `Masukkan password baru untuk "${user.username}":`,
      input: 'text',
      showCancelButton: true,
      confirmButtonColor: '#b08d00',
      confirmButtonText: 'Simpan',
      inputValidator: (value) => { if (!value) return 'Wajib diisi!'; }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.put(`/admin/users/${user.id}/password`, { password: result.value });
          Swal.fire({ icon: 'success', title: 'Sukses!', text: 'Password berhasil diubah.', confirmButtonColor: '#064e3b', timer: 1500, showConfirmButton: false });
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal mereset password.', confirmButtonColor: '#be123c' });
        }
      }
    });
  };

  const openDeleteModal = (user) => {
    if (isViewer) return;
    Swal.fire({
      title: 'HAPUS PERMANEN?',
      text: `Peringatan: Menghapus "${user.name}" dapat merusak data histori laporan patroli di database!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#be123c',
      confirmButtonText: 'Tetap Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin/users/${user.id}`);
          Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'User telah dihapus permanen.', confirmButtonColor: '#064e3b', timer: 1500, showConfirmButton: false });
          fetchUsers();
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Gagal', text: 'Data gagal dihapus.', confirmButtonColor: '#be123c' });
        }
      }
    });
  };

  const getBadgeStyle = (role) => {
    if (role === "admin") return styles.badgeAdmin;
    if (role === "viewer") return styles.badgeViewer;
    return styles.badgeSatpam;
  };

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <AdminNavbar />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 15px" : "40px 20px" }}>
        
        {isViewer && (
          <div style={styles.viewerBanner}>
            👁️ <b>Mode Pantau:</b> Anda hanya diizinkan melihat daftar pengguna. Fitur pengelolaan dinonaktifkan.
          </div>
        )}

        {/* HEADER SECTION */}
        <div style={{ marginBottom: 35, display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isMobile ? 'column' : 'row', gap: '20px' }}>
          <div style={{ display: "flex", gap: "15px", alignItems: "center", alignSelf: 'flex-start' }}>
            <div style={styles.barGold}></div>
            <div>
              <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: "900", color: "#1e293b", margin: 0 }}>Kelola User <span style={{color: '#064e3b'}}>👥</span></h1>
              <p style={{ color: "#64748b", fontSize: 13, fontWeight: '500' }}>Manajemen personil RS Islam Fatimah</p>
            </div>
          </div>
          
          {!isViewer && (
            <button onClick={() => setShowAddModal(true)} style={styles.btnAddMain}>
              <UserPlus size={18} /> {isMobile ? "Tambah" : "Daftarkan User Baru"}
            </button>
          )}
        </div>

        <div style={isViewer ? styles.disabledArea : styles.cardContainer}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}><Loader2 className="animate-spin" size={40} color="#064e3b" style={{margin: '0 auto'}}/></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              {isMobile ? (
                <div style={{ padding: '10px' }}>
                  {users.map((u) => (
                    <div key={u.id} style={{...styles.mobileCard, opacity: u.is_active ? 1 : 0.6}}>
                      <div style={styles.mobileRow}><span style={styles.mobileLabel}>NAMA</span><span style={{ fontWeight: '800', color: '#064e3b' }}>{u.name}</span></div>
                      <div style={styles.mobileRow}><span style={styles.mobileLabel}>ROLE</span><span style={getBadgeStyle(u.role)}>{u.role.toUpperCase()}</span></div>
                      {!isViewer && (
                        <div style={styles.mobileActions}>
                          <button onClick={() => handleToggleStatus(u)} style={u.is_active ? styles.btnNonaktifMobile : styles.btnAktifMobile}>
                             <Power size={14}/> {u.is_active ? 'Off' : 'On'}
                          </button>
                          <button onClick={() => openPasswordModal(u)} style={styles.btnResetMobile}><Key size={14}/></button>
                          <button onClick={() => openDeleteModal(u)} style={styles.btnHapusMobile}><Trash2 size={14}/></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <table width="100%" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th align="left" style={styles.thStyle}>NAMA LENGKAP</th>
                      <th align="left" style={styles.thStyle}>USERNAME</th>
                      <th align="center" style={styles.thStyle}>HAK AKSES</th>
                      {!isViewer && <th align="center" style={styles.thStyle}>AKSI</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{...styles.trStyle, opacity: u.is_active ? 1 : 0.5}}>
                        <td style={{ ...styles.tdStyle, fontWeight: '700', color: '#1e293b' }}>{u.name} {!u.is_active && <span style={{color: '#be123c', fontSize: '10px'}}>(Nonaktif)</span>}</td>
                        <td style={styles.tdStyle}>{u.username}</td>
                        <td align="center" style={styles.tdStyle}><span style={getBadgeStyle(u.role)}>{u.role.toUpperCase()}</span></td>
                        {!isViewer && (
                          <td style={styles.tdStyle}>
                            <div style={styles.actionGroupWeb}>
                              <button onClick={() => handleToggleStatus(u)} style={u.is_active ? styles.btnNonaktif : styles.btnAktif} title="Toggle Akses">
                                <Power size={16} />
                              </button>
                              <button onClick={() => openRoleModal(u)} style={styles.btnUbah} title="Ganti Role">Role</button>
                              <button onClick={() => openPasswordModal(u)} style={styles.btnReset} title="Reset Pass"><Key size={16}/></button>
                              <button onClick={() => openDeleteModal(u)} style={styles.btnHapus} title="Hapus Permanen"><Trash2 size={16}/></button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL REGISTER */}
      {!isViewer && showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modalContent, maxWidth: '450px'}}>
            <div style={styles.modalIconGold}>➕</div>
            <h3 style={styles.modalTitle}>Daftarkan Akun Baru</h3>
            <form onSubmit={handleRegister} style={{textAlign: 'left', marginTop: '10px'}}>
              <div style={styles.inputGroup}><label style={styles.labelModal}>NAMA LENGKAP</label><input type="text" required style={styles.modalInput} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div style={styles.inputGroup}><label style={styles.labelModal}>EMAIL</label><input type="email" required style={styles.modalInput} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div style={styles.inputGroup}><label style={styles.labelModal}>USERNAME</label><input type="text" required style={styles.modalInput} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} /></div>
              <div style={styles.inputGroup}><label style={styles.labelModal}>PASSWORD</label><input type="password" required style={styles.modalInput} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
              <div style={styles.inputGroup}>
                <label style={styles.labelModal}>ROLE AKUN</label>
                <select style={styles.modalInput} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="satpam">SATPAM</option><option value="admin">ADMIN</option><option value="viewer">VIEWER</option>
                </select>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowAddModal(false)} style={styles.btnCancel}>Batal</button>
                <button type="submit" style={styles.btnConfirmGreen}>Daftarkan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer style={styles.footer}>© 2026 <b>RS ISLAM FATIMAH CILACAP</b></footer>
    </div>
  );
}

const styles = {
  barGold: { width: '6px', height: '45px', backgroundColor: '#b08d00', borderRadius: '10px' },
  viewerBanner: { backgroundColor: "#e0f2fe", color: "#0369a1", padding: "15px 20px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #bae6fd", fontSize: "14px", fontWeight: "500" },
  cardContainer: { backgroundColor: "#fff", borderRadius: "24px", overflow: 'hidden', boxShadow: "0 4px 20px rgba(0,0,0,0.04)", marginBottom: 25, border: "1px solid #f1f5f9" },
  tableHeader: { backgroundColor: "#064e3b" },
  thStyle: { padding: "18px 25px", fontSize: "11px", color: "#fff", fontWeight: "900", textTransform: 'uppercase', letterSpacing: '1px' },
  tdStyle: { padding: "18px 25px", fontSize: "14px", borderBottom: "1px solid #f8fafc", color: '#475569' },
  trStyle: { transition: 'background 0.2s' },
  actionGroupWeb: { display: "flex", gap: "8px", justifyContent: "center" },
  mobileCard: { padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' },
  mobileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  mobileLabel: { fontSize: '10px', fontWeight: '900', color: '#94a3b8' },
  mobileActions: { display: 'flex', gap: '8px', marginTop: '10px' },
  badgeSatpam: { padding: "4px 12px", borderRadius: "20px", backgroundColor: "#f0fdf4", color: "#166534", fontSize: "10px", fontWeight: "800" },
  badgeAdmin: { padding: "4px 12px", borderRadius: "20px", backgroundColor: "#fff1f2", color: "#be123c", fontSize: "10px", fontWeight: "800" },
  badgeViewer: { padding: "4px 12px", borderRadius: "20px", backgroundColor: "#eff6ff", color: "#1e40af", fontSize: "10px", fontWeight: "800" },
  btnAddMain: { display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#064e3b', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(6,78,59,0.3)' },
  btnUbah: { padding: "8px 14px", backgroundColor: "#064e3b", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: '700', fontSize: '12px' },
  btnReset: { padding: "8px", backgroundColor: "#b08d00", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", display: 'flex', alignItems: 'center' },
  btnHapus: { padding: "8px", backgroundColor: "#fef2f2", color: "#be123c", border: "none", borderRadius: "10px", cursor: "pointer", display: 'flex', alignItems: 'center' },
  btnAktif: { padding: "8px", backgroundColor: "#f0fdf4", color: "#166534", border: "none", borderRadius: "10px", cursor: "pointer", display: 'flex', alignItems: 'center' },
  btnNonaktif: { padding: "8px", backgroundColor: "#fef2f2", color: "#be123c", border: "none", borderRadius: "10px", cursor: "pointer", display: 'flex', alignItems: 'center' },
  btnResetMobile: { flex: 1, padding: '12px', borderRadius: '12px', background: '#b08d00', color: '#fff', border: 'none', display: 'flex', justifyContent: 'center' },
  btnHapusMobile: { flex: 1, padding: '12px', borderRadius: '12px', background: '#fef2f2', color: '#be123c', border: 'none', display: 'flex', justifyContent: 'center' },
  btnAktifMobile: { flex: 1, padding: '12px', borderRadius: '12px', background: '#f0fdf4', color: '#166534', border: 'none', fontWeight: '800', display: 'flex', justifyContent: 'center', gap: 6 },
  btnNonaktifMobile: { flex: 1, padding: '12px', borderRadius: '12px', background: '#fef2f2', color: '#be123c', border: 'none', fontWeight: '800', display: 'flex', justifyContent: 'center', gap: 6 },
  footer: { textAlign: 'center', color: "#94a3b8", fontSize: "11px", paddingBottom: "40px", marginTop: '20px', letterSpacing: '1px' },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 },
  modalContent: { backgroundColor: "#fff", width: "90%", padding: "35px", borderRadius: "28px", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" },
  modalIconGold: { width: "50px", height: "50px", backgroundColor: "#fef3c7", color: "#b08d00", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 15px", fontSize: "20px" },
  modalTitle: { fontSize: "22px", fontWeight: "900", color: "#1e293b" },
  modalInput: { width: "100%", padding: "14px", borderRadius: "12px", border: "1.5px solid #f1f5f9", marginBottom: "15px", outline: "none", boxSizing: 'border-box', fontSize: '14px', backgroundColor: '#f8fafc' },
  inputGroup: { marginBottom: '5px' },
  labelModal: { fontSize: '10px', fontWeight: '900', color: '#94a3b8', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' },
  modalFooter: { display: "flex", gap: "12px", marginTop: '25px' },
  btnCancel: { flex: 1, padding: "14px", borderRadius: "14px", border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#64748b", fontWeight: "800", cursor: 'pointer' },
  btnConfirmGreen: { flex: 1, padding: "14px", borderRadius: "14px", border: "none", backgroundColor: "#064e3b", color: "#fff", fontWeight: "800", cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(6,78,59,0.2)' },
};