import {useState} from "react";
import {initialsOf} from "@/lib/auth/format.ts";
import {cn} from "@/lib/utils.ts";

export type AvatarProps = {
  name: string | null | undefined;
  email: string;
  picture: string | null | undefined;
  size?: number;
  className?: string;
};

/** Profile picture when the account has one, initials when it does not. */
export const Avatar = ({name, email, picture, size = 40, className}: AvatarProps) => {
  const [failed, setFailed] = useState(false);

  if (picture && !failed) {
    return (
      <img
        src={picture}
        alt=""
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{width: size, height: size}}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-accent-800/60 font-medium text-accent-200",
        className,
      )}
      style={{width: size, height: size, fontSize: Math.max(10, size * 0.36)}}
    >
      {initialsOf(name, email)}
    </span>
  );
};
