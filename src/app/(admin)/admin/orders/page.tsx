"use client";
import useAdmin from "@/hooks/useAdmin";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { GridEventListener } from "@mui/x-data-grid";
import React, { useMemo, useState, useEffect } from "react";
import { Box, Backdrop, CircularProgress } from "@mui/material";
import OrderDataGrid from "@/components/admin/data-grid/OrderDataGrid";
import OrderFilterToolbar from "@/components/admin/toolbars/OrderFilterToolbar";

// ----------------------------------------------------------------------

export type IOrderRow = {
  id: string;
  customer: string;
  phone: string;
  paymentType: string;
  orderDate: string;
  orderStatus: string;
  isCancelled: boolean;
};

type OrderResponse = {
  id: string;
  status:
    | "PENDING_PAYMENT1"
    | "PENDING_ORDER"
    | "ON_PROCESS"
    | "PENDING_PAYMENT2"
    | "COMPLETED"
    | "CANCELLED";
  receivedVia: "PICK_UP" | "DELIVERY";
  paymentType: "SINGLE" | "INSTALLMENT";
  email: string;
  orderNo: string;
  subTotalPrice: 12.5;
  discountPrice: 20;
  shippingFee: 130;
  totalPrice: 122.5;
  orderedAt: string;
  updatedAt: string;
  userId: string;
  remark: string;
  cFirstName: string;
  cLastName: string;
  address: string;
  district: string;
  subdistrict: string;
  province: string;
  postcode: string;
  phone: string;
  isCancelled: boolean;
};

// const rows = [
//   {
//     id: 1,
//     customer: "Thanatuch Lertritsirikul",
//     phone: "1234567890",
//     paymentType: "จ่ายมัดจำ",
//     orderDate: "30/08/2023",
//     orderStatus: "complete",
//   },
//   {
//     id: 2,
//     customer: "Thanatuch Lertritsirikul",
//     phone: "1234567890",
//     paymentType: "จ่ายเต็มจำนวน",
//     orderDate: "30/08/2023",
//     orderStatus: "pendingOrder",
//   },
// ];

// ----------------------------------------------------------------------

export default function AdminOrder() {
  const router = useRouter();
  const filterMethods = useForm({
    defaultValues: { search: "", status: "all" },
  });

  const { ordersData: orders, ordersIsLoading: isLoading } =
    useAdmin().useOrderAdmin();

  const ordersData = useMemo(() => {
    return (
      orders?.data?.map((order: OrderResponse) => ({
        id: order.id,
        orderNo: order.orderNo,
        customer: `${order.cFirstName} ${order.cLastName}`,
        phone: order.phone,
        paymentType: order.paymentType,
        orderDate: order.orderedAt,
        orderStatus: order.status,
        isCancelled: order.isCancelled,
      })) || []
    );
  }, [orders?.data]);

  const { watch } = filterMethods;

  const filterValues = watch();

  const { search, status } = filterValues;

  const [filteredRows, setFilteredRows] = useState(ordersData);

  useEffect(() => {
    let data = ordersData;

    if (search) {
      data = data.filter(
        (row: IOrderRow) =>
          row.customer.toLowerCase().indexOf(search?.toLowerCase()) > -1,
      );
    }

    if (status !== "all") {
      if (status === "CANCELLED") {
        data = data.filter((row: IOrderRow) => row.isCancelled);
      } else {
        const onGoingOrders = data.filter((row: IOrderRow) => !row.isCancelled);
        data = onGoingOrders.filter(
          (row: IOrderRow) => row.orderStatus === status,
        );
      }
    }
    setFilteredRows(data);
  }, [ordersData, search, status]);

  const onRowClick: GridEventListener<"rowClick"> = (params) => {
    router.push(`/admin/orders/${params.id}`);
  };

  return (
    <Box>
      <OrderFilterToolbar label="ออเดอร์" methods={filterMethods} />

      <OrderDataGrid rows={filteredRows} onRowClick={onRowClick} />

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="secondary" />
      </Backdrop>
    </Box>
  );
}
