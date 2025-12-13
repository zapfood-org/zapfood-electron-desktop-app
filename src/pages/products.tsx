
import { ScrollArea } from "../components/ui/scroll-area";
import { Button, Card, CardBody, CardHeader, Checkbox, Chip, Divider, Image, Input, Textarea, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure, NumberInput, Pagination, Select, SelectItem, addToast } from "@heroui/react";
import { AddCircle, CheckCircle, Magnifer, TrashBinTrash } from "@solar-icons/react";
import { useState } from "react";

interface Garnish {
    id: string;
    name: string;
    price?: number;
    isRequired: boolean;
}

interface ProductFormData {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    garnishes: Garnish[];
    requiredGarnishesCount: number;
}

interface Product extends ProductFormData {
    id: string;
}

export function ProductsPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([
        ...Array(18).fill(null).map((_, index) => ({
            id: `product-${index}`,
            name: `Produto ${index}`,
            description: `Descrição do produto ${index}`,
            price: index * 10,
            category: "lanches",
            imageUrl: `https://picsum.photos/seed/product-${index}/400/300`,
            garnishes: [],
            requiredGarnishesCount: 0,
        })),
    ]);
    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        description: "",
        price: 0,
        category: "",
        imageUrl: "",
        garnishes: [],
        requiredGarnishesCount: 0,
    });
    const [newGarnishName, setNewGarnishName] = useState("");
    const [newGarnishPrice, setNewGarnishPrice] = useState<number>(0);
    const [newGarnishRequired, setNewGarnishRequired] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleAddGarnish = () => {
        if (!newGarnishName.trim()) return;

        const newGarnish: Garnish = {
            id: Date.now().toString(),
            name: newGarnishName,
            price: newGarnishPrice > 0 ? newGarnishPrice : undefined,
            isRequired: newGarnishRequired,
        };

        setFormData({
            ...formData,
            garnishes: [...formData.garnishes, newGarnish],
            requiredGarnishesCount: newGarnishRequired
                ? formData.requiredGarnishesCount + 1
                : formData.requiredGarnishesCount,
        });

        setNewGarnishName("");
        setNewGarnishPrice(0);
        setNewGarnishRequired(false);
    };

    const handleRemoveGarnish = (id: string) => {
        const garnish = formData.garnishes.find((g: Garnish) => g.id === id);
        setFormData({
            ...formData,
            garnishes: formData.garnishes.filter((g: Garnish) => g.id !== id),
            requiredGarnishesCount:
                garnish?.isRequired && formData.requiredGarnishesCount > 0
                    ? formData.requiredGarnishesCount - 1
                    : formData.requiredGarnishesCount,
        });
    };

    const handleToggleGarnishRequired = (id: string) => {
        setFormData({
            ...formData,
            garnishes: formData.garnishes.map((g: Garnish) =>
                g.id === id ? { ...g, isRequired: !g.isRequired } : g
            ),
            requiredGarnishesCount: formData.garnishes.find((g: Garnish) => g.id === id)?.isRequired
                ? formData.requiredGarnishesCount - 1
                : formData.requiredGarnishesCount + 1,
        });
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: 0,
            category: "",
            imageUrl: "",
            garnishes: [],
            requiredGarnishesCount: 0,
        });
        setNewGarnishName("");
        setNewGarnishPrice(0);
        setNewGarnishRequired(false);
        setEditingProductId(null);
    };

    const handleEdit = (product: Product) => {
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            imageUrl: product.imageUrl,
            garnishes: product.garnishes,
            requiredGarnishesCount: product.requiredGarnishesCount,
        });
        setEditingProductId(product.id);
        onOpen();
    };

    const handleSave = (onClose: () => void) => {
        if (editingProductId) {
            // Atualizar produto existente
            setProducts(
                products.map((p) =>
                    p.id === editingProductId
                        ? {
                            ...p,
                            ...formData,
                        }
                        : p
                )
            );
            addToast({
                title: "Produto atualizado",
                description: "O produto foi atualizado com sucesso!",
                color: "success",
            });
        } else {
            // Criar novo produto
            const newProduct: Product = {
                id: `product-${Date.now()}`,
                ...formData,
            };
            setProducts([...products, newProduct]);
            addToast({
                title: "Produto adicionado",
                description: "O produto foi cadastrado com sucesso!",
                color: "success",
            });
        }
        resetForm();
        onClose();
    };

    const handleOpenModal = () => {
        resetForm();
        onOpen();
    };

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Produtos</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Gerencie seus produtos e itens do cardápio
                    </p>
                </div>
                <Button color="primary" startContent={<AddCircle size={20} weight="Outline" />} onPress={handleOpenModal}>
                    Adicionar Produto
                </Button>
            </div>

            <Divider />

            {/* Filtros */}
            <div className="px-6 py-3 gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
                <Input
                    placeholder="Buscar produtos"
                    value={search}
                    onValueChange={setSearch}
                    startContent={<Magnifer size={20} weight="Outline" />}
                    className="col-span-1"
                />
                <Select
                    placeholder="Categoria"
                    selectedKeys={selectedCategory ? [selectedCategory] : []}
                    onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setSelectedCategory(selected === "all" ? null : selected);
                    }}
                >
                    <SelectItem key="all">Todas as categorias</SelectItem>
                    <SelectItem key="lanches">Lanches</SelectItem>
                    <SelectItem key="bebidas">Bebidas</SelectItem>
                    <SelectItem key="pizzas">Pizzas</SelectItem>
                    <SelectItem key="saladas">Saladas</SelectItem>
                    <SelectItem key="marmitas">Marmitas</SelectItem>
                    <SelectItem key="pratos">Pratos</SelectItem>
                </Select>
            </div>
            <Divider />

            <ScrollArea className="flex flex-col grow h-0 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4  p-6">
                    {products.map((product) => (
                        <Card key={product.id}>
                            <CardHeader className="p-0">
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    width="100%"
                                    radius="lg"
                                    className="object-cover aspect-square"
                                    fallbackSrc="https://picsum.photos/400/300"
                                    isBlurred
                                />
                            </CardHeader>
                            <CardBody>
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <h3 className="text-lg font-semibold truncate">{product.name}</h3>
                                        <p className="text-sm text-default-500 mt-1">R$ {product.price.toFixed(2)}</p>
                                        {product.garnishes.length > 0 && (
                                            <p className="text-xs text-default-400 mt-1">
                                                {product.garnishes.length} guarnição{product.garnishes.length > 1 ? "ões" : ""}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            className="flex-1"
                                            onPress={() => handleEdit(product)}
                                        >
                                            Editar
                                        </Button>
                                        <Button size="sm" variant="bordered" className="flex-1">
                                            Ver Detalhes
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </ScrollArea>

            <Divider />

            <div className="flex justify-center px-6 py-3">
                <Pagination total={10} page={1} onChange={(page) => { console.log(page) }} />
            </div>


            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                backdrop="blur"
                size="2xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold">
                                    {editingProductId ? "Editar Produto" : "Adicionar Produto"}
                                </h2>
                                <p className="text-sm text-default-500 font-normal">
                                    {editingProductId
                                        ? "Edite os dados do produto"
                                        : "Preencha os dados do novo produto"}
                                </p>
                            </ModalHeader>
                            <Divider />
                            <ModalBody className="flex flex-col flex-1 gap-4 p-0">
                                <ScrollArea className="flex flex-col gap-4 h-full grow overflow-y-auto">
                                    <div className="flex flex-col flex-1 gap-4 px-6 py-3">
                                        <Input
                                            label="Nome do Produto"
                                            placeholder="Digite o nome"
                                            value={formData.name}
                                            onValueChange={(value) => setFormData({ ...formData, name: value })}
                                            isRequired
                                        />
                                        <Textarea
                                            label="Descrição"
                                            placeholder="Descreva o produto"
                                            value={formData.description}
                                            onValueChange={(value) => setFormData({ ...formData, description: value })}
                                            minRows={2}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <NumberInput
                                                label="Preço"
                                                placeholder="0.00"
                                                value={formData.price}
                                                onValueChange={(value) => setFormData({ ...formData, price: Number(value) })}
                                                startContent={
                                                    <span className="text-default-500">R$</span>
                                                }
                                                minValue={0}
                                                step={0.01}
                                                formatOptions={{
                                                    style: "currency",
                                                    currency: "BRL",
                                                }}
                                                isRequired
                                            />
                                            <Select
                                                label="Categoria"
                                                placeholder="Selecione a categoria"
                                                selectedKeys={formData.category ? [formData.category] : []}
                                                onSelectionChange={(keys) => {
                                                    const selected = Array.from(keys)[0] as string;
                                                    setFormData({ ...formData, category: selected || "" });
                                                }}
                                                isRequired
                                            >
                                                <SelectItem key="bebidas">Bebidas</SelectItem>
                                                <SelectItem key="lanches">Lanches</SelectItem>
                                                <SelectItem key="pizzas">Pizzas</SelectItem>
                                                <SelectItem key="saladas">Saladas</SelectItem>
                                                <SelectItem key="marmitas">Marmitas</SelectItem>
                                                <SelectItem key="pratos">Pratos</SelectItem>
                                            </Select>
                                        </div>
                                        <Input
                                            label="URL da Imagem"
                                            placeholder="https://exemplo.com/imagem.jpg"
                                            value={formData.imageUrl}
                                            onValueChange={(value) => setFormData({ ...formData, imageUrl: value })}
                                        />

                                        <Divider className="my-2" />

                                        {/* Seção de Guarnições */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold">Guarnições</h3>
                                                    <p className="text-xs text-default-500 mt-1">
                                                        Configure as opções de acompanhamentos para este produto
                                                    </p>
                                                </div>
                                                {formData.requiredGarnishesCount > 0 && (
                                                    <Chip size="sm" color="primary" variant="flat">
                                                        {formData.requiredGarnishesCount} obrigatória{formData.requiredGarnishesCount > 1 ? "s" : ""}
                                                    </Chip>
                                                )}
                                            </div>

                                            {/* Lista de Guarnições */}
                                            {formData.garnishes.length > 0 && (
                                                <div className="flex flex-col gap-2 p-3 rounded-lg bg-default-50 border border-default-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-default-700">
                                                            Guarnições cadastradas
                                                        </span>
                                                        <span className="text-xs text-default-500">
                                                            {formData.garnishes.length} {formData.garnishes.length === 1 ? "item" : "itens"}
                                                        </span>
                                                    </div>

                                                    <Divider />

                                                    <ScrollArea className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-4">
                                                        <div className="flex flex-col gap-2">
                                                            {formData.garnishes.map((garnish) => (
                                                                <div
                                                                    key={garnish.id}
                                                                    className="flex items-center justify-between p-2 rounded-lg border border-default-200 hover:border-primary/50 transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                        <Button
                                                                            isIconOnly
                                                                            size="sm"
                                                                            variant="light"
                                                                            onPress={() => handleToggleGarnishRequired(garnish.id)}
                                                                            className={garnish.isRequired ? "text-primary" : "text-default-400"}
                                                                            aria-label={garnish.isRequired ? "Marcar como opcional" : "Marcar como obrigatória"}
                                                                        >
                                                                            <CheckCircle
                                                                                size={18}
                                                                                weight={garnish.isRequired ? "Bold" : "Outline"}
                                                                            />
                                                                        </Button>
                                                                        <div className="flex flex-col flex-1 min-w-0">
                                                                            <span className="text-sm font-medium truncate">
                                                                                {garnish.name}
                                                                            </span>
                                                                            {garnish.price && garnish.price > 0 && (
                                                                                <span className="text-xs text-default-500">
                                                                                    + R$ {garnish.price.toFixed(2)}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {garnish.isRequired && (
                                                                            <Chip size="sm" color="primary" variant="flat">
                                                                                Obrigatória
                                                                            </Chip>
                                                                        )}
                                                                    </div>
                                                                    <Button
                                                                        isIconOnly
                                                                        size="sm"
                                                                        variant="light"
                                                                        color="danger"
                                                                        onPress={() => handleRemoveGarnish(garnish.id)}
                                                                        aria-label="Remover guarnição"
                                                                    >
                                                                        <TrashBinTrash size={18} weight="Outline" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </ScrollArea>
                                                </div>
                                            )}

                                            {/* Formulário para adicionar nova guarnição */}
                                            <Card className="border-2 border-dashed border-default-300">
                                                <CardBody className="p-4">
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <AddCircle size={20} weight="Outline" className="text-primary" />
                                                            <span className="text-sm font-semibold">Adicionar Guarnição</span>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                            <Input
                                                                label="Nome da guarnição"
                                                                value={newGarnishName}
                                                                onValueChange={setNewGarnishName}
                                                                className="sm:col-span-2"
                                                            />
                                                            <NumberInput
                                                                placeholder="Preço (opcional)"
                                                                value={newGarnishPrice}
                                                                onValueChange={(value) => setNewGarnishPrice(Number(value))}
                                                                startContent={<span className="text-xs text-default-500">R$</span>}
                                                                minValue={0}
                                                                step={0.01}
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <Checkbox
                                                                isSelected={newGarnishRequired}
                                                                onValueChange={setNewGarnishRequired}
                                                                size="sm"
                                                            >
                                                                <span className="text-sm text-default-600">
                                                                    Marcar como obrigatória
                                                                </span>
                                                            </Checkbox>
                                                            <Button
                                                                size="sm"
                                                                color="primary"
                                                                variant="flat"
                                                                onPress={handleAddGarnish}
                                                                isDisabled={!newGarnishName.trim()}
                                                                startContent={<AddCircle size={16} weight="Outline" />}
                                                            >
                                                                Adicionar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </ModalBody>
                            <Divider />
                            <ModalFooter>
                                <Button
                                    variant="light"
                                    onPress={() => {
                                        resetForm();
                                        onClose();
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={() => handleSave(onClose)}>
                                    {editingProductId ? "Salvar Alterações" : "Adicionar"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div >
    );
}
