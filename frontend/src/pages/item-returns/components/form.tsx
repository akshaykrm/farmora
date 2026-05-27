import SelectList from "@components/select-list";
import useGetItemCategoryName from "@hooks/item-category/use-get-item-category-names";
import useGetBatchNameList from "@hooks/use-get-batch-names"; import useGetSellerNameList from "@hooks/use-get-vendor-name-list";
import { TextField, MenuItem, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { removeInternal } from "@utils/remove-internal";
import dayjs from "dayjs";
import { useEffect, } from "react";

type Props = {
	methods: any;
	onSubmit: (payload: any) => void;
};


const ItemReturnForm = ({ methods, onSubmit }: Props) => {
	const {
		handleSubmit,
		register,
		setValue,
		watch,
		formState: { errors },
	} = methods;

	const batchNames = useGetBatchNameList();
	const itemCategoryName = useGetItemCategoryName();
	const itemVendorName = useGetSellerNameList();
	const values = watch();

	console.log(itemCategoryName.data.filter(({ type }) => (type !== "integration") && (type != "working")))

	const returnType = values.return_type;

	const [qty, ratePerBag] = watch(["quantity", "rate_per_bag"]);
	const paymentType = watch("payment_type");

	useEffect(() => {
		if (paymentType) {
			setValue("payment_type", paymentType);
		}
	}, [paymentType]);

	useEffect(() => {
		methods.setValue("total_amount", qty * ratePerBag);
	}, [qty, ratePerBag]);

	useEffect(() => {
		if (returnType === "vendor") {
			methods.setValue("payment_type", "paid");

			return;
		}

		if (returnType === "batch") {
			methods.setValue("payment_type", "credit");
		}
	}, [returnType]);

	return (
		<>
			<form {...methods} onSubmit={handleSubmit(onSubmit)}>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<TextField
						label="Return Type"
						select
						fullWidth
						value={watch("return_type")}
						name="return_type"
						onChange={(e) => {
							const { name, value } = e.target;
							setValue(name, value ? value : "");
							if (value === "batch") {
								setValue("payment_type", "");
							}
						}}
						error={Boolean(errors.return_type)}
						helperText={errors.return_type?.message}
						size="small"
					>
						<MenuItem value="vendor">Vendor</MenuItem>
						<MenuItem value="batch">Batch</MenuItem>
					</TextField>

					<SelectList
						options={removeInternal(itemCategoryName.data?.map((t) => {

	      return {id: t.id, name:t.type}
	    }))}
						value={values.item_category_id}
						onChange={(val) => {
							(setValue as any)("item_category_id", val);
						}}
						label="Category"
						name="item_category_id"
						error={Boolean(errors.item_category_id)}
						helperText={errors.item_category_id?.message}
					/>

					<DatePicker
						label="Return Date"
						name="date"
						value={values.date ? dayjs(values.date) : null}
						format="DD-MM-YYYY"
						onChange={(v) => {
							(setValue as any)("date", dayjs(v).toISOString());
						}}
						slotProps={{
							textField: {
								fullWidth: true,
								error: Boolean(errors.date),
								helperText: errors.date?.message,
								size: "small",
							},
						}}
					/>

					<SelectList
						options={batchNames.data}
						value={values.from_batch}
						onChange={(val) => {
							(setValue as any)("from_batch", val);
						}}
						label="From Batch"
						name="from_batch"
						error={Boolean(errors.from_batch)}
						helperText={errors.from_batch?.message}
					/>

					{returnType === "batch" && (
						<SelectList
							options={batchNames.data}
							value={values.to_batch}
							onChange={(val) => {
								(setValue as any)("to_batch", val);
							}}
							label="To Batch"
							name="to_batch"
							error={Boolean(errors.to_batch)}
							helperText={errors.to_batch?.message}
						/>
					)}

					{returnType === "vendor" && (
						<SelectList
							options={itemVendorName.data}
							value={values.to_vendor}
							onChange={(val) => {
								(setValue as any)("to_vendor", val);
							}}
							label="To Vendor"
							name="to_vendor"
							error={Boolean(errors.to_vendor)}
							helperText={errors.to_vendor?.message}
						/>
					)}

					<TextField
						label="Quantity"
						{...(register as any)("quantity")}
						type="number"
						fullWidth
						error={Boolean(errors.quantity)}
						helperText={errors.quantity?.message}
						size="small"
					/>

					<TextField
						label="Rate Per Bag"
						{...(register as any)("rate_per_bag")}
						type="number"
						fullWidth
						error={Boolean(errors.rate_per_bag)}
						helperText={errors.rate_per_bag?.message}
						size="small"
					/>

					<TextField
						label="Total Amount"
						{...(register as any)("total_amount")}
						type="number"
						fullWidth
						disabled
						error={Boolean(errors.total_amount)}
						helperText={errors.total_amount?.message}
						size="small"
					/>

					{/*<TextField
            label="Status"
            {...(register as any)("status")}
            select
            value={values.status}
            fullWidth
            error={Boolean(errors.status)}
            helperText={errors.status?.message}
            size="small"
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
	  */}
				</div>
				<div className="flex justify-end mt-6">
					<Button variant="contained" type="submit">
						Submit
					</Button>
				</div>
			</form>
		</>
	);
};

export default ItemReturnForm;
