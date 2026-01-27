// src/controllers/admin/users.controller.js
const usersRepo = require("../../repositories/users.repo");

exports.list = async (req, res, next) => {
  try {
    const users = await usersRepo.listSatpam();
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ message: "name, username, password wajib" });
    }

    const created = await usersRepo.createSatpam({ name, username, password });
    res.status(201).json({ message: "Satpam berhasil dibuat", data: created });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const updated = await usersRepo.updateUser(id, payload);
    res.json({ message: "User berhasil diupdate", data: updated });
  } catch (err) {
    next(err);
  }
};

exports.setActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const updated = await usersRepo.setActive(id, Boolean(is_active));
    res.json({ message: "Status user diupdate", data: updated });
  } catch (err) {
    next(err);
  }
};
