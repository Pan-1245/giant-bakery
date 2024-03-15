"use client";

import useSWR from "swr";
import React from "react";
import apiPaths from "@/utils/api-path";
import { fetcher } from "@/utils/axios";
import { Refreshment } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";

import { Tab, Tabs } from "@nextui-org/react";

import RefreshmentCard from "./RefreshmentCard";

// ----------------------------------------------------------------------

const TAB_ITEMS = [
  { key: "", title: "ทั้งหมด" },
  { key: "BREAD", title: "ขนมปัง" },
  { key: "COOKIE", title: "คุ้กกี้" },
  { key: "PIE", title: "พาย" },
  { key: "SNACK", title: "ขนมทานเล่น" },
];

export type IBakeryCategory =
  | "BREAD"
  | "PIE"
  | "COOKIE"
  | "SNACK"
  | "CAKE"
  | "";

type BakeryItemsProps = {
  amount?: string;
  cols: number;
  category?: IBakeryCategory;
  onClick?: (selected: any) => void;
};

// ----------------------------------------------------------------------

export default function BakeryTabItems() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bakeryCategory = searchParams.get("category") as IBakeryCategory;

  const handleTabSelectionChange = (selectedCategory: IBakeryCategory) => {
    router.push(`/bakeries?category=${selectedCategory}`, {
      scroll: false,
    });
  };

  return (
    <div className="flex flex-wrap flex-col justify-center items-center gap-10 md:gap-20">
      <Tabs
        variant={"underlined"}
        aria-label="Tabs"
        items={TAB_ITEMS}
        selectedKey={bakeryCategory}
        onSelectionChange={(e) =>
          handleTabSelectionChange(e as IBakeryCategory)
        }
        classNames={{
          tabList: "flex flex-wrap justify-center gap-3 md:gap-2",
          tab: " w-20 md:w-full ",
          cursor: "bg-primaryT-main",
          tabContent:
            "text-primaryT-darker group-data-[selected=true]:text-primaryT-main",
        }}
      >
        {TAB_ITEMS.map((item) => (
          <Tab
            key={item.key}
            title={item.title}
            className="flex justify-center items-center text-center text-xl md:text-2xl font-semibold md:w-28 md:mx-8"
          />
        ))}
      </Tabs>
      <div className=" pb-16 md:pb-32 mx-8">
        <BakeryItems cols={4} category={bakeryCategory} />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------

function BakeryItems({
  amount,
  cols,
  category,
  onClick,
  ...other
}: BakeryItemsProps) {
  const router = useRouter();

  const { getBakeries } = apiPaths();

  const { data } = useSWR(
    `${getBakeries(category as IBakeryCategory, amount)}`,
    fetcher,
    { revalidateOnFocus: false },
  );

  const items: Refreshment[] = data?.response?.data || [];

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-10 justify-center items-center mx-auto"
      {...other}
    >
      {Object.values(items)?.map((item: any) => (
        <RefreshmentCard
          key={item.id}
          item={item}
          onClick={
            onClick
              ? () => onClick(item)
              : () => router.push(`/bakeries/${item.name}?id=${item.id}`)
          }
        />
      ))}
    </div>
  );
}