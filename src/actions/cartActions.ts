"use server";

// import toast from "react-hot-toast";
import apiPaths from "@/utils/api-path";
import { CartType } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { prismaCart } from "@/persistence/cart";
import { getFileUrl } from "@/lib/gcs/getFileUrl";
import { responseWrapper } from "@/utils/api-response-wrapper";

import getCurrentUser from "./userActions";

// ----------------------------------------------------------------------

type IAddCustomSnackBoxToCart = {
  packageType: "PAPER_BAG" | "SNACK_BOX_S" | "SNACK_BOX_M";
  beverage: "INCLUDE" | "EXCLUDE" | "NONE";
  refreshmentIds: string[];
  quantity: number;
};

type IAddCakeToCart = {
  cakeId: string;
  cakeType: "PRESET" | "CUSTOM";
  sizeId: string;
  baseId: string;
  fillingId: string;
  quantity: number;
};

// ----------------------------------------------------------------------

export async function addPresetCakeToCartAction(
  url: string,
  body: IAddCakeToCart,
) {
  try {
    const currentUser = await getCurrentUser();

    const request = {
      userId: currentUser?.id || "GUEST",
      type: currentUser?.role || "GUEST",
      cakeId: body.cakeId,
      cakeType: body.cakeType,
      sizeId: body.sizeId,
      fillingId: body.fillingId,
      quantity: body.quantity,
    };

    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(request),
      cache: "no-store",
    });

    revalidateTag("cart");
    const data = await res.json();
    console.log("data", data);

    return data;
  } catch (err) {
    console.error(err);
  }
}

export async function addCustomSnackBoxToCartAction(
  url: string,
  body: IAddCustomSnackBoxToCart,
) {
  try {
    const currentUser = await getCurrentUser();

    const request = {
      userId: currentUser?.id || "GUEST",
      type: currentUser?.role || "GUEST",
      packageType: body.packageType,
      beverage: body.beverage,
      refreshmentIds: body.refreshmentIds,
      quantity: body.quantity,
    };

    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(request),
      cache: "no-store",
    });

    revalidateTag("cart");
    const data = await res.json();

    console.log("data", data);

    return data;
  } catch (err) {
    console.error(err);
  }
}

export async function addItemToCart(
  url: string,
  itemId: string,
  quantity: number,
) {
  try {
    const currentUser = await getCurrentUser();

    const body = {
      userId: currentUser?.id || "GUEST",
      type: currentUser?.role === "CUSTOMER" ? "MEMBER" : "GUEST",
      refreshmentId: itemId,
      quantity: quantity,
    };

    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      cache: "no-store",
    });

    revalidateTag("cart");
    const data = await res.json();

    return data;
  } catch (err) {
    console.error(err);
  }
}

export async function updateCartItem(
  userId: string,
  itemId: string,
  type: "MEMBER" | "GUEST",
  quantity: number,
  action: "increase" | "decrease" | "remove",
) {
  try {
    const { updateCartItem } = apiPaths();

    let updatedQuantity;

    if (action === "increase") {
      updatedQuantity = quantity + 1;
    } else if (action === "decrease") {
      updatedQuantity = quantity - 1;
    } else {
      updatedQuantity = 0;
    }

    const res = await fetch(updateCartItem(), {
      method: "PUT",
      body: JSON.stringify({ userId, itemId, type, quantity: updatedQuantity }),
      cache: "no-store",
    });

    revalidateTag("cart");
    const data = await res.json();

    return data;
  } catch (err) {
    console.error(err);
  }
}

export async function getCartData() {
  const currentUser = await getCurrentUser();

  try {
    let responseCart = {
      cartId: null as string | null,
      userId: null as string | null,
      type: null as CartType | null,
      subTotal: 0,
      discounts: [] as any,
      totalDiscount: 0,
      total: 0,
      items: [] as any,
    };

    const userId = currentUser?.id;
    if (!userId) {
      return responseWrapper(200, responseCart, null).json();
    }
    responseCart.userId = userId;

    const cart = await prismaCart().getCartByUserId(userId);
    if (!cart) {
      return responseWrapper(200, responseCart, null).json();
    }

    responseCart.cartId = cart.id;
    responseCart.type = cart.type;
    responseCart.subTotal = 0;
    for (var item of cart.items) {
      let baseResponse = {
        itemId: "",
        itemType: item.type,
        pricePer: 0,
        price: 0,
      };
      let responseItem: any;
      switch (item.type) {
        case "CAKE":
          baseResponse.pricePer = item.customerCake?.price || 0;
          responseItem = { ...baseResponse, ...item.customerCake };
          responseItem.price = baseResponse.pricePer * item.quantity;
          if (
            responseItem.cake &&
            responseItem.cake.imagePath &&
            responseItem.cake.imagePath != ""
          ) {
            responseItem.image = await getFileUrl(responseItem.cake.imagePath);
          }
          if (responseItem.cream && responseItem.cream.imagePath) {
            responseItem.cream.image = await getFileUrl(
              responseItem.cream.imagePath,
            );
          }
          if (responseItem.topEdge && responseItem.topEdge.imagePath) {
            responseItem.topEdge.image = await getFileUrl(
              responseItem.topEdge.imagePath,
            );
          }

          if (responseItem.bottomEdge && responseItem.bottomEdge.imagePath) {
            responseItem.bottomEdge.image = await getFileUrl(
              responseItem.bottomEdge.imagePath,
            );
          }

          if (responseItem.decoration && responseItem.decoration.imagePath) {
            responseItem.decoration.image = await getFileUrl(
              responseItem.decoration.imagePath,
            );
          }

          if (responseItem.surface && responseItem.surface.imagePath) {
            responseItem.surface.image = await getFileUrl(
              responseItem.surface.imagePath,
            );
          }

          delete responseItem.cake;

          break;
        case "REFRESHMENT":
          baseResponse.pricePer = item.refreshment?.price || 0;
          responseItem = { ...baseResponse, ...item.refreshment };
          responseItem.price = baseResponse.pricePer * item.quantity;
          if (
            responseItem &&
            responseItem.imagePath &&
            responseItem.imagePath != ""
          ) {
            responseItem.image = await getFileUrl(responseItem.imagePath);
          }
          break;
        case "SNACK_BOX":
          baseResponse.pricePer = item.snackBox?.price || 0;
          responseItem = { ...baseResponse, ...item.snackBox };
          responseItem.price = baseResponse.pricePer * item.quantity;
          if (
            responseItem &&
            responseItem.imagePath &&
            responseItem.imagePath != ""
          ) {
            responseItem.image = await getFileUrl(responseItem.imagePath);
            for (var snackBoxRefreshment of responseItem.refreshments) {
              if (snackBoxRefreshment.refreshment.imagePath) {
                snackBoxRefreshment.refreshment.image = await getFileUrl(
                  snackBoxRefreshment.refreshment.imagePath,
                );
              }
            }
          }
          break;
      }
      responseItem.itemId = item.id;
      responseItem.quantity = item.quantity;
      responseItem.createdAt = item.createdAt;
      responseItem.updatedAt = item.updatedAt;
      responseCart.items.push(responseItem);
      responseCart.subTotal += responseItem.price;

      // TODO Discounts
      responseCart.discounts = [
        {
          name: "ร้านกำลังอยู่ในช่วงพัฒนา ลดให้เลย 10 บาท",
          discount: 10,
        },
        {
          name: "พอดีเป็นคนใจดีน่ะ ลดให้เลย 10 บาท",
          discount: 10,
        },
      ];

      responseCart.totalDiscount = 20;
      responseCart.total = responseCart.subTotal - responseCart.totalDiscount;
    }

    responseCart.items.sort(
      (
        a: { createdAt: { getTime: () => number } },
        b: { createdAt: { getTime: () => number } },
      ) => {
        return a.createdAt.getTime() - b.createdAt.getTime();
      },
    );

    return responseWrapper(200, responseCart, null).json();
  } catch (err: any) {
    return responseWrapper(500, null, err.message).json();
  }
}
