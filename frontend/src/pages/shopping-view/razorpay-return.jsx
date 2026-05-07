import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { capturePayment } from "@/store/shop/order-slice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

function RazorpayReturnPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // Razorpay params
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
          window.location.href = "/shop/payment-success";
        }
      });
    }
  }, [razorpay_payment_id, razorpay_order_id, razorpay_signature, dispatch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Payment...Please wait!</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default RazorpayReturnPage;