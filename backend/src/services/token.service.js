// src/services/token.service.js
const crypto = require("crypto");
const patrolConfig = require("../config/patrol");

function getWindow(epochSeconds) {
  return Math.floor(epochSeconds / patrolConfig.TOKEN_WINDOW_SECONDS);
}

function hmacToken(postId, window) {
  const data = `${postId}:${window}`;
  return crypto
    .createHmac("sha256", patrolConfig.TOKEN_SECRET)
    .update(data)
    .digest("hex")
    .slice(0, 16); // token pendek utk QR
}

exports.generateToken = ({ postId, atEpochSeconds }) => {
  const now = atEpochSeconds ?? Math.floor(Date.now() / 1000);
  const window = getWindow(now);
  return hmacToken(postId, window);
};

exports.validateToken = ({ postId, token, atEpochSeconds }) => {
  if (!postId || !token) return false;

  const now = atEpochSeconds ?? Math.floor(Date.now() / 1000);
  const windowNow = getWindow(now);
  const tol = patrolConfig.TOKEN_WINDOW_TOLERANCE;

  for (let w = windowNow - tol; w <= windowNow + tol; w++) {
    if (hmacToken(postId, w) === token) return true;
  }
  return false;
};

exports.getCurrentWindow = () => getWindow(Math.floor(Date.now() / 1000));
