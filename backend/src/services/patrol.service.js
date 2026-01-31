// src/services/patrol.service.js
const patrolLogsRepo = require("../repositories/patrolLogs.repo");
const storageService = require("./storage.service");

exports.createPatrolLog = async ({
  userId,
  postId,
  note,
  photoFile,
  deviceInfo,
  lat,
  lng,
  accuracy,
}) => {
  const photoPath = storageService.getRelativePhotoPath(photoFile);
  if (!photoPath) throw new Error("Foto gagal diproses");

  const capturedAt = new Date();

  const created = await patrolLogsRepo.create({
    userId,
    postId,
    photoPath,
    note,
    deviceInfo,
    capturedAt,
    lat,
    lng,
    accuracy,
  });

  return created;
};
