import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function onlyDigits(str) {
  return String(str).replace(/\D/g, "");
}

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { cpf, email, numero, nome, login, senha } = req.body || {};
    const cpfClean = onlyDigits(cpf || "");
    const emailNorm = String(email || "").trim().toLowerCase();
    const loginNorm = String(login || "").trim().toLowerCase();

    if (cpfClean.length !== 11) {
      return res.status(400).json({ error: "Informe um CPF com 11 dígitos." });
    }
    if (!/^\S+@\S+\.\S+$/.test(emailNorm)) {
      return res.status(400).json({ error: "Informe um e-mail válido." });
    }
    if (String(numero || "").trim().length < 10) {
      return res.status(400).json({ error: "Informe um número de telefone válido." });
    }
    if (String(nome || "").trim().length < 3) {
      return res.status(400).json({ error: "Informe o nome completo." });
    }
    if (loginNorm.length < 3) {
      return res.status(400).json({ error: "O login deve ter pelo menos 3 caracteres." });
    }
    if (String(senha || "").length < 4) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 4 caracteres." });
    }

    const existingCpf = await prisma.user.findFirst({
      where: { cpf: cpfClean },
    });
    if (existingCpf) {
      return res.status(409).json({ error: "Já existe um usuário cadastrado com este CPF." });
    }

    const existingEmail = await prisma.user.findFirst({
      where: { email: emailNorm },
    });
    if (existingEmail) {
      return res.status(409).json({ error: "Já existe um usuário cadastrado com este e-mail." });
    }

    const existingLogin = await prisma.user.findFirst({
      where: { login: loginNorm },
    });
    if (existingLogin) {
      return res.status(409).json({ error: "Este login já está em uso." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const user = await prisma.user.create({
      data: {
        cpf: cpfClean,
        email: emailNorm,
        numero: String(numero).trim(),
        nome: String(nome).trim(),
        login: loginNorm,
        senha: senhaHash,
      },
      select: { id: true, cpf: true, email: true, numero: true, nome: true, login: true, createdAt: true },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao registrar usuário." });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { identifier, senha } = req.body || {};
    if (!identifier || !senha) {
      return res.status(400).json({ error: "Informe CPF ou e-mail e a senha." });
    }
    const clean = String(identifier).trim().toLowerCase();
    const digits = onlyDigits(identifier);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: clean },
          { cpf: digits },
        ],
      },
    });
    if (!user) {
      return res.status(401).json({ error: "CPF ou e-mail não encontrados, ou senha inválida." });
    }

    const match = await bcrypt.compare(senha, user.senha);
    if (!match) {
      return res.status(401).json({ error: "CPF ou e-mail não encontrados, ou senha inválida." });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const { senha: _, ...safe } = user;
    return res.json({ user: safe, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao fazer login." });
  }
});

// GET /auth/me (requer token)
router.get("/me", requireAuth, (req, res) => {
  return res.json(req.user);
});

export default router;
