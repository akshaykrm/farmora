import { Dialog, DialogContent } from "@components/dialog";
import RoleForm from "./role-form";
import type { RoleFormValues } from "../types";
import { rolesApi } from "@api/roles.api";
import { useEffect, useState } from "react";
import type { ValidationError } from "@errors/api.error";

type Props = {
  selectedId: number | null;
  onClose: () => void;
  refetch: () => void;
};

const EditRole = ({ selectedId, onClose, refetch }: Props) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [values, setValues] = useState<RoleFormValues>({
    name: "",
    description: "",
    permission_ids: [],
  });
  const isShow = selectedId !== null;

  useEffect(() => {
    const load = async () => {
      if (!selectedId) return;
      const res = await rolesApi.fetchById(selectedId);
      if (res.status === "success" && res.data) {
        setValues({
          name: res.data.name,
          description: res.data.description || "",
          permission_ids: (res.data.permissions || []).map((item) => item.id),
        });
      }
    };
    load();
  }, [selectedId]);

  const handleClose = () => {
    setErrors([]);
    onClose();
  };

  const onSubmit = async (payload: RoleFormValues) => {
    if (!selectedId) return;
    const res = await rolesApi.updateById(selectedId, payload);
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
      headerTitle="Edit Role"
      onClose={handleClose}
      className="max-w-2xl"
    >
      <DialogContent>
        <RoleForm
          defaultValues={values}
          onSubmit={onSubmit}
          apiErrors={errors}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditRole;
