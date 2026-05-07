import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder, capturePayment } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { razorpayOrderId, amount, key, orderId } = useSelector(
    (state) => state.shopOrder
  );

  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);

  const dispatch = useDispatch();
  const { toast } = useToast();

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  const handleRazorpayPayment = async () => {
    if (!cartItems?.items?.length) {
      toast({
        title: "Cart is empty",
        variant: "destructive",
      });
      return;
    }

    if (!currentSelectedAddress) {
      toast({
        title: "Select address first",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((item) => ({
        productId: item.productId,
        title: item.title,
        image: item.image,
        price: item.salePrice > 0 ? item.salePrice : item.price,
        quantity: item.quantity,
      })),
      addressInfo: currentSelectedAddress,
      totalAmount: totalCartAmount,
      orderStatus: "pending",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    setIsPaymentStart(true);

    const response = await dispatch(createNewOrder(orderData));

    if (!response?.payload?.success) {
      toast({
        title: "Order creation failed",
        variant: "destructive",
      });
      setIsPaymentStart(false);
      return;
    }

    const data = response.payload;

    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: "Shopping App",
      description: "Order Payment",
      order_id: data.razorpayOrderId,

      handler: async function (response) {
        console.log("Razorpay Response:", response);

        const result = await dispatch(
  capturePayment({
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_order_id: response.razorpay_order_id,
    razorpay_signature: response.razorpay_signature,
    orderId: data.orderId,
       })
);

        if (result?.payload?.success) {
          toast({
            title: "Payment successful ",
          });

          setIsPaymentStart(false);

          // redirect
          window.location.href = "/shop/payment-success";
        } else {
          toast({
            title: "Payment verification failed",
            variant: "destructive",
          });

          setIsPaymentStart(false);
        }
      },

      modal: {
        ondismiss: function () {
          setIsPaymentStart(false);
        },
      },

      theme: {
        color: "#3399cc",
      },
    };

    const razor = new window.Razorpay(options);
    razor.open();
  };

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />

        <div className="flex flex-col gap-4">
          {cartItems?.items?.map((item) => (
            <UserCartItemsContent key={item._id} cartItem={item} />
          ))}

          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">₹{totalCartAmount}</span>
            </div>
          </div>

          <div className="mt-4 w-full">
            <Button onClick={handleRazorpayPayment} className="w-full">
              {isPaymentStart
                ? "Processing Payment..."
                : "Checkout with Razorpay"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;