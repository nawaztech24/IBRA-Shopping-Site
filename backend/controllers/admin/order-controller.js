const sendEmail = require("../../helpers/send-email");
const Order = require("../../models/Order");
const User = require("../../models/User");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({});

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

const getOrderDetailsForAdmin = async (req, res) => {
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

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    const user = await User.findById(order.userId);

    await Order.findByIdAndUpdate(id, { orderStatus });

    // STATUS UPDATE EMAIL
    if (user?.email) {
      sendEmail({
        email: user.email,

        subject: "Order Status Updated",

        message: `
          <h2>Order Update 📦</h2>

          <p>Your order status has been updated.</p>

          <h3>Status: ${orderStatus}</h3>

          <p>Thank you for shopping with us ❤️</p>
        `,
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status is updated successfully!",
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
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};