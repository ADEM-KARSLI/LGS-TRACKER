export function formatAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("email rate limit")) {
    return "E-posta gönderim limiti doldu. Supabase ücretsiz planda saatte çok az onay maili gönderilir. Çözüm: Dashboard → Authentication → Email → «Confirm email» kapatın, veya 1 saat bekleyin, veya Authentication → Users → Add user ile manuel hesap açın.";
  }

  if (lower.includes("user already registered")) {
    return "Bu e-posta zaten kayıtlı. Giriş sekmesinden deneyin.";
  }

  if (lower.includes("invalid login credentials")) {
    return "E-posta veya şifre hatalı.";
  }

  if (lower.includes("email not confirmed")) {
    return "E-posta henüz onaylanmamış. Gelen kutunuzu kontrol edin veya Dashboard'da e-posta onayını kapatın.";
  }

  return message;
}
