import { useEffect, useState } from "react";
import profile from "../api";
import type { ProfileFormValues } from "../types";

const defaultProfile: ProfileFormValues = {
  name: "",
  username: "",
  email: "",
  phone: "",
};

const useGetProfile = () => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [profileData, setProfileData] =
    useState<ProfileFormValues>(defaultProfile);

  useEffect(() => {
    const handleFetchProfile = async () => {
      const res = await profile.fetchCurrent();
      if (res.status === "success" && res.data) {
        const { name, username, email, phone } = res.data;
        setProfileData({
          name,
          username,
          email: email || "",
          phone: phone || "",
        });
        setDataLoaded(true);
      }
    };

    handleFetchProfile();
  }, []);

  return { dataLoaded, profileData };
};

export default useGetProfile;
