import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const url = new URL(req.url);
  const busca = url.searchParams.get("busca") || "";

  const estoqueItens = await prisma.estoqueItem.findMany({
    where: {
      id_conta: payload.id_conta,
      fl_ativo: true,
      ...(busca
        ? { materialItem: { tx_nome: { contains: busca, mode: "insensitive" as const } } }
        : {}),
    },
    orderBy: { dt_criacao: "desc" },
    include: {
      materialItem: { select: { tx_nome: true, tx_codigo: true, id_unid_consumo: true } },
    },
    take: 100,
  });

  return NextResponse.json({ estoqueItens, total: estoqueItens.length });
}
