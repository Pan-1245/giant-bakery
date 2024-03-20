import paths from "@/utils/paths";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { CakeType, CartItemType } from "@prisma/client";
import { responseWrapper } from "@/utils/api-response-wrapper";
import { cartCustomCakeValidationSchema } from "@/lib/validationSchema";

// ----------------------------------------------------------------------

const CakeInclude = {
  sizes: true,
  bases: true,
  fillings: true,
  creams: true,
  topEdges: true,
  bottomEdges: true,
  decorations: true,
  surfaces: true,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = cartCustomCakeValidationSchema.safeParse(body);

    if (!validation.success) {
      return responseWrapper(400, null, validation.error.format());
    }

    // TODO USER ID FROM TOKEN OR COOKIE ID
    const {
      cakeId,
      type,
      userId,
      quantity,
      sizeId,
      baseId,
      fillingId,
      creamId,
      topEdgeId,
      bottomEdgeId,
      decorationId,
      surfaceId,
      cakeMessage,
    } = body;

    const CartInclude = {
      items: {
        include: {
          customerCake: {
            include: {
              cake: true,
              size: true,
              base: true,
              filling: true,
              cream: true,
              topEdge: true,
              bottomEdge: true,
              decoration: true,
              surface: true,
            },
          },
          snackBox: {
            include: {
              refreshments: {
                include: {
                  refreshment: true,
                },
              },
            },
          },
        },
      },
    };

    let cart = await prisma.cart.findFirst({
      where: {
        userId: userId,
        type: type,
      },
      include: CartInclude,
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: userId,
          type: type,
        },
        include: CartInclude,
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.customerCake?.cakeId === cakeId &&
        (item.customerCake?.baseId === baseId ||
          (item.customerCake?.baseId === null && baseId === "")) &&
        (item.customerCake?.sizeId === sizeId ||
          (item.customerCake?.sizeId === null && sizeId === "")) &&
        (item.customerCake?.fillingId === fillingId ||
          (item.customerCake?.fillingId === null && fillingId === "")) &&
        (item.customerCake?.creamId === creamId ||
          (item.customerCake?.creamId === null && creamId === "")) &&
        (item.customerCake?.topEdgeId === topEdgeId ||
          (item.customerCake?.topEdgeId === null && topEdgeId === "")) &&
        (item.customerCake?.bottomEdgeId === bottomEdgeId ||
          (item.customerCake?.bottomEdgeId === null && bottomEdgeId === "")) &&
        (item.customerCake?.decorationId === decorationId ||
          (item.customerCake?.decorationId === null && decorationId === "")) &&
        (item.customerCake?.surfaceId === surfaceId ||
          (item.customerCake?.surfaceId === null && surfaceId === ""))
    );

    const existingItemsIndex = cart.items.findIndex(
      (item) =>
        item.customerCake?.cakeId === cakeId &&
        (item.customerCake?.baseId === baseId ||
          (item.customerCake?.baseId === null && baseId === "")) &&
        (item.customerCake?.sizeId === sizeId ||
          (item.customerCake?.sizeId === null && sizeId === "")) &&
        (item.customerCake?.fillingId === fillingId ||
          (item.customerCake?.fillingId === null && fillingId === "")) &&
        (item.customerCake?.creamId === creamId ||
          (item.customerCake?.creamId === null && creamId === "")) &&
        (item.customerCake?.topEdgeId === topEdgeId ||
          (item.customerCake?.topEdgeId === null && topEdgeId === "")) &&
        (item.customerCake?.bottomEdgeId === bottomEdgeId ||
          (item.customerCake?.bottomEdgeId === null && bottomEdgeId === "")) &&
        (item.customerCake?.decorationId === decorationId ||
          (item.customerCake?.decorationId === null && decorationId === "")) &&
        (item.customerCake?.surfaceId === surfaceId ||
          (item.customerCake?.surfaceId === null && surfaceId === ""))
    );

    if (existingItem) {
      cart.items[existingItemsIndex] = await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: existingItem.quantity + quantity,
        },
        include: CartInclude.items.include,
      });
    } else {
      const size = await prisma.masterCakeSize.findFirst({
        where: {
          id: sizeId
        }
      })
      if (!size) {
        return responseWrapper(404, null, "Size is not found.")
      }

      // CUSTOM CAKE PRICE CALCULATION
      let price = Number(size.name) * 342
      cart = await prisma.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          items: {
            create: {
              type: CartItemType.CUSTOM_CAKE,
              quantity: quantity,
              customerCake: {
                create: {
                  name: "เค้กจัดเอง",
                  price: price,
                  isActive: true,
                  type: CakeType.CUSTOM,
                  cakeMessage: cakeMessage,
                  size: {
                    connect: sizeId ? { id: sizeId } : undefined,
                  },
                  base: {
                    connect: baseId ? { id: baseId } : undefined,
                  },
                  filling: {
                    connect: fillingId ? { id: fillingId } : undefined,
                  },
                  cream: {
                    connect: creamId ? { id: creamId } : undefined,
                  },
                  topEdge: {
                    connect: topEdgeId ? { id: topEdgeId } : undefined,
                  },
                  bottomEdge: {
                    connect: bottomEdgeId ? { id: bottomEdgeId } : undefined,
                  },
                  decoration: {
                    connect: decorationId ? { id: decorationId } : undefined,
                  },
                  surface: {
                    connect: surfaceId ? { id: surfaceId } : undefined,
                  },
                  cake: {
                    connect: cakeId ? { id: cakeId } : undefined,
                  },
                },
              },
            },
          },
        },
        include: CartInclude,
      });
    }

    revalidatePath(paths.cartList());

    return responseWrapper(200, cart, null);
  } catch (err: any) {
    return responseWrapper(500, null, err.message);
  }
}
