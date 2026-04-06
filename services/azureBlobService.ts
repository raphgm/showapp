// Azure Blob Storage upload utility
// Usage: await uploadToAzureBlob(fileOrBlob, filename, sasUrl)

/**
 * Uploads a file or Blob to Azure Blob Storage using a SAS URL.
 * @param fileOrBlob File or Blob to upload
 * @param filename Name for the blob in the container
 * @param sasUrl Full SAS URL to the container (ending with ...?sig=...)
 * @returns The public URL of the uploaded blob
 */
export async function uploadToAzureBlob(fileOrBlob: File | Blob, filename: string, sasUrl: string): Promise<string> {
  // Remove trailing slash if present
  const baseUrl = sasUrl.replace(/\/?(\?|$)/, '/');
  // Compose the blob URL
  const url = `${baseUrl}${filename}${sasUrl.includes('?') ? sasUrl.substring(sasUrl.indexOf('?')) : ''}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': fileOrBlob.type || 'application/octet-stream',
    },
    body: fileOrBlob,
  });
  if (!res.ok) throw new Error(`Azure upload failed: ${res.status} ${res.statusText}`);
  // The blob is now accessible at the same URL (without query string)
  return url.split('?')[0];
}

/**
 * Uploads JSON data as a blob to Azure Blob Storage.
 * @param data JSON-serializable object
 * @param filename Name for the blob (should end with .json)
 * @param sasUrl Full SAS URL to the container
 * @returns The public URL of the uploaded blob
 */
export async function uploadJsonToAzureBlob(data: any, filename: string, sasUrl: string): Promise<string> {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  return uploadToAzureBlob(blob, filename, sasUrl);
}
