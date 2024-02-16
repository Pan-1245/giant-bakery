"use client";

import useSWR from "swr";
import apiPaths from "@/utils/api-path";
import { fetcher } from "@/utils/axios";
import { useRouter } from "next/navigation";
import { Refreshment } from "@prisma/client";

import ProductCard from "./ProductCard";

// ----------------------------------------------------------------------

type Props = {
  size?: "sm" | "md";
  cols: number;
  category?: "BREAD" | "PIE" | "COOKIE" | "SNACK" | "";
  onClick?: (selected: any) => void;
};

export default function BakeryItems({
  size = "md",
  cols,
  category,
  onClick,
  ...other
}: Props) {
  const router = useRouter();

  const { getBakeries } = apiPaths();

  const { data } = useSWR(`${getBakeries()}${category}`, fetcher);

  const items: Refreshment[] = data?.response?.data || [];

  return (
    <div
      className={`grid grid-cols-${cols} gap-${
        size === "sm" ? 4 : 14
      } justify-center items-baseline`}
      {...other}
    >
      {Object.values(items)?.map((item: any) => (
        <ProductCard
          key={item.id}
          name={item.name}
          size={size}
          price={item.price}
          img={item.image ? `${item.image as string}` : "/"}
          onClick={
            onClick
              ? () => onClick(item)
              : () => router.push(`/bakery/${item.name}?id=${item.id}`)
          }
        />
      ))}
    </div>
  );
}
