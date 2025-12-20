import { Providers } from "../providers";
import { TitleBar } from "../components/title-bar";
import { Outlet } from "react-router-dom";
import { FooterBar } from "../components/footer-bar";

export function RootLayout() {
    return (
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark", enableSystem: true }}>
            <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
                <TitleBar />
                <div className="flex flex-1 overflow-hidden relative">
                    <Outlet />
                </div>
                <FooterBar />
            </div>
        </Providers>
    );
}
