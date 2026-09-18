import { Dialog, DialogContent } from "@components/dialog";
import RoleForm from "./role-form";
import type { RoleFormValues } from "../types";
import { rolesApi } from "@api/roles.api";
import { useState } from "react";
import type { ValidationError } from "@errors/api.error";

const defaultValues: RoleFormValues = {
  name: "",
  description: "",
  permission_ids: [],
};

type Props = {
  isShow: boolean;
  onClose: () => void;
  refetch: () => void;
};

const AddRole = ({ isShow, onClose, refetch }: Props) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const handleClose = () => {
    setErrors([]);
    onClose();
  };

  const onSubmit = async (payload: RoleFormValues) => {
    const res = await rolesApi.create(payload);
    if (res.status === "success") {
      handleClose();
      refetch();
    } else if (res.status === "validation_error") {
      setErrors(res.error);
    }
  };

  return (
    <Dialog
      isOpen={isShow}
      headerTitle="Add Role"
      onClose={handleClose}
      className="max-w-2xl"
    >
      <DialogContent>
        <RoleForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          apiErrors={errors}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddRole;
