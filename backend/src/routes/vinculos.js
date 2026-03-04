import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function onlyDigits(str) {
  return String(str).replace(/\D/g, "");
}

function toFrontVinculo(v) {
  if (!v) return null;
  return { ...v, createdAt: v.createdAt.toISOString() };
}

// GET /vinculos/terreiro/:terreiroId - por terreiro (antes de /:id)
router.get("/terreiro/:terreiroId", async (req, res) => {
  try {
    const list = await prisma.vinculo.findMany({
      where: { terreiroId: req.params.terreiroId },
      orderBy: { createdAt: "desc" },
    });
    return res.json(list.map(toFrontVinculo));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao listar vínculos." });
  }
});

// GET /vinculos - todos
router.get("/", async (_req, res) => {
  try {
    const list = await prisma.vinculo.findMany({
      orderBy: { createdAt: "desc" },
      include: { terreiro: { select: { id: true, nomeCasa: true } } },
    });
    return res.json(list.map((v) => ({ ...toFrontVinculo(v), terreiro: v.terreiro })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao listar vínculos." });
  }
});

// GET /vinculos/:id - um por id
router.get("/:id", async (req, res) => {
  try {
    const v = await prisma.vinculo.findUnique({
      where: { id: req.params.id },
      include: { terreiro: true },
    });
    if (!v) return res.status(404).json({ error: "Vínculo não encontrado." });
    return res.json({ ...toFrontVinculo(v), terreiro: v.terreiro });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar vínculo." });
  }
});

// POST /vinculos - criar (protegido)
router.post("/", requireAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const terreiroId = String(body.terreiroId || "").trim();
    const nomePessoa = String(body.nomePessoa || "").trim();
    const cpf = onlyDigits(body.cpf || "");
    const email = String(body.email || "").trim().toLowerCase();
    const numero = String(body.numero || "").trim();
    const funcao = body.funcao ? String(body.funcao).trim() : null;

    if (!terreiroId) return res.status(400).json({ error: "Selecione um terreiro." });
    const terreiro = await prisma.terreiro.findUnique({ where: { id: terreiroId } });
    if (!terreiro) return res.status(400).json({ error: "Terreiro não encontrado." });
    if (nomePessoa.length < 3) return res.status(400).json({ error: "Informe o nome completo." });
    if (cpf.length !== 11) return res.status(400).json({ error: "Informe um CPF com 11 dígitos." });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Informe um e-mail válido." });
    if (onlyDigits(numero).length < 10) return res.status(400).json({ error: "Informe um número válido." });

    const vinculo = await prisma.vinculo.create({
      data: { terreiroId, nomePessoa, cpf, email, numero, funcao },
    });
    return res.status(201).json(toFrontVinculo(vinculo));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao criar vínculo." });
  }
});

// PUT /vinculos/:id - atualizar (protegido)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body || {};
    const existing = await prisma.vinculo.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Vínculo não encontrado." });

    const nomePessoa = String(body.nomePessoa ?? existing.nomePessoa).trim();
    const cpf = body.cpf !== undefined ? onlyDigits(body.cpf) : existing.cpf;
    const email = String(body.email ?? existing.email).trim().toLowerCase();
    const numero = String(body.numero ?? existing.numero).trim();
    const funcao = body.funcao != null ? String(body.funcao).trim() || null : existing.funcao;
    const terreiroId = body.terreiroId ?? existing.terreiroId;

    if (nomePessoa.length < 3) return res.status(400).json({ error: "Informe o nome completo." });
    if (cpf.length !== 11) return res.status(400).json({ error: "Informe um CPF com 11 dígitos." });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Informe um e-mail válido." });
    if (onlyDigits(numero).length < 10) return res.status(400).json({ error: "Informe um número válido." });

    const vinculo = await prisma.vinculo.update({
      where: { id },
      data: { terreiroId, nomePessoa, cpf, email, numero, funcao },
    });
    return res.json(toFrontVinculo(vinculo));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar vínculo." });
  }
});

// DELETE /vinculos/:id (protegido)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.vinculo.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Vínculo não encontrado." });
    console.error(err);
    return res.status(500).json({ error: "Erro ao excluir vínculo." });
  }
});

export default router;
