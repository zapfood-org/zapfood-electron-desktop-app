import { ScrollArea } from "@/components/ui/scroll-area";
import { authClient } from "@/lib/auth-client";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Divider,
  Input,
  Spinner,
  Tab,
  Tabs,
} from "@heroui/react";
import { BillList, Magnifer, Ticket } from "@solar-icons/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../services/api";
import type { Bill } from "../types/bills";
import type { Table } from "../types/tables";

export function TablesBillsPage() {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const restaurantId = activeOrg?.id;
  const navigate = useNavigate();
  const { tenantId } = useParams();

  // State
  const [activeTab, setActiveTab] = useState("tables");
  const [tables, setTables] = useState<Table[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isLoadingBills, setIsLoadingBills] = useState(false);
  const [searchQueryTables, setSearchQueryTables] = useState("");
  const [searchQueryBills, setSearchQueryBills] = useState("");

  // Fetch Tables
  const fetchTables = async () => {
    if (!restaurantId) return;
    setIsLoadingTables(true);
    try {
      const response = await api.get(`/tables`, {
        params: {
          restaurantId: restaurantId,
          page: 1,
          size: 100,
        },
      });
      setTables(response.data.tables || []);
    } catch (error) {
      console.error("Erro ao buscar mesas:", error);
      toast.error("Erro ao carregar mesas");
    } finally {
      setIsLoadingTables(false);
    }
  };

  // Fetch Bills
  const fetchBills = async () => {
    if (!restaurantId) return;
    setIsLoadingBills(true);
    try {
      const response = await api.get(`/bills`, {
        params: {
          restaurantId: restaurantId,
          page: 1,
          size: 100,
        },
      });
      setBills(response.data.bills || []);
    } catch (error) {
      console.error("Erro ao buscar comandas:", error);
      toast.error("Erro ao carregar comandas");
    } finally {
      setIsLoadingBills(false);
    }
  };

  useEffect(() => {
    if (!restaurantId) return;
    if (activeTab === "tables") {
      fetchTables();
    } else {
      fetchBills();
    }
  }, [activeTab, restaurantId]);

  const handleViewBills = (table: Table) => {
    navigate(`/${tenantId}/tables/${table.id}`);
  };

  // Filters
  const filteredTables = tables.filter((table) =>
    table.name.toLowerCase().includes(searchQueryTables.toLowerCase())
  );

  const filteredBills = bills.filter((bill) =>
    String(bill.displayId)
      .toLowerCase()
      .includes(searchQueryBills.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 bg-default-50">
      <div className="flex flex-col bg-background">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <div>
            <h1 className="text-3xl font-bold">Mesas e Comandas</h1>
          </div>
        </div>

        <Divider />

        <div className="flex gap-4 px-6 py-3">
          {/* Search */}
          <div>
            {activeTab === "tables" ? (
              <Input
                placeholder="Buscar mesas..."
                startContent={
                  <Magnifer size={20} className="text-default-400" />
                }
                value={searchQueryTables}
                onValueChange={setSearchQueryTables}
                className="col-span-12 md:col-span-6 lg:col-span-3"
              />
            ) : (
              <Input
                placeholder="Buscar comandas..."
                startContent={
                  <Magnifer size={20} className="text-default-400" />
                }
                value={searchQueryBills}
                onValueChange={setSearchQueryBills}
                className="col-span-12 md:col-span-6 lg:col-span-3"
              />
            )}
          </div>
          {/* Tabs */}
          <div>
            <Tabs
              aria-label="Mesas e Comandas"
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              color="primary"
            >
              <Tab key="tables" title="Mesas" />
              <Tab key="bills" title="Comandas" />
            </Tabs>
          </div>
        </div>
      </div>

      <Divider />

      {/* Content */}
      <div className="flex flex-col flex-1 gap-6 overflow-hidden">
        <ScrollArea className="flex flex-col flex-grow h-0 overflow-y-auto">
          {activeTab === "tables" ? (
            isLoadingTables ? (
              <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
              </div>
            ) : filteredTables.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-default-400">
                <p className="text-lg">Nenhuma mesa encontrada</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6">
                {filteredTables.map((table) => (
                  <Card
                    key={table.id}
                    className="border border-default-200 hover:border-primary-300 transition-colors cursor-pointer"
                  >
                    <CardBody className="flex flex-col items-center justify-center p-6 gap-2">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                        <span className="text-2xl font-bold">
                          {table.name.replace(/\D/g, "") || "#"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-center">
                        {table.name}
                      </h3>
                      <Chip size="sm" variant="flat" color="success">
                        Disponível
                      </Chip>
                    </CardBody>
                    <Divider />
                    <CardFooter className="justify-end gap-2 p-2 bg-default-50">
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        startContent={<BillList size={18} />}
                        onPress={() => handleViewBills(table)}
                      >
                        Ver Comandas
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )
          ) : isLoadingBills ? (
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
    </div>
  );
}
