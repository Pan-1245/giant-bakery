import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { OrderStatus } from "@prisma/client";
import { responseWrapper } from "@/utils/api-response-wrapper";

type overview = {
  totalOrder: number;
  todayOrder: number;
  pendingOrder: number;
  completedOrder: number;
  cancelledOrder: number;
};

export async function GET(_req: NextRequest) {
  try {
    const groupByStatusOrder = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const data: overview = {
      totalOrder: 0,
      todayOrder: 0,
      pendingOrder: 0,
      completedOrder: 0,
      cancelledOrder: 0,
    };

    const pendingOrder = groupByStatusOrder.find(
      (x) => x.status === OrderStatus.PENDING_ORDER,
    )?._count.id;
    if (pendingOrder) {
      data.pendingOrder = pendingOrder;
    }

    const completed = groupByStatusOrder.find(
      (x) => x.status === OrderStatus.COMPLETED,
    )?._count.id;
    if (completed) {
      data.completedOrder = completed;
    }

    // const cancelled = groupByStatusOrder.find(
    //   (x) => x.status === OrderStatus.CANCELLED,
    // )?._count.id;
    // if (cancelled) {
    //   data.cancelledOrder = cancelled;
    // }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayOrder = await prisma.order.aggregate({
      where: {
        orderedAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      _count: {
        id: true,
      },
    });
    data.todayOrder = todayOrder._count.id ?? 0;

    const countOrders = await prisma.order.aggregate({
      _count: {
        id: true,
      },
    });

    data.totalOrder = countOrders._count.id;

    return responseWrapper(200, data, null);
  } catch (err: any) {
    return responseWrapper(500, null, err);
  }
}
