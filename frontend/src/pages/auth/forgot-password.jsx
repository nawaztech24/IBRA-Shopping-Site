import { useState } from "react";
import axios from "axios";

import { Link } from "react-router-dom";

import { useToast } from "@/components/ui/use-toast";

function ForgotPassword() {
  const { toast } = useToast();

  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Email is required",
        variant: "destructive",
      });

      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        { email }
      );

      toast({
        title:
          response.data.message ||
          "Password reset email sent",
      });

      setEmail("");
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
          Forgot Password
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email to receive a password reset link.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="block mb-2 text-sm font-medium">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-md border p-3 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-black text-white py-3 hover:opacity-90"
        >
          Send Reset Link
        </button>
      </form>

      <div className="text-center">
        <Link
          to="/auth/login"
          className="text-sm text-primary hover:underline"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;