"use server";

import paths from "@/utils/paths";
import apiPaths from "@/utils/api-path";
import { revalidatePath } from "next/cache";

export async function getCakes(type: string) {
  const { getCakesByType } = apiPaths();

  const res = await fetch(getCakesByType(type));

  const data = await res.json();

  revalidatePath(paths.cakeList());

  return data;
}