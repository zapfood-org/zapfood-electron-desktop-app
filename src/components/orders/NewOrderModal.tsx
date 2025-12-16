import { Button, Divider, Image, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup, Select, SelectItem, Textarea } from "@heroui/react";
import { AddCircle, Magnifer, TrashBinTrash } from "@solar-icons/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { Product } from "../../types/products";
import { ScrollArea } from "../ui/scroll-area";
import type { Order } from "./OrderCard";

export interface OrderProduct {
    product: Product;
    quantity: number;
}

export interface NewOrderFormData {
    observation: string;
    customerName: string;
    customerPhone: string;
    address: string;
    deliveryType: "delivery" | "pickup" | "dine_in";
    table: string;
    command: string;
    products: OrderProduct[];
}

export interface NewOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateOrder: (formData: NewOrderFormData) => void;
    orderToEdit?: Order | null;
    onUpdateOrder?: (orderId: number, formData: NewOrderFormData) => void;
}

export function NewOrderModal({ isOpen, onClose, onCreateOrder, orderToEdit, onUpdateOrder }: NewOrderModalProps) {
    const restaurantId = "cmj6oymuh0001kv04uygl2c4z";
    const tableOptions = Array.from({ length: 30 }, (_, i) => (i + 1).toString());
    const commandOptions = Array.from({ length: 50 }, (_, i) => (i + 1).toString());

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [searchProduct, setSearchProduct] = useState("");
    const [formData, setFormData] = useState<NewOrderFormData>({
        observation: "",
        customerName: "",
        customerPhone: "",
        address: "",
        deliveryType: "delivery",
        table: "",
        command: "",
        products: [],
    });

    // Buscar produtos da API
    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    // Preencher formulário quando estiver editando
    useEffect(() => {
        if (orderToEdit && isOpen) {
            // Extrair observação da descrição (tudo após " - ")
            const descriptionParts = orderToEdit.description.split(" - ");
            const productsDescription = descriptionParts[0];
            const observation = descriptionParts.slice(1).join(" - ");

            // Tentar parsear produtos da descrição (formato: "2x Produto, 1x Outro")
            const productsList: OrderProduct[] = [];
            if (productsDescription && products.length > 0) {
                const items = productsDescription.split(", ");
                items.forEach((item) => {
                    const match = item.match(/^(\d+)x\s+(.+)$/);
                    if (match) {
                        const quantity = parseInt(match[1]);
                        const productName = match[2].trim();
                        const product = products.find((p) => p.name === productName);
                        if (product) {
                            productsList.push({ product, quantity });
                        }
                    }
                });
            }

            // Extrair mesa e comanda do endereço
            let table = "";
            let command = "";
            let address = orderToEdit.address;
            
            if (orderToEdit.deliveryType === "pickup" || orderToEdit.deliveryType === "dine_in") {
                const mesaMatch = orderToEdit.address.match(/Mesa\s+(\d+)/);
                const comandaMatch = orderToEdit.address.match(/Comanda\s+(\d+)/);
                if (mesaMatch) table = mesaMatch[1];
                if (comandaMatch) command = comandaMatch[1];
                if (orderToEdit.deliveryType === "dine_in" && !mesaMatch && !comandaMatch) {
                    address = "";
                }
            }

            setFormData({
                observation: observation || "",
                customerName: orderToEdit.customerName,
                customerPhone: orderToEdit.customerPhone === "Não informado" ? "" : orderToEdit.customerPhone,
                address: address,
                deliveryType: orderToEdit.deliveryType,
                table: table,
                command: command,
                products: productsList,
            });
        } else if (!orderToEdit && isOpen) {
            // Resetar formulário quando criar novo pedido
            setFormData({
                observation: "",
                customerName: "",
                customerPhone: "",
                address: "",
                deliveryType: "delivery",
                table: "",
                command: "",
                products: [],
            });
            setSearchProduct("");
        }
    }, [orderToEdit, isOpen, products]);

    const fetchProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const response = await axios.get(
                `https://api.zapfood.shop/restaurants/${restaurantId}/products`,
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

    const filteredProducts = products.filter((product) =>
        searchProduct.trim() === "" ||
        product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        product.description.toLowerCase().includes(searchProduct.toLowerCase())
    );

    const handleAddProduct = (product: Product) => {
        const existingProductIndex = formData.products.findIndex(
            (p) => p.product.id === product.id
        );

        if (existingProductIndex >= 0) {
            const updatedProducts = [...formData.products];
            updatedProducts[existingProductIndex].quantity += 1;
            setFormData((prev) => ({ ...prev, products: updatedProducts }));
        } else {
            setFormData((prev) => ({
                ...prev,
                products: [...prev.products, { product, quantity: 1 }],
            }));
        }
    };

    const handleRemoveProduct = (productId: string) => {
        setFormData((prev) => ({
            ...prev,
            products: prev.products.filter((p) => p.product.id !== productId),
        }));
    };

    const handleUpdateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            handleRemoveProduct(productId);
            return;
        }

        setFormData((prev) => ({
            ...prev,
            products: prev.products.map((p) =>
                p.product.id === productId ? { ...p, quantity } : p
            ),
        }));
    };

    const calculateTotal = () => {
        return formData.products.reduce(
            (total, orderProduct) =>
                total + orderProduct.product.price * orderProduct.quantity,
            0
        );
    };

    const handleCreateOrder = () => {
        // Validar campos obrigatórios
        if (!formData.customerName) {
            toast.error("Preencha o nome do cliente");
            return;
        }

        if (formData.products.length === 0) {
            toast.error("Adicione pelo menos um produto ao pedido");
            return;
        }

        if (formData.deliveryType === "delivery" && !formData.address) {
            toast.error("O endereço é obrigatório para entregas");
            return;
        }

        if (orderToEdit && onUpdateOrder) {
            // Modo de edição
            onUpdateOrder(orderToEdit.id, formData);
        } else {
            // Modo de criação
            onCreateOrder(formData);
        }

        // Resetar formulário
        setFormData({
            observation: "",
            customerName: "",
            customerPhone: "",
            address: "",
            deliveryType: "delivery",
            table: "",
            command: "",
            products: [],
        });
        setSearchProduct("");
        onClose();
    };

    const handleClose = () => {
        setFormData({
            observation: "",
            customerName: "",
            customerPhone: "",
            address: "",
            deliveryType: "delivery",
            table: "",
            command: "",
            products: [],
        });
        setSearchProduct("");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="full" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold">{orderToEdit ? "Editar Pedido" : "Novo Pedido"}</h2>
                    <p className="text-sm text-default-500 font-normal">
                        {orderToEdit ? "Edite os dados do pedido" : "Preencha os dados do pedido"}
                    </p>
                </ModalHeader>
                <Divider />
                <ModalBody className="flex flex-1 p-0 gap-0 overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] flex-1 h-full">
                        {/* Coluna 1: Dados do Pedido */}
                        <div className="col-span-1 flex flex-col gap-4 px-6 py-3 overflow-y-auto">
                            <h3 className="text-lg font-semibold">Dados do Pedido</h3>

                            {/* Informações do Cliente */}
                            <div className="flex flex-col gap-4">
                                <Input
                                    label="Nome do Cliente"
                                    placeholder="Ex: João Silva"
                                    value={formData.customerName}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({ ...prev, customerName: value }))
                                    }
                                    isRequired
                                />
                                <Input
                                    label="Telefone"
                                    placeholder="(11) 98765-4321"
                                    value={formData.customerPhone}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({ ...prev, customerPhone: value }))
                                    }
                                />
                            </div>

                            {/* Tipo de Entrega */}
                            <div className="flex flex-col gap-2">
                                <span className="text-sm text-default-600 font-medium">Tipo de Entrega</span>
                                <RadioGroup
                                    orientation="vertical"
                                    value={formData.deliveryType}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            deliveryType: value as "delivery" | "pickup" | "dine_in",
                                        }))
                                    }
                                    classNames={{ wrapper: "gap-2" }}
                                >
                                    <Radio value="delivery">Entrega</Radio>
                                    <Radio value="pickup">Retirada</Radio>
                                    <Radio value="dine_in">Consumo no local</Radio>
                                </RadioGroup>
                            </div>

                            {/* Endereço ou Mesa/Comanda */}
                            {formData.deliveryType === "delivery" && (
                                <Input
                                    label="Endereço"
                                    placeholder="Rua, número - Bairro"
                                    value={formData.address}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({ ...prev, address: value }))
                                    }
                                    isRequired={formData.deliveryType === "delivery"}
                                />
                            )}

                            {(formData.deliveryType === "pickup" || formData.deliveryType === "dine_in") && (
                                <div className="flex flex-col gap-4">
                                    <Select
                                        label="Mesa"
                                        aria-label="Mesa"
                                        placeholder="Selecione a mesa"
                                        selectedKeys={formData.table ? new Set([formData.table]) : new Set([])}
                                        onSelectionChange={(keys) => {
                                            const value = Array.from(keys)[0] as string;
                                            setFormData((prev) => ({ ...prev, table: value || "" }));
                                        }}
                                    >
                                        {tableOptions.map((table) => (
                                            <SelectItem key={table} textValue={`Mesa ${table}`}>
                                                Mesa {table}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Select
                                        label="Comanda"
                                        aria-label="Comanda"
                                        placeholder="Selecione a comanda"
                                        selectedKeys={formData.command ? new Set([formData.command]) : new Set([])}
                                        onSelectionChange={(keys) => {
                                            const value = Array.from(keys)[0] as string;
                                            setFormData((prev) => ({ ...prev, command: value || "" }));
                                        }}
                                    >
                                        {commandOptions.map((command) => (
                                            <SelectItem key={command} textValue={`Comanda ${command}`}>
                                                Comanda {command}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            )}

                            {/* Observação */}
                            <Textarea
                                label="Observação"
                                placeholder="Observações adicionais sobre o pedido"
                                value={formData.observation}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({ ...prev, observation: value }))
                                }
                                minRows={3}
                            />
                        </div>

                        <Divider orientation="vertical" />

                        {/* Coluna 2: Lista do Cardápio */}
                        <div className="col-span-1 flex flex-1 flex-col overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-3">
                                <h3 className="text-lg font-semibold">Cardápio</h3>
                            </div>

                            <Divider />

                            <div className="px-6 py-3">
                                {/* Busca de Produtos */}
                                <Input
                                    placeholder="Buscar produtos..."
                                    value={searchProduct}
                                    onValueChange={setSearchProduct}
                                    startContent={<Magnifer size={18} />}
                                />
                            </div>

                            <Divider />

                            {/* Lista de Produtos Disponíveis */}
                            <ScrollArea className="flex flex-1 flex-col h-0 rounded-lg px-6 py-3">
                                {isLoadingProducts ? (
                                    <div className="text-center text-default-500 py-4">Carregando produtos...</div>
                                ) : filteredProducts.length === 0 ? (
                                    <div className="text-center text-default-500 py-4">
                                        {searchProduct ? "Nenhum produto encontrado" : "Nenhum produto disponível"}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {filteredProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className="flex items-center gap-3 p-3 hover:bg-default-100 rounded-lg transition-colors cursor-pointer"
                                                onClick={() => handleAddProduct(product)}
                                            >
                                                {product.imageUrl ? (
                                                    <Image
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        width={60}
                                                        height={60}
                                                        className="object-cover rounded-lg flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-[60px] h-[60px] bg-default-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                        <span className="text-xs text-default-400">Sem imagem</span>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium">{product.name}</div>
                                                    <div className="text-sm text-default-500 line-clamp-2">
                                                        {product.description}
                                                    </div>
                                                    <div className="text-sm font-semibold text-primary mt-1">
                                                        R$ {product.price.toFixed(2).replace(".", ",")}
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    color="primary"
                                                    variant="flat"
                                                    startContent={<AddCircle size={16} weight="Outline" />}
                                                    onPress={() => handleAddProduct(product)}
                                                    className="flex-shrink-0"
                                                >
                                                    Adicionar
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                        <Divider orientation="vertical" />

                        {/* Coluna 3: Produtos Adicionados */}
                        <div className="col-span-1 flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-3">
                                <h3 className="text-lg font-semibold">Pedido</h3>
                                {formData.products.length > 0 && (
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-default-500">Total</span>
                                        <div className="text-lg font-bold text-primary">
                                            R$ {calculateTotal().toFixed(2).replace(".", ",")}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Divider />

                            {/* Lista de Produtos Adicionados */}
                            {formData.products.length === 0 ? (
                                <div className="flex flex-1 items-center justify-center text-center text-default-500 p-6">
                                    <div>
                                        <p className="text-sm">Nenhum produto adicionado</p>
                                        <p className="text-xs mt-2">Selecione produtos do cardápio para adicionar ao pedido.</p>
                                    </div>
                                </div>
                            ) : (
                                <ScrollArea className="flex flex-1 flex-col h-0 p-6">
                                    <div className="flex flex-col gap-3">
                                        {formData.products.map((orderProduct) => (
                                            <div
                                                key={orderProduct.product.id}
                                                className="flex items-center gap-3 p-3 bg-default-50 rounded-lg hover:bg-default-100 transition-colors"
                                            >
                                                {/* Imagem do Produto */}
                                                {orderProduct.product.imageUrl ? (
                                                    <Image
                                                        src={orderProduct.product.imageUrl}
                                                        alt={orderProduct.product.name}
                                                        width={60}
                                                        height={60}
                                                        className="object-cover rounded-lg flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-[60px] h-[60px] bg-default-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                        <span className="text-xs text-default-400">Sem imagem</span>
                                                    </div>
                                                )}

                                                {/* Informações do Produto */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">{orderProduct.product.name}</div>
                                                    <div className="text-sm text-default-500">
                                                        R$ {orderProduct.product.price.toFixed(2).replace(".", ",")} cada
                                                    </div>
                                                    <div className="text-xs text-default-400 mt-1">
                                                        Quantidade: {orderProduct.quantity}
                                                    </div>
                                                </div>

                                                {/* Controles e Preço */}
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="flat"
                                                            isIconOnly
                                                            className="min-w-8 h-8"
                                                            onPress={() =>
                                                                handleUpdateQuantity(
                                                                    orderProduct.product.id,
                                                                    orderProduct.quantity - 1
                                                                )
                                                            }
                                                        >
                                                            -
                                                        </Button>
                                                        <span className="w-8 text-center font-medium text-sm">
                                                            {orderProduct.quantity}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="flat"
                                                            isIconOnly
                                                            className="min-w-8 h-8"
                                                            onPress={() =>
                                                                handleUpdateQuantity(
                                                                    orderProduct.product.id,
                                                                    orderProduct.quantity + 1
                                                                )
                                                            }
                                                        >
                                                            +
                                                        </Button>
                                                    </div>
                                                    <div className="text-sm font-semibold text-primary">
                                                        R$ {(orderProduct.product.price * orderProduct.quantity)
                                                            .toFixed(2)
                                                            .replace(".", ",")}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        color="danger"
                                                        isIconOnly
                                                        className="min-w-8 h-8"
                                                        onPress={() => handleRemoveProduct(orderProduct.product.id)}
                                                    >
                                                        <TrashBinTrash size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>
                    </div>
                </ModalBody>
                <Divider />
                <ModalFooter>
                    <Button variant="light" onPress={handleClose}>
                        Cancelar
                    </Button>
                    <Button color="primary" onPress={handleCreateOrder} className="text-white">
                        {orderToEdit ? "Salvar Alterações" : "Criar Pedido"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
