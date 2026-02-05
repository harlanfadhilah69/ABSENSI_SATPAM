import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
// ✅ Import logo patroli yang kamu kirim tadi
import logoImg from "../../assets/logo_patroli.png"; 

export default function Login() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuthContext();

  const redirect = params.get("redirect");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div style={containerStyle}>
      {/* --- HEADER LOGO SECTION --- */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={logoCircle}>
          <img src={logoImg} alt="Logo Patroli" style={logoImageStyle} />
        </div>
        <h1 style={titleStyle}>RS Islam Fatimah Cilacap</h1>
        <p style={subtitleStyle}>PATROL GUARD RSIFC</p>
      </div>

      {/* --- LOGIN CARD --- */}
      <div style={formCard}>
        <h2 style={cardTitle}>Login Ke Akun</h2>
        <p style={cardSubtitle}>Masukkan kredensial Anda untuk akses sistem</p>

        <form onSubmit={submit}>
          <div style={inputGroup}>
            <label style={labelStyle}>Username</label>
            <div style={inputWrapper}>
              <span style={iconStyle}>👤</span>
              <input
                placeholder="Contoh: satpam_fatimah"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={inputGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={labelStyle}>Password</label>
              <span style={forgotPass}>Lupa password?</span>
            </div>
            <div style={inputWrapper}>
              <span style={iconStyle}>🔒</span>
              <input
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </div>

          {msg && <div style={errorBox}>{msg}</div>}

          <button type="submit" disabled={loading} style={btnSubmit}>
            {loading ? "Memproses..." : "Masuk ➔"}
          </button>
        </form>

        <div style={footerLink}>
          Belum punya akun? <Link to="/register" style={linkStyle}>Daftar di sini</Link>
        </div>
      </div>

      <footer style={copyrightStyle}>
        © 2026 RS Islam Fatimah, Bagian Keamanan.
      </footer>
    </div>
  );
}

// --- STYLES (Identik dengan Gambar/Mockup) ---

const containerStyle = {
  backgroundColor: "#f4f7f6",
  minHeight: "100vh",
  padding: "40px 20px",
  fontFamily: "'Inter', sans-serif",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center"
};

const logoCircle = {
  width: "100px",
  height: "100px",
  backgroundColor: "#004d00", 
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "0 auto 15px",
  boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
  border: "3px solid #fff",
  overflow: "hidden"
};

const logoImageStyle = {
  width: "85%",
  height: "85%",
  objectFit: "contain"
};

const titleStyle = {
  margin: "0",
  fontSize: "24px",
  color: "#1a1a1a",
  fontWeight: "800",
  letterSpacing: "-0.5px"
};

const subtitleStyle = {
  margin: "5px 0 0 0",
  fontSize: "12px",
  letterSpacing: "3px",
  color: "#666",
  fontWeight: "600"
};

const formCard = {
  maxWidth: "400px",
  width: "100%",
  padding: "40px",
  borderRadius: "24px",
  background: "white",
  boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
  border: "1px solid #f0f0f0",
  marginTop: "20px"
};

const cardTitle = {
  textAlign: "center",
  margin: "0",
  fontSize: "20px",
  color: "#1a1a1a",
  fontWeight: "700"
};

const cardSubtitle = {
  textAlign: "center",
  color: "#888",
  fontSize: "13px",
  margin: "8px 0 25px 0"
};

const inputGroup = { marginBottom: 20 };

const labelStyle = { 
  display: "block", 
  marginBottom: 8, 
  fontSize: "13px", 
  fontWeight: "600", 
  color: "#444" 
};

const inputWrapper = {
  position: "relative",
  display: "flex",
  alignItems: "center"
};

const iconStyle = {
  position: "absolute",
  left: "14px",
  fontSize: "14px",
  color: "#aaa"
};

const inputStyle = {
  width: "100%",
  padding: "12px 15px 12px 40px",
  borderRadius: "12px",
  border: "1px solid #e0e0e0",
  fontSize: "14px",
  backgroundColor: "#fcfcfc",
  boxSizing: "border-box",
  outline: "none",
  transition: "border 0.2s"
};

const forgotPass = {
  fontSize: "11px",
  color: "#b08d00",
  fontWeight: "600",
  cursor: "pointer"
};

const errorBox = {
  padding: "10px",
  backgroundColor: "#fff5f5",
  color: "#c53030",
  borderRadius: "8px",
  fontSize: "12px",
  marginBottom: "15px",
  border: "1px solid #fed7d7",
  textAlign: "center"
};

const btnSubmit = {
  width: "100%",
  padding: "14px",
  backgroundColor: "#1a3a1a", 
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "15px",
  transition: "transform 0.1s ease",
  marginTop: "10px"
};

const footerLink = {
  marginTop: "25px",
  textAlign: "center",
  fontSize: "13px",
  color: "#666"
};

const linkStyle = {
  color: "#b08d00",
  textDecoration: "none",
  fontWeight: "700"
};

const copyrightStyle = {
  marginTop: "30px",
  fontSize: "11px",
  color: "#999",
  textAlign: "center"
};