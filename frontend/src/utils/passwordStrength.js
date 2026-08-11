// Same password strength rule enforced by the backend (StrongPasswordValidator):
// at least 8 characters, one uppercase, one lowercase, and a special character from @ # $ % ! & *
export const STRONG_PASSWORD_RE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[@#$%!&*]).{8,}$/;

export function isStrongPassword(password) {
  return STRONG_PASSWORD_RE.test(password || "");
}
