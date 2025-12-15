
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { I18nProvider } from "@react-aria/i18n";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

function ThemedToastContainer() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Usa resolvedTheme se disponível, caso contrário usa theme
  const currentTheme = mounted ? (resolvedTheme || theme) : "dark";
  const toastTheme = currentTheme === "dark" ? "dark" : "light";

  return (
    <ToastContainer
      theme={toastTheme}
      position="bottom-right"
      draggable
      limit={5}
      draggablePercent={60}
      className={"select-none"}
      autoClose={1500}
    />
  );
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const navigate = useNavigate();

  return (
    <I18nProvider locale="pt-BR">
      <HeroUIProvider navigate={navigate}>
        <NextThemesProvider {...themeProps}>
          <ThemedToastContainer />
          <ToastProvider toastOffset={20} placement="top-center" toastProps={{ color: "success", }} />
          {children}
        </NextThemesProvider>
      </HeroUIProvider>
    </I18nProvider>
  );
}
