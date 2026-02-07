import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import logoImg from "../assets/logo_patroli.png"; 
// ✅ Import icon dari lucide-react
import { Eye, EyeOff, User, Mail, Tag, Lock } from "lucide-react";

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role] = useState("satpam"); 
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      setLoading(true);
      await api.post("/auth/register", { name, email, username, password, role });
      setMsg("Register berhasil ✅");
      setTimeout(() => nav("/login"), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Gagal pendaftaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* --- HEADER LOGO SECTION --- */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? 20 : 30 }}>
        <div style={{...styles.logoWrapper, width: isMobile ? "100px" : "130px", height: isMobile ? "100px" : "130px"}}>
          <img src={logoImg} alt="Logo RS" style={styles.logoImg} />
        </div>
        <h1 style={{ ...styles.brandTitle, fontSize: isMobile ? "20px" : "26px" }}>
          RS Islam Fatimah Cilacap
        </h1>
        <p style={styles.brandSubtitle}>PATROL GUARD RSIFC</p>
      </div>

      {/* --- FORM CARD --- */}
      <div style={{...styles.formCard, padding: isMobile ? "25px 20px" : "35px"}}>
        <h2 style={styles.cardTitle}>Register Akun</h2>
        <p style={styles.cardSubtitle}>Silahkan lengkapi data pendaftaran Anda</p>
        
        {msg && (
          <div style={{ 
            padding: "12px", marginBottom: "20px", borderRadius: "10px", textAlign: "center", fontSize: "13px",
            backgroundColor: msg.includes("berhasil") ? "#f0fdf4" : "#fef2f2", 
            color: msg.includes("berhasil") ? "#166534" : "#991b1b", 
            border: `1px solid ${msg.includes("berhasil") ? "#bbf7d0" : "#fecaca"}` 
          }}>
            {msg}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nama Lengkap</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input type="text" placeholder="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} required />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input type="email" placeholder="contoh@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrapper}>
              <Tag size={18} style={styles.inputIcon} />
              <input type="text" placeholder="Masukkan username" value={username} onChange={(e) => setUsername(e.target.value)} style={styles.input} required />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
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
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <p style={styles.helperText}>
            Pendaftaran khusus untuk akun <strong>Satpam</strong>.
          </p>

          <button type="submit" disabled={loading} style={styles.btnSubmit}>
            {loading ? "Menyimpan..." : "Daftar Sekarang"}
          </button>
        </form>

        <p style={styles.footerLink}>
          Sudah punya akun? <span onClick={() => nav("/login")} style={styles.linkText}>Login di sini</span>
        </p>
      </div>

      <footer style={styles.copyright}>
        © 2026 RS ISLAM FATIMAH SECURITY SYSTEM
      </footer>
    </div>
  );
}

const styles = {
  container: { backgroundColor: "#f4f7f6", minHeight: "100vh", padding: "20px", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  logoWrapper: { display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto", backgroundColor: "transparent" },
  logoImg: { width: "100%", height: "100%", objectFit: "contain" },
  brandTitle: { margin: "10px 0 5px 0", color: "#1a1a1a", fontWeight: "800", textAlign: 'center' },
  brandSubtitle: { margin: 0, fontSize: "11px", letterSpacing: "3px", color: "#64748b", textTransform: "uppercase", textAlign: 'center' },
  formCard: { maxWidth: "450px", width: "100%", borderRadius: "24px", background: "white", boxShadow: "0 20px 40px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0", boxSizing: 'border-box' },
  cardTitle: { textAlign: "center", margin: "0", fontSize: "20px", color: "#1e293b", fontWeight: "700" },
  cardSubtitle: { textAlign: "center", color: "#94a3b8", fontSize: "13px", margin: "8px 0 25px 0" },
  inputGroup: { marginBottom: 15 },
  label: { display: "block", marginBottom: 8, fontSize: "13px", fontWeight: "700", color: "#475569" },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center", width: "100%" },
  inputIcon: { position: "absolute", left: "14px", color: "#94a3b8" },
  input: { width: "100%", padding: "14px 45px 14px 42px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "14px", backgroundColor: "#f8fafc", boxSizing: "border-box", outline: "none", transition: "all 0.2s" },
  eyeButton: { position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", padding: "5px" },
  helperText: { textAlign: "center", fontSize: "11px", color: "#b08d00", margin: "15px 0" },
  btnSubmit: { width: "100%", padding: "16px", backgroundColor: "#064e3b", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "800", fontSize: "15px", boxShadow: "0 8px 15px rgba(6,78,59,0.2)" },
  footerLink: { textAlign: "center", marginTop: 25, fontSize: "14px", color: "#64748b" },
  linkText: { color: "#b08d00", cursor: "pointer", fontWeight: "800" },
  copyright: { textAlign: "center", marginTop: 40, fontSize: "10px", color: "#94a3b8", letterSpacing: "1px" }
};