import { Dialog, DialogContent } from "@components/dialog";
import RoleForm from "./role-form";
import type { RoleFormValues } from "../types";
import { rolesApi, type RoleKind } from "@api/roles.api";
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
  kind?: RoleKind;
};

const AddRole = ({ isShow, onClose, refetch, kind = "custom" }: Props) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const handleClose = () => {
    setErrors([]);
    onClose();
  };

  const onSubmit = async (payload: RoleFormValues) => {
    const res = await rolesApi.create({ ...payload, kind });
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
      headerTitle={kind === "system" ? "Add System Role" : "Add Role"}
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
