import logoImg from "@/assets/logo.png";

const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: { img: 32, text: "text-lg" },
    md: { img: 36, text: "text-xl" },
    lg: { img: 48, text: "text-3xl" },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <img
        src={logoImg}
        alt="Cliento logo"
        width={s.img}
        height={s.img}
        className="object-contain"
      />
      <span className={`${s.text} font-bold tracking-tight text-foreground`}>
        Cliento
      </span>
    </div>
  );
};

export default Logo;
