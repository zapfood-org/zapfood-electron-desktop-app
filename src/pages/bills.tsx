import { ScrollArea } from "@/components/ui/scroll-area";
import { authClient } from "@/lib/auth-client";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import { AddCircle, Magnifer, Ticket } from "@solar-icons/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import type { Bill } from "../types/bills";

export function BillsPage() {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const restaurantId = activeOrg?.id;

  // State
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter bills by displayId
  const filteredBills = bills.filter((bill) =>
    String(bill.displayId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create Modal State
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [billName, setBillName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Bills
  const fetchBills = async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/bills`, {
        params: {
          restaurantId: restaurantId,
          page: 1,
          size: 100, // Fetch all for now
        },
      });
      setBills(response.data.bills || []);
    } catch (error) {
      console.error("Erro ao buscar comandas:", error);
      toast.error("Erro ao carregar comandas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchBills();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const handleOpenCreate = () => {
    setBillName("");
    onOpen();
  };

  const handleSaveBill = async () => {
    if (!billName.trim()) {
      toast.warning("Por favor, informe o nome/número da comanda");
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.post(`/bills`, {
        name: billName,
        restaurantId: restaurantId,
      });

      setBills([...bills, response.data]);
      toast.success("Comanda criada com sucesso!");
      onClose();
      setBillName("");
    } catch (error) {
      console.error("Erro ao salvar comanda:", error);
      toast.error("Erro ao salvar comanda");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-default-50">
      <div className="flex flex-col bg-background">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <div>
            <h1 className="text-3xl font-bold">Comandas</h1>
          </div>
          <Button
            color="primary"
            startContent={<AddCircle size={20} />}
            onPress={handleOpenCreate}
          >
            Nova Comanda
          </Button>
        </div>

        <Divider />

        {/* Search */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3">
          <Input
            placeholder="Buscar comandas..."
            startContent={<Magnifer size={20} className="text-default-400" />}
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="col-span-12 md:col-span-6 lg:col-span-3"
          />
        </div>
      </div>

      <Divider />

      {/* Content */}
      <div className="flex flex-col flex-1 gap-6 overflow-hidden">
        {/* List */}
        <ScrollArea className="flex flex-col flex-grow h-0 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-default-400">
              <p className="text-lg">Nenhuma comanda encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6">
              {filteredBills.map((bill) => (
                <Card
                  key={bill.id}
                  className="border border-default-200 hover:border-primary-300 transition-colors"
                >
                  <CardBody className="flex flex-col items-center justify-center p-6 gap-2">
                    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-2">
                      <Ticket size={32} weight="Bold" />
                    </div>
                    <h3 className="text-xl font-bold text-center">
                      {bill.displayId}
                    </h3>
                    <div className="flex flex-col gap-1">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={bill.active ? "success" : "default"}
                      >
                        {bill.active ? "Ativa" : "Inativa"}
                      </Chip>
                      {!bill.available && (
                        <Chip size="sm" variant="flat" color="warning">
                          Ocupada
                        </Chip>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Nova Comanda</ModalHeader>
              <ModalBody>
                <Input
                  label="Nome/Número da Comanda"
                  placeholder="Ex: 101"
                  value={billName}
                  onValueChange={setBillName}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveBill();
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  isLoading={isSaving}
                  onPress={handleSaveBill}
                >
                  Criar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
