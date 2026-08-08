import { useState } from "react";
import PageTitle from "@components/PageTitle";
import LoadingMessage from "@components/LoadingMessage";
import toast from "react-hot-toast";
import ProfileForm from "./components/form";
import ChangePasswordForm from "./components/change-password-form";
import useGetProfile from "./hooks/use-get-profile";
import useUpdateProfile from "./hooks/use-update-profile";
import useChangePassword from "./hooks/use-change-password";
import { updateSessionProfile } from "@utils/session";
import { useAuthDispatch } from "@store/authentication/context";

const defaultPasswordValues = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

const ProfilePage = () => {
  const dispatch = useAuthDispatch();
  const { dataLoaded, profileData } = useGetProfile();
  const [passwordResetKey, setPasswordResetKey] = useState(0);

  const { onSubmit, errors, clearError } = useUpdateProfile({
    onSuccess: (inputData) => {
      clearError();
      toast.success("Profile updated successfully");
      updateSessionProfile({
        name: inputData.name,
        email: inputData.email,
        phone: inputData.phone,
      });
      dispatch({
        type: "UPDATE_PROFILE",
        payload: {
          name: inputData.name,
          email: inputData.email,
          phone: inputData.phone,
        },
      });
    },
  });

  const changePassword = useChangePassword({
    onSuccess: () => {
      toast.success("Password updated successfully");
      setPasswordResetKey((key) => key + 1);
    },
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Profile" />
      </div>

      {dataLoaded ? (
        <div className="max-w-lg space-y-6">
          <div className="rounded-lg border border-brand-border bg-brand-card p-6">
            <h2 className="mb-4 text-base font-semibold text-brand-ink">
              Profile Information
            </h2>
            <ProfileForm
              onSubmit={onSubmit}
              defaultValues={profileData}
              apiError={errors}
            />
          </div>

          <div className="rounded-lg border border-brand-border bg-brand-card p-6">
            <h2 className="mb-4 text-base font-semibold text-brand-ink">
              Change Password
            </h2>
            <ChangePasswordForm
              key={passwordResetKey}
              onSubmit={changePassword.onSubmit}
              defaultValues={defaultPasswordValues}
              apiError={changePassword.errors}
              errorMessage={changePassword.errorMessage}
            />
          </div>
        </div>
      ) : (
        <LoadingMessage />
      )}
    </>
  );
};

export default ProfilePage;
