// src/services/patrol.service.js
const patrolLogsRepo = require("../repositories/patrolLogs.repo");
const storageService = require("./storage.service");
const patrolConfig = require("../config/patrol");

exports.createPatrolLog = async ({
  userId,
  postId,
  note,
  photoFile,
  deviceInfo,
}) => {
  // (opsional) rule anti-spam pos sama dalam x detik
  // Untuk versi MVP, kita skip cek DB terakhir. Bisa ditambah nanti.

  const photoPath = storageService.getRelativePhotoPath(photoFile);
  if (!photoPath) throw new Error("Foto gagal diproses");

  const capturedAt = new Date(); // waktu server

  const created = await patrolLogsRepo.create({
    userId,
    postId,
    photoPath,
    note,
    deviceInfo,
    capturedAt,
  });

  return {
    id: created.id,
    user_id: created.user_id,
    post_id: created.post_id,
    photo_path: created.photo_path,
    note: created.note,
    captured_at_server: created.captured_at_server,
  };
};
