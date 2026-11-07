const REVIEW_CODE_DIGEST = '8f0995314d500c91365cda858761aa7219a28d4d536e6f6600815424178b5b35';

export async function matchesReviewCode(value) {
  const code = value.trim().toLowerCase();
  if (!/^[a-f0-9]{32}$/.test(code)) return false;

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
  const hex = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  return hex === REVIEW_CODE_DIGEST;
}
