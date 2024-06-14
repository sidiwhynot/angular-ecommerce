declare module 'webp-converter' {
    export function buffer(file: File, mimeType: string, quality: string): Promise<Blob>;
  }
  