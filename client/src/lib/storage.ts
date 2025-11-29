import { nanoid } from "nanoid";

export async function storagePut(file: File, prefix: string): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  const fileKey = `${prefix}-${nanoid()}.${file.name.split(".").pop()}`;
  formData.append("file", file);
  formData.append("key", fileKey);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }

  const data = await response.json();
  return { url: data.url, key: fileKey };
}
