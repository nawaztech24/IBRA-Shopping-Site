// SAME imports (unchanged)
import { Button } from "@/components/ui/button";
import bannerOne from "../../assets/banner-1.webp";
import bannerTwo from "../../assets/banner-2.webp";
import bannerThree from "../../assets/banner-3.webp";
import {
  Airplay,
  BabyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  Heater,
  Images,
  Shirt,
  ShirtIcon,
  ShoppingBasket,
  UmbrellaIcon,
  WashingMachine,
  WatchIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { getFeatureImages } from "@/store/common-slice";

// SAME data
const categoriesWithIcon = [
  { id: "men", label: "Men", icon: ShirtIcon },
  { id: "women", label: "Women", icon: CloudLightning },
  { id: "kids", label: "Kids", icon: BabyIcon },
  { id: "accessories", label: "Accessories", icon: WatchIcon },
  { id: "footwear", label: "Footwear", icon: UmbrellaIcon },
];

const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: Shirt },
  { id: "adidas", label: "Adidas", icon: WashingMachine },
  { id: "puma", label: "Puma", icon: ShoppingBasket },
  { id: "levi's", label: "Levi's", icon: Airplay },
  { id: "zara", label: "Zara", icon: Images },
  { id: "h&m", label: "H&M", icon: Heater },
];

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  //  FIXED banners
  const banners =
    featureImageList && featureImageList.length > 0
      ? featureImageList.map((item) => item.image)
      : [bannerOne, bannerTwo, bannerThree];

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(id) {
    dispatch(fetchProductDetails(id));
  }

  function handleAddtoCart(id) {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: id,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Product is added to cart" });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    if (banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [banners]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen">

      {/*  BANNER */}
      <div className="relative w-full h-[600px] overflow-hidden">
        {banners.map((slide, index) => (
          <img
            src={slide}
            key={index}
            className={`${
              index === currentSlide ? "opacity-100" : "opacity-0"
            } absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000`}
          />
        ))}

        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prev) => (prev - 1 + banners.length) % banners.length
            )
          }
          className="absolute top-1/2 left-4 bg-white/80"
        >
          <ChevronLeftIcon />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide((prev) => (prev + 1) % banners.length)
          }
          className="absolute top-1/2 right-4 bg-white/80"
        >
          <ChevronRightIcon />
        </Button>
      </div>

      {/* CATEGORY */}
      <section className="py-12 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-8">
          Shop by category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-4">
          {categoriesWithIcon.map((item) => (
            <Card
              onClick={() => handleNavigateToListingPage(item, "category")}
              className="cursor-pointer"
            >
              <CardContent className="flex flex-col items-center p-6">
                <item.icon className="w-12 h-12 mb-4" />
                {item.label}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      
      <section className="py-12 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-8">
          Shop by Brand
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 px-4">
          {brandsWithIcon.map((item) => (
            <Card
              onClick={() => handleNavigateToListingPage(item, "brand")}
              className="cursor-pointer"
            >
              <CardContent className="flex flex-col items-center p-6">
                <item.icon className="w-12 h-12 mb-4" />
                {item.label}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          Feature Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
          {productList?.map((item) => (
            <ShoppingProductTile
              product={item}
              handleGetProductDetails={handleGetProductDetails}
              handleAddtoCart={handleAddtoCart}
            />
          ))}
        </div>
      </section>

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingHome;