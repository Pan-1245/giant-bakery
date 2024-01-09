import { formatDate } from "@/lib/formatDate";
import { bucket } from "@/lib/gcs/gcs";
import { getFileUrl } from "@/lib/gcs/getFileUrl";
import { isObjectId } from "@/lib/isObjectId";
import { parseBoolean } from "@/lib/parseBoolean";
import { prisma } from "@/lib/prisma";
import { refreshmentValidationSchema } from "@/lib/validation-schema";
import { responseWrapper } from "@/utils/api-response-wrapper";
import type { RefreshmentCategory, StockStatus } from "@prisma/client";
import { NextRequest } from "next/server";

type GetRefreshmentById = {
  params: {
    id: string;
  };
};

export async function GET(_req: NextRequest, { params }: GetRefreshmentById) {
  try {
    const { id } = params;

    const validId = isObjectId(id);

    if (!validId) {
      return responseWrapper(400, null, "Invalid Object Id.");
    }

    let refreshment = await prisma.refreshment.findUnique({
      where: { id: id, isDeleted: false },
    });

    if (!refreshment) {
      return responseWrapper(
        404,
        null,
        `Refreshment with given id ${id} not found.`,
      );
    }

    const imagePath = `refreshments/${refreshment.category}/${refreshment.id}/${refreshment.imageFileName}`;

    const newFileUrl = await getFileUrl(imagePath);

    refreshment = await prisma.refreshment.update({
      where: { id: id },
      data: {
        image: newFileUrl,
      },
    });

    return responseWrapper(200, refreshment, null);
  } catch (err: any) {
    return responseWrapper(500, null, err.message);
  }
}

export async function PUT(req: NextRequest, { params }: GetRefreshmentById) {
  try {
    const { id } = params;

    const validId = isObjectId(id);

    if (!validId) {
      return responseWrapper(400, null, "Invalid Object Id.");
    }

    const formData = await req.formData();

    const refreshment = await prisma.refreshment.findUnique({
      where: { id: id, isDeleted: false },
    });

    if (!refreshment) {
      return responseWrapper(
        404,
        null,
        `Refreshment with given id ${id} not found.`,
      );
    }

    const name = formData.get("name") as string;
    const category = formData.get("category") as RefreshmentCategory;
    const status = formData.get("status") as StockStatus;
    const minQty = parseInt(formData.get("minQty") as string);
    const maxQty = parseInt(formData.get("maxQty") as string);
    const currQty = parseInt(formData.get("currQty") as string);
    const weight = parseFloat(formData.get("weight") as string);
    const height = parseFloat(formData.get("height") as string);
    const length = parseFloat(formData.get("length") as string);
    const width = parseFloat(formData.get("width") as string);
    const price = parseFloat(formData.get("price") as string);
    const isActive = parseBoolean(formData.get("isActive") as string);

    const validation = refreshmentValidationSchema.safeParse({
      name,
      category,
      status,
      minQty,
      maxQty,
      currQty,
      weight,
      height,
      length,
      width,
      price,
      isActive,
    });

    if (!validation.success) {
      return responseWrapper(400, null, validation.error.message);
    }

    const image = formData.get("image") as File | null;

    let imageFileName = refreshment.imageFileName as string;

    if (image) {
      const oldImage = bucket.file(refreshment.imageFileName as string);
      await oldImage.delete();

      const buffer = Buffer.from(await image.arrayBuffer());

      const updatedImageFileName = `${formatDate(
        new Date(Date.now()).toString(),
      )}_${image.name.replace(/\s/g, "_")}`;

      const gcsFile = bucket.file(updatedImageFileName);

      await gcsFile.save(buffer, {
        metadata: {
          contentType: image.type,
        },
      });

      imageFileName = updatedImageFileName;
    }

    const imageUrl = await getFileUrl(imageFileName);

    const updatedRefreshment = await prisma.refreshment.update({
      where: { id: refreshment.id },
      data: {
        name: name,
        imageFileName: imageFileName,
        image: imageUrl,
        category: category,
        status: status,
        minQty: minQty,
        maxQty: maxQty,
        currQty: currQty,
        weight: weight,
        height: height,
        length: length,
        width: width,
        price: price,
        isActive: isActive,
      },
    });

    return responseWrapper(200, updatedRefreshment, null);
  } catch (err: any) {
    return responseWrapper(500, null, `Something went wrong.\n ${err.message}`);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: GetRefreshmentById,
) {
  try {
    const { id } = params;

    const validId = isObjectId(id);

    if (!validId) {
      return responseWrapper(400, null, "Invalid Object Id.");
    }

    const refreshment = await prisma.refreshment.findUnique({
      where: { id: id, isDeleted: false },
    });

    if (!refreshment) {
      return responseWrapper(
        404,
        null,
        `Refreshment with given id ${id} not found.`,
      );
    }

    const deletedRefreshment = await prisma.refreshment.update({
      where: { id: refreshment.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now()),
      },
    });

    // const oldImage = bucket.file(refreshment.imageFileName as string);
    // await oldImage.delete();

    return responseWrapper(200, null, null);
  } catch (err: any) {
    return responseWrapper(500, null, err.message);
  }
}
