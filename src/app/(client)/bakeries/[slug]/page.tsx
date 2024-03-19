"use client";

import useSWR from "swr";
import toast from "react-hot-toast";
import React, { useState } from "react";
import apiPaths from "@/utils/api-path";
import { fetcher } from "@/utils/axios";
import useSWRMutation from "swr/mutation";
import { Refreshment } from "@prisma/client";
import getCurrentUser from "@/actions/userActions";
import ProductDetail from "@/components/ProductDetail";
import { useRouter, useSearchParams } from "next/navigation";

type BakeryDetailParams = {
  params: {
    slug: string;
  };
};

type IAddRefreshmentToCart = {
  userId: string;
  type: "CUSTOMER" | "GUEST";
  refreshmentId: string;
  quantity: number;
};

async function sendAddRefreshmentRequest(
  url: string,
  { arg }: { arg: IAddRefreshmentToCart },
) {
  await fetch(url, {
    method: "POST",
    body: JSON.stringify(arg),
  }).then((res) => res.json());
}

export default function BakeryDetail({ params }: BakeryDetailParams) {
  const router = useRouter();

  const searchParams = useSearchParams();

  const id = searchParams.get("id") as string;
  const { slug } = params;

  const decodedSlug = decodeURIComponent(slug) as string;

  const { getBakeryBySlug, addRefreshmentToCart } = apiPaths();

  const { data } = useSWR(`${getBakeryBySlug(decodedSlug, id)}`, fetcher);

  const item: Refreshment = data?.response?.data || {};

  const { trigger: triggerAddToCart, isMutating: isMutatingAddToCart } =
    useSWRMutation(addRefreshmentToCart(), sendAddRefreshmentRequest);

  const [counter, setCounter] = useState(1);

  const handleInputChange = (e: any) => {
    let inputValue = e.target.value;
    inputValue =
      isNaN(inputValue) || inputValue === "" ? 1 : parseInt(inputValue, 10);
    inputValue = Math.min(Math.max(inputValue, 1), item.currQty);
    setCounter(inputValue);
  };

  const decrement = () => {
    if (counter > 1) setCounter(counter - 1);
  };

  const increment = () => {
    if (counter < item.currQty) setCounter(counter + 1);
  };

  async function handleAddToCart() {
    const currentUser = await getCurrentUser();

    const body: IAddRefreshmentToCart = {
      userId: currentUser?.id || "",
      type: (currentUser?.role as "GUEST" | "CUSTOMER") || "GUEST",
      refreshmentId: item.id,
      quantity: counter,
    };

    try {
      await triggerAddToCart(body);
      toast.success("ใส่ตะกร้าสำเร็จ");
      router.push("/cart");
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  }

  return (
    <div className="flex h-auto w-auto items-center justify-center p-36">
      <ProductDetail
        item={item}
        counter={counter}
        isLoading={isMutatingAddToCart}
        onClick={() => {
          handleAddToCart();
        }}
        onChange={handleInputChange}
        onIncrement={increment}
        onDecrement={decrement}
      />
    </div>
  );
}
