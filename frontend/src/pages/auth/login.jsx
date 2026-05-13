import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";

import { useState } from "react";

import { useDispatch } from "react-redux";

import { Link } from "react-router-dom";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);

  const dispatch = useDispatch();

  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();

    // Blank field validation
    if (!formData.email || !formData.password) {
      toast({
        title: "All fields are required",
        variant: "destructive",
      });

      return;
    }

    // Password length validation
    if (formData.password.length < 6) {
      toast({
        title: "Password must be at least 6 characters",
        variant: "destructive",
      });

      return;
    }

    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message || "Login successful",
        });
      } else {
        toast({
          title:
            data?.payload?.message ||
            "Invalid email or password",

          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Sign in to your account
        </h1>

        <p className="mt-2">
          Don't have an account

          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/register"
          >
            Register
          </Link>
        </p>
      </div>

      <CommonForm
        formControls={loginFormControls}
        buttonText={"Sign In"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />

      <div className="text-right">
        <Link
          to="/auth/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot Password?
        </Link>
      </div>
    </div>
  );
}

export default AuthLogin;