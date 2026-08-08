import { useMutation } from "@tanstack/react-query";
import auth from "@api/auth.api";
import type { LoginPayload, UserSession } from "@app-types/auth.types";
import NetworkError from "@errors/network.error";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useAuthDispatch } from "@store/authentication/context";
import { createSession } from "@utils/session";

const useLogin = () => {
  const dispatch = useAuthDispatch();
  const methods = useForm<LoginPayload>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: LoginPayload) => auth.login(payload),
    onSuccess: (data) => {
      const userSession: UserSession = {
        username: data.username,
        name: data.name,
        email: data.email,
        phone: data.phone,
        token: data.token,
        role: data.user_type,
      };
      createSession(userSession);
      toast.success("Login successful!");
      dispatch({
        type: "LOGIN",
        payload: {
          token: data.token,
          user: {
            name: data.name,
            username: data.username,
            email: data.email,
            phone: data.phone,
            role: data.user_type,
          },
        },
      });
    },
    onError: (error) => {
      if (error instanceof NetworkError) {
        if (
          error.code === "USER_NOT_FOUND" ||
          error.code === "INVALID_USERNAME"
        ) {
          methods.setError("username", { type: "server", message: error.message });
          return;
        }
        if (error.code === "UNAUTHORIZED") {
          methods.setError("password", { type: "server", message: error.message });
          return;
        }
      }
      toast.error(error.message);
      console.log(error);
    },
  });

  const onLogin = useCallback(
    (payload: LoginPayload) => {
      methods.clearErrors("username");
      methods.clearErrors("password");
      mutation.mutate(payload);
    },
    [mutation, methods],
  );

  return { onLogin, methods, isPending: mutation.isPending };
};

export default useLogin;
