import { useState } from "react";
import defaultProfile from "../../assets/icons/default-profile.png";

type AvatarProps = {
  name?: string | null;
  src?: string | null;
  alt?: string;
  className?: string;
};

export function Avatar({ name, src, alt, className = "" }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const imageSrc = !failed ? src || defaultProfile : defaultProfile;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full bg-[#E4E6EB] font-bold text-[#606770] ${className}`}
    >
      <img
        src={imageSrc}
        alt={alt ?? name ?? "Avatar"}
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
