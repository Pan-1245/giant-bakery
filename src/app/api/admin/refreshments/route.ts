import { formatDate } from "@/lib/formatDate";
import { bucket } from "@/lib/gcs/gcs";
import { getFileUrl } from "@/lib/gcs/getFileUrl";
import { parseBoolean } from "@/lib/parseBoolean";
import { prisma } from "@/lib/prisma";
import { refreshmentValidationSchema } from "@/lib/validation-schema";
import { responseWrapper } from "@/utils/api-response-wrapper";
import type { RefreshmentCategory, StockStatus } from "@prisma/client";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const image = formData.get("image") as File | null;

    if (!image) {
      return responseWrapper(400, null, "Invalid image file.");
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const imageFileName = `${formatDate(new Date(Date.now()).toString())}_${
      image.name
    }`;
    const gcsFile = bucket.file(imageFileName);

    await gcsFile.save(buffer, {
      metadata: {
        contentType: image.type,
      },
    });

    const imageUrl = await getFileUrl(imageFileName);

    const name = formData.get("name") as string;
    const category = formData.get("category") as RefreshmentCategory;
    const status = formData.get("status") as StockStatus;
    const minQty = parseInt(formData.get("minQty") as string);
    const maxQty = parseInt(formData.get("maxQty") as string);
    const currQty = parseInt(formData.get("currQty") as string);
    const price = parseFloat(formData.get("price") as string);
    const isActive = parseBoolean(formData.get("isActive") as string);

    const validation = refreshmentValidationSchema.safeParse({
      name,
      category,
      status,
      minQty,
      maxQty,
      currQty,
      price,
      isActive,
    });

    if (!validation.success) {
      return responseWrapper(400, null, validation.error.message);
    }

    const newRefreshment = await prisma.refreshment.create({
      data: {
        name: name,
        image: imageUrl,
        category: category,
        status: status,
        minQty: minQty,
        maxQty: maxQty,
        currQty: currQty,
        price: price,
        isActive: isActive,
      },
    });

    return responseWrapper(201, newRefreshment, null);
  } catch (err: any) {
    return responseWrapper(500, null, `Something went wrong./n ${err.message}`);
  }
}
