import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

export default function AdminNavbar() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        borderBottom: "1px solid #ddd",
        marginBottom: 20,
      }}
    >
      {/* kiri */}
      <div style={{ display: "flex", gap: 16 }}>
        <strong>Admin Panel</strong>

        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin/reports">Reports</Link>
      </div>

      {/* kanan */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: 14 }}>
          👤 {user?.username}
        </span>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
