import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { responseWrapper } from "@/utils/api-response-wrapper";
import { RefreshmentType, RefreshmentCategory } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const type: RefreshmentType = "BAKERY";
    const category = req.nextUrl.searchParams.get(
      "category",
    ) as RefreshmentCategory;

    const refreshments = await prisma.refreshment.findMany({
      where: {
        type: type,
        category: category,
        isActive: true,
        isDeleted: false,
      },
    });

    if (refreshments.length === 0) {
      return responseWrapper(200, null, "No Content");
    }

    return responseWrapper(200, refreshments, null);
  } catch (err: any) {
    return responseWrapper(500, null, err.message);
  }
}