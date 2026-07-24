// Escrita segura no localStorage — o orçamento (~5 MB) é partilhado por etiquetas
// e config (que carrega o logo em base64). Sem guarda, um estouro de quota é uma
// exceção não tratada e perda silenciosa de dados.

export type SetResult = { ok: true } | { ok: false; quota: boolean };

export function safeSetItem(key: string, value: string): SetResult {
  try {
    localStorage.setItem(key, value);
    return { ok: true };
  } catch (e) {
    const quota =
      e instanceof DOMException &&
      // nomes/códigos variam por browser
      (e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        e.code === 22);
    return { ok: false, quota: !!quota };
  }
}
