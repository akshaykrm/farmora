import SelectList from "@components/select-list";
import useGetSeasonNames from "@hooks/use-get-season-names";
import useGetVendorNames from "@hooks/use-get-vendor-name-list";
import { TextField, Button, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, type DefaultValues } from "react-hook-form";
import type { DuplicateInvoice, PurchaseFormValues } from "../types";
import { Dialog, DialogActions, DialogContent } from "@components/dialog";
import type { ValidationError } from "@errors/api.error";
import useGetItemsByVendorId from "@pages/items/hooks/use-get-items-by-vendor-id";
import purchase from "../api";
import { itemTypes } from "@pages/items";
import { RHFTextField } from "@components/form/input";
import useGetBatchNameList from "@hooks/use-get-batch-names";

type Props = {
  defaultValues: DefaultValues<PurchaseFormValues>;
  onSubmit: (payload: any) => void;
  apiError: ValidationError[];
  onCancel?: () => void;
  duplicateInvoice?: DuplicateInvoice | null;
};

const sectionColumns = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

const FormSection = ({
  title,
  description,
  columns = 4,
  children,
}: {
  title: string;
  description?: string;
  columns?: 3 | 4;
  children: ReactNode;
}) => (
  <section className="rounded-lg border border-brand-border p-4">
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-brand-ink">{title}</h3>
      {description && (
        <p className="text-xs text-brand-ink-muted">{description}</p>
      )}
    </div>
    <div
      className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${sectionColumns[columns]} [&>*]:min-w-0`}
    >
      {children}
    </div>
  </section>
);

const PurchaseForm = ({
  onSubmit,
  defaultValues,
  apiError,
  onCancel,
  duplicateInvoice,
}: Props) => {
  const methods = useForm({ defaultValues });
  const [dismissedDuplicate, setDismissedDuplicate] =
    useState<DuplicateInvoice | null>(null);
  const showDuplicate =
    !!duplicateInvoice && duplicateInvoice !== dismissedDuplicate;
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = methods;

  useEffect(() => {
    methods.reset(defaultValues);
  }, [defaultValues]);

  const sellerList = useGetVendorNames({ type: ["supplier", "internal"] });
  const values = methods.watch();
  const selectedCategoryId = watch("category_id") as number;
  const { handleGetItemsByVendorID, itemList } = useGetItemsByVendorId();

  const seasonNames = useGetSeasonNames({ status: "active" });
  //TODO: make this get by season id
  const batchList = useGetBatchNameList({
    status: "active",
    season_id: values.season_id,
  });

  const selectedItem = useMemo(() => {
    if (itemList && selectedCategoryId) {
      const selected = itemList.find((item) => item.id === selectedCategoryId);
      return selected || null;
    }
    return null;
  }, [selectedCategoryId, itemList]);

  const selectedType = useMemo(() => {
    if (selectedItem) {
      const { type, base_price } = selectedItem;
      if (base_price) {
        setValue("price_per_unit", base_price.toString());
      }
      return type;
    }

    return itemTypes.find((item) => item.value === "regular")?.value;
  }, [selectedItem]);

  const parsedQty = useMemo(() => {
    return values.quantity ? parseFloat(values.quantity) : 0;
  }, [values.quantity]);

  useEffect(() => {
    if (parsedQty === 0) {
      setValue("total_price", "");
    }
    if (values.price_per_unit && !values.total_price) {
      const totalPrice = parsedQty * parseFloat(values.price_per_unit);
      setValue("total_price", totalPrice.toString());
    }
  }, [parsedQty, values.price_per_unit]);

  useEffect(() => {
    if (selectedType === "working") {
      setValue("quantity", "1");
      setValue("payment_type", "paid");
    }
    if (selectedType === "integration") {
      setValue("quantity", "1");
      setValue("payment_type", "credit");
    }
  }, [selectedType]);

  useEffect(() => {
    if (values.vendor_id) {
      handleGetItemsByVendorID(values.vendor_id);
    }
  }, [values.vendor_id]);

  useEffect(() => {
    const handleGetInvoiceNumber = async () => {
      const invoiceNumber = await purchase.getInvoiceNumber();
      if (invoiceNumber) {
        setValue("invoice_number", invoiceNumber);
      }
    };
    if (!values.invoice_number) {
      handleGetInvoiceNumber();
    }
  }, [values.invoice_number]);

  useEffect(() => {
    let netAmount = 0;

    if (values.total_price) {
      netAmount = parseFloat(values.total_price);
      if (values.discount_price) {
        const parsedDiscountPrice = parseFloat(values.discount_price);
        netAmount += parsedDiscountPrice;
      }
    }

    setValue("net_amount", netAmount || "");
  }, [values.total_price, values.discount_price]);

  useEffect(() => {
    if (apiError.length > 0) {
      apiError.forEach(({ name, message }) => {
        setError(name, { message });
      });
    }
  }, [apiError]);

  return (
    <>
      <form {...methods} onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <FormSection title="Invoice" description="Supplier bill details">
            <RHFTextField
              label="Invoice Number"
              control={control}
              name="invoice_number"
              disabled
              fullWidth
              size="small"
            />

            <DatePicker
              label="Invoice Date"
              name="invoice_date"
              value={values.invoice_date ? dayjs(values.invoice_date) : null}
              format="DD-MM-YYYY"
              onChange={(v) => {
                clearErrors("invoice_date");
                setValue("invoice_date", dayjs(v).toISOString());
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: Boolean(errors.invoice_date),
                  helperText: errors.invoice_date?.message,
                  size: "small",
                },
              }}
            />

            <SelectList
              options={sellerList.data}
              value={values.vendor_id}
              onChange={(val) => {
                clearErrors("vendor_id");
                setValue("vendor_id", val);
              }}
              label="Supplier"
              name="vendor_id"
              error={Boolean(errors.vendor_id)}
              helperText={errors.vendor_id?.message}
            />

            <TextField
              select
              label="Payment Type"
              {...register("payment_type")}
              value={values.payment_type || "credit"}
              fullWidth
              disabled={
                selectedType === "working" || selectedType === "integration"
              }
              error={Boolean(errors.payment_type)}
              helperText={errors.payment_type?.message}
              size="small"
            >
              <MenuItem value="credit">Credit</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
            </TextField>
          </FormSection>

          <FormSection
            title="Item & Batch"
            description="What was purchased and where it goes"
            columns={3}
          >
            <SelectList
              options={itemList}
              value={values.category_id}
              disabled={itemList.length === 0}
              onChange={(val) => {
                clearErrors("category_id");
                setValue("category_id", val);
              }}
              label="Item"
              name="category_id"
              error={Boolean(errors.category_id)}
              helperText={
                errors.category_id?.message ||
                (values.vendor_id ? undefined : "Select a supplier first")
              }
            />

            <SelectList
              options={seasonNames.data}
              value={values.season_id}
              onChange={(val) => {
                clearErrors("season_id");
                setValue("season_id", val);
              }}
              label="Season"
              name="season_id"
              error={Boolean(errors.season_id)}
              helperText={errors.season_id?.message}
            />

            <SelectList
              options={batchList.data}
              disabled={!values.season_id}
              value={values.batch_id}
              onChange={(val) => {
                clearErrors("batch_id");
                setValue("batch_id", val);
              }}
              label="Batch"
              name="batch_id"
              error={Boolean(errors.batch_id)}
              helperText={
                errors.batch_id?.message ||
                (values.season_id ? undefined : "Select a season first")
              }
            />
          </FormSection>

          <FormSection
            title="Quantity & Amount"
            description="Enter the rate or the total; the other is calculated"
          >
            <RHFTextField
              label="Quantity (Nos)"
              name="quantity"
              control={control}
              type="number"
              fullWidth
              disabled={
                selectedType === "working" || selectedType === "integration"
              }
              size="small"
            />

            <RHFTextField
              label="Rate / Number"
              name="price_per_unit"
              control={control}
              type="number"
              fullWidth
              size="small"
              onChange={(e) => {
                const { value } = e.target;
                setValue("price_per_unit", value);
                const totalPrice = parsedQty * parseFloat(value || 0);
                setValue("total_price", totalPrice.toString());
              }}
            />

            <RHFTextField
              label="Total Amount"
              name="total_price"
              control={control}
              type="number"
              fullWidth
              size="small"
              onChange={(e) => {
                const { value } = e.target;
                setValue("total_price", value);
                const pricePerUnit = parsedQty
                  ? parseFloat(value || 0) / parsedQty
                  : 0;
                setValue("price_per_unit", pricePerUnit.toString());
              }}
            />

            {/*
            <RHFTextField
              label="Discount / Round Off"
              name="discount_price"
              control={control}
              type="number"
              fullWidth
              size="small"
            />

            <RHFTextField
              label="Assign Quantity"
              name="assign_quantity"
              control={control}
              fullWidth
              size="small"
            />
            */}

            <RHFTextField
              label="Net Amount"
              name="net_amount"
              control={control}
              fullWidth
              disabled
              size="small"
            />
          </FormSection>

          <FormSection title="Notes">
            <div className="col-span-full">
              <RHFTextField
                label="Narration"
                name="narration"
                control={control}
                fullWidth
                multiline
                rows={2}
                size="small"
              />
            </div>
          </FormSection>
        </div>

        <div className="mt-6 flex justify-stretch md:justify-end gap-2">
          {onCancel && (
            <Button
              variant="outlined"
              type="button"
              onClick={onCancel}
              className="w-full md:w-auto"
            >
              Cancel
            </Button>
          )}
          <Button
            variant="contained"
            type="submit"
            className="w-full md:w-auto"
          >
            Submit
          </Button>
        </div>
      </form>

      <Dialog
        isOpen={showDuplicate}
        headerTitle="Invoice Number Already Exists"
        onClose={() => setDismissedDuplicate(duplicateInvoice ?? null)}
      >
        <DialogContent>
          <p className="text-sm text-brand-ink-soft">
            Invoice number{" "}
            <span className="font-semibold text-brand-ink">
              {duplicateInvoice?.invoice_number}
            </span>{" "}
            already exists. Do you want to change it to{" "}
            <span className="font-semibold text-brand-ink">
              {duplicateInvoice?.next_invoice_number}
            </span>{" "}
            and save?
          </p>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setDismissedDuplicate(duplicateInvoice ?? null)}
          >
            No
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!duplicateInvoice) return;
              setDismissedDuplicate(duplicateInvoice);
              setValue("invoice_number", duplicateInvoice.next_invoice_number);
              handleSubmit(onSubmit)();
            }}
          >
            Yes, change it
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PurchaseForm;
