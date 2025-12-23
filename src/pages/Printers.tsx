import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
  useDisclosure,
} from "@heroui/react";
import {
  AddCircle,
  CheckCircle,
  Document,
  Magnifer,
  Printer,
  Settings,
  TrashBinTrash,
} from "@solar-icons/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { ScrollArea } from "../components/ui/scroll-area";

interface Printer {
  id: string;
  name: string;
  type: "thermal" | "network" | "usb";
  connection: string;
  isActive: boolean;
  paperSize: "58mm" | "80mm";
  copies: number;
  printLogo: boolean;
  printFooter: boolean;
}

const initialPrinters: Printer[] = [
  {
    id: "1",
    name: "Impressora Térmica Principal",
    type: "thermal",
    connection: "USB - COM3",
    isActive: true,
    paperSize: "80mm",
    copies: 1,
    printLogo: true,
    printFooter: true,
  },
  {
    id: "2",
    name: "Impressora de Rede - Cozinha",
    type: "network",
    connection: "192.168.1.100:9100",
    isActive: true,
    paperSize: "58mm",
    copies: 1,
    printLogo: false,
    printFooter: true,
  },
  {
    id: "3",
    name: "Impressora USB - Balcão",
    type: "usb",
    connection: "USB - COM5",
    isActive: false,
    paperSize: "80mm",
    copies: 2,
    printLogo: true,
    printFooter: false,
  },
];

export function PrintersPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [printers, setPrinters] = useState<Printer[]>(initialPrinters);
  const [editingPrinterId, setEditingPrinterId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState<Omit<Printer, "id">>({
    name: "",
    type: "thermal",
    connection: "",
    isActive: true,
    paperSize: "80mm",
    copies: 1,
    printLogo: true,
    printFooter: true,
  });

  const filteredPrinters = printers.filter(
    (printer) =>
      printer.name.toLowerCase().includes(search.toLowerCase()) ||
      printer.connection.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (printerId?: string) => {
    if (printerId) {
      const printer = printers.find((p) => p.id === printerId);
      if (printer) {
        setEditingPrinterId(printerId);
        const { ...rest } = printer;
        setFormData(rest);
      }
    } else {
      setEditingPrinterId(null);
      setFormData({
        name: "",
        type: "thermal",
        connection: "",
        isActive: true,
        paperSize: "80mm",
        copies: 1,
        printLogo: true,
        printFooter: true,
      });
    }
    onOpen();
  };

  const handleSave = (onClose: () => void) => {
    if (!formData.name.trim() || !formData.connection.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (editingPrinterId) {
      setPrinters((prev) =>
        prev.map((p) =>
          p.id === editingPrinterId ? { ...formData, id: editingPrinterId } : p
        )
      );
      toast.success("A impressora foi atualizada com sucesso!");
    } else {
      const newPrinter: Printer = {
        ...formData,
        id: Date.now().toString(),
      };
      setPrinters((prev) => [...prev, newPrinter]);
      toast.success("A impressora foi adicionada com sucesso!");
    }
    onClose();
  };

  const handleDelete = (id: string) => {
    setPrinters((prev) => prev.filter((p) => p.id !== id));
    toast.success("A impressora foi removida com sucesso!");
  };

  const handleToggleActive = (id: string) => {
    setPrinters((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
    toast.info("O status da impressora foi alterado");
  };

  const handleTestPrint = () => {
    toast.info("Enviando comando de teste para a impressora...");

    // Simulação de teste
    setTimeout(() => {
      toast.success("O teste de impressão foi enviado com sucesso!");
    }, 1500);
  };

  const getTypeLabel = (type: Printer["type"]) => {
    switch (type) {
      case "thermal":
        return "Térmica";
      case "network":
        return "Rede";
      case "usb":
        return "USB";
      default:
        return type;
    }
  };

  const getTypeColor = (type: Printer["type"]) => {
    switch (type) {
      case "thermal":
        return "primary";
      case "network":
        return "success";
      case "usb":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto">
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col gap-6 py-6">
        <div className="flex flex-col flex-1 gap-6">
          {/* Busca */}
          <div className="flex items-center gap-4">
            <Input
              placeholder="Buscar impressoras..."
              value={search}
              onValueChange={setSearch}
              startContent={
                <Magnifer
                  size={18}
                  weight="Outline"
                  className="text-default-400"
                />
              }
              className="max-w-xs"
            />
            <Chip variant="flat" color="default">
              {filteredPrinters.length} impressora
              {filteredPrinters.length !== 1 ? "s" : ""}
            </Chip>
            <div className="flex ml-auto">
              <Button
                color="primary"
                startContent={<AddCircle size={20} weight="Outline" />}
                onPress={() => handleOpenModal()}
              >
                Adicionar Impressora
              </Button>
            </div>
          </div>

          <Divider />

          {/* Lista de Impressoras */}
          <ScrollArea className="flex flex-col grow h-0 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {filteredPrinters.length > 0 ? (
                filteredPrinters.map((printer) => (
                  <Card key={printer.id} className="w-full">
                    <CardHeader className="flex items-start justify-between pb-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                          <Printer
                            size={24}
                            weight="Outline"
                            className="text-primary"
                          />
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold truncate">
                              {printer.name}
                            </h3>
                            <Chip
                              size="sm"
                              color={printer.isActive ? "success" : "default"}
                              variant="flat"
                            >
                              {printer.isActive ? "Ativa" : "Inativa"}
                            </Chip>
                          </div>
                          <Chip
                            size="sm"
                            color={getTypeColor(printer.type)}
                            variant="flat"
                          >
                            {getTypeLabel(printer.type)}
                          </Chip>
                          <p className="text-sm text-default-500 truncate">
                            {printer.connection}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-default-500">Papel:</span>
                          <span className="font-medium">
                            {printer.paperSize}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-default-500">Cópias:</span>
                          <span className="font-medium">{printer.copies}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-default-500">Logo:</span>
                          <Chip
                            size="sm"
                            color={printer.printLogo ? "success" : "default"}
                            variant="flat"
                          >
                            {printer.printLogo ? "Sim" : "Não"}
                          </Chip>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-default-500">Rodapé:</span>
                          <Chip
                            size="sm"
                            color={printer.printFooter ? "success" : "default"}
                            variant="flat"
                          >
                            {printer.printFooter ? "Sim" : "Não"}
                          </Chip>
                        </div>

                        <Divider />

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={
                              <Document size={16} weight="Outline" />
                            }
                            className="flex-1"
                            onPress={() => handleTestPrint()}
                          >
                            Testar
                          </Button>
                          <Button
                            size="sm"
                            variant="flat"
                            color="default"
                            startContent={
                              <Settings size={16} weight="Outline" />
                            }
                            isIconOnly
                            onPress={() => handleOpenModal(printer.id)}
                          >
                            <Settings size={16} weight="Outline" />
                          </Button>
                          <Button
                            size="sm"
                            variant="flat"
                            color="danger"
                            isIconOnly
                            onPress={() => handleDelete(printer.id)}
                          >
                            <TrashBinTrash size={16} weight="Outline" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant={printer.isActive ? "bordered" : "solid"}
                          color={printer.isActive ? "default" : "success"}
                          className="w-full"
                          onPress={() => handleToggleActive(printer.id)}
                        >
                          {printer.isActive ? "Desativar" : "Ativar"}
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center">
                  <Printer
                    size={64}
                    weight="Outline"
                    className="text-default-300 mb-4"
                  />
                  <p className="text-sm text-default-400">
                    {search
                      ? "Nenhuma impressora encontrada"
                      : "Nenhuma impressora cadastrada"}
                  </p>
                  <p className="text-xs text-default-300 mt-1">
                    {search
                      ? "Tente buscar com outros termos"
                      : "Adicione uma impressora para começar"}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Modal de Adicionar/Editar */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-2">
                  <Printer
                    size={24}
                    weight="Outline"
                    className="text-primary"
                  />
                  <span>
                    {editingPrinterId
                      ? "Editar Impressora"
                      : "Adicionar Impressora"}
                  </span>
                </div>
              </ModalHeader>
              <Divider />
              <ModalBody className="flex flex-col gap-4 py-6">
                <Input
                  label="Nome da Impressora"
                  placeholder="Ex: Impressora Principal"
                  value={formData.name}
                  onValueChange={(value) =>
                    setFormData({ ...formData, name: value })
                  }
                  isRequired
                />

                <Select
                  label="Tipo de Impressora"
                  selectedKeys={[formData.type]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as Printer["type"];
                    setFormData({ ...formData, type: selected });
                  }}
                  isRequired
                >
                  <SelectItem key="thermal">Térmica</SelectItem>
                  <SelectItem key="network">Rede</SelectItem>
                  <SelectItem key="usb">USB</SelectItem>
                </Select>

                <Input
                  label="Conexão"
                  placeholder={
                    formData.type === "network"
                      ? "Ex: 192.168.1.100:9100"
                      : formData.type === "usb"
                      ? "Ex: USB - COM3"
                      : "Ex: COM3 ou IP:Porta"
                  }
                  value={formData.connection}
                  onValueChange={(value) =>
                    setFormData({ ...formData, connection: value })
                  }
                  description={
                    formData.type === "network"
                      ? "Endereço IP e porta da impressora"
                      : formData.type === "usb"
                      ? "Porta USB (COM) da impressora"
                      : "Porta ou endereço de conexão"
                  }
                  isRequired
                />

                <Select
                  label="Tamanho do Papel"
                  selectedKeys={[formData.paperSize]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(
                      keys
                    )[0] as Printer["paperSize"];
                    setFormData({ ...formData, paperSize: selected });
                  }}
                >
                  <SelectItem key="58mm">58mm</SelectItem>
                  <SelectItem key="80mm">80mm</SelectItem>
                </Select>

                <Input
                  label="Número de Cópias"
                  type="number"
                  value={formData.copies.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, copies: parseInt(value) || 1 })
                  }
                  min={1}
                  max={10}
                />

                <div className="flex items-center justify-between p-4 rounded-lg bg-default-100">
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">Imprimir Logo</span>
                    <span className="text-sm text-default-500">
                      Incluir logo na nota fiscal
                    </span>
                  </div>
                  <Switch
                    isSelected={formData.printLogo}
                    onValueChange={(value) =>
                      setFormData({ ...formData, printLogo: value })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-default-100">
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">Imprimir Rodapé</span>
                    <span className="text-sm text-default-500">
                      Incluir rodapé na nota fiscal
                    </span>
                  </div>
                  <Switch
                    isSelected={formData.printFooter}
                    onValueChange={(value) =>
                      setFormData({ ...formData, printFooter: value })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-default-100">
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">Ativa</span>
                    <span className="text-sm text-default-500">
                      Impressora está ativa e funcionando
                    </span>
                  </div>
                  <Switch
                    isSelected={formData.isActive}
                    onValueChange={(value) =>
                      setFormData({ ...formData, isActive: value })
                    }
                  />
                </div>
              </ModalBody>
              <Divider />
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  startContent={<CheckCircle size={18} weight="Outline" />}
                  onPress={() => handleSave(onClose)}
                >
                  {editingPrinterId ? "Atualizar" : "Adicionar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
