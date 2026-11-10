import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

  const [pacientes, agendamentos, recebimentos, despesas, tratamentos] = await Promise.all([
    prisma.paciente.count({
      where: { id_conta: payload.id_conta, fl_ativo: true },
    }),
    prisma.agendaItem.count({
      where: {
        id_conta: payload.id_conta,
        fl_ativo: true,
        dt_inicio: {
          gte: new Date(hoje.setHours(0, 0, 0, 0)),
          lt: new Date(hoje.setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.recebimento.aggregate({
      where: {
        id_conta: payload.id_conta,
        fl_ativo: true,
        dt_vencimento: { gte: inicioMes, lte: fimMes },
      },
      _sum: { vl_debito: true, vl_credito: true },
      _count: true,
    }),
    prisma.despesa.aggregate({
      where: {
        id_conta: payload.id_conta,
        fl_ativo: true,
        dt_vencimento: { gte: inicioMes, lte: fimMes },
      },
      _sum: { vl_despesa: true, vl_pago: true },
      _count: true,
    }),
    prisma.tratamento.count({
      where: { id_conta: payload.id_conta, fl_ativo: true, cd_situacao: "ATIVO" },
    }),
  ]);

  return NextResponse.json({
    pacientes,
    agendamentos,
    tratamentosAtivos: tratamentos,
    receber: Number(recebimentos._sum.vl_debito || 0) - Number(recebimentos._sum.vl_credito || 0),
    receberCount: recebimentos._count,
    pagar: Number(despesas._sum.vl_despesa || 0) - Number(despesas._sum.vl_pago || 0),
    pagarCount: despesas._count,
  });
}
