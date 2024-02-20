import React from "react";
import Image from "next/image";
// import toast from "react-hot-toast";
import { Cake } from "@prisma/client";
// import apiPaths from "@/utils/api-path";
// import useSWRMutation from "swr/mutation";
// import getCurrentUser from "@/actions/userActions";

import { Card, Button } from "@nextui-org/react";

type Props = {
  item: Cake;
  size?: "sm" | "md";
  onClick?: () => void;
};

// type IAddSnackBoxToCart = {
//   userId: string;
//   type: "MEMBER" | "GUEST";
//   snackBoxId: string;
//   quantity: number;
// };

// async function sendAddSnackBoxRequest(
//   url: string,
//   { arg }: { arg: IAddSnackBoxToCart },
// ) {
//   await fetch(url, {
//     method: "POST",
//     body: JSON.stringify(arg),
//   }).then((res) => res.json());
// }

export default function CakeCard({ item, onClick, size = "md" }: Props) {
  // TODO : ADD CAKE TO CART
  //   const { addPresetSnackBoxToCart, addCustomSnackBoxToCart } = apiPaths();

  //   const { trigger: triggerAddToCart, isMutating: isMutatingAddToCart } =
  //     useSWRMutation(addPresetSnackBoxToCart(), sendAddSnackBoxRequest);

  //   async function handleAddToCart(itemId: string) {
  //     const currentUser = await getCurrentUser();

  //     const body: IAddSnackBoxToCart = {
  //       userId: currentUser?.id || "",
  //       type: currentUser?.role === "CUSTOMER" ? "MEMBER" : "GUEST",
  //       snackBoxId: itemId,
  //       quantity: 1,
  //     };

  //     try {
  //       await triggerAddToCart(body);
  //       toast.success("ใส่ตะกร้าสำเร็จ");
  //     } catch (error) {
  //       console.error(error);
  //       toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
  //     }
  //   }

  let imgSize: { width: number; height: number } = { width: 800, height: 128 };
  let padding = 12;
  let fontSize = "lg";

  if (size === "sm") {
    imgSize.width = 180;
    imgSize.height = 50;

    padding = 2;
    fontSize = "md";
  }

  return (
    <Card
      className={` bg-white pb-${
        size === "sm" ? "4" : "6"
      } rounded-md shadow-md`}
    >
      <div onClick={onClick}>
        <Image
          src={(item?.image as string) ?? "/placeholder-image.jpeg"}
          alt={item.name}
          width={imgSize.width}
          height={imgSize.height}
          className=" object-cover mb-4 rounded-sm"
        />
        <article
          className={`flex flex-col flex-wrap text-pretty p-6 gap-${
            size === "sm" ? "1" : "2 items-center"
          }`}
        >
          <p
            className={`text-black truncate text-${fontSize} font-normal max-w-full`}
          >
            {item.name}
          </p>

          {size === "sm" ? (
            <div className="flex flex-row w-full justify-between items-center ">
              <p
                className={`text-secondaryT-main text-${fontSize} font-semibold`}
              >
                ฿{item.price?.toFixed(2)}
              </p>
              <Button
                size={size}
                onClick={onClick}
                className={`bg-secondaryT-main items-center text-white text-${size} rounded-sm px-${padding}`}
              >
                เพิ่ม
              </Button>
            </div>
          ) : (
            <>
              <p
                className={`text-secondaryT-main text-${fontSize} font-semibold`}
              >
                ฿{item.price?.toFixed(2)}
              </p>
              <Button
                size={size}
                onClick={onClick}
                className={`bg-secondaryT-main items-center text-white text-${size} rounded-sm px-${padding}`}
              >
                ใส่ตะกร้า
              </Button>
            </>
          )}
        </article>
      </div>
    </Card>
  );
}