import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { prismaCart } from "@/persistence/cart";
import { prismaUser } from "@/persistence/user";
import { getFileUrl } from "@/lib/gcs/getFileUrl";
import { prismaOrder } from "@/persistence/order";
import { createStripeSession } from "@/lib/stripe";
import { responseWrapper } from "@/utils/api-response-wrapper";
import { checkoutCartValidateSchema } from "@/lib/validationSchema";
import { prismaCustomerAddress } from "@/persistence/customerAddress";
import {
  Order,
  Prisma,
  ReceivedVia,
  OrderStatus,
  OrderRefreshment,
  OrderCustomerCake,
  OrderSnackBoxRefreshment,
} from "@prisma/client";

type LineItem = {
  price_data: {
    currency: string;
    unit_amount: number;
    product_data: {
      images: string[];
      name: string;
    };
  };
  quantity: number;
};

var order = null as Order | null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      addressId,
      userId,
      paymentMethod,
      paymentType,
      remark,
      receivedVia,
      email,
    } = body;

    const validate = checkoutCartValidateSchema.safeParse(body);
    if (!validate.success) {
      return responseWrapper(400, null, validate.error.message);
    }

    const user = await prismaUser().getUserById(userId);
    if (!user) {
      return responseWrapper(404, null, `User not found.`);
    }

    const address = await prismaCustomerAddress().getUserAddressById(addressId);
    const cart = await prismaCart().getCartByUserId(userId);

    if (!cart || cart.items.length == 0) {
      return responseWrapper(
        404,
        null,
        `Cart with user id: ${userId} is not found.`,
      );
    }

    // MAP LineItems
    // TODO Check STOCK
    const lineItems = [] as LineItem[];
    for (var cartItem of cart?.items) {
      switch (cartItem.type) {
        case "CAKE":
          if (!cartItem.customerCake) {
            return responseWrapper(409, null, "Cake Type is missing cake.");
          }

          var image = [];
          if (cartItem.customerCake.cake.imagePath) {
            image.push(await getFileUrl(cartItem.customerCake.cake.imagePath));
          }
          lineItems.push({
            price_data: {
              currency: "thb",
              unit_amount: cartItem.customerCake.price,
              product_data: {
                images: image,
                name: cartItem.customerCake.name,
              },
            },
            quantity: cartItem.quantity,
          });
          break;
        case "REFRESHMENT":
          if (!cartItem.refreshment) {
            return responseWrapper(
              409,
              null,
              "Refreshment is missing refreshment.",
            );
          }

          var image = [];
          if (cartItem.refreshment.imagePath) {
            image.push(await getFileUrl(cartItem.refreshment.imagePath));
          }
          lineItems.push({
            price_data: {
              currency: "thb",
              unit_amount: cartItem.refreshment.price,
              product_data: {
                images: image,
                name: cartItem.refreshment.name,
              },
            },
            quantity: cartItem.quantity,
          });
          break;
        case "SNACK_BOX":
          if (!cartItem.snackBox) {
            return responseWrapper(409, null, "Snack Box is snackbox.");
          }
          var image = [];
          if (cartItem.snackBox.imagePath) {
            image.push(await getFileUrl(cartItem.snackBox.imagePath));
          }
          lineItems.push({
            price_data: {
              currency: "thb",
              unit_amount: cartItem.snackBox.price,
              product_data: {
                images: image,
                name: cartItem.snackBox.name,
              },
            },
            quantity: cartItem.quantity,
          });
          break;
      }
    }

    let shippingFee = 0;
    if (receivedVia == ReceivedVia.DELIVERY) {
      // TODO Shipping Fee
      shippingFee = 130;
    }

    // TODO DISCOUNT
    const totalDiscount = 20;

    // CREATE ORDER ITEMS
    let subTotal = 0 as number;
    const orderCustomCakes = [] as OrderCustomerCake[];
    const orderRefreshments = [] as OrderRefreshment[];
    const orderSnackBoxes = [] as Prisma.OrderSnackBoxGetPayload<{
      include: { refreshments: true };
    }>[];

    for (var cartItem of cart?.items) {
      switch (cartItem.type) {
        case "CAKE":
          if (!cartItem.customerCake) {
            return responseWrapper(
              409,
              null,
              "Cake Item missing Customer Cake",
            );
          }
          orderCustomCakes.push({
            id: "",
            name: cartItem.customerCake.cake.name,
            quantity: cartItem.quantity,
            remark: cartItem.customerCake.cake.remark!,
            imageFileName: cartItem.customerCake.cake.imageFileName!,
            imagePath: cartItem.customerCake.cake.imagePath,
            image: cartItem.customerCake.cake.image,
            pricePer: cartItem.customerCake.price,
            price: cartItem.customerCake.price * cartItem.quantity,
            weight: cartItem.customerCake.cake.weight,
            height: cartItem.customerCake.cake.height,
            length: cartItem.customerCake.cake.length,
            width: cartItem.customerCake.cake.width,
            orderId: "1234",
            cakeType: cartItem.customerCake.type,
            customerCakeId: cartItem.customerCake.id,
            cakeId: cartItem.customerCake.cakeId,
            size: cartItem.customerCake.size?.name || null,
            base: cartItem.customerCake.base?.name || null,
            filling: cartItem.customerCake.filling?.name || null,
            cream: cartItem.customerCake.cream?.name || null,
            creamColor: cartItem.customerCake.creamColor,
            topEdge: cartItem.customerCake.topEdge?.name || null,
            topEdgeColor: cartItem.customerCake.topEdgeColor,
            bottomEdge: cartItem.customerCake.bottomEdge?.name || null,
            bottomEdgeColor: cartItem.customerCake.bottomEdgeColor,
            decoration: cartItem.customerCake.decoration?.name || null,
            surface: cartItem.customerCake.surface?.name || null,
          });

          subTotal += cartItem.customerCake.price * cartItem.quantity;
          break;
        case "REFRESHMENT":
          if (!cartItem.refreshment) {
            return responseWrapper(
              409,
              null,
              "Refreshment Item missing refreshment",
            );
          }
          orderRefreshments.push({
            id: "",
            name: cartItem.refreshment.name,
            description: cartItem.refreshment.description,
            remark: cartItem.refreshment.remark,
            quantity: cartItem.quantity,
            imageFileName: cartItem.refreshment.imageFileName,
            imagePath: cartItem.refreshment.imagePath,
            image: cartItem.refreshment.image,
            type: cartItem.refreshment.type,
            category: cartItem.refreshment.category,
            weight: cartItem.refreshment.weight,
            height: cartItem.refreshment.height,
            length: cartItem.refreshment.length,
            width: cartItem.refreshment.width,
            pricePer: cartItem.refreshment.price,
            price: cartItem.refreshment.price * cartItem.quantity,
            orderId: "",
            unitType: cartItem.refreshment.unitType,
            unitRatio: cartItem.refreshment.unitRatio,
            refreshmentId: cartItem.refreshment.id,
          });

          subTotal += cartItem.refreshment.price * cartItem.quantity;

          break;
        case "SNACK_BOX":
          if (!cartItem.snackBox) {
            return responseWrapper(
              409,
              null,
              "SnackBox Item missing snack box",
            );
          }

          var orderSnackBoxRefreshment = [] as OrderSnackBoxRefreshment[];
          for (var refreshment of cartItem.snackBox.refreshments) {
            orderSnackBoxRefreshment.push({
              id: "",
              name: refreshment.refreshment.name,
              description: refreshment.refreshment.description,
              remark: refreshment.refreshment.remark,
              imageFileName: refreshment.refreshment.imageFileName,
              imagePath: refreshment.refreshment.imagePath,
              image: refreshment.refreshment.image,
              type: refreshment.refreshment.type,
              category: refreshment.refreshment.category,
              weight: refreshment.refreshment.weight,
              height: refreshment.refreshment.height,
              length: refreshment.refreshment.length,
              width: refreshment.refreshment.width,
              price: refreshment.refreshment.price,
              orderSnackBoxId: "",
              unitType: refreshment.refreshment.unitType,
              unitRatio: refreshment.refreshment.unitRatio,
              refreshmentId: refreshment.refreshment.id,
            });
          }

          orderSnackBoxes.push({
            refreshments: orderSnackBoxRefreshment,
            id: "",
            name: cartItem.snackBox.name,
            quantity: cartItem.quantity,
            pricePer: cartItem.snackBox.price,
            price: cartItem.snackBox.price * cartItem.quantity,
            imageFileName: cartItem.snackBox.imageFilename,
            imagePath: cartItem.snackBox.imagePath,
            image: cartItem.snackBox.image,
            type: cartItem.snackBox.type,
            packageType: cartItem.snackBox.packageType,
            beverage: cartItem.snackBox.beverage,
            snackBoxId: cartItem.snackBox.id,
            orderId: "",
          });
          break;
      }
    }

    // TODO Decrease quantity
    // CREATE ORDER
    order = await prismaOrder().createOrder({
      status: OrderStatus.PENDING_PAYMENT1,
      paymentType: paymentType,
      receivedVia: receivedVia,
      email: email,
      subTotalPrice: subTotal,
      discountPrice: totalDiscount,
      shippingFee: shippingFee,
      totalPrice: subTotal - totalDiscount + shippingFee,
      cFirstName: address ? address.cFirstName : user.firstName,
      cLastName: address ? address.cLastName : user.lastName,
      address: address?.address,
      district: address?.district,
      subdistrict: address?.subdistrict,
      province: address?.province,
      postcode: address?.postcode,
      phone: address ? address.phone : user.phone,
      remark: remark,
      userId: userId,
      orderCake: {
        create: orderCustomCakes.map((cake) => ({
          name: cake.name,
          quantity: cake.quantity,
          remark: cake.remark,
          imageFileName: cake.imageFileName,
          imagePath: cake.imagePath,
          image: cake.image,
          pricePer: cake.pricePer,
          price: cake.price,
          weight: cake.weight,
          height: cake.height,
          length: cake.length,
          width: cake.width,
          cakeType: cake.cakeType,
          customerCakeId: cake.customerCakeId,
          cakeId: cake.cakeId,
          size: cake.size,
          base: cake.base,
          filling: cake.filling,
          cream: cake.filling,
          creamColor: cake.creamColor,
          topEdge: cake.topEdge,
          topEdgeColor: cake.topEdgeColor,
          bottomEdge: cake.bottomEdge,
          bottomEdgeColor: cake.bottomEdgeColor,
          decoration: cake.decoration,
          surface: cake.surface,
        })),
      },
      orderRefreshment: {
        create: orderRefreshments.map((refreshment) => ({
          name: refreshment.name,
          description: refreshment.description,
          remark: refreshment.remark,
          quantity: cartItem.quantity,
          imageFileName: refreshment.imageFileName,
          imagePath: refreshment.imagePath,
          image: refreshment.image,
          type: refreshment.type,
          category: refreshment.category,
          weight: refreshment.weight,
          height: refreshment.height,
          length: refreshment.length,
          width: refreshment.width,
          pricePer: refreshment.pricePer,
          price: refreshment.price,
          unitType: refreshment.unitType,
          unitRatio: refreshment.unitRatio,
          refreshmentId: refreshment.refreshmentId,
        })),
      },
      orderSnackBox: {
        create: orderSnackBoxes.map((snackBox) => ({
          name: snackBox.name,
          quantity: snackBox.quantity,
          pricePer: snackBox.pricePer,
          price: snackBox.price,
          imageFileName: snackBox.imageFileName,
          imagePath: snackBox.imagePath,
          image: snackBox.image,
          type: snackBox.type,
          packageType: snackBox.packageType,
          beverage: snackBox.beverage,
          snackBoxId: snackBox.snackBoxId,
          refreshments: {
            create: snackBox.refreshments.map((refreshment) => ({
              name: refreshment.name,
              description: refreshment.description,
              remark: refreshment.remark,
              imageFileName: refreshment.imageFileName,
              imagePath: refreshment.imagePath,
              image: refreshment.image,
              type: refreshment.type,
              category: refreshment.category,
              weight: refreshment.weight,
              height: refreshment.height,
              length: refreshment.length,
              width: refreshment.width,
              price: refreshment.price,
              unitType: refreshment.unitType,
              unitRatio: refreshment.unitRatio,
              refreshmentId: refreshment.refreshmentId,
            })),
          },
        })),
      },
    });

    const session = await createStripeSession(
      userId,
      order.id,
      paymentMethod,
      shippingFee,
      totalDiscount,
      lineItems,
      req,
    );

    const data = {
      stripeUrl: session.url,
    };

    await prisma.cart.delete({
      where: {
        userId: userId,
      },
    });

    return responseWrapper(200, data, null);
  } catch (err: any) {
    if (order) {
      await prisma.order.delete({
        where: {
          id: order.id,
        },
      });
    }
    return responseWrapper(500, null, err.message);
  }
}
