"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";

import { requireAdminUser, requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { passwordResetSchema } from "@/lib/validations/auth";

function getRedirectTarget(formData: FormData, fallbackPath: string) {
  const redirectTo = formData.get("redirectTo");

  if (typeof redirectTo === "string" && redirectTo.trim()) {
    return redirectTo.trim();
  }

  return fallbackPath;
}

export async function updateCurrentUserPassword(formData: FormData) {
  const { userId } = await requireCurrentUser();
  const redirectTo = getRedirectTarget(formData, "/dashboard/perfil?senha=ok");
  const parsed = passwordResetSchema.parse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  const senhaHash = await hash(parsed.password, 12);

  await prisma.usuario.update({
    where: { id: userId },
    data: { senhaHash },
  });

  redirect(redirectTo);
}

export async function adminUpdateUserPassword(formData: FormData) {
  await requireAdminUser();
  const parsed = passwordResetSchema.parse({
    userId: formData.get("userId"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  const redirectTo = getRedirectTarget(formData, `/dashboard/gerenciar-usuarios?edit=${parsed.userId}&senha=ok`);
  const senhaHash = await hash(parsed.password, 12);

  await prisma.usuario.update({
    where: { id: parsed.userId! },
    data: { senhaHash },
  });

  redirect(redirectTo);
}

export async function adminDeactivateUser(formData: FormData) {
  const { userId: adminUserId } = await requireAdminUser();
  const targetUserId = Number(formData.get("userId"));

  if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
    throw new Error("Usuario invalido.");
  }

  if (targetUserId === adminUserId) {
    throw new Error("Nao e possivel excluir o proprio usuario por este painel.");
  }

  const targetUser = await prisma.usuario.findUnique({
    where: { id: targetUserId },
    select: { pessoaId: true },
  });

  if (!targetUser) {
    throw new Error("Usuario nao encontrado.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.usuario.update({
      where: { id: targetUserId },
      data: { ativo: false },
    });

    await tx.pessoa.update({
      where: { id: targetUser.pessoaId },
      data: { ativo: false },
    });
  });

  redirect("/dashboard/gerenciar-usuarios?excluido=1");
}
