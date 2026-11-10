import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, senha } = body;

  if (!email || !senha) {
    return NextResponse.json(
      { error: "Email e senha são obrigatórios" },
      { status: 400 }
    );
  }

  const usuario = await prisma.usuario.findUnique({
    where: { tx_email: email },
    include: { conta: true },
  });

  if (!usuario || !usuario.fl_ativo) {
    return NextResponse.json(
      { error: "Credenciais inválidas" },
      { status: 401 }
    );
  }

  const senhaValida = await bcrypt.compare(senha, usuario.tx_senha);
  if (!senhaValida) {
    return NextResponse.json(
      { error: "Credenciais inválidas" },
      { status: 401 }
    );
  }

  const token = signToken({
    id_usuario: usuario.id_usuario,
    id_conta: usuario.id_conta,
    tx_nome: usuario.tx_nome,
    tx_email: usuario.tx_email,
  });

  const response = NextResponse.json({
    success: true,
    usuario: {
      id_usuario: usuario.id_usuario,
      tx_nome: usuario.tx_nome,
      tx_email: usuario.tx_email,
      conta: {
        id_conta: usuario.conta.id_conta,
        tx_nome: usuario.conta.tx_nome,
      },
    },
  });

  response.cookies.set("dentalsix-token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  return response;
}
