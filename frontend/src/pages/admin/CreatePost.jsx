// src/pages/admin/CreatePost.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import AdminNavbar from "../../components/admin/AdminNavbar";

export default function CreatePost() {
  const nav = useNavigate();

  const [postName, setPostName] = useState("");
  const [locationDesc, setLocationDesc] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (!postName.trim()) {
      setMsg("post_name wajib");
      return;
    }

    setLoading(true);
    try {
      await api.post("/admin/posts", {
        post_name: postName,
        location_desc: locationDesc,
      });

      setMsg("✅ Pos berhasil dibuat");
      setPostName("");
      setLocationDesc("");

      // balik ke dashboard
      setTimeout(() => nav("/admin/dashboard"), 600);
    } catch (e2) {
      setMsg(e2?.response?.data?.message || "Gagal buat pos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <AdminNavbar />

      <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Tambah Pos</h2>

        {msg && (
          <div style={{ marginBottom: 12, color: msg.startsWith("✅") ? "#0a0" : "crimson" }}>
            {msg}
          </div>
        )}

        <div style={card}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 10 }}>
              <label style={label}>Nama Pos</label>
              <input
                value={postName}
                onChange={(e) => setPostName(e.target.value)}
                placeholder="Contoh: Pos Lobby"
                style={input}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={label}>Deskripsi Lokasi</label>
              <input
                value={locationDesc}
                onChange={(e) => setLocationDesc(e.target.value)}
                placeholder="Contoh: Lantai 1"
                style={input}
              />
            </div>

            <button style={{ ...btn, width: "100%" }} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </button>

            <button
              type="button"
              onClick={() => nav("/admin/dashboard")}
              style={{ ...btn, width: "100%", marginTop: 10, background: "#fff" }}
              disabled={loading}
            >
              Batal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const card = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 16,
  background: "#fff",
};

const btn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ccc",
  background: "#f6f6f6",
  cursor: "pointer",
  color: "#111",
};

const input = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #ccc",
};

const label = {
  display: "block",
  marginBottom: 6,
  fontSize: 12,
  color: "#555",
};
