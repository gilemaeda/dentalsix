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

  const where = {
    id_conta: payload.id_conta,
    fl_ativo: true,
    ...(busca ? { tx_nome: { contains: busca, mode: "insensitive" as const } } : {}),
  };

  const [prestadores, total] = await Promise.all([
    prisma.prestador.findMany({
      where,
      orderBy: { tx_nome: "asc" },
      include: { especialidade: true },
    }),
    prisma.prestador.count({ where }),
  ]);

  return NextResponse.json({ prestadores, total });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("dentalsix-token")?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const body = await req.json();
  if (!body.tx_nome?.trim()) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });

  const prestador = await prisma.prestador.create({
    data: {
      tx_nome: body.tx_nome.trim(),
      tx_apelido: body.tx_apelido || null,
      tx_cpf: body.tx_cpf || null,
      tx_cro: body.tx_cro || null,
      id_cro_uf: body.id_cro_uf || null,
      cd_tipo: body.cd_tipo || null,
      cd_tipo_pessoa: body.cd_tipo_pessoa || null,
      tx_cnpj: body.tx_cnpj || null,
      tx_razao_social: body.tx_razao_social || null,
      tx_email_remetente: body.tx_email_remetente || null,
      tx_observacoes: body.tx_observacoes || null,
      id_tipo_prestador: body.id_tipo_prestador || null,
      id_prestador_principal: body.id_prestador_principal || null,
      id_especialidade: body.id_especialidade || null,
      // Responsible person
      tx_resp_nome: body.tx_resp_nome || null,
      tx_resp_cpf: body.tx_resp_cpf || null,
      tx_resp_cro: body.tx_resp_cro || null,
      id_resp_cro_uf: body.id_resp_cro_uf || null,
      id_resp_sexo: body.id_resp_sexo || null,
      dt_resp_data_nasc: body.dt_resp_data_nasc ? new Date(body.dt_resp_data_nasc) : null,
      id_resp_estado_civil: body.id_resp_estado_civil || null,
      tx_resp_inss: body.tx_resp_inss || null,
      // Address
      tx_cep: body.tx_cep || null,
      id_tipo_logradouro: body.id_tipo_logradouro || null,
      tx_endereco: body.tx_endereco || null,
      tx_numero: body.tx_numero || null,
      tx_complemento: body.tx_complemento || null,
      tx_referencia: body.tx_referencia || null,
      id_uf: body.id_uf || null,
      id_cidade: body.id_cidade || null,
      id_bairro: body.id_bairro || null,
      // Phone 1
      id_tipo_fone1: body.id_tipo_fone1 || null,
      tx_fone_ddd1: body.tx_fone_ddd1 || null,
      tx_fone_nro1: body.tx_fone_nro1 || null,
      tx_fone_ram1: body.tx_fone_ram1 || null,
      // Phone 2
      id_tipo_fone2: body.id_tipo_fone2 || null,
      tx_fone_ddd2: body.tx_fone_ddd2 || null,
      tx_fone_nro2: body.tx_fone_nro2 || null,
      tx_fone_ram2: body.tx_fone_ram2 || null,
      // Email 1
      id_tipo_email1: body.id_tipo_email1 || null,
      tx_email1: body.tx_email1 || null,
      // Email 2
      id_tipo_email2: body.id_tipo_email2 || null,
      tx_email2: body.tx_email2 || null,
      id_conta: payload.id_conta,
    },
  });

  return NextResponse.json(prestador, { status: 201 });
}
