"use client";

import toast from "react-hot-toast";
import React, { useMemo } from "react";
import { ICartItem } from "@/app/(client)/cart/types";

import {
  User,
  Table,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
} from "@nextui-org/react";

import AddIcon from "../icons/AddIcon";
import MinusIcon from "../icons/MinusIcon";
import DeleteIcon from "../icons/DeleteIcon";

// ----------------------------------------------------------------------

type Props = {
  userId: string;
  userType: "CUSTOMER" | "GUEST";
  items: ICartItem[];
  onUpdateCartItem: (
    userId: string,
    itemId: string,
    type: "CUSTOMER" | "GUEST",
    quantity: number,
    action: "increase" | "decrease" | "remove",
  ) => Promise<any>;
};

// ----------------------------------------------------------------------

export default function CartItemTable({
  userId,
  userType,
  items,
  onUpdateCartItem,
}: Props) {
  const renderCell = React.useCallback(
    (item: ICartItem, columnKey: React.Key) => {
      switch (columnKey) {
        case "name":
          return (
            <User
              avatarProps={{
                radius: "md",
                className: "w-14 h-14 md:w-20 md:h-20 md:text-large",
                src:
                  item.type === "SNACK_BOX"
                    ? item.packageType === "PAPER_BAG"
                      ? "/paper-bag.jpeg"
                      : "/snack-box.png"
                    : item.image,
              }}
              classNames={{
                name: "text-sm md:text-lg font-medium",
                description: "text-xs md:text-base font-normal",
              }}
              description={item?.description || ""}
              name={item.name}
              className=" gap-6 pl-3"
            >
              {item.name}
            </User>
          );

        case "price":
          return (
            <div className="justify-center text-center">{`฿${item.pricePer}`}</div>
          );

        case "amount":
          return (
            <div className="flex flex-row items-center gap-1 justify-center">
              <Button
                isIconOnly
                size="sm"
                radius="md"
                className="bg-transparent"
                onPress={async () => {
                  try {
                    await onUpdateCartItem(
                      userId,
                      item.itemId,
                      userType,
                      item.quantity,
                      "decrease",
                    ).then(
                      (res) =>
                        !res.response.success &&
                        toast.error("กรุณาลองใหม่อีกครั้ง"),
                    );
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                <MinusIcon />
              </Button>
              <div className=" border   max-w-12 min-w-12 px-1 text-center overflow-auto text-ellipsis rounded-sm">
                {item.quantity}
              </div>
              <Button
                isIconOnly
                size="sm"
                radius="md"
                className="bg-transparent"
                onPress={async () => {
                  await onUpdateCartItem(
                    userId,
                    item.itemId,
                    userType,
                    item.quantity,
                    "increase",
                  ).then(
                    (res) =>
                      !res.response.success &&
                      toast.error("กรุณาลองใหม่อีกครั้ง"),
                  );
                }}
              >
                <AddIcon />
              </Button>
            </div>
          );

        case "total":
          return (
            <div className="flex flex-row items-center gap-1 justify-end pr-3">
              {`฿${item.price}`}
              <Button
                isIconOnly
                size="sm"
                radius="md"
                className="bg-transparent pb-1.5"
                onPress={async () => {
                  await onUpdateCartItem(
                    userId,
                    item.itemId,
                    userType,
                    item.quantity,
                    "remove",
                  ).then(
                    (res) =>
                      !res?.response?.success &&
                      toast.error("กรุณาลองใหม่อีกครั้ง"),
                  );
                }}
              >
                <DeleteIcon />
              </Button>
            </div>
          );
        default:
          return "";
      }
    },
    [onUpdateCartItem, userId, userType],
  );

  const classNames = useMemo(
    () => ({
      th: [
        "bg-primaryT-lighter",
        "font-medium",
        "text-sm md:text-base",
        "border-b",
        "border-divider",
        "px-3 py-4 md:py-4 md:px-8",
        "first:rounded-none first:rounded-none",
        "last:rounded-none last:rounded-none",
      ],
      td: [
        "text-base",
        // changing the rows border radius
        // first
        "group-data-[first=true]:first:before:rounded-none",
        "group-data-[first=true]:last:before:rounded-none",
        // middle
        "group-data-[middle=true]:before:rounded-none",
        // last
        "group-data-[last=true]:first:before:rounded-none",
        "group-data-[last=true]:last:before:rounded-none",
      ],
    }),
    [],
  );

  return (
    <Table radius="sm" removeWrapper classNames={classNames}>
      <TableHeader>
        <TableColumn className="text-primaryT-darker" key="name">
          สินค้า
        </TableColumn>
        <TableColumn key="price" className="text-center text-primaryT-darker">
          ราคา
        </TableColumn>
        <TableColumn
          key="amount"
          align="center"
          className="text-center text-primaryT-darker"
        >
          จำนวน
        </TableColumn>
        <TableColumn
          key="total"
          align="end"
          className=" text-end text-primaryT-darker"
        >
          ราคารวม
        </TableColumn>
      </TableHeader>
      <TableBody emptyContent={"ไม่พบสินค้าในตะกร้า"} items={items}>
        {(item) => (
          <TableRow key={item.itemId}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
