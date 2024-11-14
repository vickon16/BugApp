import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Input, InputProps } from "./ui/input";

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pe-10", className)}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          title={showPassword ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 transform"
        >
          {showPassword ? (
            <EyeOff className="size-5 text-muted-foreground" />
          ) : (
            <Eye className="size-5 text-background" />
          )}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
