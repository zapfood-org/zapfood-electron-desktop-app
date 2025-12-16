import { Chip, Divider, Image, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, type ChipProps } from "@heroui/react";
import { Calendar, CheckCircle, ClockCircle, MapPoint, PhoneCalling, Shop, Wallet } from "@solar-icons/react";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import type { Product } from "../../types/products";
import { ScrollArea } from "../ui/scroll-area";
import type { Order } from "./OrderCard";

export interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export function OrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
    const restaurantId = "cmj6oymuh0001kv04uygl2c4z";
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    // Buscar produtos da API quando o modal abrir
    useEffect(() => {
        if (isOpen && order) {
            fetchProducts();
        }
    }, [isOpen, order]);

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
        } finally {
            setIsLoadingProducts(false);
        }
    };

    if (!order) return null;

    const formatTime = (date: moment.Moment) => date.format("DD/MM/YYYY HH:mm");
    const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;

    const getDeliveryTypeLabel = (type: string) => {
        switch (type) {
            case "delivery":
                return "Entrega";
            case "pickup":
                return "Retirada";
            case "dine_in":
                return "Consumo no local";
            default:
                return type;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "pending":
                return "Pendente";
            case "in_production":
                return "Em Produção";
            case "sending":
                return "Enviando";
            case "completed":
                return "Concluído";
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "warning";
            case "in_production":
                return "primary";
            case "sending":
                return "secondary";
            case "completed":
                return "success";
            default:
                return "default";
        }
    };

    // Parsear produtos da descrição e buscar informações completas
    const parseProducts = (description: string) => {
        const parts = description.split(" - ");
        const productsText = parts[0];
        const observation = parts.slice(1).join(" - ");

        const parsedProducts = productsText.split(", ").map((item) => {
            const match = item.match(/^(\d+)x\s+(.+)$/);
            if (match) {
                const quantity = parseInt(match[1]);
                const productName = match[2].trim();
                // Buscar produto completo na lista de produtos da API
                const productInfo = products.find((p) => p.name === productName);
                return {
                    quantity,
                    name: productName,
                    product: productInfo || null,
                };
            }
            const productInfo = products.find((p) => p.name === item.trim());
            return { 
                quantity: 1, 
                name: item.trim(),
                product: productInfo || null,
            };
        });

        return { products: parsedProducts, observation };
    };

    const { products: parsedProducts, observation } = parseProducts(order.description);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center justify-between w-full">
                        <h2 className="text-2xl font-bold">{order.name}</h2>
                        <Chip color={getStatusColor(order.status) as ChipProps["color"]} variant="flat" size="lg">
                            {getStatusLabel(order.status)}
                        </Chip>
                    </div>
                    <p className="text-sm text-default-500 font-normal">Detalhes do pedido</p>
                </ModalHeader>
                <Divider />
                <ScrollArea className="flex flex-grow flex-col h-[80vh] overflow-y-auto p-6">
                    <ModalBody className="flex flex-col p-0">
                        {/* Informações do Cliente */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-semibold">Informações do Cliente</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-default-500">Nome</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{order.customerName}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-default-500">Telefone</span>
                                    <div className="flex items-center gap-2">
                                        <PhoneCalling size={16} weight="Outline" className="text-default-400" />
                                        <span>{order.customerPhone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Tipo de Entrega e Endereço */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-semibold">Entrega</h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <Chip
                                        color={order.deliveryType === "delivery" ? "primary" : order.deliveryType === "dine_in" ? "success" : "secondary"}
                                        variant="flat"
                                    >
                                        {getDeliveryTypeLabel(order.deliveryType)}
                                    </Chip>
                                </div>
                                <div className="flex items-start gap-2">
                                    {order.deliveryType === "delivery" ? (
                                        <MapPoint size={20} weight="Outline" className="mt-0.5 flex-shrink-0 text-default-400" />
                                    ) : (
                                        <Shop size={20} weight="Outline" className="mt-0.5 flex-shrink-0 text-default-400" />
                                    )}
                                    <span className="text-default-700">{order.address}</span>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Produtos */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-semibold">Produtos</h3>
                            <div className="flex flex-col gap-2">
                                {isLoadingProducts ? (
                                    <div className="text-center text-default-500 py-4">Carregando produtos...</div>
                                ) : (
                                    parsedProducts.map((item, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-default-50 rounded-lg">
                                            {item.product?.imageUrl ? (
                                                <Image
                                                    src={item.product.imageUrl}
                                                    alt={item.name}
                                                    width={60}
                                                    height={60}
                                                    className="object-cover rounded-lg flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-[60px] h-[60px] bg-default-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                    <span className="text-xs text-default-400">Sem imagem</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                                    <span className="text-sm font-semibold text-primary">{item.quantity}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-medium">{item.name}</span>
                                                    {item.product && (
                                                        <div className="text-sm text-default-500">
                                                            R$ {item.product.price.toFixed(2).replace(".", ",")} cada
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {observation && (
                                <div className="mt-2 p-3 bg-default-50 rounded-lg">
                                    <span className="text-sm text-default-500">Observação: </span>
                                    <span className="text-sm">{observation}</span>
                                </div>
                            )}
                        </div>

                        <Divider />

                        {/* Informações de Pagamento */}
                        {order.isPaid && (
                            <>
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Wallet size={20} weight="Outline" />
                                        Informações de Pagamento
                                    </h3>
                                    <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle size={20} weight="Outline" className="text-success" />
                                            <span className="font-semibold text-success">Pedido Pago</span>
                                        </div>
                                        <div className="flex flex-col gap-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-default-600">Valor Total:</span>
                                                <span className="font-semibold text-success">{formatCurrency(order.total)}</span>
                                            </div>
                                            {order.completedAt && (
                                                <div className="flex justify-between">
                                                    <span className="text-default-600">Data do Pagamento:</span>
                                                    <span>{formatTime(order.completedAt)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Divider />
                            </>
                        )}

                        {/* Timeline do Pedido */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-semibold">Histórico</h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                    <div className="flex-1">
                                        <div className="font-medium">Pedido Criado</div>
                                        <div className="text-sm text-default-500 flex items-center gap-1">
                                            <Calendar size={14} weight="Outline" />
                                            {formatTime(order.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                {order.acceptedAt && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                        <div className="flex-1">
                                            <div className="font-medium">Pedido Aceito / Em Produção</div>
                                            <div className="text-sm text-default-500 flex items-center gap-1">
                                                <ClockCircle size={14} weight="Outline" />
                                                {formatTime(order.acceptedAt)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {order.completedAt && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-success mt-2" />
                                        <div className="flex-1">
                                            <div className="font-medium">Pedido Concluído</div>
                                            <div className="text-sm text-default-500 flex items-center gap-1">
                                                <CheckCircle size={14} weight="Outline" />
                                                {formatTime(order.completedAt)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Divider />

                        {/* Resumo Financeiro */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-semibold">Resumo</h3>
                            <div className="p-4 bg-default-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">Total do Pedido</span>
                                    <span className="text-2xl font-bold text-primary">{formatCurrency(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                </ScrollArea>
                <Divider />
                <ModalFooter>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-default-600 hover:text-default-800 font-medium"
                    >
                        Fechar
                    </button>
                </ModalFooter>
            </ModalContent>
        </Modal >
    );
}
