import * as React from "react";
import { SVGProps } from "react";

// ----------------------------------------------------------------------

const BasketIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M5.5 21c-.78 0-1.46-.45-1.79-1.1L1.1 10.44 1 10a1 1 0 0 1 1-1h4.58l4.6-6.57a.997.997 0 0 1 1.65.01L17.42 9H22a1 1 0 0 1 1 1l-.04.29-2.67 9.61c-.33.65-1.01 1.1-1.79 1.1zM12 4.74 9 9h6zM12 13a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2"
    />
  </svg>
);
export default BasketIcon;
