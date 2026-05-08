import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { capturePayment } from "@/store/shop/order-slice";
import { fetchCartItems } from "@/store/shop/cart-slice";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useLocation, useNavigate } from "react-router-dom";

function RazorpayReturnPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const params = new URLSearchParams(location.search);

  const razorpay_payment_id = params.get("razorpay_payment_id");
  const razorpay_order_id = params.get("razorpay_order_id");
  const razorpay_signature = params.get("razorpay_signature");

  useEffect(() => {
    if (razorpay_payment_id && razorpay_order_id) {
      const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));

      dispatch(
        capturePayment({
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          orderId,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          sessionStorage.removeItem("currentOrderId");

          dispatch(fetchCartItems(user?.id));

          navigate("/shop/payment-success");
        }
      });
    }
  }, [
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    dispatch,
    navigate,
    user,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Payment...Please wait!</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default RazorpayReturnPage;