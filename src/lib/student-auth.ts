const STUDENT_EMAIL_DOMAIN = "student.app";

export function normalizeStudentUsername(username: string) {
  return username.trim().toLowerCase().replace(/\s+/g, "");
}

export function isStudentUsername(identifier: string) {
  return !identifier.includes("@");
}

export function studentEmailFromUsername(username: string) {
  return `${normalizeStudentUsername(username)}@${STUDENT_EMAIL_DOMAIN}`;
}

export function validateStudentUsername(username: string) {
  const normalized = normalizeStudentUsername(username);
  if (!/^[a-z0-9._-]{3,32}$/.test(normalized)) {
    return {
      valid: false,
      username: normalized,
      error:
        "Kullanıcı adı 3-32 karakter olmalı; sadece harf, rakam, nokta, tire ve alt çizgi kullanın.",
    };
  }

  return { valid: true, username: normalized, error: null };
}
