import { authClient } from "@/lib/auth-client";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Spinner,
} from "@heroui/react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

export function SettingsPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { data: organizations } = authClient.useListOrganizations();

  const organization = useMemo(() => {
    return organizations?.find((org) => org.id === tenantId);
  }, [organizations, tenantId]);

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto">
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col gap-3 my-3">
        {!organization ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-0">
                <h2 className="text-lg font-semibold">Informações Gerais</h2>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome da Empresa"
                    placeholder="Digite o nome"
                    defaultValue={organization.name}
                  />
                  <Input
                    label="Identificador (Slug)"
                    isDisabled
                    defaultValue={organization.slug}
                    description="O identificador não pode ser alterado."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="email@exemplo.com"
                  />
                  <Input label="Telefone" placeholder="(11) 98765-4321" />
                </div>
                <div className="flex justify-end mt-2">
                  <Button color="primary">Salvar Alterações</Button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="pb-0">
                <h2 className="text-lg font-semibold">Endereço</h2>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                <Input
                  label="CEP"
                  placeholder="00000-000"
                  description="Digite o CEP para preencher automaticamente"
                />
                <Input
                  label="Rua/Avenida"
                  placeholder="Nome da rua ou avenida"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Número" placeholder="123" />
                  <Input label="Complemento" placeholder="Apto, Bloco, etc." />
                  <Input label="Bairro" placeholder="Nome do bairro" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Cidade" placeholder="Nome da cidade" />
                  <Input label="Estado" placeholder="UF" maxLength={2} />
                </div>
                <div className="flex justify-end mt-2">
                  <Button color="primary">Salvar Endereço</Button>
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
