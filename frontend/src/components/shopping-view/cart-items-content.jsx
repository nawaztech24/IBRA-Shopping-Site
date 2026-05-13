import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import axios from "axios";
import { useState } from "react";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);

  const dispatch = useDispatch();

  const { toast } = useToast();

  const [showActions, setShowActions] = useState(null);

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction == "plus") {
      let getCartItems = cartItems.items || [];

      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) => item.productId === getCartItem?.productId
        );

        const getCurrentProductIndex = productList.findIndex(
          (product) => product._id === getCartItem?.productId
        );

        const getTotalStock =
          productList[getCurrentProductIndex].totalStock;

        if (indexOfCurrentCartItem > -1) {
          const getQuantity =
            getCartItems[indexOfCurrentCartItem].quantity;

          if (getQuantity + 1 > getTotalStock) {
            toast({
              title: `Only ${getQuantity} quantity can be added for this item`,
              variant: "destructive",
            });

            return;
          }
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item updated successfully",
        });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({
        userId: user?.id,
        productId: getCartItem?.productId,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item removed",
        });
      }
    });
  }

  async function handleMoveToWishlist(getCartItem) {
    try {
      await axios.post(
        "https://shopping-app-j1vl.onrender.com/api/shop/wishlist/add",
        {
          userId: user?.id,
          productId: getCartItem?.productId,
        }
      );

      dispatch(
        deleteCartItem({
          userId: user?.id,
          productId: getCartItem?.productId,
        })
      );

      toast({
        title: "Moved to wishlist",
      });
    } catch (error) {
      console.log(error);

      toast({
        title: "Something went wrong",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <img
        src={cartItem?.image}
        alt={cartItem?.title}
        className="w-20 h-20 rounded object-cover"
      />

      <div className="flex-1">
        <h3 className="font-extrabold">{cartItem?.title}</h3>

        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            disabled={cartItem?.quantity === 1}
            onClick={() =>
              handleUpdateQuantity(cartItem, "minus")
            }
          >
            <Minus className="w-4 h-4" />
          </Button>

          <span className="font-semibold">
            {cartItem?.quantity}
          </span>

          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            onClick={() =>
              handleUpdateQuantity(cartItem, "plus")
            }
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-end relative overflow-visible">
        <p className="font-semibold">
          ₹
          {(
            (cartItem?.salePrice > 0
              ? cartItem?.salePrice
              : cartItem?.price) * cartItem?.quantity
          ).toFixed(2)}
        </p>

        <button
          onClick={() =>
            setShowActions(
              showActions === cartItem?.productId
                ? null
                : cartItem?.productId
            )
          }
        >
          <Trash
            className="cursor-pointer mt-1"
            size={20}
          />
        </button>

        {showActions === cartItem?.productId && (
          <div className="absolute right-0 top-8 bg-white border rounded-md shadow-2xl p-2 z-[9999] w-auto">
            <button
              onClick={() => setShowActions(null)}
              className="absolute top-1 right-2 text-lg font-bold"
            >
              ×
            </button>

            <div className="flex items-center gap-2 mt-5">
              <Button
                className="h-8 text-xs px-3"
                onClick={() => {
                  handleMoveToWishlist(cartItem);
                  setShowActions(null);
                }}
              >
                Wishlist
              </Button>

              <Button
                variant="destructive"
                className="h-8 text-xs px-3"
                onClick={() => {
                  handleCartItemDelete(cartItem);
                  setShowActions(null);
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserCartItemsContent;