import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { responseWrapper } from "@/utils/api-response-wrapper";

// ----------------------------------------------------------------------

type GetAddressByIdProps = {
  params: {
    id: string;
    customerId: string;
  };
};

export async function PUT(req: NextRequest, { params }: GetAddressByIdProps) {
  try {
    const { id, customerId } = params;
    const body = await req.json();

    const customerAddresses = await prisma.customerAddress.findMany({
      where: { userId: customerId },
    });

    if (!customerAddresses) {
      return responseWrapper(
        404,
        null,
        `User with given id ${customerId} does not have any addresses.`,
      );
    }

    const address = customerAddresses.find((address) => address.id === id);

    if (!address) {
      return responseWrapper(
        404,
        null,
        `Addresss with given id ${id} not found.`,
      );
    }

    const updatedAddress = await prisma.customerAddress.update({
      where: { id: id },
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

export async function DELETE(
  _req: NextRequest,
  { params }: GetAddressByIdProps,
) {
  try {
    const { id, customerId } = params;

    const customerAddresses = await prisma.customerAddress.findMany({
      where: { userId: customerId },
    });

    if (!customerAddresses) {
      return responseWrapper(
        404,
        null,
        `The user with given id ${customerId} does not have any addresses.`,
      );
    }

    const address = customerAddresses.find((address) => address.id === id);

    if (!address) {
      return responseWrapper(
        404,
        null,
        `Addresss with given id ${id} not found.`,
      );
    }

    await prisma.customerAddress.delete({
      where: { id: id },
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
