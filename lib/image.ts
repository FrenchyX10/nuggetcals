const MAX_EDGE = 1920;
const JPEG_QUALITY = 0.92;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = src;
  });
}

export async function prepareImage(file: File): Promise<{
  previewUrl: string;
  thumbnail: string;
  base64: string;
  mimeType: "image/jpeg";
}> {
  if (!file.type.startsWith("image/") && file.type !== "") {
    throw new Error("Please upload a photo (JPG or PNG).");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not process that photo.");
    ctx.drawImage(img, 0, 0, width, height);

    const previewUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    const base64 = previewUrl.split(",")[1] ?? "";
    if (!base64) throw new Error("Could not encode that photo.");

    const thumbScale = Math.min(1, 280 / Math.max(width, height));
    const thumb = document.createElement("canvas");
    thumb.width = Math.max(1, Math.round(width * thumbScale));
    thumb.height = Math.max(1, Math.round(height * thumbScale));
    const tctx = thumb.getContext("2d");
    if (!tctx) throw new Error("Could not make a thumbnail.");
    tctx.drawImage(canvas, 0, 0, thumb.width, thumb.height);

    return {
      previewUrl,
      thumbnail: thumb.toDataURL("image/jpeg", 0.72),
      base64,
      mimeType: "image/jpeg",
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
