import { useState } from "react";

import axios from "axios";

import { useParams, useNavigate } from "react-router-dom";

import { useToast } from "@/components/ui/use-toast";

function ResetPassword() {
  const { token } = useParams();

  const navigate = useNavigate();

  const { toast } = useToast();

  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      toast({
        title: "Password is required",
        variant: "destructive",
      });

      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password must be at least 6 characters",
        variant: "destructive",
      });

      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`,
        { password }
      );

      toast({
        title:
          response.data.message ||
          "Password reset successful",
      });

      navigate("/auth/login");
    } catch (error) {
      toast({
        title:
          error?.response?.data?.message ||
          "Something went wrong",

        variant: "destructive",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Reset Password
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="block mb-2 text-sm font-medium">
            New Password
          </label>

          <input
            type="password"
            placeholder="Enter new password"
            className="w-full rounded-md border p-3 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-black text-white py-3 hover:opacity-90"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
