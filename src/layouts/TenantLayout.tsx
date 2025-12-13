import { Outlet } from "react-router-dom";
import { SideMenu } from "../components/side-menu";

export function TenantLayout() {
    return (
        <div className="flex flex-1 w-full h-full overflow-hidden">
            <SideMenu />
            <div className="flex flex-1 flex-col overflow-hidden relative bg-background">
                <Outlet />
            </div>
        </div>
    );
}
