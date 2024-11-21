 'use server';

import { auth } from "@/auth";
import { IUser } from "../definition";
import userRepository from "../repository/mongodb/user.repository";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt"; 

const repository = userRepository;

export async function findOneUser(props: { email: string; connected?: boolean }) {
  const user = await repository.findOne(props);
  return user;
}

export async function findOneUserById(props: { id: string; connected?: boolean }) {
  const user = await repository.findOne(props);
  return user;
}

export async function findAllUsers(input?: Partial<IUser>): Promise<IUser[]> {
  return (await repository.findMany(input ?? {})) as IUser[];
}

export async function createOneUser(input: Omit<IUser, "id" | "created_at" | "user_id">) {
  const session = await auth();
  const created_at = new Date();
  const id = crypto.randomUUID();

  // Criptografar a senha
  const hashedPassword = await bcrypt.hash(input.password, 10);

  const _input = {
    ...input,
    password: hashedPassword, // Substituir a senha pelo hash
    created_at,
    id,
    user_id: session?.user.id!,
  };

  await repository.create(_input);
  revalidatePath("/user");
  revalidatePath("/configurator");
  revalidatePath("/configuration");
  return _input;
}

export async function updateOneUserById(
  query: { id: string },
  value: Partial<Omit<IUser, "id" | "created_at">>
) {
  // Se o valor incluir uma nova senha, criptografar antes de atualizar
  if (value.password) {
    value.password = await bcrypt.hash(value.password, 10);
  }

  const result = await repository.updateOne(query, value);
  return result;
}

export async function updateOneUserByEmail(
  query: { email: string },
  value: Partial<Omit<IUser, "id" | "created_at">>
) {
  // Se o valor incluir uma nova senha, criptografar antes de atualizar
  if (value.password) {
    value.password = await bcrypt.hash(value.password, 10);
  }

  const result = await repository.updateOne(query, value);
  return result;
}

export async function deleteOneUserById(query: { id: string }) {
  const result = await repository.deleteOne(query);
  revalidatePath("/user");
  revalidatePath("/configurator");
  return result;
}
