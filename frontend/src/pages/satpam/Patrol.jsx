import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix icon marker Leaflet di Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function Patrol() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  const postId = params.get("post_id");
  const tokenQR = params.get("token");

  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");

  // ✅ Info Pos (dari endpoint scan)
  const [postInfo, setPostInfo] = useState(null); // { id, post_name, location_desc }
  const [postStatus, setPostStatus] = useState("Memuat info pos...");

  // GPS
  const [gps, setGps] = useState({ lat: null, lng: null, accuracy: null });
  const [gpsStatus, setGpsStatus] = useState("Mengambil lokasi...");

  // Kamera
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraStatus, setCameraStatus] = useState("Menyalakan kamera...");
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  // ✅ jangan pakai !!gps.lat karena 0 bisa valid
  const canSubmit = useMemo(() => {
    const gpsOk =
      gps.lat !== null &&
      gps.lat !== undefined &&
      gps.lat !== "" &&
      gps.lng !== null &&
      gps.lng !== undefined &&
      gps.lng !== "";

    return !!postId && !!tokenQR && !!photoBlob && gpsOk;
  }, [postId, tokenQR, photoBlob, gps.lat, gps.lng]);

  // ✅ 0) Fetch info pos dari QR (scan)
  useEffect(() => {
    const fetchPostInfo = async () => {
      if (!postId || !tokenQR) {
        setPostStatus("QR tidak lengkap (post_id/token kosong)");
        setPostInfo(null);
        return;
      }

      setPostStatus("Memuat info pos...");
      try {
        const res = await api.get("/patrol/scan", {
          params: { post_id: postId, token: tokenQR },
        });

        setPostInfo(res.data?.post || null);
        setPostStatus(res.data?.post ? "Pos terdeteksi ✅" : "Pos tidak ditemukan");
      } catch (err) {
        setPostInfo(null);
        setPostStatus(err?.response?.data?.message || "Gagal ambil info pos");
      }
    };

    fetchPostInfo();
  }, [postId, tokenQR]);

  // 1) Start GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus("Browser tidak mendukung GPS");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setGpsStatus("Lokasi terdeteksi ✅");
      },
      (err) => {
        setGpsStatus(err.message || "Gagal ambil lokasi");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 2) Start Camera (front camera)
  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraStatus("Kamera siap ✅");
      } catch (err) {
        setCameraStatus("Kamera gagal dibuka (izin ditolak / device tidak support)");
      }
    };

    start();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // 3) Validasi QR minimal (kalau link tidak lengkap)
  useEffect(() => {
    if (!postId || !tokenQR) {
      setMsg("QR tidak lengkap. Pastikan link berisi post_id dan token.");
    }
  }, [postId, tokenQR]);

  const capturePhoto = () => {
  setMsg("");
  const video = videoRef.current;
  const canvas = canvasRef.current;
  if (!video || !canvas) return;

  const w = video.videoWidth || 640;
  const h = video.videoHeight || 480;

  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");

  // ✅ FIX: UN-MIRROR FOTO (balik horizontal)
  ctx.save();
  ctx.translate(w, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, w, h);
  ctx.restore();

  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      setPhotoBlob(blob);
      setPhotoPreview(URL.createObjectURL(blob));
    },
    "image/jpeg",
    0.9
  );
};


  const submit = async () => {
    setMsg("");

    try {
      if (!postId || !tokenQR) return setMsg("QR tidak lengkap.");
      if (!photoBlob) return setMsg("Foto belum diambil.");
      if (gps.lat === null || gps.lng === null) return setMsg("GPS belum dapat lokasi.");

      const fd = new FormData();
      fd.append("post_id", postId);
      fd.append("token", tokenQR);
      fd.append("note", note);
      fd.append("lat", String(gps.lat));
      fd.append("lng", String(gps.lng));
      fd.append("accuracy", String(gps.accuracy ?? ""));
      fd.append("photo", photoBlob, "selfie.jpg");

      const res = await api.post("/patrol/submit", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg(res.data?.message || "Berhasil submit ✅");

      // optional: balik ke home satpam
      // nav("/satpam");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Gagal submit");
    }
  };

  const openGoogleMaps = () => {
    if (gps.lat === null || gps.lng === null) return;
    window.open(`https://www.google.com/maps?q=${gps.lat},${gps.lng}`, "_blank");
  };

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h2>Submit Patroli</h2>

      {msg && (
        <div style={{ marginBottom: 10, color: msg.includes("✅") ? "green" : "crimson" }}>
          {msg}
        </div>
      )}

      {/* ✅ TAMPILKAN NAMA POS */}
      <div style={{ marginBottom: 12, padding: 12, border: "1px solid #ddd" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 14 }}>
              <b>Pos:</b> {postInfo?.post_name || "-"}{" "}
              {postInfo?.id ? <span style={{ color: "#777" }}>(ID: {postInfo.id})</span> : null}
            </div>
            {postInfo?.location_desc ? (
              <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                <b>Lokasi:</b> {postInfo.location_desc}
              </div>
            ) : null}

            <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
              Status QR: {postStatus}
            </div>
          </div>

          <div style={{ fontSize: 12, color: "#666" }}>
            <div>
              <b>post_id:</b> {postId || "-"}
            </div>
          </div>
        </div>
      </div>

      {/* GPS */}
      <div style={{ padding: 12, border: "1px solid #ddd", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div>
            <b>GPS:</b> {gpsStatus}
            <div style={{ fontSize: 13, marginTop: 6 }}>
              {gps.lat !== null ? (
                <>
                  Lat: {gps.lat} | Lng: {gps.lng} | Akurasi: {Math.round(gps.accuracy || 0)}m
                </>
              ) : (
                "-"
              )}
            </div>
          </div>

          <button onClick={openGoogleMaps} disabled={gps.lat === null} style={{ padding: "8px 12px" }}>
            Buka di Maps
          </button>
        </div>

        {/* Maps */}
        {gps.lat !== null && (
          <div style={{ marginTop: 12 }}>
            <MapContainer
              center={[gps.lat, gps.lng]}
              zoom={17}
              style={{ height: 280, width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[gps.lat, gps.lng]}>
                <Popup>Lokasi Satpam</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </div>

      {/* Kamera */}
      <div style={{ padding: 12, border: "1px solid #ddd", marginBottom: 14 }}>
        <b>Foto Selfie (kamera):</b>{" "}
        <span style={{ marginLeft: 8, color: "#555" }}>{cameraStatus}</span>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <div style={{ border: "1px solid #ddd", padding: 10 }}>
            <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>Preview Kamera</div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                borderRadius: 6,
                background: "#000",
                transform: "scaleX(-1)", // ✅ FIX PREVIEW TIDAK MIRROR
              }}
            />

            <button onClick={capturePhoto} style={{ marginTop: 10, padding: "10px 12px", width: "100%" }}>
              Ambil Foto
            </button>
          </div>

          <div style={{ border: "1px solid #ddd", padding: 10 }}>
            <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>Hasil Foto</div>
            {photoPreview ? (
              <img src={photoPreview} alt="selfie" style={{ width: "100%", borderRadius: 6 }} />
            ) : (
              <div style={{ padding: 16, color: "#777" }}>Belum ada foto</div>
            )}

            <div style={{ marginTop: 10, fontSize: 12, color: "#777" }}>
              (Foto akan dikirim sebagai file <code>photo</code> ke backend)
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      {/* Catatan */}
      <div style={{ padding: 12, border: "1px solid #ddd" }}>
        <b>Keterangan / Kondisi:</b>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Patroli aman / kondisi aman / dll"
          style={{ width: "100%", marginTop: 8, padding: 10, minHeight: 110 }}
        />

        <button
          onClick={submit}
          disabled={!canSubmit}
          style={{ marginTop: 10, padding: "12px 14px", width: "100%" }}
        >
          Submit
        </button>

        <button
          onClick={() => nav("/satpam")}
          style={{ marginTop: 10, padding: "10px 14px", width: "100%" }}
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}
