import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@components/dialog";
import auth from "@api/auth.api";
import type { ManagerRegistrationPayload } from "@app-types/auth.types";
import { Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  packageId: number;
  packageName: string;
};

const ManagerRegistrationDialog = ({
  isOpen,
  onClose,
  packageId,
  packageName,
}: Props) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ManagerRegistrationPayload>({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      status: 1,
      package_id: packageId,
      state: "",
      district: "",
      place: "",
      pincode: "",
      bird_capacity: "",
    },
  });

  const mutation = useMutation({
    mutationFn: auth.registerManager,
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      setTimeout(() => {
        onClose();
        reset();
        setSuccess(false);
        navigate("/login");
      }, 2000);
    },
    onError: (error: unknown) => {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.",
      );
    },
  });

  const onSubmit = (data: ManagerRegistrationPayload) => {
    setError(null);
    mutation.mutate({
      ...data,
      package_id: packageId,
      status: 1,
    });
  };

  const handleClose = () => {
    if (!mutation.isPending) {
      onClose();
      reset();
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      headerTitle="Register for Farm Management"
      onClose={handleClose}
    >
      <DialogContent>
        <div className="mb-4">
          <p className="text-brand-ink-soft mb-2">
            Complete the registration to get started with the{" "}
            <span className="font-semibold text-brand-accent">{packageName}</span>{" "}
            package.
          </p>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-brand-canvas border border-brand-border-strong/50 rounded-lg">
            <p className="text-brand-primary text-sm font-medium">
              Registration successful! Redirecting to login...
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-brand-danger-soft border border-brand-danger-soft rounded-lg">
            <p className="text-brand-danger-strong text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-brand-ink-soft mb-2"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-brand-border-strong rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              {...register("name", { required: "Full name is required" })}
            />
            {errors.name && (
              <p className="text-brand-danger text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-brand-ink-soft mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Choose a username"
              className="w-full px-4 py-3 border border-brand-border-strong rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              {...register("username", { required: "Username is required" })}
            />
            {errors.username && (
              <p className="text-brand-danger text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-brand-ink-soft mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-brand-border-strong rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
            />
            {errors.email && (
              <p className="text-brand-danger text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-brand-ink-soft mb-2"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              className="w-full px-4 py-3 border border-brand-border-strong rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              {...register("phone", {
                required: "Phone number is required",
                minLength: {
                  value: 7,
                  message: "Enter a valid phone number",
                },
              })}
            />
            {errors.phone && (
              <p className="text-brand-danger text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-brand-ink-soft mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-3 border border-brand-border-strong rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-brand-danger text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-brand-ink-soft mb-2"
              >
                State
              </label>
              <input
                id="state"
                type="text"
                placeholder="Enter your state"
                className="w-full px-4 py-3 border border-brand-border-strong rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                {...register("state")}
              />
            </div>

            <div>
              <label
                htmlFor="district"
                className="block text-sm font-medium text-brand-ink-soft mb-2"
              >
                District
              </label>
              <input
                id="district"
                type="text"
                placeholder="Enter your district"
                className="w-full px-4 py-3 border border-brand-border-strong rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                {...register("district")}
              />
            </div>

            <div>
              <label
                htmlFor="place"
                className="block text-sm font-medium text-brand-ink-soft mb-2"
              >
                Place
              </label>
              <input
                id="place"
                type="text"
                placeholder="Enter your place"
                className="w-full px-4 py-3 border border-brand-border-strong rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                {...register("place")}
              />
            </div>

            <div>
              <label
                htmlFor="pincode"
                className="block text-sm font-medium text-brand-ink-soft mb-2"
              >
                Pincode
              </label>
              <input
                id="pincode"
                type="text"
                placeholder="Enter your pincode"
                className="w-full px-4 py-3 border border-brand-border-strong rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                {...register("pincode")}
              />
            </div>

            <div>
              <label
                htmlFor="bird_capacity"
                className="block text-sm font-medium text-brand-ink-soft mb-2"
              >
                Bird capacity
              </label>
              <input
                id="bird_capacity"
                type="text"
                placeholder="Enter bird capacity"
                className="w-full px-4 py-3 border border-brand-border-strong rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                {...register("bird_capacity")}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outlined"
              onClick={handleClose}
              disabled={mutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={mutation.isPending}
              className="flex-1"
            >
              {mutation.isPending ? (
                <>
                  <CircularProgress size={16} color="inherit" />
                  <span>Registering...</span>
                </>
              ) : (
                "Register"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManagerRegistrationDialog;
