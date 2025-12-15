
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button, Card, CardBody, Chip, Divider, Image, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Spinner, Textarea, useDisclosure } from "@heroui/react";
import { AddCircle, BookBookmark, Magnifer, TrashBinTrash } from "@solar-icons/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { Product } from "../types/products";

interface Menu {
    id: string;
    name: string;
    description?: string;
    status: "active" | "inactive";
    restaurantId: string;
    productIds: string[];
    createdAt?: string;
    updatedAt?: string;
}

interface MenuWithProducts extends Menu {
    products: Product[];
}

export function MenusPage() {
    const restaurantId = "cmj6b8z6b0000u4vsgfh8y9g6";
    
    const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onOpenChange: onCreateModalOpenChange } = useDisclosure();
    const { isOpen: isAddProductModalOpen, onOpen: onAddProductModalOpen, onOpenChange: onAddProductModalOpenChange } = useDisclosure();
    
    const [menus, setMenus] = useState<MenuWithProducts[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingMenus, setIsLoadingMenus] = useState(true);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<MenuWithProducts | null>(null);
    const [searchMenu, setSearchMenu] = useState("");
    const [searchProduct, setSearchProduct] = useState("");
    
    // Formulário de criação de cardápio
    const [newMenuName, setNewMenuName] = useState("");
    const [newMenuDescription, setNewMenuDescription] = useState("");
    const [newMenuStatus, setNewMenuStatus] = useState<"active" | "inactive">("active");

    // Buscar cardápios
    const fetchMenus = async () => {
        setIsLoadingMenus(true);
        try {
            // TODO: Substituir por endpoint real quando disponível
            // Por enquanto, vamos usar dados mockados mas com estrutura preparada para API
            const mockMenus: Menu[] = [
                {
                    id: "1",
                    name: "Cardápio Principal",
                    description: "Cardápio completo com todas as opções",
                    status: "active",
                    restaurantId: restaurantId,
                    productIds: [],
                }
            ];
            
            // Buscar produtos para cada cardápio
            const menusWithProducts = await Promise.all(
                mockMenus.map(async (menu) => {
                    const menuProducts = await fetchProductsForMenu(menu.productIds);
                    return {
                        ...menu,
                        products: menuProducts,
                    };
                })
            );
            
            setMenus(menusWithProducts);
            if (menusWithProducts.length > 0) {
                setSelectedMenu(menusWithProducts[0]);
            }
        } catch (error) {
            console.error("Erro ao buscar cardápios:", error);
            toast.error("Erro ao carregar cardápios");
        } finally {
            setIsLoadingMenus(false);
        }
    };

    // Buscar produtos para um cardápio
    const fetchProductsForMenu = async (productIds: string[]): Promise<Product[]> => {
        if (productIds.length === 0) return [];
        
        try {
            // Buscar todos os produtos do restaurante
            const response = await axios.get(
                `http://localhost:5000/restaurants/${restaurantId}/products`,
                {
                    params: {
                        page: 1,
                        size: 100,
                    },
                    headers: {
                        accept: "application/json",
                    },
                }
            );
            
            // Filtrar apenas os produtos que estão no cardápio
            const allProducts = response.data.products || [];
            return allProducts.filter((product: Product) => productIds.includes(product.id));
        } catch (error) {
            console.error("Erro ao buscar produtos do cardápio:", error);
            return [];
        }
    };

    // Buscar todos os produtos disponíveis
    const fetchAllProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const response = await axios.get(
                `http://localhost:5000/restaurants/${restaurantId}/products`,
                {
                    params: {
                        page: 1,
                        size: 100,
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
    }
    }, [isAddProductModalOpen]);

    // Criar novo cardápio
    const handleCreateMenu = async (onClose: () => void) => {
        if (!newMenuName.trim()) {
            toast.error("Por favor, informe o nome do cardápio");
            return;
        }

        try {
            // TODO: Substituir por chamada real à API quando disponível
            const newMenu: Menu = {
                id: Date.now().toString(),
                name: newMenuName.trim(),
                description: newMenuDescription.trim() || undefined,
                status: newMenuStatus,
                restaurantId: restaurantId,
                productIds: [],
            };

            const menuWithProducts: MenuWithProducts = {
                ...newMenu,
                products: [],
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
        }
    };

    // Adicionar produto ao cardápio
    const handleAddProduct = (product: Product) => {
        if (!selectedMenu) return;

        if (selectedMenu.productIds.includes(product.id)) {
            toast.warning("Este produto já está no cardápio");
            return;
        }

        const updatedMenu: MenuWithProducts = {
            ...selectedMenu,
            productIds: [...selectedMenu.productIds, product.id],
            products: [...selectedMenu.products, product],
        };

        setMenus(menus.map(m => m.id === updatedMenu.id ? updatedMenu : m));
        setSelectedMenu(updatedMenu);
        
        toast.success(`${product.name} adicionado ao cardápio`);
        onAddProductModalOpenChange();
    };

    // Remover produto do cardápio
    const handleRemoveProduct = (productId: string) => {
        if (!selectedMenu) return;

        const updatedMenu: MenuWithProducts = {
            ...selectedMenu,
            productIds: selectedMenu.productIds.filter(id => id !== productId),
            products: selectedMenu.products.filter(p => p.id !== productId),
        };

        setMenus(menus.map(m => m.id === updatedMenu.id ? updatedMenu : m));
        setSelectedMenu(updatedMenu);
        
        toast.success("Produto removido do cardápio");
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
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Cardápios</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Gerencie os cardápios do restaurante
                    </p>
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
                                        className={`cursor-pointer transition-all w-full border ${
                                            selectedMenu?.id === menu.id
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
                                        <h2 className="text-2xl font-bold">{selectedMenu.name}</h2>
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
                            <ScrollArea className="flex-1 overflow-y-auto">
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
                                            <p className="text-default-500 mb-2">Nenhum produto neste cardápio</p>
                                            <Button 
                                                size="sm" 
                                                variant="flat" 
                                                color="primary"
                                                startContent={<AddCircle size={18} weight="Outline" />}
                                                onPress={onAddProductModalOpen}
                                            >
                                                Adicionar Primeiro Produto
                                            </Button>
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
                                <Button color="primary" onPress={() => handleCreateMenu(onClose)}>
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
                                    Selecione os produtos que deseja adicionar
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <Input
                                    placeholder="Buscar produtos..."
                                    value={searchProduct}
                                    onValueChange={setSearchProduct}
                                    startContent={<Magnifer size={20} weight="Outline" />}
                                    className="mb-4"
                                />
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {availableProducts.map((product) => (
                                            <Card
                                                key={product.id}
                                                isPressable
                                                onPress={() => handleAddProduct(product)}
                                                className="hover:border-primary transition-colors"
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
                                                            <h3 className="text-sm font-semibold truncate">{product.name}</h3>
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
                                        ))}
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Fechar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
