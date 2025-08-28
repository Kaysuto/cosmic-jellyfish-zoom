import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/95 group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:backdrop-blur-sm group-[.toaster]:border-2",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:font-medium",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-semibold group-[.toast]:shadow-md",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-semibold",
          success: "group-[.toast]:bg-green-600/95 group-[.toast]:text-white group-[.toast]:border-green-500 group-[.toast]:shadow-green-500/25",
          error: "group-[.toast]:bg-red-600/95 group-[.toast]:text-white group-[.toast]:border-red-500 group-[.toast]:shadow-red-500/25",
          warning: "group-[.toast]:bg-yellow-600/95 group-[.toast]:text-white group-[.toast]:border-yellow-500 group-[.toast]:shadow-yellow-500/25",
          info: "group-[.toast]:bg-blue-600/95 group-[.toast]:text-white group-[.toast]:border-blue-500 group-[.toast]:shadow-blue-500/25",
        },
      }}
      position="bottom-right"
      richColors
      duration={4000}
      expand={true}
      {...props}
    />
  );
};

export { Toaster };
