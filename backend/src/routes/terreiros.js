import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { SEGMENTO_TO_DB, SEGMENTO_TO_FRONT, RACA_COR_TO_DB, RACA_COR_TO_FRONT } from "../lib/enums.js";

const router = Router();

function toFrontTerreiro(t) {
  if (!t) return null;
  return {
    ...t,
    segmento: SEGMENTO_TO_FRONT[t.segmento] ?? t.segmento,
    racaCor: RACA_COR_TO_FRONT[t.racaCor] ?? t.racaCor,
    createdAt: t.createdAt.toISOString(),
  };
}

// GET /terreiros - lista todos
router.get("/", async (_req, res) => {
  try {
    const list = await prisma.terreiro.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(list.map(toFrontTerreiro));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao listar terreiros." });
  }
});

// GET /terreiros/:id - um por id
router.get("/:id", async (req, res) => {
  try {
    const t = await prisma.terreiro.findUnique({
      where: { id: req.params.id },
    });
    if (!t) return res.status(404).json({ error: "Terreiro não encontrado." });
    return res.json(toFrontTerreiro(t));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar terreiro." });
  }
});

// POST /terreiros - criar (protegido)
router.post("/", requireAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const nomeCasa = String(body.nomeCasa || "").trim();
    const anoFundacao = Number(body.anoFundacao);
    const segmentoFront = body.segmento;
    const segmentoDb = SEGMENTO_TO_DB[segmentoFront] ?? segmentoFront;
    const qtdFilhosSanto = Number(body.qtdFilhosSanto) || 0;
    const endereco = String(body.endereco || "").trim();
    const liderReligioso = String(body.liderReligioso || "").trim();
    const telefone = String(body.telefone || "").trim();
    const email = String(body.email || "").trim();
    const racaCorFront = body.racaCor;
    const racaCorDb = RACA_COR_TO_DB[racaCorFront] ?? racaCorFront;

    if (!nomeCasa) return res.status(400).json({ error: "Informe o nome da casa." });
    if (!Number.isFinite(anoFundacao) || anoFundacao < 1600 || anoFundacao > new Date().getFullYear()) {
      return res.status(400).json({ error: "Ano de fundação inválido." });
    }
    if (!endereco) return res.status(400).json({ error: "Informe o endereço." });
    if (!liderReligioso) return res.status(400).json({ error: "Informe o líder religioso." });
    if (!telefone) return res.status(400).json({ error: "Informe o telefone." });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Informe um e-mail válido." });

    const terreiro = await prisma.terreiro.create({
      data: {
        nomeCasa,
        anoFundacao,
        segmento: segmentoDb,
        qtdFilhosSanto,
        endereco,
        liderReligioso,
        telefone,
        email,
        racaCor: racaCorDb,
      },
    });
    return res.status(201).json(toFrontTerreiro(terreiro));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao criar terreiro." });
  }
});

// PUT /terreiros/:id - atualizar (protegido)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body || {};
    const existing = await prisma.terreiro.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Terreiro não encontrado." });

    const nomeCasa = String(body.nomeCasa ?? existing.nomeCasa).trim();
    const anoFundacao = Number(body.anoFundacao ?? existing.anoFundacao);
    const segmentoFront = body.segmento ?? existing.segmento;
    const segmentoDb = SEGMENTO_TO_DB[segmentoFront] ?? segmentoFront;
    const qtdFilhosSanto = Number(body.qtdFilhosSanto ?? existing.qtdFilhosSanto) || 0;
    const endereco = String(body.endereco ?? existing.endereco).trim();
    const liderReligioso = String(body.liderReligioso ?? existing.liderReligioso).trim();
    const telefone = String(body.telefone ?? existing.telefone).trim();
    const email = String(body.email ?? existing.email).trim();
    const racaCorFront = body.racaCor ?? existing.racaCor;
    const racaCorDb = RACA_COR_TO_DB[racaCorFront] ?? racaCorFront;

    const terreiro = await prisma.terreiro.update({
      where: { id },
      data: {
        nomeCasa,
        anoFundacao,
        segmento: segmentoDb,
        qtdFilhosSanto,
        endereco,
        liderReligioso,
        telefone,
        email,
        racaCor: racaCorDb,
      },
    });
    return res.json(toFrontTerreiro(terreiro));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar terreiro." });
  }
});

// DELETE /terreiros/:id (protegido)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    await prisma.terreiro.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Terreiro não encontrado." });
    console.error(err);
    return res.status(500).json({ error: "Erro ao excluir terreiro." });
  }
});

export default router;
