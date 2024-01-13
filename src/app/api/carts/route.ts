import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { responseWrapper } from "@/utils/api-response-wrapper";
import { Variant, CakeType, Refreshment } from "@prisma/client";
import { updateQtyCartValidateSchema } from "@/lib/validationSchema";

enum CartItemType {
  PRESET_CAKE = "PRESET_CAKE",
  CUSTOM_CAKE = "CUSTOM_CAKE",
  REFRESHMENT = "REFRESHMENT",
  SNACK_BOX = "SNACK_BOX",
}

enum CartItemTypeField {
  PRESET_CAKE = "presetCakes",
  CUSTOM_CAKE = "customCakes",
  REFRESHMENT = "refreshments",
  SNACK_BOX = "snackBoxes",
}

export async function PUT(req: NextRequest) {
  try {
    // TODO GET USER ID FROM TOKEN OR COOKIE ID
    const body = await req.json();
    const validation = updateQtyCartValidateSchema.safeParse(body);

    if (!validation.success) {
      return responseWrapper(400, null, validation.error.format());
    }

    const { userId, quantity, itemId, type } = body;

    const cart = await prisma.cart.findFirst({ where: { userId: userId } });
    if (!cart) {
      return responseWrapper(
        404,
        null,
        `Cart with given user id ${userId} is not found.`,
      );
    }

    let itemArray;
    switch (type) {
      case CartItemType.PRESET_CAKE:
        itemArray = cart.presetCakes;
        break;
      case CartItemType.CUSTOM_CAKE:
        itemArray = cart.customCakes;
        break;
      case CartItemType.REFRESHMENT:
        itemArray = cart.refreshments;
        break;
      case CartItemType.SNACK_BOX:
        itemArray = cart.snackBoxes;
        break;
      default:
        return responseWrapper(400, null, "Invalid cart item type");
    }

    const itemIndex = itemArray.findIndex((item) => item.itemId === itemId);

    if (itemIndex === -1) {
      return responseWrapper(
        404,
        null,
        `Item with itemId ${itemId} not found in your cart.`,
      );
    }

    itemArray[itemIndex].quantity = quantity;

    const field = CartItemTypeField[type as keyof typeof CartItemTypeField];
    const updateData = { [field]: { set: itemArray } };
    await prisma.cart.update({
      where: { id: cart.id },
      data: updateData,
    });
    return responseWrapper(200, itemArray[itemIndex], null);
  } catch (err: any) {
    return responseWrapper(500, null, err.message);
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId") as string;
    if (!userId) {
      return responseWrapper(400, null, "UserId is required");
    }

    const cart = await prisma.cart.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!cart) {
      return responseWrapper(
        404,
        null,
        `Cart with given userId ${userId} not found.`,
      );
    }

    let responseCart = {
      cartId: cart.id,
      userId: cart.userId,
      type: cart.type,
      items: [] as any,
    };

    const cakeIds: string[] = cart.presetCakes.map(
      (presetCakeItem) => presetCakeItem.cakeId,
    );

    cakeIds.push(
      ...cart.customCakes.map((customCakeItem) => customCakeItem.cakeId),
    );

    const variantIds: string[] = cart.customCakes.flatMap(
      (customCakeItem) => customCakeItem.variantIds,
    );

    const refreshmentIds: string[] = cart.refreshments.map(
      (refreshmentItem) => refreshmentItem.refreshmentId,
    );

    refreshmentIds.push(
      ...cart.snackBoxes.flatMap((snackBoxItem) => snackBoxItem.refreshmentIds),
    );

    const cakes = await prisma.cake.findMany({
      where: {
        id: { in: cakeIds },
        isDeleted: false,
      },
      include: {
        variants: true,
      },
    });

    const variants = await prisma.variant.findMany({
      where: {
        id: { in: variantIds },
        isDeleted: false,
      },
    });

    const refreshments = await prisma.refreshment.findMany({
      where: {
        id: { in: refreshmentIds },
        isDeleted: false,
      },
    });

    cart.presetCakes.forEach((presetCake) => {
      const cake = cakes.find(
        (v) => v.id === presetCake.cakeId && v.type === CakeType.PRESET,
      );
      if (cake) {
        responseCart.items.push({
          itemsId: presetCake.itemId,
          quantity: presetCake.quantity,
          createdAt: presetCake.createdAt,
          type: CartItemType.PRESET_CAKE,
          cakeId: cake.id,
          name: cake.name,
          variants: cake.variants,
        });
      }
    });

    cart.customCakes.forEach((customCake) => {
      const cake = cakes.find(
        (v) => v.id === customCake.cakeId && v.type === CakeType.CUSTOM,
      );

      const variantCustomCake = [] as Variant[];
      customCake.variantIds.forEach((variantId) => {
        const variant = variants.find((v) => v.id === variantId);
        if (variant) {
          variantCustomCake.push(variant);
        }
      });

      if (cake) {
        responseCart.items.push({
          itemsId: customCake.itemId,
          quantity: customCake.quantity,
          createdAt: customCake.createdAt,
          type: CartItemType.CUSTOM_CAKE,
          cakeId: cake.id,
          name: cake.name,
          variants: variantCustomCake,
        });
      }
    });

    cart.refreshments.forEach((refreshment) => {
      const refreshmentData = refreshments.find(
        (v) => v.id === refreshment.refreshmentId,
      );
      if (!refreshmentData) {
        return responseWrapper(
          404,
          null,
          `Refreshment with given id ${refreshment.refreshmentId} is not found.`,
        );
      }
      responseCart.items.push({
        itemsId: refreshment.itemId,
        quantity: refreshment.quantity,
        createdAt: refreshment.createdAt,
        type: CartItemType.REFRESHMENT,
        refreshmentId: refreshmentData.id,
        name: refreshmentData.name,
      });
    });

    cart.snackBoxes.forEach((snackBox) => {
      const snackBoxRefreshment = [] as Refreshment[];

      snackBox.refreshmentIds.forEach((refreshmentId) => {
        const refreshmentData = refreshments.find(
          (v) => v.id === refreshmentId,
        );

        if (refreshmentData) {
          snackBoxRefreshment.push(refreshmentData);
        }
      });

      responseCart.items.push({
        itemsId: snackBox.itemId,
        quantity: snackBox.quantity,
        createdAt: snackBox.createdAt,
        type: CartItemType.SNACK_BOX,
        refreshments: snackBoxRefreshment,
      });
    });

    responseCart.items.sort(
      (
        a: { createdAt: { getTime: () => number } },
        b: { createdAt: { getTime: () => number } },
      ) => {
        return a.createdAt.getTime() - b.createdAt.getTime();
      },
    );

    return responseWrapper(200, responseCart, null);
  } catch (err: any) {
    return responseWrapper(500, null, err.message);
  }
}
