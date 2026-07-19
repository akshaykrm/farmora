import SelectList from "@components/select-list";
import useGetSeasonNameList from "@hooks/use-get-season-names";
import useGetVendorNames from "@hooks/use-get-vendor-name-list";
import { TextField, Button, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { useForm, type DefaultValues } from "react-hook-form";
import type { PurchaseFormValues } from "../types";
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
};

const PurchaseForm = ({
  onSubmit,
  defaultValues,
  apiError,
  onCancel,
}: Props) => {
  const methods = useForm({ defaultValues });
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

  const sellerList = useGetVendorNames({ type: "supplier" });
  const values = methods.watch();
  const selectedCategoryId = watch("category_id") as number;
  const { handleGetItemsByVendorID, itemList } = useGetItemsByVendorId();

  const seasonNames = useGetSeasonNameList();
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
          <div className="min-w-0">
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
          </div>

          <div className="min-w-0">
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
          </div>

          <div className="min-w-0">
            <RHFTextField
              label="Invoice Number"
              control={control}
              name="invoice_number"
              disabled
              fullWidth
              size="small"
            />
          </div>

          <div className="min-w-0">
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
          </div>

          <div className="min-w-0">
            <SelectList
              options={itemList}
              value={values.category_id}
              disabled={itemList.length === 0}
              onChange={(val) => {
                clearErrors("category_id");
                setValue("category_id", val);
              }}
              label="Type"
              name="category_id"
              error={Boolean(errors.category_id)}
              helperText={errors.category_id?.message}
            />
          </div>

          <div className="min-w-0">
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
              helperText={errors.batch_id?.message}
            />
          </div>

          <div className="min-w-0">
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
          </div>

          <div className="min-w-0">
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
          </div>

          <div className="min-w-0">
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
          </div>

          {/*          <div className="min-w-0">
            <RHFTextField
              label="Discount / Round Off"
              name="discount_price"
              control={control}
              type="number"
              fullWidth
              size="small"
            />
          </div>
	  */}

          <div className="min-w-0">
            <RHFTextField
              label="Net amount"
              name="net_amount"
              control={control}
              fullWidth
              disabled
              size="small"
            />
          </div>

          {/*
          <div className="min-w-0">
            <RHFTextField
              label="Assign Quantity"
              name="assign_quantity"
              control={control}
              fullWidth
              size="small"
            />
          </div>

	 */}
          <div className="min-w-0">
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
          </div>
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
    </>
  );
};

export default PurchaseForm;
