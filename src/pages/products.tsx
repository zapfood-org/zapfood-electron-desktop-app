
import { Button, Card, CardBody, CardHeader, Divider, Image, Input, Pagination, Select, SelectItem } from "@heroui/react";
import { AddCircle, ClipboardList, Magnifer } from "@solar-icons/react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ScrollArea } from "../components/ui/scroll-area";
import { PenNewSquare } from "@solar-icons/react/ssr";

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
    const navigate = useNavigate();
    const { tenantId } = useParams<{ tenantId: string }>();
    const [products] = useState<Product[]>([
        ...Array(18).fill(null).map((_, index) => ({
            id: `product-${index}`,
            name: `Produto ${index}`,
            description: `Descrição do produto ${index}`,
            price: index * 10,
            category: "lanches",
            imageUrl: `https://picsum.photos/seed/product-${index}/512/512`,
            garnishes: [],
            requiredGarnishesCount: 0,
        })),
    ]);

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleCreate = () => {
        navigate(`/${tenantId}/products/create`);
    };

    const handleEdit = (product: Product) => {
        navigate(`/${tenantId}/products/${product.id}/edit`, { state: { product } });
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4  p-6">
                    {products.map((product) => (
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
                                        <p className="text-sm text-default-500 mt-1">R$ {product.price.toFixed(2)}</p>
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
                                        <Button size="sm" variant="flat" startContent={<ClipboardList size={20} weight="Outline" />}>
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
        </div>
    );
}
