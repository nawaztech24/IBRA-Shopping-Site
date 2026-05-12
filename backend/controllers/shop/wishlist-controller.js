const Wishlist = require("../../models/wishlist");
const mongoose = require("mongoose");


// ADD TO WISHLIST
exports.addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        products: [{ productId }],
      });

      await wishlist.save();

      return res.status(201).json({
        success: true,
        message: "Product added to wishlist",
        data: wishlist,
      });
    }

    const productExists = wishlist.products.find(
      (item) => item.productId.toString() === productId
    );

    if (productExists) {
      return res.status(200).json({
        success: true,
        message: "Product already in wishlist",
      });
    }

    wishlist.products.push({ productId });

    await wishlist.save();

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      data: wishlist,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


// GET WISHLIST
exports.getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    const wishlist = await Wishlist.findOne({ userId }).populate(
      "products.productId"
    );

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      data: wishlist.products,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


exports.removeFromWishlist = async (req, res) => {
  try {

    console.log(req.params);

    const { userId, productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.products.pull({
      productId: new mongoose.Types.ObjectId(productId),
    });

    await wishlist.save();

    const updatedWishlist = await Wishlist.findOne({ userId });

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      data: updatedWishlist,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};