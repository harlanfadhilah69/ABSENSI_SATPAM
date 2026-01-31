import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("satpam");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!username || !password) {
      setMsg("Username dan password wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/register", {
        username,
        password,
        role,
      });

      setMsg(res.data?.message || "Register berhasil ✅");

      setTimeout(() => {
        nav("/login");
      }, 1200);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Register gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", padding: 20 }}>
      <h2>Register Akun</h2>

      {msg && (
        <div
          style={{
            marginBottom: 12,
            color: msg.includes("berhasil") ? "green" : "crimson",
          }}
        >
          {msg}
        </div>
      )}

      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          >
            <option value="satpam">Satpam</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 12 }}
        >
          {loading ? "Menyimpan..." : "Register"}
        </button>
      </form>

      <div style={{ marginTop: 16, fontSize: 14 }}>
        Sudah punya akun?{" "}
        <span
          onClick={() => nav("/login")}
          style={{ color: "blue", cursor: "pointer" }}
        >
          Login
        </span>
      </div>
    </div>
  );
}
