export type PortalUser = {
  id: string;
  createdAt: string;

  nome: string;
  email: string;
  cpf: string;       // só dígitos
  telefone: string;  // texto (DDD)
  senhaHash: string; // MVP: hash simples
};
