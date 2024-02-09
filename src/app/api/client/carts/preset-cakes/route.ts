import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { CakeType, CartItemType } from "@prisma/client";
import { responseWrapper } from "@/utils/api-response-wrapper";
import { cartPresetCakeValidationSchema } from "@/lib/validationSchema";

// ----------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = cartPresetCakeValidationSchema.safeParse(body);

    if (!validation.success) {
      return responseWrapper(400, null, validation.error.format());
    }

    // TODO USER ID FROM TOKEN OR COOKIE ID
    const { cakeId, type, userId, quantity } = body;
    const cake = await prisma.cake.findUnique({
      where: {
        id: cakeId,
        isDeleted: false,
        type: CakeType.PRESET,
      },
    });

    if (!cake) {
      return responseWrapper(
        404,
        null,
        `Preset Cake with given id ${cakeId} not found.`,
      );
    }

    const CartInclude = {
      items: {
        include: {
          presetCake: {
            include: {
              variants: true,
            },
          },
          customCake: {
            include: {
              cake: true,
              variants: true,
            },
          },
          refreshment: true,
          snackBox: {
            include: {
              refreshments: true,
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
      (item) => item.presetCakesId === cakeId,
    );

    const existingItemIndex = cart.items.findIndex(
      (item) => item.presetCakesId === cakeId,
    );

    if (existingItem) {
      cart.items[existingItemIndex] = await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: existingItem.quantity + quantity,
        },
        include: CartInclude.items.include,
      });
    } else {
      cart = await prisma.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          items: {
            create: {
              type: CartItemType.PRESET_CAKE,
              quantity: quantity,
              presetCake: {
                connect: {
                  id: cakeId,
                },
              },
            },
          },
        },
        include: CartInclude,
      });
    }

    return responseWrapper(200, cart, null);
  } catch (err: any) {
    return responseWrapper(500, null, err.message);
  }
}
