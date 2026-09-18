import { useEffect, useState } from "react";
import type { EmployeeFormValues } from "../types";
import employee from "../api";

const useGetEmployeeById = (selectedId: number | null) => {
  const [dataLoaded, setdataLoaded] = useState(false);
  const [selectedData, setSelectedData] = useState<EmployeeFormValues>({
    name: "",
    username: "",
    role_ids: [],
    permission_ids: [],
  });

  useEffect(() => {
    const handleGetEmployeeById = async (id: number) => {
      const res = await employee.fetchById(id);
      if (res.status === "success") {
        if (res.data) {
          const { name, username, role_ids, permission_ids } = res.data;
          setSelectedData({
            name,
            username,
            role_ids: role_ids || [],
            permission_ids: permission_ids || [],
          });
          setdataLoaded(true);
        }
      }
    };

    if (selectedId) {
      handleGetEmployeeById(selectedId);
    }
  }, [selectedId]);

  return { dataLoaded, selectedData };
};

export default useGetEmployeeById;
