"use server";

import { revalidatePath } from "next/cache";

export const revalidate = (originalPath: string, type?: "layout" | "page") => {
  revalidatePath(originalPath, type);
};
