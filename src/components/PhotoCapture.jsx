import React, { useRef, useState } from 'react';

const MAX_SIZE = 1200;
const JPEG_QUALITY = 0.8;

function resizeImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function PhotoCapture({ label, onCapture, existingPhoto, onClear }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(existingPhoto || null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await resizeImage(file);
    setPreview(base64);
    onCapture(base64);
    e.target.value = '';
  };

  const handleRetake = () => {
    setPreview(null);
    if (onClear) onClear();
    fileRef.current?.click();
  };

  return (
    <div className="photo-capture">
      <div className="photo-capture-label">{label || 'Photo'}</div>

      {preview ? (
        <div className="photo-capture-preview">
          <img src={preview} alt="Preview" className="photo-capture-img" />
          <button className="photo-capture-retake" onClick={handleRetake}>
            Refaire
          </button>
        </div>
      ) : (
        <button
          className="photo-capture-btn"
          onClick={() => fileRef.current?.click()}
        >
          <span className="photo-capture-icon">+</span>
          <span>Prendre une photo</span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
    </div>
  );
}
