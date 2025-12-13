
import { Avatar, Button, Card, CardBody, CardHeader, Divider, Input } from "@heroui/react";
import { Magnifer } from "@solar-icons/react";

export function CustomersPage() {
    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Clientes</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Gerencie sua base de clientes
                    </p>
                </div>
                <Input
                    placeholder="Buscar cliente..."
                    startContent={<Magnifer size={18} weight="Outline" />}
                    className="max-w-xs"
                />
            </div>

            <Divider />

            <div className="flex flex-col grow h-0 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                        <Card key={item}>
                            <CardHeader>
                                <div className="flex items-center gap-4 w-full">
                                    <Avatar
                                        size="lg"
                                        name={`Cliente ${item}`}
                                        className="bg-primary text-primary-foreground"
                                    />
                                    <div className="flex flex-col flex-1">
                                        <h3 className="text-lg font-semibold">Cliente {item}</h3>
                                        <p className="text-sm text-default-500">cliente{item}@email.com</p>
                                        <p className="text-sm text-default-400">(11) 98765-432{item}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-medium">15 pedidos</span>
                                        <span className="text-xs text-default-500">Cliente desde Jan/2024</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="flat" className="flex-1">
                                        Ver Detalhes
                                    </Button>
                                    <Button size="sm" variant="bordered" className="flex-1">
                                        Histórico
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
