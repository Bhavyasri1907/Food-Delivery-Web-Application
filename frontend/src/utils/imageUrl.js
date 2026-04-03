export function getImageUrl(image, version) {
  const normalizedInput = typeof image === 'string' ? image.trim() : '';
  if (!normalizedInput) return '';
  const isAbsolute = /^https?:\/\//i.test(normalizedInput);

  const baseUrl = isAbsolute
    ? normalizedInput
    : `http://localhost:5000${normalizedInput.startsWith('/') ? normalizedInput : `/${normalizedInput}`}`;

  // Keep external URLs stable; version busting is only useful for local uploads.
  if (!version || isAbsolute) return baseUrl;

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('v', String(version));
    return url.toString();
  } catch {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}v=${encodeURIComponent(String(version))}`;
  }
}

export function handleImageError(event, seed = 'food') {
  const target = event.currentTarget;
  if (target.dataset.fallbackApplied === '1') return;
  target.dataset.fallbackApplied = '1';
  target.src = `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`;
}
