import api from './api';

function isCapacitor(): boolean {
  return !!(window as any).Capacitor;
}

async function downloadOnWeb(blob: Blob, filename: string): Promise<void> {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

async function downloadOnCapacitor(blob: Blob, filename: string): Promise<void> {
  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  const { Share } = await import('@capacitor/share');

  const reader = new FileReader();
  const base64 = await new Promise<string>((resolve, reject) => {
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const savedFile = await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Cache,
  });

  try {
    await Share.share({
      title: filename,
      text: `Descargar ${filename}`,
      url: savedFile.uri,
      dialogTitle: 'Guardar archivo',
    });
  } catch {
    const anchor = document.createElement('a');
    anchor.href = savedFile.uri;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}

export async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  if (isCapacitor()) {
    await downloadOnCapacitor(blob, filename);
  } else {
    await downloadOnWeb(blob, filename);
  }
}

export async function downloadFromApi(url: string, filename: string): Promise<void> {
  const response = await api.get(url, { responseType: 'blob' });
  await downloadBlob(response.data, filename);
}

export async function downloadPostBlob(url: string, body: any, filename: string): Promise<void> {
  const response = await api.post(url, body, { responseType: 'blob' });
  await downloadBlob(response.data, filename);
}

export async function downloadFromFetch(url: string, filename: string): Promise<void> {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const blob = await response.blob();
  await downloadBlob(blob, filename);
}
