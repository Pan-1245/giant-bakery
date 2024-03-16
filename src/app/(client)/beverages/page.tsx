import React from "react";
import TitleSection from "@/components/TitleSection";
import BeverageItems from "@/components/BeverageItems";

// ----------------------------------------------------------------------

export default function BeveragePage() {
  return (
    <section>
      <TitleSection title={"เครื่องดื่ม"} />
      <div className="container px-6 pb-16 md:pb-40">
        <BeverageItems cols={4} />
      </div>
    </section>
  );
}
