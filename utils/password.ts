export type PasswordValidation = {
  valid: boolean
  errors: string[]
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Minimal 8 karakter")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Minimal 1 huruf kapital")
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Minimal 1 angka")
  }

  return {
    valid: errors.length === 0,
    errors
  }
}