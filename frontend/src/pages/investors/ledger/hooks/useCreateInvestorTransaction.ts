import { useState } from "react";
import type { ValidationError } from "@errors/api.error";
import type { InvestorTransactionFormValues } from "../types";
import investorLedgerApi from "../api";
import toast from "react-hot-toast";

type UseCreateInvestorTransactionOpts = {
  onSuccess: () => void;
};

const useCreateInvestorTransaction = (
  opts: UseCreateInvestorTransactionOpts,
) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const clearError = () => {
    setErrors([]);
  };

  const onSubmit = async (inputData: InvestorTransactionFormValues) => {
    const res = await investorLedgerApi.createTransaction(inputData);
    console.log(res);
    if (res.status === "success") {
      opts.onSuccess();
    } else if (res.status === "validation_error") {
      setErrors(res.error);
    } else if (res.status === "failed") {
      toast.error(res.data as string);
    }
  };

  return {
    onSubmit,
    errors,
    clearError,
  };
};

export default useCreateInvestorTransaction;
