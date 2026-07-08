type AppLogoProps = {
  readonly className?: string;
  readonly size?: number;
};

export function AppLogo({ className = "app-logo", size = 38 }: AppLogoProps): JSX.Element {
  return (
    <img
      className={className}
      src="/app-logo.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      decoding="async"
      draggable={false}
    />
  );
}
