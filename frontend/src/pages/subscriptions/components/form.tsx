import type {
  NewSubscriptionRequest,
  EditSubscriptionRequest,
} from "@app-types/subscription.types";
import SelectList from "@components/select-list";
import useGetPackageNames from "@hooks/package/use-get-package-names";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import fetcherV2 from "@utils/fetcherV2";
import type { ListResponse } from "@app-types/response.types";
import type { NameResponse } from "@app-types/gen.types";
import referralsApi from "@api/referrals.api";

type EditMethod = UseFormReturn<EditSubscriptionRequest, any, FieldValues>;
type AddMethod = UseFormReturn<NewSubscriptionRequest, any, FieldValues>;

type Props = {
  methods: EditMethod | AddMethod;
  onSubmit: (payload: any) => void;
  onCancel?: () => void;
  showUserSelect?: boolean;
  showReferralSelect?: boolean;
  referralLocked?: boolean;
};

const SubscriptionForm = ({
  methods,
  onSubmit,
  onCancel,
  showUserSelect,
  showReferralSelect,
  referralLocked,
}: Props) => {
  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods;

  const packageNames = useGetPackageNames();
  const values = methods.watch();
  const [subscribers, setSubscribers] = useState<NameResponse[]>([]);
  const [partners, setPartners] = useState<NameResponse[]>([]);

  useEffect(() => {
    if (!showUserSelect) return;
    const load = async () => {
      const res = await fetcherV2<ListResponse<{ id: number; name: string }>>(
        "users",
        null,
        { method: "GET", filter: { user_type: "manager", limit: 100, page: 1 } },
      );
      if (res.status === "success" && res.data) {
        setSubscribers(
          res.data.data.map((user) => ({ id: user.id, name: user.name })),
        );
      }
    };
    load();
  }, [showUserSelect]);

  useEffect(() => {
    if (!showReferralSelect) return;
    const load = async () => {
      const res = await referralsApi.fetchAll({ page: 1, limit: 100 });
      if (res.status === "success" && res.data) {
        setPartners(
          (res.data.data || [])
            .filter((partner) => partner.status === "active")
            .map((partner) => ({
              id: partner.id,
              name: `${partner.name} (${partner.code})`,
            })),
        );
      }
    };
    load();
  }, [showReferralSelect]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4">
          {showUserSelect && (
            <SelectList
              options={subscribers}
              value={(values as NewSubscriptionRequest).user_id}
              onChange={(val) => {
                (setValue as any)("user_id", val);
              }}
              label="Subscriber"
              name="user_id"
              error={Boolean((errors as any).user_id)}
              helperText={(errors as any).user_id?.message}
            />
          )}
          <SelectList
            options={packageNames.data}
            value={values.package_id}
            onChange={(val) => {
              (setValue as any)("package_id", val);
            }}
            label="Package"
            name="package_id"
            error={Boolean(errors.package_id)}
            helperText={errors.package_id?.message}
          />
          {showReferralSelect && (
            <SelectList
              options={partners}
              value={(values as NewSubscriptionRequest).referral_partner_id}
              onChange={(val) => {
                (setValue as any)("referral_partner_id", val || null);
              }}
              label="Referral partner"
              name="referral_partner_id"
              error={Boolean((errors as any).referral_partner_id)}
              helperText={
                referralLocked
                  ? "Already assigned for this subscriber"
                  : (errors as any).referral_partner_id?.message ||
                    "Optional — assigns partner and credits bonus"
              }
              disabled={referralLocked}
            />
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          {onCancel && (
            <Button variant="outlined" type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </>
  );
};

export default SubscriptionForm;
