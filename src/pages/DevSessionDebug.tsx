import { authClient } from "@/lib/auth-client";
import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { useEffect, useState } from "react";
import { TitleBar } from "../components/title-bar";

export function DevSessionDebug() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchSession = async () => {
        setLoading(true);
        setError("");
        try {
            const { data, error } = await authClient.getSession();
            if (error) {
                setError(error.message || "Failed to fetch session");
                setSession(null);
            } else {
                setSession(data);
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSession();
    }, []);

    return (
        <div className="flex flex-col h-screen w-full bg-background text-foreground">
            <TitleBar />
            <div className="p-8 overflow-auto">
                <h1 className="text-2xl font-bold mb-6">Dev Tools: Session Debug</h1>

                <div className="flex gap-4 mb-6">
                    <Button color="primary" onPress={fetchSession} isLoading={loading}>
                        Refresh Session
                    </Button>
                    <Button color="danger" variant="flat" onPress={async () => {
                        await authClient.signOut();
                        fetchSession();
                    }}>
                        Sign Out
                    </Button>
                </div>

                {error && (
                    <Card className="mb-6 border-danger" shadow="sm">
                        <CardBody className="text-danger">
                            Error: {error}
                        </CardBody>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card shadow="sm">
                        <CardHeader className="font-bold">Session State</CardHeader>
                        <Divider />
                        <CardBody>
                            <pre className="text-xs bg-slate-950 text-green-400 p-4 rounded-lg overflow-auto max-h-[400px]">
                                {session ? JSON.stringify(session, null, 2) : "No Active Session"}
                            </pre>
                        </CardBody>
                    </Card>

                    <Card shadow="sm">
                        <CardHeader className="font-bold">Raw Cookie Check</CardHeader>
                        <Divider />
                        <CardBody>
                            <p className="text-sm mb-2">Current document.cookie:</p>
                            <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-4 rounded-lg break-all">
                                {document.cookie || "No cookies found"}
                            </pre>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
