const Q_KEY = "portal_questionario_completo_v1";

export function setQuestionarioCompleto(v: boolean) {
  localStorage.setItem(Q_KEY, v ? "1" : "0");
}

export function isQuestionarioCompleto() {
  return localStorage.getItem(Q_KEY) === "1";
}
