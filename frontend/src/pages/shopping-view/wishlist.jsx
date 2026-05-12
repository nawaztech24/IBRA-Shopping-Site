import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";

function ShoppingWishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);

  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const { toast } = useToast();

  async function fetchWishlistItems() {
    try {
      const response = await axios.get(
        `https://shopping-app-j1vl.onrender.com/api/shop/wishlist/get/${user?.id}`
      );

      if (response?.data?.success) {
        setWishlistItems(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function handleRemoveFromWishlist(productId) {
    try {
      const response = await axios.delete(
        `https://shopping-app-j1vl.onrender.com/api/shop/wishlist/remove/${user?.id}/${productId}`
      );

      if (response?.data?.success) {
        toast({
          title: "Product removed from wishlist",
        });

        fetchWishlistItems();
      }
    } catch (error) {
      console.log(error);

      toast({
        title: "Something went wrong",
        variant: "destructive",
      });
    }
  }

  function handleAddToCart(productId) {
    dispatch(
      addToCart({
        userId: user?.id,
        productId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));

        toast({
          title: "Product added to cart",
        });

        handleRemoveFromWishlist(productId);
      }
    });
  }

  useEffect(() => {
    if (user?.id) {
      fetchWishlistItems();
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <h2 className="text-xl font-semibold">Wishlist is empty</h2>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item?._id}>
              <img
                src={item?.productId?.image}
                alt={item?.productId?.title}
                className="w-full h-[300px] object-cover rounded-t-lg"
              />

              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-2">
                  {item?.productId?.title}
                </h2>

                <p className="text-lg font-semibold mb-4">
                  ₹
                  {item?.productId?.salePrice > 0
                    ? item?.productId?.salePrice
                    : item?.productId?.price}
                </p>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() =>
                      handleAddToCart(item?.productId?._id)
                    }
                  >
                    Add to Cart
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() =>
                      handleRemoveFromWishlist(item?.productId?._id)
                    }
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ShoppingWishlist;