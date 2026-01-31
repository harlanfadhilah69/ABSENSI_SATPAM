import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import AdminNavbar from "../../components/admin/AdminNavbar";

export default function PostForm() {
  const nav = useNavigate();
  const { id } = useParams(); // kalau ada id => edit
  const isEdit = !!id;

  const [postName, setPostName] = useState("");
  const [locationDesc, setLocationDesc] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // load data untuk edit
  useEffect(() => {
    const load = async () => {
      if (!isEdit) return;

      setLoading(true);
      setMsg("");
      try {
        // asumsi endpoint GET /admin/posts sudah ada,
        // kalau tidak ada GET /admin/posts/:id, kita ambil dari list lalu cari.
        const res = await api.get("/admin/posts");
        const found = (res.data?.data || []).find((p) => String(p.id) === String(id));

        if (!found) {
          setMsg("Pos tidak ditemukan");
          return;
        }

        setPostName(found.post_name || "");
        setLocationDesc(found.location_desc || "");
      } catch (e) {
        setMsg(e?.response?.data?.message || "Gagal memuat data pos");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (!postName.trim()) {
      setMsg("post_name wajib");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/admin/posts/${id}`, {
          post_name: postName,
          location_desc: locationDesc,
        });
        setMsg("✅ Pos berhasil diupdate");
      } else {
        await api.post("/admin/posts", {
          post_name: postName,
          location_desc: locationDesc,
        });
        setMsg("✅ Pos berhasil dibuat");
      }

      // balik dashboard setelah 700ms biar user lihat pesan
      setTimeout(() => nav("/admin/dashboard"), 700);
    } catch (e2) {
      setMsg(e2?.response?.data?.message || "Gagal simpan pos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <AdminNavbar />

      <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <h2 style={{ margin: 0 }}>{isEdit ? "Edit Pos" : "Tambah Pos"}</h2>
          <button onClick={() => nav("/admin/dashboard")} style={{ ...btn, background: "#fff" }}>
            ⬅ Kembali
          </button>
        </div>

        {msg && (
          <div style={{ marginTop: 12, color: msg.startsWith("✅") ? "#0a0" : "crimson", fontWeight: 700 }}>
            {msg}
          </div>
        )}

        <div style={{ ...card, marginTop: 14 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={label}>Nama Pos</label>
              <input
                value={postName}
                onChange={(e) => setPostName(e.target.value)}
                placeholder="Contoh: Pos Lobby"
                style={input}
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={label}>Deskripsi Lokasi</label>
              <input
                value={locationDesc}
                onChange={(e) => setLocationDesc(e.target.value)}
                placeholder="Contoh: Lantai 1"
                style={input}
                disabled={loading}
              />
            </div>

            <button style={{ ...btn, width: "100%" }} disabled={loading}>
              {loading ? "Menyimpan..." : isEdit ? "Update" : "Simpan"}
            </button>
          </form>

          <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
            {isEdit ? `Sedang mengedit pos ID: ${id}` : "Membuat pos baru"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== styles ===== */
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
