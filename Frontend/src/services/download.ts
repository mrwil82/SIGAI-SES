import api from "./api";

function isCapacitor(): boolean {
  try {
    const c = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    return !!(c && typeof c.isNativePlatform === "function" && c.isNativePlatform());
  } catch {
    return false;
  }
}

async function downloadOnWeb(blob: Blob, filename: string): Promise<void> {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

async function downloadOnCapacitor(
  blob: Blob,
  filename: string,
): Promise<void> {
  const { Filesystem, Directory } = await import("@capacitor/filesystem");
  const { Share } = await import("@capacitor/share");

  // Convertir blob a base64
  const reader = new FileReader();
  const base64 = await new Promise<string>((resolve, reject) => {
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  // Guardar en Documents (accesible desde el administrador de archivos)
  const savedFile = await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Documents,
  });

  // Intentar compartir/abrir con el gestor de archivos del sistema
  const canShare = await Share.canShare();
  if (canShare.value) {
    await Share.share({
      title: "Descargar archivo",
      text: filename,
      files: [savedFile.uri],
      dialogTitle: "Guardar " + filename,
    });
  }
}

export async function downloadBlob(
  blob: Blob,
  filename: string,
): Promise<void> {
  if (isCapacitor()) {
    await downloadOnCapacitor(blob, filename);
  } else {
    await downloadOnWeb(blob, filename);
  }
}

export async function downloadFromApi(
  url: string,
  filename: string,
): Promise<void> {
  const response = await api.get(url, { responseType: "blob" });
  await downloadBlob(response.data, filename);
}

export async function downloadPostBlob(
  url: string,
  body: object,
  filename: string,
): Promise<void> {
  const response = await api.post(url, body, { responseType: "blob" });
  await downloadBlob(response.data, filename);
}

export async function downloadFromFetch(
  url: string,
  filename: string,
): Promise<void> {
  const token = sessionStorage.getItem("token");
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const blob = await response.blob();
  await downloadBlob(blob, filename);
}
