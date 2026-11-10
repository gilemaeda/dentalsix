import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const anamnese = await prisma.anamnese.findFirst({
      where: { id_anamnese: parseInt(id), id_conta: payload.id_conta },
      include: { itens: { where: { fl_ativo: true }, orderBy: { vl_ordem: "asc" } } },
    });
    if (!anamnese) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    return NextResponse.json(anamnese);
  }

  const [anamneses, total] = await Promise.all([
    prisma.anamnese.findMany({
      where: { id_conta: payload.id_conta, fl_ativo: true },
      orderBy: { tx_nome_questionario: "asc" },
      include: { _count: { select: { itens: true } } },
    }),
    prisma.anamnese.count({ where: { id_conta: payload.id_conta, fl_ativo: true } }),
  ]);

  return NextResponse.json({ anamneses, total });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.tx_nome_questionario?.trim()) {
    return NextResponse.json({ error: "Nome do questionário é obrigatório" }, { status: 400 });
  }

  const anamnese = await prisma.anamnese.create({
    data: {
      tx_nome_questionario: body.tx_nome_questionario.trim(),
      tx_nome_abreviado: body.tx_nome_abreviado || null,
      tx_observacao: body.tx_observacao || null,
      tx_subtitulo: body.tx_subtitulo || null,
      id_conta: payload.id_conta,
      ...(body.itens?.length
        ? {
            itens: {
              create: body.itens.map((item: Record<string, unknown>, idx: number) => ({
                tx_pergunta: item.tx_pergunta || "",
                tx_itens_resposta: item.tx_itens_resposta || null,
                fl_complemento: item.fl_complemento || false,
                tx_ajuda_complemento: item.tx_ajuda_complemento || null,
                fl_alerta: item.fl_alerta || false,
                tx_itens_alerta: item.tx_itens_alerta || null,
                tx_msg_alerta: item.tx_msg_alerta || null,
                vl_ordem: item.vl_ordem || idx + 1,
              })),
            },
          }
        : {}),
    },
  });

  return NextResponse.json(anamnese, { status: 201 });
}
