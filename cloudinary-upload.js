// cloudinary-upload.js
// Uploads a single image file straight from the browser to Cloudinary using
// an unsigned upload preset — no backend server needed.
// Returns the image's secure HTTPS URL, or null if no file was passed in.

const CLOUD_NAME = "dhcpvdnoy";
const UPLOAD_PRESET = "rubels-angels";

export async function uploadImage(file) {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error("Image upload failed: " + errText);
  }

  const data = await res.json();
  return data.secure_url;
}
