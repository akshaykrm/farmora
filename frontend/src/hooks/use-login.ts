import { useMutation } from "@tanstack/react-query";
import auth from "@api/auth.api";
import type { LoginPayload, UserSession } from "@app-types/auth.types";
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
      toast.error(error.message);
      console.log(error);
    },
  });

  const onLogin = useCallback(
    (payload: LoginPayload) => {
      mutation.mutate(payload);
    },
    [mutation],
  );

  return { onLogin, methods, isPending: mutation.isPending };
};

export default useLogin;
