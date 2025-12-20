import { Outlet } from "react-router-dom";
import { CompaniesSideMenu } from "../components/companies-side-menu";

export function CompaniesLayout() {
    return (
        <div className="flex flex-1 w-full h-full overflow-hidden">
            <CompaniesSideMenu />
            <div className="flex flex-1 flex-col overflow-hidden relative bg-background">
                <Outlet />
            </div>
        </div>
    );
}
