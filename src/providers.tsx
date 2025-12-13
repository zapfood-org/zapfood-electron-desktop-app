
import type { ThemeProviderProps } from "next-themes";
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { I18nProvider } from "@react-aria/i18n";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useNavigate } from "react-router-dom";
import * as React from "react";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const navigate = useNavigate();

  return (
    <I18nProvider locale="pt-BR">
      <HeroUIProvider navigate={navigate}>
        <NextThemesProvider {...themeProps}>
          <ToastProvider toastOffset={20} placement="top-center" />
          {children}
        </NextThemesProvider>
      </HeroUIProvider>
    </I18nProvider>
  );
}
