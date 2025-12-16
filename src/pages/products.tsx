
import { Button, Divider, Image, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Select, SelectItem, Spinner, useDisclosure } from "@heroui/react";
import { AddCircle, Archive, Magnifer } from "@solar-icons/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ProductCard } from "../components/products/ProductCard";
import { ScrollArea } from "../components/ui/scroll-area";
import type { Product, ProductsResponse } from "../types/products";


export function ProductsPage() {
    const navigate = useNavigate();
    const { tenantId } = useParams<{ tenantId: string }>();
    const restaurantId = "cmj6oymuh0001kv04uygl2c4z";
    const { isOpen: isDetailsModalOpen, onOpen: onDetailsModalOpen, onOpenChange: onDetailsModalOpenChange } = useDisclosure();
    const { isOpen: isArchiveModalOpen, onOpen: onArchiveModalOpen, onOpenChange: onArchiveModalOpenChange } = useDisclosure();

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    ''
    // Função para buscar produtos da API
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get<ProductsResponse>(
                `https://api.zapfood.shop/restaurants/${restaurantId}/products`,
                {
                    params: {
                        page: 1,
                        size: 1000, // Search all products for client-side pagination
                    },
                    headers: {
                        accept: "application/json",
                    },
                }
            );

            // Mapear produtos da API para o formato do componente
            const mappedProducts: Product[] = response.data.products.map((apiProduct) => {
                return {
                    id: apiProduct.id,
                    name: apiProduct.name,
                    description: apiProduct.description,
                    price: apiProduct.price,
                    category: apiProduct.category,
                    imageUrl: apiProduct.imageUrl,
                    restaurantId: apiProduct.restaurantId,
                    optionGroupIds: apiProduct.optionGroupIds || [],
                    createdAt: apiProduct.createdAt,
                    updatedAt: apiProduct.updatedAt,
                };
            });

            setProducts(mappedProducts);
            // setPaginationMeta(response.data.meta); // Not used for client-side pagination
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || error.message || "Erro ao buscar produtos";
                toast.error(errorMessage);
            } else {
                toast.error("Erro desconhecido ao buscar produtos");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Buscar produtos quando o componente montar
    useEffect(() => {
        fetchProducts();
    }, []); // Run only once

    const [sortBy, setSortBy] = useState<string>("category");

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedCategory]);

    // Filtrar e Ordenar produtos (Client Side)
    const filteredProducts = products
        .filter((product) => {
            const matchesSearch = search.trim() === "" ||
                product.name.toLowerCase().includes(search.toLowerCase()) ||
                product.description.toLowerCase().includes(search.toLowerCase());

            const matchesCategory = !selectedCategory || product.category === selectedCategory;

            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "category":
                    return a.category.localeCompare(b.category);
                case "name":
                    return a.name.localeCompare(b.name);
                case "price_asc":
                    return a.price - b.price;
                case "price_desc":
                    return b.price - a.price;
                default:
                    return 0;
            }
        });

    // Pagination Logic
    const itemsPerPage = 18;
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    // Get current page items
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleCreate = () => {
        navigate(`/${tenantId}/products/create`);
    };

    const handleEdit = (product: Product) => {
        navigate(`/${tenantId}/products/${product.id}/edit`, { state: { product } });
    };

    const handleViewDetails = (product: Product) => {
        setSelectedProduct(product);
        onDetailsModalOpen();
    };

    const handleArchive = (product: Product) => {
        setSelectedProduct(product);
        onArchiveModalOpen();
    };

    const handleConfirmArchive = async () => {
        if (!selectedProduct) return;

        // TODO: Integrate with backend archive endpoint
        toast.info(`Produto ${selectedProduct.name} arquivado (Simulação)`);
        onArchiveModalOpenChange();
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
                <Button color="primary" startContent={<AddCircle size={20} weight="Outline" />} onPress={handleCreate}>
                    Adicionar Produto
                </Button>
            </div>

            <Divider />

            {/* Filtros */}
            <div className="px-6 py-3 gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
                <Input
                    placeholder="Buscar produtos"
                    label="Buscar produtos"
                    value={search}
                    onValueChange={setSearch}
                    startContent={<Magnifer size={20} weight="Outline" />}
                    className="col-span-1"
                />
                <Select
                    placeholder="Categoria"
                    label="Categoria"
                    selectedKeys={selectedCategory ? [selectedCategory] : []}
                    onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setSelectedCategory(selected === "all" ? null : selected);
                    }}
                >
                    <SelectItem key="all">Todas as categorias</SelectItem>
                    <SelectItem key="lanches">Lanches</SelectItem>
                    <SelectItem key="bebidas">Bebidas</SelectItem>
                    <SelectItem key="bebidas_alcoolicas">Bebidas Alcoólicas</SelectItem>
                    <SelectItem key="sucos">Sucos</SelectItem>
                    <SelectItem key="pizzas">Pizzas</SelectItem>
                    <SelectItem key="saladas">Saladas</SelectItem>
                    <SelectItem key="marmitas">Marmitas</SelectItem>
                    <SelectItem key="pratos">Pratos</SelectItem>
                </Select>
                <Select
                    label="Ordenar por"
                    placeholder="Selecione..."
                    selectedKeys={[sortBy]}
                    onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        if (selected) setSortBy(selected);
                    }}
                >
                    <SelectItem key="category">Categorias</SelectItem>
                    <SelectItem key="name">Nome (A-Z)</SelectItem>
                    <SelectItem key="price_asc">Preço (Menor - Maior)</SelectItem>
                    <SelectItem key="price_desc">Preço (Maior - Menor)</SelectItem>
                </Select>
            </div>
            <Divider />

            {isLoading ? (
                <div className="flex flex-1 flex-col items-center justify-center p-12 h-full">
                    <Spinner size="lg" />
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
                    <p className="text-lg text-default-500">Nenhum produto encontrado</p>
                    <p className="text-sm text-default-400 mt-2">
                        {search || selectedCategory
                            ? "Tente ajustar os filtros de busca"
                            : "Comece adicionando seu primeiro produto"}
                    </p>
                </div>
            ) : (
                <ScrollArea className="flex flex-col grow h-0 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 p-6">
                        {paginatedProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onEdit={handleEdit}
                                onViewDetails={handleViewDetails}
                                onArchive={handleArchive}
                            />
                        ))}
                    </div>
                </ScrollArea>
            )}

            <Divider />

            <div className="flex justify-center px-6 py-3">
                <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={(page) => setCurrentPage(page)}
                />
            </div>

            {/* Modal de Detalhes do Produto */}
            <Modal
                isOpen={isDetailsModalOpen}
                onOpenChange={onDetailsModalOpenChange}
                size="3xl"
                backdrop="blur"
                scrollBehavior="inside"
            >
                <ModalContent className="!m-0">
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold">{selectedProduct?.name}</h2>
                            <p className="text-sm text-default-500">Detalhes do Produto</p>
                        </ModalHeader>
                        <ModalBody className="p-0">
                            <ScrollArea className="flex grow h-0 overflow-y-auto min-h-[80vh] max-h-[80vh] py-4 px-6">
                                {selectedProduct && (
                                    <div className="flex flex-1 flex-col gap-6">
                                        {/* Imagem */}
                                        {selectedProduct.imageUrl && (
                                            <div className="relative w-full aspect-square max-w-md mx-auto rounded-lg overflow-hidden border-2 border-default-200">
                                                <Image
                                                    src={selectedProduct.imageUrl}
                                                    alt={selectedProduct.name}
                                                    className="w-full h-full object-cover"
                                                    radius="none"
                                                />
                                            </div>
                                        )}

                                        {/* Informações Básicas */}
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <h3 className="text-sm font-semibold text-default-600 mb-2">Informações Básicas</h3>
                                                <div className="flex flex-col gap-2">
                                                    <div>
                                                        <span className="text-sm text-default-500">Nome:</span>
                                                        <p className="text-base font-medium">{selectedProduct.name}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm text-default-500">Descrição:</span>
                                                        <p className="text-base">{selectedProduct.description || "Sem descrição"}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm text-default-500">Preço:</span>
                                                        <p className="text-base font-semibold text-primary">R$ {selectedProduct.price.toFixed(2).replace(".", ",")}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm text-default-500">Categoria:</span>
                                                        <p className="text-base capitalize">{selectedProduct.category}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Grupos de Opções */}
                                            {selectedProduct.optionGroupIds && selectedProduct.optionGroupIds.length > 0 && (
                                                <div>
                                                    <h3 className="text-sm font-semibold text-default-600 mb-2">
                                                        Grupos de Opções ({selectedProduct.optionGroupIds.length})
                                                    </h3>
                                                    <p className="text-xs text-default-500 mb-3">
                                                        Este produto possui {selectedProduct.optionGroupIds.length} grupo{selectedProduct.optionGroupIds.length > 1 ? "s" : ""} de opções configurado{selectedProduct.optionGroupIds.length > 1 ? "s" : ""}.
                                                        {selectedProduct.optionGroupIds.length > 0 && (
                                                            <span className="block mt-2">
                                                                IDs: {selectedProduct.optionGroupIds.join(", ")}
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-default-400 italic">
                                                        Os detalhes dos grupos de opções serão exibidos quando o endpoint estiver disponível.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </ScrollArea>
                        </ModalBody>
                    </>
                </ModalContent>
            </Modal>


            {/* Modal de Arquivar Produto */}
            <Modal
                isOpen={isArchiveModalOpen}
                onOpenChange={onArchiveModalOpenChange}
                size="md"
                backdrop="blur"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Archive size={24} className="text-danger" />
                                    Arquivar Produto
                                </h2>
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-default-500">
                                    Tem certeza que deseja arquivar o produto <span className="font-semibold text-foreground">{selectedProduct?.name}</span>?
                                </p>
                                <p className="text-sm text-default-400">
                                    Esta ação não removerá o produto permanentemente, mas ele não aparecerá mais no catálogo.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="danger" onPress={handleConfirmArchive}>
                                    Arquivar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div >
    );
}
