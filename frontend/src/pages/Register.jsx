import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
// ✅ Pastikan logo ada di folder assets atau public
// Jika di public/logo.png gunakan: const logoImg = "/logo.png";
import logoImg from "../assets/logo_patroli.png"; 

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState("satpam"); 
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      setLoading(true);
      const res = await api.post("/auth/register", {
        name, email, username, password, role,
      });
      setMsg(res.data?.message || "Register berhasil ✅");
      setTimeout(() => nav("/login"), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* --- HEADER LOGO SECTION --- */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={logoCircle}>
          <img src={logoImg} alt="Logo RS" style={logoImageStyle} />
        </div>
        <h1 style={{ margin: "10px 0 5px 0", fontSize: "28px", color: "#1a1a1a", fontWeight: "800" }}>
          RS Islam Fatimah Cilacap
        </h1>
        <p style={{ margin: 0, fontSize: "12px", letterSpacing: "3px", color: "#666", textTransform: "uppercase" }}>
          PATROL GUARD RSIFC
        </p>
      </div>

      {/* --- FORM SECTION --- */}
      <div style={formCard}>
        <h2 style={{ textAlign: "center", margin: "0 0 10px 0", fontSize: "22px", color: "#1a1a1a" }}>Register Akun</h2>
        <p style={{ textAlign: "center", color: "#888", fontSize: "14px", marginBottom: 25 }}>Silahkan lengkapi data pendaftaran Anda</p>
        
        {msg && (
          <div style={{ 
            padding: "12px", marginBottom: "20px", borderRadius: "8px", textAlign: "center", fontSize: "14px",
            backgroundColor: msg.includes("berhasil") ? "#d4edda" : "#f8d7da", 
            color: msg.includes("berhasil") ? "#155724" : "#721c24", 
            border: `1px solid ${msg.includes("berhasil") ? "#c3e6cb" : "#f5c6cb"}` 
          }}>
            {msg}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={inputGroup}>
            <label style={labelStyle}>Nama Lengkap</label>
            <input type="text" placeholder="Masukkan nama lengkap" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} required />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Email</label>
            <input type="email" placeholder="contoh@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Username</label>
            <input type="text" placeholder="Masukkan username" value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} required />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
          </div>

          <p style={{ textAlign: "center", fontSize: "12px", color: "#b08d00", margin: "20px 0" }}>
            Pendaftaran ini khusus untuk akun <strong>Satpam</strong>.
          </p>

          <button type="submit" disabled={loading} style={btnSubmit}>
            {loading ? "Menyimpan..." : "Daftar Sekarang 👤"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 25, fontSize: "14px", color: "#666" }}>
          Sudah punya akun? <span onClick={() => nav("/login")} style={{ color: "#b08d00", cursor: "pointer", fontWeight: "bold" }}>Login di sini</span>
        </p>
      </div>

      <footer style={{ textAlign: "center", marginTop: 40, fontSize: "10px", color: "#999", letterSpacing: "1px" }}>
        © 2026 RS ISLAM FATIMAH SECURITY SYSTEM V2.0
      </footer>
    </div>
  );
}

// --- STYLES ---
const containerStyle = {
  backgroundColor: "#f4f7f6",
  minHeight: "100vh",
  padding: "40px 20px",
  fontFamily: "'Inter', sans-serif",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
};

const logoCircle = {
  width: "120px",
  height: "120px",
  backgroundColor: "#004d00", // Hijau tua sesuai desain
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "0 auto",
  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
  border: "4px solid #fff",
  overflow: "hidden" // Agar gambar tidak keluar dari lingkaran
};

const logoImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover" // Menyesuaikan logo di dalam lingkaran
};

const formCard = {
  maxWidth: 450,
  width: "100%",
  padding: "40px",
  borderRadius: "30px",
  background: "white",
  boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
  border: "2px solid #f0f0f0"
};

const inputGroup = { marginBottom: 18 };

const labelStyle = { display: "block", marginBottom: 8, fontSize: "14px", fontWeight: "600", color: "#333" };

const inputStyle = {
  width: "100%",
  padding: "14px 18px",
  borderRadius: "12px",
  border: "1px solid #e0e0e0",
  fontSize: "15px",
  backgroundColor: "#f9f9f9",
  boxSizing: "border-box",
  outline: "none"
};

const btnSubmit = {
  width: "100%",
  padding: "16px",
  backgroundColor: "#1a3a1a", // Hijau gelap RS
  color: "white",
  border: "none",
  borderRadius: "15px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
  boxShadow: "0 8px 15px rgba(0,100,0,0.2)",
  transition: "all 0.3s ease"
};