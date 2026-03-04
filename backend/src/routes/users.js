import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function onlyDigits(str) {
  return String(str).replace(/\D/g, "");
}

function safeUser(u) {
  if (!u) return null;
  const { senha: _, ...rest } = u;
  return { ...rest, createdAt: u.createdAt?.toISOString?.() ?? u.createdAt };
}

// GET /users - listar (protegido, útil para admin)
router.get("/", requireAuth, async (_req, res) => {
  try {
    const list = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(list.map(safeUser));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao listar usuários." });
  }
});

// GET /users/:id - um por id (protegido)
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const u = await prisma.user.findUnique({
      where: { id: req.params.id },
    });
    if (!u) return res.status(404).json({ error: "Usuário não encontrado." });
    return res.json(safeUser(u));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar usuário." });
  }
});

// PUT /users/:id - atualizar (protegido; só o próprio usuário ou admin)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    if (req.user.id !== id) {
      return res.status(403).json({ error: "Sem permissão para editar este usuário." });
    }
    const body = req.body || {};
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Usuário não encontrado." });

    const updates = {};
    if (body.numero != null) updates.numero = String(body.numero).trim();
    if (body.nome != null) updates.nome = String(body.nome).trim();
    if (body.email != null) {
      const emailNorm = String(body.email).trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(emailNorm)) {
        return res.status(400).json({ error: "E-mail inválido." });
      }
      const outro = await prisma.user.findFirst({
        where: { email: emailNorm, id: { not: id } },
      });
      if (outro) return res.status(409).json({ error: "Este e-mail já está em uso." });
      updates.email = emailNorm;
    }
    if (body.login != null) {
      const loginNorm = String(body.login).trim().toLowerCase();
      if (loginNorm.length < 3) return res.status(400).json({ error: "Login deve ter pelo menos 3 caracteres." });
      const outro = await prisma.user.findFirst({
        where: { login: loginNorm, id: { not: id } },
      });
      if (outro) return res.status(409).json({ error: "Este login já está em uso." });
      updates.login = loginNorm;
    }
    if (body.senha != null && body.senha.length >= 4) {
      updates.senha = await bcrypt.hash(body.senha, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updates,
    });
    return res.json(safeUser(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar usuário." });
  }
});

// DELETE /users/:id - excluir (protegido; só o próprio)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: "Sem permissão para excluir este usuário." });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Usuário não encontrado." });
    console.error(err);
    return res.status(500).json({ error: "Erro ao excluir usuário." });
  }
});

export default router;
