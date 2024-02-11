"use server";

import paths from "@/utils/paths";
import apiPaths from "@/utils/api-path";
import { revalidatePath } from "next/cache";

// ----------------------------------------------------------------------

export async function getAllPresetCakes() {
  const { getCakes } = apiPaths();

  const res = await fetch(getCakes());

  const data = await res.json();

  revalidatePath(paths.cakeList());

  return data;
}
