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
      password: "",
      status: 1,
      package_id: packageId,
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
          <p className="text-brand-slate mb-2">
            Complete the registration to get started with the{" "}
            <span className="font-semibold text-brand-accent">{packageName}</span>{" "}
            package.
          </p>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-brand-mint border border-brand-pale/50 rounded-lg">
            <p className="text-brand-primary text-sm font-medium">
              Registration successful! Redirecting to login...
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-brand-slate mb-2"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-brand-pale-gray rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              {...register("name", { required: "Full name is required" })}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-brand-slate mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Choose a username"
              className="w-full px-4 py-3 border border-brand-pale-gray rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              {...register("username", { required: "Username is required" })}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-brand-slate mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-3 border border-brand-pale-gray rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
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
