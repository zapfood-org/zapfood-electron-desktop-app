import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: "http://localhost:8080/api/v1/auth",
    plugins: [
        organizationClient()
    ]
});
