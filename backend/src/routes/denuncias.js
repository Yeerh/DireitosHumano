import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  DENUNCIA_TIPO_TO_DB,
  DENUNCIA_TIPO_TO_FRONT,
  DENUNCIA_CATEGORIA_TO_DB,
  DENUNCIA_CATEGORIA_TO_FRONT,
} from "../lib/enums.js";

const router = Router();

function toFrontDenuncia(d) {
  if (!d) return null;
  return {
    ...d,
    tipo: DENUNCIA_TIPO_TO_FRONT[d.tipo] ?? d.tipo,
    categoria: DENUNCIA_CATEGORIA_TO_FRONT[d.categoria] ?? d.categoria,
    createdAt: d.createdAt.toISOString(),
  };
}

// GET /denuncias - listar todas
router.get("/", async (_req, res) => {
  try {
    const list = await prisma.denuncia.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(list.map(toFrontDenuncia));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao listar denúncias." });
  }
});

// GET /denuncias/:id - uma por id
router.get("/:id", async (req, res) => {
  try {
    const d = await prisma.denuncia.findUnique({
      where: { id: req.params.id },
    });
    if (!d) return res.status(404).json({ error: "Denúncia não encontrada." });
    return res.json(toFrontDenuncia(d));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar denúncia." });
  }
});

// POST /denuncias - criar (público, como no front)
router.post("/", async (req, res) => {
  try {
    const body = req.body || {};
    const tipoFront = body.tipo || "Denúncia";
    const tipoDb = DENUNCIA_TIPO_TO_DB[tipoFront] ?? tipoFront;
    const categoriaFront = body.categoria || "Outros";
    const categoriaDb = DENUNCIA_CATEGORIA_TO_DB[categoriaFront] ?? categoriaFront;
    const titulo = String(body.titulo || "").trim();
    const mensagem = String(body.mensagem || "").trim();
    const localOcorrido = body.localOcorrido ? String(body.localOcorrido).trim() : null;
    const anonimo = Boolean(body.anonimo !== false);
    const nome = anonimo ? null : (body.nome ? String(body.nome).trim() : null);
    const telefone = anonimo ? null : (body.telefone ? String(body.telefone).trim() : null);
    const email = anonimo ? null : (body.email ? String(body.email).trim() : null);

    if (titulo.length < 5) {
      return res.status(400).json({ error: "Título curto demais (mínimo de 5 caracteres)." });
    }
    if (mensagem.length < 20) {
      return res.status(400).json({ error: "Mensagem curta demais (mínimo de 20 caracteres)." });
    }
    if (!anonimo && !nome) {
      return res.status(400).json({ error: "Informe seu nome ou marque envio anônimo." });
    }
    if (!anonimo && email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: "Informe um e-mail válido." });
    }

    const denuncia = await prisma.denuncia.create({
      data: {
        tipo: tipoDb,
        categoria: categoriaDb,
        titulo,
        mensagem,
        localOcorrido,
        anonimo,
        nome,
        telefone,
        email,
        status: "Recebido",
      },
    });
    return res.status(201).json(toFrontDenuncia(denuncia));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao registrar denúncia." });
  }
});

// PUT /denuncias/:id - atualizar (ex.: mudar status)
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body || {};
    const existing = await prisma.denuncia.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Denúncia não encontrada." });

    const updates = {};
    if (body.tipo != null) updates.tipo = DENUNCIA_TIPO_TO_DB[body.tipo] ?? body.tipo;
    if (body.categoria != null) updates.categoria = DENUNCIA_CATEGORIA_TO_DB[body.categoria] ?? body.categoria;
    if (body.titulo != null) updates.titulo = String(body.titulo).trim();
    if (body.mensagem != null) updates.mensagem = String(body.mensagem).trim();
    if (body.localOcorrido !== undefined) updates.localOcorrido = body.localOcorrido ? String(body.localOcorrido).trim() : null;
    if (body.status != null) updates.status = String(body.status);

    const denuncia = await prisma.denuncia.update({
      where: { id },
      data: updates,
    });
    return res.json(toFrontDenuncia(denuncia));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar denúncia." });
  }
});

// DELETE /denuncias/:id
router.delete("/:id", async (req, res) => {
  try {
    await prisma.denuncia.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Denúncia não encontrada." });
    console.error(err);
    return res.status(500).json({ error: "Erro ao excluir denúncia." });
  }
});

export default router;
