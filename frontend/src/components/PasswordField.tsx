import { forwardRef, useId, useState } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import { Eye, EyeOff } from "lucide-react";

type Props = Omit<TextFieldProps, "type">;

const PasswordField = forwardRef<HTMLDivElement, Props>(function PasswordField(
  { label, id, slotProps, disabled, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id || generatedId;
  const name = typeof label === "string" ? label.toLowerCase() : "password";
  return (
    <TextField
      {...props}
      ref={ref}
      id={inputId}
      label={label}
      disabled={disabled}
      type={visible ? "text" : "password"}
      slotProps={{
        ...slotProps,
        input: (ownerState) => {
          const original =
            typeof slotProps?.input === "function"
              ? slotProps.input(ownerState)
              : slotProps?.input;
          return {
            ...original,
            endAdornment: (
              <>
                {original?.endAdornment}
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    edge="end"
                    disabled={disabled}
                    aria-label={`${visible ? "Hide" : "Show"} ${name}`}
                    aria-pressed={visible}
                    aria-controls={inputId}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setVisible((value) => !value)}
                  >
                    {visible ? (
                      <EyeOff size={18} aria-hidden="true" />
                    ) : (
                      <Eye size={18} aria-hidden="true" />
                    )}
                  </IconButton>
                </InputAdornment>
              </>
            ),
          };
        },
      }}
    />
  );
});

export default PasswordField;
