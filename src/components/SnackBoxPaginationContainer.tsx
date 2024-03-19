"use client";

import useSWR from "swr";
import Image from "next/image";
import toast from "react-hot-toast";
import React, { useState } from "react";
import apiPaths from "@/utils/api-path";
import { fetcher } from "@/utils/axios";
import { SnackBox } from "@prisma/client";
import { useRouter } from "next/navigation";
import { addItemToCart } from "@/actions/cartActions";

import { Card, Button } from "@nextui-org/react";

// import { Pagination } from "@nextui-org/react";

// ----------------------------------------------------------------------

type SnackBoxItemsProps = {
  cols: number;
  onClick?: (selected: any) => void;
};

type SnackBoxCardProps = {
  item: SnackBox;
  size?: "sm" | "md";
  onClick?: () => void;
};

// ----------------------------------------------------------------------

export default function SnackBoxPaginationContainer() {
  return (
    <div className="relative pb-8">
      <div className="text-2xl font-normal md:text-4xl">ชุดเบรกจัดให้</div>
      <SnackBoxItems cols={4} />
    </div>
  );
}

// ----------------------------------------------------------------------

function SnackBoxItems({ cols, onClick, ...other }: SnackBoxItemsProps) {
  const router = useRouter();

  const { getPresetSnackBox } = apiPaths();

  const { data } = useSWR(getPresetSnackBox(), fetcher);

  const items: SnackBox[] = data?.response?.data || [];

  const [currentPage, setCurrentPage] = useState(1);

  const snackBoxCount = items.length;

  const itemsPerPage = 4;
  const pageSize = Math.ceil(snackBoxCount / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayItems = items.slice(startIndex, endIndex);

  return (
    <>
      <div
        className={`mx-auto grid grid-cols-2 items-center justify-center gap-5 md:grid-cols-2 md:gap-10 lg:grid-cols-3 2xl:grid-cols-4`}
        {...other}
      >
        {items?.map((item: any) => (
          <SnackBoxCard
            key={item.id}
            item={item}
            onClick={
              onClick
                ? () => onClick(item)
                : () => router.push(`/snack-boxes/${item.name}?id=${item.id}`)
            }
          />
        ))}
      </div>
      {/* <Pagination
        showControls
        total={pageSize}
        initialPage={1}
        onChange={(page) => setCurrentPage(page)}
        variant="light"
        size="lg"
        className="flex items-center justify-center pt-24"
      /> */}
    </>
  );
}

// ----------------------------------------------------------------------

function SnackBoxCard({ item, onClick, size = "md" }: SnackBoxCardProps) {
  const { addPresetSnackBoxToCart } = apiPaths();

  const [isLoading, setIsLoading] = useState(false);

  async function handleAddToCart(itemId: string) {
    setIsLoading(true);
    try {
      await addItemToCart(addPresetSnackBoxToCart(), itemId, 1);
      toast.success("ใส่ตะกร้าสำเร็จ");
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
    setIsLoading(false);
  }

  return (
    <Card
      className="h-full w-44 items-center rounded-md bg-white pb-1 shadow-md hover:cursor-pointer md:w-unit-80 md:pb-2"
      isPressable
      onPress={onClick}
    >
      <div className=" relative h-36 w-full md:h-64">
        <Image
          src={(item?.image as string) ?? "/placeholder.svg"}
          alt={item?.name}
          fill
          className=" object-cover"
        />
      </div>
      <div className="text-pretty flex flex-col flex-wrap items-center gap-2 p-4 md:gap-3 md:p-6">
        <p className="max-w-full truncate text-lg font-normal text-primaryT-darker md:text-xl">
          {item?.name}
        </p>

        <p className="text-lg font-semibold text-secondaryT-main md:text-xl">
          ฿{item?.price?.toFixed(0) ?? 0}
        </p>
        <Button
          size={size}
          isLoading={isLoading}
          onClick={() => {
            handleAddToCart(item?.id);
          }}
          className="text-md items-center rounded-sm bg-secondaryT-main px-12 text-white"
        >
          ใส่ตะกร้า
        </Button>
      </div>
    </Card>
  );
}
