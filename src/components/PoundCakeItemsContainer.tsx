"use client";

import useSWR from "swr";
import { Cake } from "@prisma/client";
import React, { useState } from "react";
import { fetcher } from "@/utils/axios";
import apiPaths from "@/utils/api-path";
import { useRouter } from "next/navigation";

import { useDisclosure } from "@nextui-org/react";

import CakeCard from "./CakeCard";
import PresetCakeModal from "./modal/PresetCakeModal";

// ----------------------------------------------------------------------

type PoundCakeItemsContainerProps = {
  limitItems: number;
  isPoundCakePage?: boolean;
};

type PoundCakeItemsProps = {
  cols: number;
  onClick?: (selected: any) => void;
  isPoundCakePage?: boolean;
};

// ----------------------------------------------------------------------

export default function PoundCakeItemsContainer({
  limitItems,
  isPoundCakePage = false,
}: PoundCakeItemsContainerProps) {
  const router = useRouter();

  return (
    <div className="relative">
      <div className="pb-8 md:px-36">
        <div className=" flex flex-row items-center justify-between pb-10 text-2xl font-normal  md:text-4xl">
          เค้กสำเร็จรูป (ปอนด์)
          {!isPoundCakePage && (
            <div
              className=" cursor-pointer text-lg font-semibold text-secondaryT-main md:text-xl"
              onClick={() => router.push("/cakes/pound")}
            >
              {`ดูทั้งหมด >`}
            </div>
          )}
          {/* <CustomCakeContainer /> */}
        </div>
        <PoundCakeItems cols={4} isPoundCakePage={isPoundCakePage} />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------

function PoundCakeItems({
  cols,
  onClick,
  isPoundCakePage = false,
  ...other
}: PoundCakeItemsProps) {
  const router = useRouter();

  const [selectedCakeName, setSelectedCakeName] = useState<string>("");

  const { getCakes } = apiPaths();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { data } = useSWR(getCakes("PRESET"), fetcher, {
    revalidateOnFocus: false,
  });

  const items: Cake[] = data?.response?.data || [];

  const [currentPage, setCurrentPage] = useState(1);

  const cakeCount = items.length;

  const itemsPerPage = 4;
  const pageSize = Math.ceil(cakeCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayItems = items.slice(startIndex, endIndex);

  const handleCardClick = (id: string, itemName: string) => {
    if (isPoundCakePage) {
      router.replace(`/cakes/pound?id=${id}&slug=${itemName}&type=PRESET`, {
        scroll: false,
      });
    } else {
      router.replace(`/cakes?id=${id}&slug=${itemName}&type=PRESET`, {
        scroll: false,
      });
    }

    setSelectedCakeName(itemName);
    onOpen();
  };

  return (
    <>
      <div
        className="mx-auto grid grid-cols-2 items-center justify-center gap-5 md:grid-cols-4 md:gap-10"
        {...other}
      >
        {Object.values(displayItems)?.map((item: Cake) => (
          <CakeCard
            key={item.id}
            item={item}
            onClick={() => {
              handleCardClick(item.id, item.name);
            }}
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
      <PresetCakeModal
        slug={selectedCakeName}
        isOpen={isOpen}
        onOpenChange={() => {
          if (isPoundCakePage) {
            router.push(`/cakes/pound`, { scroll: false });
          } else {
            router.push(`/cakes`, { scroll: false });
          }
          onOpenChange();
        }}
      />
    </>
  );
}
