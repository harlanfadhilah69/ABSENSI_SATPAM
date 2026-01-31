import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuthContext();

  const redirect = params.get("redirect");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

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
      setMsg(err?.response?.data?.message || "Login gagal");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h2>Login</h2>

      <form onSubmit={submit}>
        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={input}
        />

        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ ...input, marginTop: 10 }}
        />

        {msg && <div style={{ color: "crimson", marginTop: 10 }}>{msg}</div>}

        <button style={{ ...btn, width: "100%", marginTop: 12 }}>
          Masuk
        </button>
      </form>

      {/* 🔽 LINK REGISTER */}
      <div style={{ marginTop: 14, textAlign: "center", fontSize: 14 }}>
        Belum punya akun?{" "}
        <Link to="/register">Daftar di sini</Link>
      </div>
    </div>
  );
}

const input = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
};

const btn = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "#f6f6f6",
  cursor: "pointer",
};
