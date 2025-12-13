
import { Button, Card, CardBody, CardHeader, Chip, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Textarea, useDisclosure, addToast } from "@heroui/react";
import { AddCircle, Copy, Pen, TrashBinTrash } from "@solar-icons/react";
import React, { useState } from "react";

interface Prize {
    id: string;
    name: string;
    type: "product" | "discount" | "coupon";
    value: string;
    probability: number;
    color: string;
}

interface Game {
    id: string;
    name: string;
    description: string;
    status: "active" | "inactive";
    prizes: Prize[];
    link: string;
    wheelType?: "circular" | "horizontal";
    createdAt: string;
}

const presetColors = [
    "#FF6B6B", // Vermelho
    "#4ECDC4", // Turquesa
    "#FFE66D", // Amarelo
    "#95E1D3", // Verde água
    "#F38181", // Rosa
    "#AA96DA", // Roxo
    "#FCBAD3", // Rosa claro
    "#A8E6CF", // Verde menta
    "#FFD3A5", // Pêssego
    "#FD9853", // Laranja
    "#A8DADC", // Azul claro
    "#457B9D", // Azul
    "#E63946", // Vermelho escuro
    "#F1FAEE", // Bege claro
    "#1D3557", // Azul escuro
    "#FFB4A2", // Salmão
];

const mockGames: Game[] = [
    {
        id: "1",
        name: "Roleta de Descontos",
        description: "Gire a roleta e ganhe descontos incríveis!",
        status: "active",
        prizes: [
            { id: "1", name: "10% OFF", type: "discount", value: "10", probability: 30, color: "#FF6B6B" },
            { id: "2", name: "20% OFF", type: "discount", value: "20", probability: 20, color: "#4ECDC4" },
            { id: "3", name: "Produto Grátis", type: "product", value: "Hambúrguer", probability: 10, color: "#FFE66D" },
            { id: "4", name: "5% OFF", type: "discount", value: "5", probability: 40, color: "#95E1D3" },
        ],
        link: typeof window !== "undefined" ? `${window.location.origin}/game/1?type=circular` : "/game/1?type=circular",
        wheelType: "circular",
        createdAt: "2024-01-15",
    },
];

export function PromotionalGamesPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [games, setGames] = useState<Game[]>(mockGames);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "active" as "active" | "inactive",
        wheelType: "circular" as "circular" | "horizontal",
    });
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
    const [prizeForm, setPrizeForm] = useState({
        name: "",
        type: "discount" as "product" | "discount" | "coupon",
        value: "",
        probability: 0,
        color: "#FF6B6B",
    });

    const handleOpen = (game?: Game) => {
        if (game) {
            setSelectedGame(game);
            setFormData({
                name: game.name,
                description: game.description,
                status: game.status,
                wheelType: game.wheelType || "circular",
            });
            setPrizes(game.prizes);
        } else {
            setSelectedGame(null);
            setFormData({
                name: "",
                description: "",
                status: "active",
                wheelType: "circular",
            });
            setPrizes([]);
        }
        setPrizeForm({
            name: "",
            type: "discount",
            value: "",
            probability: 0,
            color: "#FF6B6B",
        });
        onOpen();
    };

    const handleClose = () => {
        setSelectedGame(null);
        setFormData({
            name: "",
            description: "",
            status: "active",
            wheelType: "circular",
        });
        setPrizes([]);
        setEditingPrize(null);
        setPrizeForm({
            name: "",
            type: "discount",
            value: "",
            probability: 0,
            color: "#FF6B6B",
        });
        onOpenChange();
    };

    const handleSave = () => {
        if (!formData.name.trim()) {
            addToast({
                title: "Erro",
                description: "O nome do jogo é obrigatório",
                color: "danger",
            });
            return;
        }

        if (prizes.length === 0) {
            addToast({
                title: "Erro",
                description: "Adicione pelo menos um prêmio",
                color: "danger",
            });
            return;
        }

        const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
        if (totalProbability !== 100) {
            addToast({
                title: "Erro",
                description: "A soma das probabilidades deve ser 100%",
                color: "danger",
            });
            return;
        }

        const gameId = selectedGame?.id || Date.now().toString();
        const newGame: Game = {
            id: gameId,
            name: formData.name,
            description: formData.description,
            status: formData.status,
            prizes: prizes,
            wheelType: formData.wheelType,
            link: typeof window !== "undefined"
                ? `${window.location.origin}/game/${gameId}?type=${formData.wheelType}`
                : `/game/${gameId}?type=${formData.wheelType}`,
            createdAt: selectedGame?.createdAt || new Date().toISOString().split("T")[0],
        };

        if (selectedGame) {
            setGames(games.map((g) => (g.id === selectedGame.id ? newGame : g)));
            addToast({
                title: "Jogo atualizado",
                description: "O jogo promocional foi atualizado com sucesso!",
                color: "success",
            });
        } else {
            setGames([...games, newGame]);
            addToast({
                title: "Jogo criado",
                description: "O jogo promocional foi criado com sucesso!",
                color: "success",
            });
        }

        handleClose();
    };

    const handleAddPrize = () => {
        if (!prizeForm.name.trim() || !prizeForm.value.trim()) {
            addToast({
                title: "Erro",
                description: "Preencha todos os campos do prêmio",
                color: "danger",
            });
            return;
        }

        if (editingPrize) {
            setPrizes(
                prizes.map((p) =>
                    p.id === editingPrize.id
                        ? {
                            ...prizeForm,
                            id: editingPrize.id,
                        }
                        : p
                )
            );
            addToast({
                title: "Prêmio atualizado",
                description: "O prêmio foi atualizado com sucesso!",
                color: "success",
            });
        } else {
            const newPrize: Prize = {
                ...prizeForm,
                id: Date.now().toString(),
            };
            setPrizes([...prizes, newPrize]);
            addToast({
                title: "Prêmio adicionado",
                description: "O prêmio foi adicionado com sucesso!",
                color: "success",
            });
        }

        setPrizeForm({
            name: "",
            type: "discount",
            value: "",
            probability: 0,
            color: "#FF6B6B",
        });
        setEditingPrize(null);
    };

    const handleEditPrize = (prize: Prize) => {
        setEditingPrize(prize);
        setPrizeForm({
            name: prize.name,
            type: prize.type,
            value: prize.value,
            probability: prize.probability,
            color: prize.color,
        });
    };

    const handleDeletePrize = (id: string) => {
        setPrizes(prizes.filter((p) => p.id !== id));
        addToast({
            title: "Prêmio removido",
            description: "O prêmio foi removido com sucesso!",
            color: "success",
        });
    };

    const copyLink = (link: string) => {
        navigator.clipboard.writeText(link);
        addToast({
            title: "Link copiado",
            description: "O link promocional foi copiado para a área de transferência!",
            color: "success",
        });
    };

    const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Jogos Promocionais</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Crie e gerencie jogos promocionais para engajar seus clientes
                    </p>
                </div>
                <Button color="primary" startContent={<AddCircle size={20} weight="Outline" />} onPress={() => handleOpen()}>
                    Criar Jogo
                </Button>
            </div>

            <Divider />

            <div className="flex flex-col grow h-0 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {games.map((game) => (
                        <Card key={game.id}>
                            <CardHeader className="flex flex-col items-start gap-2 pb-2">
                                <div className="flex items-center justify-between w-full">
                                    <h3 className="text-lg font-semibold">{game.name}</h3>
                                    <Chip
                                        size="sm"
                                        color={game.status === "active" ? "success" : "default"}
                                        variant="flat"
                                    >
                                        {game.status === "active" ? "Ativo" : "Inativo"}
                                    </Chip>
                                </div>
                                <p className="text-sm text-default-500">{game.description}</p>
                            </CardHeader>
                            <CardBody className="pt-0">
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <p className="text-xs text-default-500 mb-1">Prêmios configurados</p>
                                        <p className="text-sm font-semibold">{game.prizes.length} prêmios</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-default-500 mb-1">Link promocional</p>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={game.link}
                                                readOnly
                                                size="sm"
                                                classNames={{
                                                    input: "text-xs",
                                                    inputWrapper: "h-8",
                                                }}
                                            />
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="flat"
                                                onPress={() => copyLink(game.link)}
                                            >
                                                <Copy size={16} weight="Outline" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            className="flex-1"
                                            onPress={() => handleOpen(game)}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="bordered"
                                            className="flex-1"
                                            onPress={() => window.open(game.link, "_blank")}
                                        >
                                            Visualizar
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>

            <Modal
                isOpen={isOpen}
                onOpenChange={handleClose}
                backdrop="blur"
                size="5xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold">
                            {selectedGame ? "Editar Jogo Promocional" : "Criar Jogo Promocional"}
                        </h2>
                        <p className="text-sm text-default-500 font-normal">
                            Configure sua roleta promocional com produtos e prêmios
                        </p>
                    </ModalHeader>
                    <ModalBody>
                        <div className="flex flex-col gap-6">
                            {/* Informações Básicas */}
                            <div className="flex flex-col gap-4">
                                <h3 className="text-lg font-semibold">Informações Básicas</h3>
                                <Input
                                    label="Nome do Jogo"
                                    placeholder="Ex: Roleta de Descontos"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    isRequired
                                />
                                <Textarea
                                    label="Descrição"
                                    placeholder="Descreva o jogo promocional..."
                                    value={formData.description}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
                                    minRows={2}
                                />
                                <Select
                                    label="Status"
                                    selectedKeys={[formData.status]}
                                    onSelectionChange={(keys) => {
                                        const selected = Array.from(keys)[0] as string;
                                        setFormData({ ...formData, status: selected as "active" | "inactive" });
                                    }}
                                >
                                    <SelectItem key="active">Ativo</SelectItem>
                                    <SelectItem key="inactive">Inativo</SelectItem>
                                </Select>
                                <Select
                                    label="Tipo de Roleta"
                                    selectedKeys={[formData.wheelType]}
                                    onSelectionChange={(keys) => {
                                        const selected = Array.from(keys)[0] as string;
                                        setFormData({ ...formData, wheelType: selected as "circular" | "horizontal" });
                                    }}
                                    description="Escolha entre roleta circular ou horizontal"
                                >
                                    <SelectItem key="circular">Circular</SelectItem>
                                    <SelectItem key="horizontal">Horizontal</SelectItem>
                                </Select>
                            </div>

                            <Divider />

                            {/* Configuração de Prêmios */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Prêmios da Roleta</h3>
                                    <Chip
                                        size="sm"
                                        color={totalProbability === 100 ? "success" : "warning"}
                                        variant="flat"
                                    >
                                        Probabilidade: {totalProbability}%
                                    </Chip>
                                </div>

                                {/* Formulário de Prêmio */}
                                <Card>
                                    <CardBody className="gap-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label="Nome do Prêmio"
                                                placeholder="Ex: 10% OFF"
                                                value={prizeForm.name}
                                                onChange={(e) => setPrizeForm({ ...prizeForm, name: e.target.value })}
                                                size="sm"
                                            />
                                            <Select
                                                label="Tipo"
                                                selectedKeys={[prizeForm.type]}
                                                onSelectionChange={(keys) => {
                                                    const selected = Array.from(keys)[0] as string;
                                                    setPrizeForm({ ...prizeForm, type: selected as Prize["type"] });
                                                }}
                                                size="sm"
                                            >
                                                <SelectItem key="discount">Desconto</SelectItem>
                                                <SelectItem key="product">Produto</SelectItem>
                                                <SelectItem key="coupon">Cupom</SelectItem>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label={prizeForm.type === "discount" ? "Valor (%)" : "Valor"}
                                                placeholder={prizeForm.type === "discount" ? "10" : "Nome do produto/cupom"}
                                                value={prizeForm.value}
                                                onChange={(e) => setPrizeForm({ ...prizeForm, value: e.target.value })}
                                                size="sm"
                                            />
                                            <Input
                                                label="Probabilidade (%)"
                                                type="number"
                                                placeholder="30"
                                                value={prizeForm.probability.toString()}
                                                onChange={(e) =>
                                                    setPrizeForm({
                                                        ...prizeForm,
                                                        probability: parseInt(e.target.value) || 0,
                                                    })
                                                }
                                                size="sm"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <label className="text-sm text-default-600 mb-2 block">Cor</label>
                                                <div className="flex flex-col gap-3">
                                                    <div className="grid grid-cols-8 gap-2">
                                                        {presetColors.map((color) => (
                                                            <button
                                                                key={color}
                                                                type="button"
                                                                onClick={() => setPrizeForm({ ...prizeForm, color })}
                                                                className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${prizeForm.color === color
                                                                        ? "border-primary ring-2 ring-primary ring-offset-2"
                                                                        : "border-default-300 hover:border-default-400"
                                                                    }`}
                                                                style={{ backgroundColor: color }}
                                                                aria-label={`Selecionar cor ${color}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-12 h-12 rounded-lg border border-default-300 flex-shrink-0"
                                                            style={{ backgroundColor: prizeForm.color }}
                                                        />
                                                        <Input
                                                            value={prizeForm.color}
                                                            onChange={(e) => setPrizeForm({ ...prizeForm, color: e.target.value })}
                                                            size="sm"
                                                            placeholder="#FF6B6B"
                                                            classNames={{
                                                                input: "text-xs",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                color="primary"
                                                onPress={handleAddPrize}
                                                startContent={<AddCircle size={18} weight="Outline" />}
                                                className="w-full"
                                            >
                                                {editingPrize ? "Atualizar" : "Adicionar"} Prêmio
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Lista de Prêmios */}
                                {prizes.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-semibold">Prêmios Adicionados</p>
                                        <Table aria-label="Lista de prêmios" removeWrapper>
                                            <TableHeader>
                                                <TableColumn>NOME</TableColumn>
                                                <TableColumn>TIPO</TableColumn>
                                                <TableColumn>VALOR</TableColumn>
                                                <TableColumn>PROBABILIDADE</TableColumn>
                                                <TableColumn>COR</TableColumn>
                                                <TableColumn>AÇÕES</TableColumn>
                                            </TableHeader>
                                            <TableBody>
                                                {prizes.map((prize) => (
                                                    <TableRow key={prize.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-4 h-4 rounded"
                                                                    style={{ backgroundColor: prize.color }}
                                                                />
                                                                <span className="font-medium">{prize.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip size="sm" variant="flat">
                                                                {prize.type === "discount"
                                                                    ? "Desconto"
                                                                    : prize.type === "product"
                                                                        ? "Produto"
                                                                        : "Cupom"}
                                                            </Chip>
                                                        </TableCell>
                                                        <TableCell>{prize.value}</TableCell>
                                                        <TableCell>{prize.probability}%</TableCell>
                                                        <TableCell>
                                                            <div
                                                                className="w-6 h-6 rounded border border-default-300"
                                                                style={{ backgroundColor: prize.color }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    variant="light"
                                                                    onPress={() => handleEditPrize(prize)}
                                                                >
                                                                    <Pen size={16} weight="Outline" />
                                                                </Button>
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    variant="light"
                                                                    color="danger"
                                                                    onPress={() => handleDeletePrize(prize.id)}
                                                                >
                                                                    <TrashBinTrash size={16} weight="Outline" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={handleClose}>
                            Cancelar
                        </Button>
                        <Button color="primary" onPress={handleSave}>
                            {selectedGame ? "Atualizar" : "Criar"} Jogo
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
