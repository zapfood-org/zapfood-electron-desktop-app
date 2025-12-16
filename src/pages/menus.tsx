
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button, Card, CardBody, Chip, Divider, Image, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Spinner, Textarea, useDisclosure } from "@heroui/react";
import { AddCircle, BookBookmark, CheckCircle, Magnifer, Pen, TrashBinTrash } from "@solar-icons/react";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { Product } from "../types/products";
import { api, restaurantId } from "../services/api";

interface Menu {
    id: string;
    name: string;
    description?: string;
    status: "active" | "inactive";
    restaurantId: string;
    // API returns products directly in some views
    productIds?: string[];
    products?: Product[];
    createdAt?: string;
    updatedAt?: string;
}

interface MenuWithProducts extends Menu {
    products: Product[];
}

export function MenusPage() {

    const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onOpenChange: onCreateModalOpenChange } = useDisclosure();
    const { isOpen: isAddProductModalOpen, onOpen: onAddProductModalOpen, onOpenChange: onAddProductModalOpenChange } = useDisclosure();

    const [menus, setMenus] = useState<MenuWithProducts[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingMenus, setIsLoadingMenus] = useState(true);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<MenuWithProducts | null>(null);
    const [searchMenu, setSearchMenu] = useState("");
    const [searchProduct, setSearchProduct] = useState("");
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

    // Loading states for actions
    const [isCreatingMenu, setIsCreatingMenu] = useState(false);
    const [isAddingProducts, setIsAddingProducts] = useState(false);
    const [removingProductId, setRemovingProductId] = useState<string | null>(null);

    // Formulário de criação de cardápio
    const [newMenuName, setNewMenuName] = useState("");
    const [newMenuDescription, setNewMenuDescription] = useState("");
    const [newMenuStatus, setNewMenuStatus] = useState<"active" | "inactive">("active");

    // Edit Menu State
    const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onOpenChange: onEditModalOpenChange } = useDisclosure();
    const [editMenuName, setEditMenuName] = useState("");
    const [editMenuDescription, setEditMenuDescription] = useState("");
    const [editMenuStatus, setEditMenuStatus] = useState<"active" | "inactive">("active");
    const [isUpdatingMenu, setIsUpdatingMenu] = useState(false);

    // Buscar cardápios
    const fetchMenus = async () => {
        setIsLoadingMenus(true);
        try {
            const response = await api.get<Menu[]>(
                `/menus`,
                {
                    params: {
                        restaurantId
                    },
                    headers: {
                        accept: "application/json",
                    },
                }
            );

            // The API returns menus with their products included
            const menusData = response.data.map(menu => ({
                ...menu,
                status: menu.status || "active", // Default to active if missing
                productIds: menu.products?.map(p => p.id) || [],
                products: menu.products || []
            }));

            // @ts-ignore - we are normalizing the data structure
            setMenus(menusData);
            if (menusData.length > 0 && !selectedMenu) {
                // @ts-ignore
                setSelectedMenu(menusData[0]);
            }
        } catch (error) {
            console.error("Erro ao buscar cardápios:", error);
            toast.error("Erro ao carregar cardápios");
        } finally {
            setIsLoadingMenus(false);
        }
    };

    // Helper to refresh specific menu data is not needed if we refetch all, 
    // but for now keeping it simple with full refetch or local state update.

    // Buscar todos os produtos disponíveis
    const fetchAllProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const response = await api.get(
                `/products`,
                {
                    params: {
                        page: 1,
                        size: 1000,
                        restaurantId
                    },
                    headers: {
                        accept: "application/json",
                    },
                }
            );

            setProducts(response.data.products || []);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            toast.error("Erro ao carregar produtos");
        } finally {
            setIsLoadingProducts(false);
        }
    };

    useEffect(() => {
        fetchMenus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isAddProductModalOpen) {
            fetchAllProducts();
            setSelectedProducts(new Set());
        }
    }, [isAddProductModalOpen]);

    // Criar novo cardápio
    const handleCreateMenu = async (onClose: () => void) => {
        if (!newMenuName.trim()) {
            toast.error("Por favor, informe o nome do cardápio");
            return;
        }

        setIsCreatingMenu(true);
        try {
            const payload = {
                name: newMenuName.trim(),
                description: newMenuDescription.trim() || undefined,
                restaurantId: restaurantId,
                productIds: [], // Start empty
            };

            const response = await api.post<Menu>(
                `/menus`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const newMenu = response.data;
            const menuWithProducts: MenuWithProducts = {
                ...newMenu,
                status: newMenuStatus, // Local optimistic or default
                products: [],
                productIds: [],
            };

            setMenus([...menus, menuWithProducts]);
            setSelectedMenu(menuWithProducts);

            // Limpar formulário
            setNewMenuName("");
            setNewMenuDescription("");
            setNewMenuStatus("active");

            toast.success("Cardápio criado com sucesso!");
            onClose();
        } catch (error) {
            console.error("Erro ao criar cardápio:", error);
            toast.error("Erro ao criar cardápio");
        } finally {
            setIsCreatingMenu(false);
        }
    };

    const handleOpenEdit = () => {
        if (!selectedMenu) return;
        setEditMenuName(selectedMenu.name);
        setEditMenuDescription(selectedMenu.description || "");
        setEditMenuStatus(selectedMenu.status);
        onEditModalOpen();
    };

    const handleUpdateMenu = async (onClose: () => void) => {
        if (!selectedMenu) return;
        if (!editMenuName.trim()) {
            toast.error("Por favor, informe o nome do cardápio");
            return;
        }

        setIsUpdatingMenu(true);
        try {
            const payload = {
                name: editMenuName.trim(),
                description: editMenuDescription.trim() || undefined,
                // Status is not explicitly in PATCH, but sending it just in case backend accepts it later
                // or we handle status separately if needed.
                // Assuming backend doesn't break if extra fields are sent.
            };

            await api.patch(
                `/menus/${selectedMenu.id}`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const updatedMenu: MenuWithProducts = {
                ...selectedMenu,
                name: editMenuName.trim(),
                description: editMenuDescription.trim() || undefined,
                status: editMenuStatus, // Optimistically update status locally
                updatedAt: new Date().toISOString()
            };

            setMenus(menus.map(m => m.id === updatedMenu.id ? updatedMenu : m));
            setSelectedMenu(updatedMenu);

            toast.success("Cardápio atualizado com sucesso!");
            onClose();
        } catch (error) {
            console.error("Erro ao atualizar cardápio:", error);
            toast.error("Erro ao atualizar cardápio");
        } finally {
            setIsUpdatingMenu(false);
        }
    };

    // Adicionar produtos selecionados ao cardápio
    const handleAddSelectedProducts = async () => {
        if (!selectedMenu || selectedProducts.size === 0) {
            toast.warning("Selecione pelo menos um produto");
            return;
        }

        const productsToAdd = products.filter(p => selectedProducts.has(p.id) && !selectedMenu.productIds?.includes(p.id));

        if (productsToAdd.length === 0) {
            toast.warning("Todos os produtos selecionados já estão no cardápio");
            setSelectedProducts(new Set());
            return;
        }

        setIsAddingProducts(true);
        try {
            const currentIds = selectedMenu.productIds || [];
            const newIds = productsToAdd.map(p => p.id);
            const allProductIds = [...currentIds, ...newIds];

            await api.patch(
                `/menus/${selectedMenu.id}`,
                {
                    productIds: allProductIds,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const updatedMenu: MenuWithProducts = {
                ...selectedMenu,
                productIds: allProductIds,
                products: [...(selectedMenu.products || []), ...productsToAdd],
            };

            setMenus(menus.map(m => m.id === updatedMenu.id ? updatedMenu : m));
            setSelectedMenu(updatedMenu);

            toast.success(`${productsToAdd.length} ${productsToAdd.length === 1 ? "produto adicionado" : "produtos adicionados"} ao cardápio`);
            setSelectedProducts(new Set());
            onAddProductModalOpenChange();
        } catch (error) {
            console.error("Erro ao adicionar produtos:", error);
            toast.error("Erro ao atualizar cardápio");
        } finally {
            setIsAddingProducts(false);
        }
    };

    const handleToggleProductSelection = (productId: string) => {
        const newSelected = new Set(selectedProducts);
        if (newSelected.has(productId)) {
            newSelected.delete(productId);
        } else {
            newSelected.add(productId);
        }
        setSelectedProducts(newSelected);
    };

    // remover produto do cardápio
    const handleRemoveProduct = async (productId: string) => {
        if (!selectedMenu) return;

        setRemovingProductId(productId);
        try {
            const currentIds = selectedMenu.productIds || [];
            const newIds = currentIds.filter(id => id !== productId);

            await api.patch(
                `/menus/${selectedMenu.id}`,
                {
                    productIds: newIds,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const updatedMenu: MenuWithProducts = {
                ...selectedMenu,
                productIds: newIds,
                products: selectedMenu.products.filter(p => p.id !== productId),
            };

            setMenus(menus.map(m => m.id === updatedMenu.id ? updatedMenu : m));
            setSelectedMenu(updatedMenu);

            toast.success("Produto removido do cardápio");
        } catch (error) {
            console.error("Erro ao remover produto:", error);
            toast.error("Erro ao remover produto");
        } finally {
            setRemovingProductId(null);
        }
    };

    // Filtrar cardápios
    const filteredMenus = menus.filter(menu =>
        menu.name.toLowerCase().includes(searchMenu.toLowerCase())
    );

    // Filtrar produtos disponíveis
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        product.description.toLowerCase().includes(searchProduct.toLowerCase()) ||
        product.category.toLowerCase().includes(searchProduct.toLowerCase())
    );

    // Produtos já no cardápio
    const selectedProductIds = selectedMenu?.productIds || [];
    const availableProducts = filteredProducts.filter(p => !selectedProductIds.includes(p.id));

    return (
        <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Cardápios</h1>
                </div>
                <Button color="primary" startContent={<AddCircle size={20} weight="Outline" />} onPress={onCreateModalOpen}>
                    Criar Cardápio
                </Button>
            </div>

            <Divider />

            <div className="grid grid-cols-[1fr_auto_2fr] h-full">
                {/* Coluna Esquerda - Lista de Cardápios */}
                <div className="flex flex-col flex-1">
                    <div className="p-4">
                        <Input
                            placeholder="Buscar cardápio..."
                            value={searchMenu}
                            onValueChange={setSearchMenu}
                            startContent={<Magnifer size={20} weight="Outline" />}
                        />
                    </div>
                    <Divider />
                    <ScrollArea className="flex flex-col grow h-0 overflow-y-auto">
                        {isLoadingMenus ? (
                            <div className="flex items-center justify-center p-12">
                                <Spinner size="lg" />
                            </div>
                        ) : filteredMenus.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <BookBookmark size={48} weight="Outline" className="text-default-300 mb-4" />
                                <p className="text-default-500">Nenhum cardápio encontrado</p>
                            </div>
                        ) : (
                            <div className="p-4 space-y-2">
                                {filteredMenus.map((menu) => (
                                    <Card
                                        key={menu.id}
                                        className={`cursor-pointer transition-all w-full border ${selectedMenu?.id === menu.id
                                            ? "border-primary bg-primary-50 dark:bg-primary-900"
                                            : "border border-default-200 hover:border-primary-200 dark:hover:border-primary-200 bg-white dark:bg-black"
                                            }`}
                                        isPressable
                                        onPress={() => setSelectedMenu(menu)}
                                    >
                                        <CardBody className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-default-200 flex items-center justify-center flex-shrink-0">
                                                    <BookBookmark size={20} weight="Outline" />
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <h3 className="text-base font-semibold truncate">{menu.name}</h3>
                                                    <p className="text-xs text-default-500">
                                                        {menu.products.length} {menu.products.length === 1 ? "produto" : "produtos"}
                                                    </p>
                                                </div>
                                                {menu.status === "active" && (
                                                    <div className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
                                                )}
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Divider Vertical */}
                <Divider orientation="vertical" />

                {/* Coluna Direita - Itens do Cardápio */}
                <div className="flex-1 flex flex-col">
                    {selectedMenu ? (
                        <>
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-2xl font-bold">{selectedMenu.name}</h2>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                onPress={handleOpenEdit}
                                            >
                                                <Pen size={18} />
                                            </Button>
                                        </div>
                                        {selectedMenu.description && (
                                            <p className="text-sm text-default-500 mt-1">{selectedMenu.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <Chip size="sm" variant="flat" color={selectedMenu.status === "active" ? "success" : "default"}>
                                                {selectedMenu.status === "active" ? "Ativo" : "Inativo"}
                                            </Chip>
                                            <span className="text-xs text-default-500">
                                                {selectedMenu.products.length} {selectedMenu.products.length === 1 ? "produto" : "produtos"}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="primary"
                                        startContent={<AddCircle size={18} weight="Outline" />}
                                        onPress={onAddProductModalOpen}
                                    >
                                        Adicionar Produto
                                    </Button>
                                </div>
                            </div>
                            <Divider />
                            <ScrollArea className="flex flex-col flex-grow h-0 overflow-y-auto">
                                <div className="p-6">
                                    {selectedMenu.products.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedMenu.products.map((product) => (
                                                <Card key={product.id}>
                                                    <CardBody className="p-4">
                                                        <div className="flex gap-4">
                                                            {/* Imagem do Produto */}
                                                            {product.imageUrl && (
                                                                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-default-200">
                                                                    <Image
                                                                        src={product.imageUrl}
                                                                        alt={product.name}
                                                                        className="w-full h-full object-cover"
                                                                        radius="none"
                                                                        fallbackSrc="https://picsum.photos/200/200"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                                    <div className="flex-1 min-w-0">
                                                                        <h3 className="text-base font-semibold truncate">{product.name}</h3>
                                                                        <Chip size="sm" variant="flat" className="mt-1">
                                                                            {product.category}
                                                                        </Chip>
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="light"
                                                                        color="danger"
                                                                        isIconOnly
                                                                        aria-label="Remover produto"
                                                                        isLoading={removingProductId === product.id}
                                                                        onPress={() => handleRemoveProduct(product.id)}
                                                                    >
                                                                        <TrashBinTrash size={18} weight="Outline" />
                                                                    </Button>
                                                                </div>
                                                                <p className="text-sm text-default-600 line-clamp-2 mb-2">
                                                                    {product.description}
                                                                </p>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-lg font-bold text-primary">
                                                                        R$ {product.price.toFixed(2).replace(".", ",")}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                            <BookBookmark size={48} weight="Outline" className="text-default-300 mb-4" />
                                            <p className="text-default-500">Nenhum produto neste cardápio</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <BookBookmark size={48} weight="Outline" className="text-default-300 mb-4" />
                            <p className="text-default-500">Selecione um cardápio para ver os produtos</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Criar Cardápio */}
            <Modal
                isOpen={isCreateModalOpen}
                onOpenChange={onCreateModalOpenChange}
                backdrop="blur"
                size="2xl"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold">Criar Cardápio</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Configure um novo cardápio para o restaurante
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        label="Nome do Cardápio"
                                        placeholder="Ex: Cardápio Principal, Cardápio Executivo"
                                        value={newMenuName}
                                        onValueChange={setNewMenuName}
                                        isRequired
                                    />
                                    <Textarea
                                        label="Descrição"
                                        placeholder="Descreva o cardápio (opcional)"
                                        value={newMenuDescription}
                                        onValueChange={setNewMenuDescription}
                                        minRows={3}
                                    />
                                    <Select
                                        label="Status"
                                        selectedKeys={[newMenuStatus]}
                                        onSelectionChange={(keys) => {
                                            const selected = Array.from(keys)[0] as string;
                                            setNewMenuStatus(selected as "active" | "inactive");
                                        }}
                                    >
                                        <SelectItem key="active">Ativo</SelectItem>
                                        <SelectItem key="inactive">Inativo</SelectItem>
                                    </Select>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={() => handleCreateMenu(onClose)} isLoading={isCreatingMenu}>
                                    Criar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Modal de Adicionar Produto */}
            <Modal
                isOpen={isAddProductModalOpen}
                onOpenChange={onAddProductModalOpenChange}
                backdrop="blur"
                size="4xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold">Adicionar Produtos ao Cardápio</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Selecione um ou mais produtos que deseja adicionar
                                </p>
                            </ModalHeader>
                            <Divider />
                            <ModalBody className="min-h-[70vh] p-0 gap-0">
                                <div className="p-4">
                                    <Input
                                        placeholder="Buscar produtos..."
                                        value={searchProduct}
                                        onValueChange={setSearchProduct}
                                        startContent={<Magnifer size={20} weight="Outline" />}
                                    />
                                </div>
                                <Divider />
                                <ScrollArea className="flex flex-col flex-grow h-0 overflow-y-auto">
                                    {isLoadingProducts ? (
                                        <div className="flex items-center justify-center p-12">
                                            <Spinner size="lg" />
                                        </div>
                                    ) : availableProducts.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center p-12 text-center">
                                            <p className="text-default-500">
                                                {searchProduct ? "Nenhum produto encontrado" : "Todos os produtos já estão no cardápio"}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                            {availableProducts.map((product) => {
                                                const isSelected = selectedProducts.has(product.id);
                                                return (
                                                    <Card
                                                        key={product.id}
                                                        className={`transition-all cursor-pointer ${isSelected ? "border-primary border bg-primary-50 dark:bg-primary-950/20" : "border border-default-200 hover:border-primary-200"}`}
                                                        isPressable
                                                        onPress={() => handleToggleProductSelection(product.id)}
                                                    >
                                                        <CardBody className="p-4">
                                                            <div className="flex gap-3">
                                                                {product.imageUrl && (
                                                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-default-200">
                                                                        <Image
                                                                            src={product.imageUrl}
                                                                            alt={product.name}
                                                                            className="w-full h-full object-cover"
                                                                            radius="none"
                                                                            fallbackSrc="https://picsum.photos/200/200"
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                                        <h3 className="text-sm font-semibold truncate">{product.name}</h3>
                                                                        {isSelected && (
                                                                            <CheckCircle size={20} weight="Bold" className="text-primary flex-shrink-0" />
                                                                        )}
                                                                    </div>
                                                                    <Chip size="sm" variant="flat" className="mt-1">
                                                                        {product.category}
                                                                    </Chip>
                                                                    <p className="text-xs text-default-600 line-clamp-2 mt-1">
                                                                        {product.description}
                                                                    </p>
                                                                    <span className="text-sm font-bold text-primary mt-1 block">
                                                                        R$ {product.price.toFixed(2).replace(".", ",")}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </CardBody>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}
                                </ScrollArea>
                            </ModalBody>
                            <Divider />
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleAddSelectedProducts}
                                    isDisabled={selectedProducts.size === 0 || isAddingProducts}
                                    isLoading={isAddingProducts}
                                    startContent={!isAddingProducts ? <AddCircle size={18} weight="Outline" /> : undefined}
                                >
                                    Adicionar {selectedProducts.size > 0 ? `(${selectedProducts.size})` : ""}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Modal de Editar Cardápio */}
            <Modal
                isOpen={isEditModalOpen}
                onOpenChange={onEditModalOpenChange}
                backdrop="blur"
                size="2xl"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold">Editar Cardápio</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Atualize as informações do cardápio
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        label="Nome do Cardápio"
                                        placeholder="Ex: Cardápio Principal, Cardápio Executivo"
                                        value={editMenuName}
                                        onValueChange={setEditMenuName}
                                        isRequired
                                    />
                                    <Textarea
                                        label="Descrição"
                                        placeholder="Descreva o cardápio (opcional)"
                                        value={editMenuDescription}
                                        onValueChange={setEditMenuDescription}
                                        minRows={3}
                                    />
                                    <Select
                                        label="Status"
                                        selectedKeys={[editMenuStatus]}
                                        onSelectionChange={(keys) => {
                                            const selected = Array.from(keys)[0] as string;
                                            setEditMenuStatus(selected as "active" | "inactive");
                                        }}
                                    >
                                        <SelectItem key="active">Ativo</SelectItem>
                                        <SelectItem key="inactive">Inativo</SelectItem>
                                    </Select>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={() => handleUpdateMenu(onClose)} isLoading={isUpdatingMenu}>
                                    Salvar Alterações
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
