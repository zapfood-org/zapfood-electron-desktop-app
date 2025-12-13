import { Providers } from "../providers";
import { TitleBar } from "../components/title-bar";
import { Outlet } from "react-router-dom";

export function RootLayout() {
    return (
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
            <div className="flex flex-1 flex-col h-screen overflow-hidden bg-background text-foreground">
                <TitleBar />
                <div className="flex flex-1 overflow-hidden relative">
                    <Outlet />
                </div>
            </div>
        </Providers>
    );
}
