import { useState } from "react";
import axios from "axios";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import accImg from "../../assets/account.jpg";

import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";

import { useToast } from "@/components/ui/use-toast";

function ShoppingAccount() {
  const { toast } = useToast();

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      toast({
        title: "All fields are required",
        variant: "destructive",
      });

      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "New password must be at least 6 characters",
        variant: "destructive",
      });

      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
        
        passwordData,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast({
          title: response.data.message,
        });

        setPasswordData({
          oldPassword: "",
          newPassword: "",
        });
      }
    } catch (error) {
      toast({
        title:
          error?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img
          src={accImg}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="container mx-auto grid grid-cols-1 gap-8 py-8">
        <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">Orders</TabsTrigger>

              <TabsTrigger value="address">Address</TabsTrigger>

              <TabsTrigger value="password">
                Change Password
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <ShoppingOrders />
            </TabsContent>

            <TabsContent value="address">
              <Address />
            </TabsContent>

            <TabsContent value="password">
              <div className="max-w-md space-y-5 mt-5">
                <h2 className="text-2xl font-bold">
                  Change Password
                </h2>

                <form
                  onSubmit={handleChangePassword}
                  className="space-y-4"
                >
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Old Password
                    </label>

                    <input
                      type="password"
                      placeholder="Enter old password"
                      className="w-full rounded-md border p-3 outline-none"
                      value={passwordData.oldPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          oldPassword: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      New Password
                    </label>

                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full rounded-md border p-3 outline-none"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-md bg-black text-white py-3 hover:opacity-90"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;