import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, MenuItem, TextField } from "@mui/material";
import { Link, useNavigate } from "react-router";
import {
  checkoutRequest,
  openCheckout,
  CHECKOUT_TOKEN_KEY,
} from "@api/checkout.api";
import type { CheckoutOrder, CheckoutSession } from "@api/checkout.api";
import { createSession } from "@utils/session";
import { useAuthDispatch } from "@store/authentication/context";
import { formatCurrency } from "@utils/currency";
import type { AuthUser, UserSession } from "@app-types/auth.types";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAuthDispatch();
  const [selected, setSelected] = useState<number | "">("");
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const session = useQuery({
    queryKey: ["checkout-session"],
    queryFn: () => checkoutRequest<CheckoutSession>("session"),
    retry: false,
  });
  const data = session.data;
  const current =
    order ||
    (data?.active || data?.order?.status === "pending" ? data?.order : null);
  const packageId = current?.package_id || selected || data?.packages[0]?.id;
  const completed = current?.status === "completed";
  const selectedPlan = data?.packages.find((plan) => plan.id === packageId);
  const amount = current
    ? current.amount / 100
    : Math.max(
        0,
        Number(selectedPlan?.actual_price || 0) -
          Number(selectedPlan?.discount_price || 0),
      );

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setMessage("");
    try {
      await action();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Checkout failed. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  };
  const pay = () =>
    run(async () => {
      if (!data || !packageId) return;
      const pending = await checkoutRequest<CheckoutOrder>("orders", {
        package_id: packageId,
        kind: data.kind,
        request_id: data.request_id,
      });
      setOrder(pending);
      setOrder(await openCheckout(pending));
    });
  const enter = () =>
    run(async () => {
      const result = await checkoutRequest<
        UserSession & { user_type: string; permissions: string[] }
      >("access", {});
      createSession(result);
      sessionStorage.removeItem(CHECKOUT_TOKEN_KEY);
      dispatch({
        type: "LOGIN",
        payload: {
          token: result.token,
          user: { ...result, role: result.user_type } as AuthUser,
        },
      });
      navigate("/dashboard", { replace: true });
    });

  return (
    <main className="min-h-screen bg-brand-bg px-4 py-16 text-brand-ink">
      <div className="mx-auto max-w-lg space-y-5 rounded-2xl border border-brand-border bg-brand-card p-8">
        <h1 className="text-2xl font-bold">
          {completed
            ? "Your package is ready"
            : "Complete your package purchase"}
        </h1>
        <p className="text-brand-ink-muted">
          {completed
            ? "Your subscription is active. Continue to set up your farm."
            : "Your account is saved. Complete payment to activate access. You can return and sign in to retry anytime."}
        </p>
        {session.isPending && <p>Loading checkout…</p>}
        {session.error && (
          <Alert severity="error">
            {session.error.message} <Link to="/login">Sign in again</Link>
          </Alert>
        )}
        {message && <Alert severity="warning">{message}</Alert>}
        {!completed && data && (
          <>
            <TextField
              select
              fullWidth
              label="Package"
              value={packageId || ""}
              disabled={busy || Boolean(current)}
              onChange={(event) => setSelected(Number(event.target.value))}
            >
              {data.packages.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.name} —{" "}
                  {formatCurrency(
                    Math.max(
                      0,
                      Number(plan.actual_price) - Number(plan.discount_price),
                    ),
                  )}{" "}
                  / {plan.duration} months
                </MenuItem>
              ))}
            </TextField>
            <p className="text-lg font-semibold">
              Amount due: {formatCurrency(amount)}
            </p>
            <Button
              fullWidth
              variant="contained"
              onClick={pay}
              disabled={busy || !packageId}
            >
              {busy
                ? "Processing…"
                : amount === 0
                  ? "Activate free package"
                  : "Continue to payment"}
            </Button>
            {current && (
              <Button
                fullWidth
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    setOrder(
                      await checkoutRequest<CheckoutOrder>(
                        `orders/${current.id}`,
                      ),
                    );
                  })
                }
              >
                Check payment status
              </Button>
            )}
          </>
        )}
        {completed && (
          <Button fullWidth variant="contained" disabled={busy} onClick={enter}>
            Continue to dashboard
          </Button>
        )}
        <Link
          className="block text-center text-brand-ink-muted underline"
          to="/login"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
