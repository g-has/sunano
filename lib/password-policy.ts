/**
 * Política de senha compartilhada entre cadastro e redefinição.
 *
 * Em produção exigimos senha forte (mínimo de 8 caracteres com maiúscula,
 * minúscula, número e símbolo). Em localhost/desenvolvimento a exigência é
 * relaxada para apenas um comprimento mínimo, facilitando testes.
 */

export const STRONG_PASSWORD_HINT =
  "Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo."

const MIN_LENGTH = 8
const DEV_MIN_LENGTH = 6

/** Detecta se a requisição veio de localhost a partir do header `host`. */
export function isLocalhostHost(host: string | null | undefined): boolean {
  if (!host) return false
  const hostname = host.split(":")[0].toLowerCase()
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "[::1]" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost")
  )
}

/**
 * Valida a senha conforme a política. Retorna uma mensagem de erro ou `null`
 * quando a senha é aceita.
 *
 * @param relaxed quando `true` (ex.: localhost) só verifica comprimento mínimo.
 */
export function validatePassword(password: string, relaxed = false): string | null {
  if (relaxed) {
    if (password.length < DEV_MIN_LENGTH) {
      return `A senha deve ter no mínimo ${DEV_MIN_LENGTH} caracteres.`
    }
    return null
  }

  if (password.length < MIN_LENGTH) {
    return `A senha deve ter no mínimo ${MIN_LENGTH} caracteres.`
  }
  if (!/[a-z]/.test(password)) {
    return "A senha deve conter ao menos uma letra minúscula."
  }
  if (!/[A-Z]/.test(password)) {
    return "A senha deve conter ao menos uma letra maiúscula."
  }
  if (!/[0-9]/.test(password)) {
    return "A senha deve conter ao menos um número."
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "A senha deve conter ao menos um símbolo (ex.: !@#$%)."
  }
  return null
}
