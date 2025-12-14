import { Button, Card, CardBody, CardHeader, Chip, Image } from "@heroui/react";
import { ClipboardList } from "@solar-icons/react";
import { PenNewSquare } from "@solar-icons/react/ssr";

interface Garnish {
    id: string;
    name: string;
    price?: number;
    isRequired: boolean;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    garnishes: Garnish[];
    requiredGarnishesCount: number;
}

interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onViewDetails: (product: Product) => void;
}

const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, string> = {
        "bebidas": "Bebidas",
        "lanches": "Lanches",
        "pizzas": "Pizzas",
        "saladas": "Saladas",
        "marmitas": "Marmitas",
        "pratos": "Pratos",
    };
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
};

export function ProductCard({ product, onEdit, onViewDetails }: ProductCardProps) {
    return (
        <Card>
            <CardHeader className="p-0 relative">
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
                <Chip
                    size="sm"
                    color="primary"
                    variant="solid"
                    className="absolute top-2 left-2 z-10"
                >
                    {getCategoryLabel(product.category)}
                </Chip>
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
                            onPress={() => onEdit(product)}
                            startContent={<PenNewSquare size={20} weight="Outline" />}
                            className="flex-1"
                        >
                            Editar
                        </Button>
                        <Button 
                            size="sm" 
                            variant="flat" 
                            startContent={<ClipboardList size={20} weight="Outline" />}
                            onPress={() => onViewDetails(product)}
                        >
                            Ver Detalhes
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
