const razorpay = require("../../helpers/razorpay");
const sendEmail = require("../../helpers/send-email");
const crypto = require("crypto");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const User = require("../../models/User");


const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      cartId,
    } = req.body;

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `order_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId: razorpayOrder.id,
    });

    await newlyCreatedOrder.save();

    res.status(201).json({
      success: true,
      orderId: newlyCreatedOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error creating Razorpay order",
    });
  }
};


const capturePayment = async (req, res) => {
  try {

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId,
    } = req.body;

    console.log("BODY:", req.body);
    console.log("SECRET:", process.env.RAZORPAY_SECRET);

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment data",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    console.log("Generated:", expectedSignature);
    console.log("Received:", razorpay_signature);

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const user = await User.findById(order.userId);

    // PAYMENT FAILED
    if (expectedSignature !== razorpay_signature) {

      if (user?.email) {
        sendEmail({
          email: user.email,

          subject: "Payment Failed",

          message: `
            <h2>Payment Failed ❌</h2>

            <p>Your payment could not be completed.</p>

            <p>Please try again.</p>
          `,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // PAYMENT SUCCESS
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = razorpay_payment_id;

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (product) {
        product.totalStock -= item.quantity;
        await product.save();
      }
    }

    await Cart.findByIdAndDelete(order.cartId);

    await order.save();

    // SUCCESS EMAIL
    if (user?.email) {
      sendEmail({
        email: user.email,

        subject: "Order Placed Successfully",

        message: `
          <h2>Order Confirmed ✅</h2>

          <p>Your payment was successful.</p>

          <p>Your order has been placed successfully.</p>

          <p>Total Amount: ₹${order.totalAmount}</p>

          <p>Thank you for shopping with us ❤️</p>
        `,
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment successful",
      data: order,
    });

  } catch (e) {
    console.log(e);

    res.status(500).json({
      success: false,
      message: "Payment failed",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};


const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};