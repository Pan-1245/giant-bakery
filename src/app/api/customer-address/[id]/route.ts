import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { responseWrapper } from "@/utils/api-response-wrapper";

// ----------------------------------------------------------------------

type GetAddressByIdParams = {
  params: {
    id: string;
  };
};

export async function PUT(req: NextRequest, { params }: GetAddressByIdParams) {
  try {
    const addressId = params.id;
    const body = await req.json();

    const address = await prisma.customerAddress.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      return responseWrapper(
        404,
        null,
        `Addresss with given id ${params.id} not found.`,
      );
    }

    const updatedAddress = await prisma.customerAddress.update({
      where: { id: address.id },
      data: body,
    });

    return responseWrapper(200, updatedAddress, null);
  } catch (err: any) {
    return responseWrapper(
      500,
      null,
      `Something went wrong./n Error: ${err.message}`,
    );
  }
}

export async function DELETE({ params }: GetAddressByIdParams) {
  try {
    const addressId = params.id;

    const address = prisma.customerAddress.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      return responseWrapper(
        404,
        null,
        `Addresss with given id ${params.id} not found.`,
      );
    }

    await prisma.customerAddress.delete({
      where: { id: addressId },
    });

    return responseWrapper(200, null, null);
  } catch (err: any) {
    return responseWrapper(
      500,
      null,
      `Something went wrong./n Error: ${err.message}`,
    );
  }
}
