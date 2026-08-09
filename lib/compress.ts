const MAX_EDGE = 1600
const QUALITY = 0.82

/**
 * Shrinks a phone photo before upload. A modern phone camera produces 4–8 MB
 * per shot; at 1600px on the long edge these land around 200–350 KB, which
 * keeps her storage free tier usable across hundreds of fabrics and keeps the
 * catalogue quick to load on mobile data.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  const bitmap = await loadBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) return file

  context.drawImage(bitmap, 0, 0, width, height)
  if ('close' in bitmap) bitmap.close()

  const blob = await toBlob(canvas)
  if (!blob || blob.size >= file.size) return file

  return new File([blob], replaceExtension(file.name), {
    type: 'image/jpeg',
    lastModified: file.lastModified,
  })
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      // Honours the EXIF orientation tag, so photos taken sideways stay upright.
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // Fall through to the <img> path below.
    }
  }

  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    return image
  } finally {
    URL.revokeObjectURL(url)
  }
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', QUALITY),
  )
}

function replaceExtension(name: string): string {
  return `${name.replace(/\.[^.]+$/, '')}.jpg`
}

/** Storage object key. Random prefix avoids collisions between same-named photos. */
export function storagePathFor(file: File): string {
  const random = crypto.randomUUID().slice(0, 8)
  const safe = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(-40)
  return `${random}-${safe || 'fabric.jpg'}`
}
