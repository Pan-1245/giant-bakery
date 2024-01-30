const baseUrl = process.env.NEXT_PUBLIC_URL as string;

const createUrl = (endpoint: string) => `${baseUrl}/api/${endpoint}`;

const paths = () => {
  // Cart
  const getCart = (userId: string) => createUrl(`carts?userId=${userId}`);
  const deleteCartItem = (userId: string, itemId: string) =>
    createUrl(`carts?userId=${userId}&itemId=${itemId}`);
  const updateCartItem = createUrl("carts");

  const getCustomerAddress = (userId: string) =>
    createUrl(`customers/${userId}/addresses`);

  const createCustomerAddress = (userId: string) =>
    createUrl(`customers/${userId}/addresses`);

  const getInterExpressLocation = (zipCode: string) =>
    `https://api-intership.interexpress.co.th/v1/operation-areas/post-code/${zipCode}`;

  return {
    getCart,
    updateCartItem,
    deleteCartItem,
    getCustomerAddress,
    createCustomerAddress,
    getInterExpressLocation,
  };
};

export default paths;
