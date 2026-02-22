const usersRepo = require("../../repositories/users.repo");
const bcrypt = require("bcrypt");

/**
 * ✅ MENAMPILKAN SEMUA USER
 */
exports.list = async (req, res, next) => {
  try {
    const users = await usersRepo.listAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

/**
 * ✅ REGISTER/TAMBAH USER BARU (OLEH ADMIN)
 */
exports.create = async (req, res, next) => {
  try {
    const { name, email, username, password, role } = req.body;

    if (!name || !email || !username || !password || !role) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    // ✅ PERBAIKAN: Pastikan role 'viewer' diizinkan saat pendaftaran
    const validRoles = ["admin", "satpam", "viewer"];
    if (!validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ message: "Role tidak valid. Pilih Admin, Satpam, atau Viewer." });
    }

    const exists = await usersRepo.findByUsername(username);
    if (exists) {
      return res.status(409).json({ message: "Username sudah digunakan!" });
    }

    const created = await usersRepo.create({ name, email, username, password, role: role.toLowerCase() });
    
    res.status(201).json({ 
      message: "User berhasil dibuat ✅", 
      data: created 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ✅ UPDATE ROLE USER
 */
exports.updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // ✅ PERBAIKAN: Izinkan perubahan role ke 'viewer'
    if (!["admin", "satpam", "viewer"].includes(role.toLowerCase())) {
      return res.status(400).json({ message: "Role tidak valid" });
    }

    await usersRepo.updateRole(id, role.toLowerCase());
    res.json({ message: `Role berhasil diubah menjadi ${role.toUpperCase()}` });
  } catch (err) {
    next(err);
  }
};

/**
 * ✅ RESET PASSWORD OLEH ADMIN
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 4) {
      return res.status(400).json({ message: "Password minimal 4 karakter" });
    }

    const user = await usersRepo.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const isSame = await bcrypt.compare(password, user.password_hash);

    if (isSame) {
      return res.status(400).json({ 
        message: "Password baru tidak boleh sama dengan password lama!" 
      });
    }

    await usersRepo.updateUser(id, { password });
    res.json({ message: "Password berhasil di-reset oleh Admin" });

  } catch (err) {
    console.error("Error Reset Password:", err);
    next(err);
  }
};

/**
 * ✅ HAPUS USER SECARA PERMANEN
 */
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: "Anda tidak bisa menghapus akun sendiri" });
    }

    await usersRepo.deleteUser(id);
    res.json({ message: "User berhasil dihapus secara permanen" });
  } catch (err) {
    next(err);
  }
};

/**
 * ✅ AKTIFKAN / NONAKTIFKAN USER
 */
exports.setActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const updated = await usersRepo.setActive(id, Boolean(is_active));
    res.json({ message: "Status akun berhasil diperbarui", data: updated });
  } catch (err) {
    next(err);
  }
};