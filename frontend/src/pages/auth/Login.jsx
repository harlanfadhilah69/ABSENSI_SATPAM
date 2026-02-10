import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import logoImg from "../../assets/logo_patroli.png"; 
import { Eye, EyeOff, User, Lock, Info } from "lucide-react";

export default function Login() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuthContext();

  const redirect = params.get("redirect");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State untuk Modal Lupa Password
  const [showForgotModal, setShowForgotModal] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await login(username, password);
      const role = res.user?.role;

      if (redirect) {
        nav(decodeURIComponent(redirect), { replace: true });
        return;
      }

      if (role === "admin") nav("/admin/dashboard");
      else nav("/satpam");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Login gagal, periksa kembali kredensial Anda");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 30 }}>
        <div style={{...styles.logoWrapper, width: isMobile ? "120px" : "150px", height: isMobile ? "120px" : "150px"}}>
          <img src={logoImg} alt="Logo Patroli" style={styles.logoImg} />
        </div>
        <h1 style={{ ...styles.brandTitle, fontSize: isMobile ? "22px" : "26px" }}>
          RS Islam Fatimah Cilacap
        </h1>
        <p style={styles.brandSubtitle}>PATROL GUARD RSIFC</p>
      </div>

      <div style={{...styles.formCard, padding: isMobile ? "30px 20px" : "40px"}}>
        <h2 style={styles.cardTitle}>Login Akun</h2>
        <p style={styles.cardSubtitle}>Silahkan Login Terlebih Dahulu</p>

        <form onSubmit={submit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                placeholder="Masukkan Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={styles.label}>Password</label>
              {/* ✅ Fungsi Klik Lupa Password */}
              <span onClick={() => setShowForgotModal(true)} style={styles.forgotPass}>
                Lupa password?
              </span>
            </div>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {msg && <div style={styles.errorBox}>{msg}</div>}

          <button type="submit" disabled={loading} style={styles.btnSubmit}>
            {loading ? "Memproses..." : "Masuk Sekarang"}
          </button>
        </form>

        <div style={styles.footerLink}>
          Belum punya akun? <Link to="/register" style={styles.linkText}>Daftar di sini</Link>
        </div>
      </div>

      {/* ✅ MODAL POPUP LUPA PASSWORD MENARIK */}
      {showForgotModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalAksenEmas}></div>
            <div style={styles.modalIconBox}>
              <Info size={32} color="#b08d00" />
            </div>
            <h3 style={styles.modalTitle}>Bantuan Login</h3>
            <p style={styles.modalBody}>
              Untuk meriset password Anda, silakan hubungi <b>Admin IT</b> atau <b>Komandan Satpam</b> di Ruang Keamanan RS Islam Fatimah Cilacap.
            </p>
            <button 
              onClick={() => setShowForgotModal(false)} 
              style={styles.btnModalClose}
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      <footer style={styles.copyright}>
        © 2026 RS Islam Fatimah Security System
      </footer>
    </div>
  );
}

const styles = {
  container: { backgroundColor: "#f4f7f6", minHeight: "100vh", padding: "20px", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  logoWrapper: { display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 10px", backgroundColor: "transparent" },
  logoImg: { width: "100%", height: "100%", objectFit: "contain" },
  brandTitle: { margin: "0", color: "#1a1a1a", fontWeight: "800", letterSpacing: "-0.5px", textAlign: 'center' },
  brandSubtitle: { margin: "5px 0 0 0", fontSize: "11px", letterSpacing: "3px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", textAlign: 'center' },
  formCard: { maxWidth: "400px", width: "100%", borderRadius: "24px", background: "white", boxShadow: "0 20px 40px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", boxSizing: 'border-box', marginTop: "10px" },
  cardTitle: { textAlign: "center", margin: "0", fontSize: "20px", color: "#1e293b", fontWeight: "700" },
  cardSubtitle: { textAlign: "center", color: "#94a3b8", fontSize: "13px", margin: "8px 0 25px 0" },
  inputGroup: { marginBottom: 20 },
  label: { display: "block", marginBottom: 8, fontSize: "13px", fontWeight: "600", color: "#475569" },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center", width: "100%" },
  inputIcon: { position: "absolute", left: "14px", color: "#94a3b8" },
  input: { width: "100%", padding: "14px 45px 14px 42px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "14px", backgroundColor: "#fcfcfc", boxSizing: "border-box", outline: "none", transition: "all 0.2s" },
  eyeButton: { position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", padding: "5px" },
  forgotPass: { fontSize: "11px", color: "#b08d00", fontWeight: "700", cursor: "pointer" },
  errorBox: { padding: "10px", backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: "10px", fontSize: "12px", marginBottom: "15px", border: "1px solid #fecaca", textAlign: "center" },
  btnSubmit: { width: "100%", padding: "16px", backgroundColor: "#064e3b", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "700", fontSize: "15px", marginTop: "10px", boxShadow: "0 4px 12px rgba(6, 78, 59, 0.2)" },
  footerLink: { marginTop: "25px", textAlign: "center", fontSize: "14px", color: "#64748b" },
  linkText: { color: "#b08d00", textDecoration: "none", fontWeight: "700" },
  copyright: { marginTop: "30px", fontSize: "10px", color: "#94a3b8", textAlign: "center", letterSpacing: "0.5px" },

  // --- STYLES MODAL BARU ---
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 3000 },
  modalContent: { backgroundColor: "#fff", width: "90%", maxWidth: "380px", borderRadius: "24px", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden", position: "relative", padding: "40px 30px" },
  modalAksenEmas: { position: "absolute", top: 0, left: 0, width: "100%", height: "6px", backgroundColor: "#b08d00" },
  modalIconBox: { width: "70px", height: "70px", backgroundColor: "#fef3c7", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 20px" },
  modalTitle: { fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: "0 0 12px 0" },
  modalBody: { fontSize: "14px", color: "#64748b", lineHeight: "1.6", margin: "0 0 30px 0" },
  btnModalClose: { width: "100%", padding: "14px", backgroundColor: "#064e3b", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "14px", cursor: "pointer", transition: "all 0.2s" }
};