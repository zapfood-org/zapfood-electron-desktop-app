
import { Button, Card, CardBody, CardHeader, Divider, Image, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Select, SelectItem, Spinner, useDisclosure } from "@heroui/react";
import { AddCircle, ClipboardList, Magnifer } from "@solar-icons/react";
import { PenNewSquare } from "@solar-icons/react/ssr";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ScrollArea } from "../components/ui/scroll-area";

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

interface ApiProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    restaurantId: string;
    createdAt: string;
    updatedAt: string;
    garnishClasses?: Array<{
        id: string;
        name: string;
        isRequired: boolean;
        items: Array<{
            id: string;
            name: string;
            price?: number;
        }>;
    }>;
}

interface ProductsResponse {
    products: ApiProduct[];
    meta: {
        totalItems: number;
        totalPages: number;
        page: number;
        size: number;
    };
}

export function ProductsPage() {
    const navigate = useNavigate();
    const { tenantId } = useParams<{ tenantId: string }>();
    const restaurantId = "cmj6b8z6b0000u4vsgfh8y9g6";
    const { isOpen: isDetailsModalOpen, onOpen: onDetailsModalOpen, onOpenChange: onDetailsModalOpenChange } = useDisclosure();
    
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [paginationMeta, setPaginationMeta] = useState<ProductsResponse["meta"]>({
        totalItems: 0,
        totalPages: 1,
        page: 1,
        size: 10,
    });

    // Função para buscar produtos da API
    const fetchProducts = async (page: number = 1) => {
        setIsLoading(true);
        try {
            const response = await axios.get<ProductsResponse>(
                `http://localhost:5000/restaurants/${restaurantId}/products`,
                {
                    params: {
                        page,
                        size: 10,
                    },
                    headers: {
                        accept: "application/json",
                    },
                }
            );

            // Mapear produtos da API para o formato do componente
            const mappedProducts: Product[] = response.data.products.map((apiProduct) => {
                // Converter garnishClasses para garnishes (formato antigo)
                const garnishes: Garnish[] = [];
                let requiredGarnishesCount = 0;

                if (apiProduct.garnishClasses) {
                    apiProduct.garnishClasses.forEach((garnishClass) => {
                        if (garnishClass.isRequired) {
                            requiredGarnishesCount++;
                        }
                        garnishClass.items.forEach((item) => {
                            garnishes.push({
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                isRequired: garnishClass.isRequired,
                            });
                        });
                    });
                }

                return {
                    id: apiProduct.id,
                    name: apiProduct.name,
                    description: apiProduct.description,
                    price: apiProduct.price,
                    category: apiProduct.category,
                    imageUrl: apiProduct.imageUrl,
                    garnishes,
                    requiredGarnishesCount,
                };
            });

            setProducts(mappedProducts);
            setPaginationMeta(response.data.meta);
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

    // Buscar produtos quando o componente montar ou quando a página mudar
    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage]);

    // Filtrar produtos localmente por busca e categoria
    const filteredProducts = products.filter((product) => {
        const matchesSearch = search.trim() === "" || 
            product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.description.toLowerCase().includes(search.toLowerCase());
        
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

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
                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <Spinner size="lg" />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <p className="text-lg text-default-500">Nenhum produto encontrado</p>
                        <p className="text-sm text-default-400 mt-2">
                            {search || selectedCategory 
                                ? "Tente ajustar os filtros de busca" 
                                : "Comece adicionando seu primeiro produto"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 p-6">
                        {filteredProducts.map((product) => (
                            <Card key={product.id}>
                                <CardHeader className="p-0">
                                    <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        width="100%"
                                        height="100%"
                                        radius="lg"
                                        className="object-cover aspect-square"
                                        fallbackSrc="https://picsum.photos/512/512"
                                        isBlurred
                                    />
                                </CardHeader>
                                <CardBody>
                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <h3 className="text-lg font-semibold truncate">{product.name}</h3>
                                            <p className="text-sm text-default-500 mt-1">R$ {product.price.toFixed(2).replace(".", ",")}</p>
                                            {product.garnishes.length > 0 && (
                                                <p className="text-xs text-default-400 mt-1">
                                                    {product.garnishes.length} guarnição{product.garnishes.length > 1 ? "ões" : ""}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-1 gap-2">
                                            <Button
                                                size="sm"
                                                variant="flat"
                                                onPress={() => handleEdit(product)}
                                                startContent={<PenNewSquare size={20} weight="Outline" />}
                                                className="flex-1"
                                            >
                                                Editar
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="flat" 
                                                startContent={<ClipboardList size={20} weight="Outline" />}
                                                onPress={() => handleViewDetails(product)}
                                            >
                                                Ver Detalhes
                                            </Button>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <Divider />

            <div className="flex justify-center px-6 py-3">
                <Pagination 
                    total={paginationMeta.totalPages} 
                    page={currentPage} 
                    onChange={(page) => setCurrentPage(page)} 
                />
            </div>

            {/* Modal de Detalhes do Produto */}
            <Modal 
                isOpen={isDetailsModalOpen} 
                onOpenChange={onDetailsModalOpenChange}
                size="2xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold">{selectedProduct?.name}</h2>
                                <p className="text-sm text-default-500">Detalhes do Produto</p>
                            </ModalHeader>
                            <ModalBody>
                                {selectedProduct && (
                                    <div className="flex flex-col gap-6">
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

                                            {/* Guarnições */}
                                            {selectedProduct.garnishes.length > 0 && (
                                                <div>
                                                    <h3 className="text-sm font-semibold text-default-600 mb-2">
                                                        Guarnições ({selectedProduct.garnishes.length})
                                                    </h3>
                                                    {selectedProduct.requiredGarnishesCount > 0 && (
                                                        <p className="text-xs text-default-500 mb-3">
                                                            {selectedProduct.requiredGarnishesCount} guarnição{selectedProduct.requiredGarnishesCount > 1 ? "ões" : ""} obrigatória{selectedProduct.requiredGarnishesCount > 1 ? "s" : ""}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-col gap-2">
                                                        {selectedProduct.garnishes.map((garnish) => (
                                                            <div 
                                                                key={garnish.id}
                                                                className="flex items-center justify-between p-3 rounded-lg bg-default-50 border border-default-200"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    {garnish.isRequired && (
                                                                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium">
                                                                            Obrigatória
                                                                        </span>
                                                                    )}
                                                                    <span className="text-sm font-medium">{garnish.name}</span>
                                                                </div>
                                                                {garnish.price && garnish.price > 0 && (
                                                                    <span className="text-sm font-semibold text-primary">
                                                                        + R$ {garnish.price.toFixed(2).replace(".", ",")}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Fechar
                                </Button>
                                <Button 
                                    color="primary" 
                                    onPress={() => {
                                        onClose();
                                        if (selectedProduct) {
                                            handleEdit(selectedProduct);
                                        }
                                    }}
                                >
                                    Editar Produto
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
