import { prisma } from "@/lib/prisma";
import { Order, Prisma } from "@prisma/client";

type PrismaOrder = Prisma.OrderGetPayload<{
  include: {
    orderCake: true;
    orderRefreshment: true;
    orderSnackBox: {
      include: {
        refreshments: true;
      };
    };
    payment: true;
  };
}>;

export function prismaOrder() {
  return {
    getOrderById,
    createOrder,
    updateOrderById,
    getAllOrder,
    getAllOrderByUserId,
  };
}

async function createOrder(
  data:
    | (Prisma.Without<
        Prisma.OrderCreateInput,
        Prisma.OrderUncheckedCreateInput
      > &
        Prisma.OrderUncheckedCreateInput)
    | (Prisma.Without<
        Prisma.OrderUncheckedCreateInput,
        Prisma.OrderCreateInput
      > &
        Prisma.OrderCreateInput),
): Promise<Order> {
  const order = await prisma.order.create({
    data: data,
  });
  return order;
}

async function getOrderById(orderId: string): Promise<PrismaOrder | null> {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      orderCake: true,
      orderRefreshment: true,
      orderSnackBox: {
        include: {
          refreshments: true,
        },
      },
      payment: true,
    },
  });
  return order;
}

async function updateOrderById(
  orderId: string,
  data:
    | (Prisma.Without<
        Prisma.OrderUpdateInput,
        Prisma.OrderUncheckedUpdateInput
      > &
        Prisma.OrderUncheckedUpdateInput)
    | (Prisma.Without<
        Prisma.OrderUncheckedUpdateInput,
        Prisma.OrderUpdateInput
      > &
        Prisma.OrderUpdateInput),
): Promise<void> {
  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: data,
  });
}

async function getAllOrderByUserId(userId: string): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: {
      userId: userId,
    },
    orderBy: [
      {
        orderedAt: "desc",
      },
    ],
  });
  return orders;
}

async function getAllOrder(): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    orderBy: [
      {
        orderedAt: "desc",
      },
    ],
  });
  return orders;
}
