const usersRepo = require("../../repositories/users.repo");

exports.list = async (req, res, next) => {
  try {
    const users = await usersRepo.listAllUsers();
    res.json(users); 
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, username, password, role } = req.body;
    if (!name || !email || !username || !password || !role) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }
    const created = await usersRepo.create({ name, email, username, password, role });
    res.status(201).json({ message: "User berhasil dibuat", data: created });
  } catch (err) {
    next(err);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["admin", "satpam"].includes(role)) {
      return res.status(400).json({ message: "Role tidak valid" });
    }
    await usersRepo.updateRole(id, role);
    res.json({ message: `Role berhasil diubah menjadi ${role}` });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 4) {
      return res.status(400).json({ message: "Password minimal 4 karakter" });
    }

    // ✅ Sekarang fungsi updateUser sudah ada di repo
    await usersRepo.updateUser(id, { password });
    res.json({ message: "Password berhasil di-reset oleh Admin" });
  } catch (err) {
    console.error("Error Reset Password:", err); // Agar terlihat di terminal jika error
    next(err);
  }
};

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