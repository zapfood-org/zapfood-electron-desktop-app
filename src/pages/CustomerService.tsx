
import { Avatar, Button, Chip, Divider, Input } from "@heroui/react";
import { Magnifer, PhoneCalling, Plain2, Shop } from "@solar-icons/react";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "../components/ui/scroll-area";

export type MessageChannel = "whatsapp" | "menu";

export interface Message {
    id: string;
    text: string;
    sender: "customer" | "support";
    channel: MessageChannel;
    timestamp: string;
    customerName?: string;
    customerPhone?: string;
    isRead: boolean;
}

export interface Conversation {
    id: string;
    customerName: string;
    customerPhone?: string;
    channel: MessageChannel;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    avatar?: string;
    messages: Message[];
}

const mockConversations: Conversation[] = [
    {
        id: "1",
        customerName: "Maria Silva",
        customerPhone: "(11) 98765-4321",
        channel: "whatsapp",
        lastMessage: "Olá, gostaria de saber sobre o status do meu pedido",
        lastMessageTime: moment().subtract(5, "minutes").toISOString(),
        unreadCount: 2,
        messages: [
            {
                id: "m1",
                text: "Olá, gostaria de fazer um pedido",
                sender: "customer",
                channel: "whatsapp",
                timestamp: moment().subtract(30, "minutes").toISOString(),
                customerName: "Maria Silva",
                customerPhone: "(11) 98765-4321",
                isRead: true,
            },
            {
                id: "m2",
                text: "Olá Maria! Claro, como posso ajudá-la hoje?",
                sender: "support",
                channel: "whatsapp",
                timestamp: moment().subtract(28, "minutes").toISOString(),
                isRead: true,
            },
            {
                id: "m3",
                text: "Gostaria de pedir uma pizza grande",
                sender: "customer",
                channel: "whatsapp",
                timestamp: moment().subtract(25, "minutes").toISOString(),
                customerName: "Maria Silva",
                isRead: true,
            },
            {
                id: "m4",
                text: "Perfeito! Qual sabor você prefere?",
                sender: "support",
                channel: "whatsapp",
                timestamp: moment().subtract(24, "minutes").toISOString(),
                isRead: true,
            },
            {
                id: "m5",
                text: "Olá, gostaria de saber sobre o status do meu pedido",
                sender: "customer",
                channel: "whatsapp",
                timestamp: moment().subtract(5, "minutes").toISOString(),
                customerName: "Maria Silva",
                isRead: false,
            },
        ],
    },
    {
        id: "2",
        customerName: "João Santos",
        channel: "menu",
        lastMessage: "Obrigado pelo atendimento!",
        lastMessageTime: moment().subtract(1, "hour").toISOString(),
        unreadCount: 0,
        messages: [
            {
                id: "m6",
                text: "Preciso de ajuda para fazer um pedido pelo cardápio digital",
                sender: "customer",
                channel: "menu",
                timestamp: moment().subtract(2, "hours").toISOString(),
                customerName: "João Santos",
                isRead: true,
            },
            {
                id: "m7",
                text: "Olá João! Estou aqui para ajudá-lo. O que você gostaria de pedir?",
                sender: "support",
                channel: "menu",
                timestamp: moment().subtract(2, "hours").toISOString(),
                isRead: true,
            },
            {
                id: "m8",
                text: "Obrigado pelo atendimento!",
                sender: "customer",
                channel: "menu",
                timestamp: moment().subtract(1, "hour").toISOString(),
                customerName: "João Santos",
                isRead: true,
            },
        ],
    },
    {
        id: "3",
        customerName: "Ana Costa",
        customerPhone: "(11) 91234-5678",
        channel: "whatsapp",
        lastMessage: "Quanto tempo demora a entrega?",
        lastMessageTime: moment().subtract(15, "minutes").toISOString(),
        unreadCount: 1,
        messages: [
            {
                id: "m9",
                text: "Quanto tempo demora a entrega?",
                sender: "customer",
                channel: "whatsapp",
                timestamp: moment().subtract(15, "minutes").toISOString(),
                customerName: "Ana Costa",
                customerPhone: "(11) 91234-5678",
                isRead: false,
            },
        ],
    },
];

export function CustomerServicePage() {
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0] || null);
    const [searchQuery, setSearchQuery] = useState("");
    const [messageText, setMessageText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const filteredConversations = conversations.filter((conv) => {
        const query = searchQuery.toLowerCase();
        return (
            conv.customerName.toLowerCase().includes(query) ||
            conv.customerPhone?.toLowerCase().includes(query) ||
            conv.lastMessage.toLowerCase().includes(query)
        );
    });

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        // Marcar mensagens como lidas
        const updatedConversations = conversations.map((conv) => {
            if (conv.id === conversation.id) {
                return {
                    ...conv,
                    unreadCount: 0,
                    messages: conv.messages.map((msg) => ({ ...msg, isRead: true })),
                };
            }
            return conv;
        });
        setConversations(updatedConversations);
    };

    const handleSendMessage = () => {
        if (!messageText.trim() || !selectedConversation) return;

        const newMessage: Message = {
            id: `m${Date.now()}`,
            text: messageText.trim(),
            sender: "support",
            channel: selectedConversation.channel,
            timestamp: moment().toISOString(),
            isRead: true,
        };

        const updatedConversations = conversations.map((conv) => {
            if (conv.id === selectedConversation.id) {
                return {
                    ...conv,
                    lastMessage: newMessage.text,
                    lastMessageTime: newMessage.timestamp,
                    messages: [...conv.messages, newMessage],
                };
            }
            return conv;
        });

        setConversations(updatedConversations);
        setSelectedConversation({
            ...selectedConversation,
            messages: [...selectedConversation.messages, newMessage],
            lastMessage: newMessage.text,
            lastMessageTime: newMessage.timestamp,
        });
        setMessageText("");
    };

    const formatTime = (timestamp: string) => {
        const messageDate = moment(timestamp);
        const now = moment();

        if (messageDate.isSame(now, "day")) {
            return messageDate.format("HH:mm");
        } else if (messageDate.isSame(now.clone().subtract(1, "day"), "day")) {
            return "Ontem";
        } else {
            return messageDate.format("DD/MM/YYYY");
        }
    };

    const getChannelIcon = (channel: MessageChannel) => {
        return channel === "whatsapp" ? (
            <PhoneCalling size={16} weight="Outline" />
        ) : (
            <Shop size={16} weight="Outline" />
        );
    };

    const getChannelLabel = (channel: MessageChannel) => {
        return channel === "whatsapp" ? "WhatsApp" : "Cardápio Digital";
    };

    const getChannelColor = (channel: MessageChannel) => {
        return channel === "whatsapp" ? "success" : "primary";
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedConversation?.messages]);

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Atendimento</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Chat de atendimento ao cliente
                    </p>
                </div>
            </div>

            <Divider />

            <div className="flex flex-1 overflow-hidden">
                {/* Lista de Conversas */}
                <div className="w-96 flex flex-col">
                    <div className="p-4">
                        <Input
                            placeholder="Buscar conversas..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            startContent={<Magnifer size={18} weight="Outline" />}
                            size="md"
                        />
                    </div>

                    <Divider />

                    <ScrollArea className="flex flex-col grow h-0 overflow-y-auto">
                        <div className="flex flex-col">
                            {filteredConversations.length === 0 ? (
                                <div className="p-6 text-center text-sm text-default-500">
                                    Nenhuma conversa encontrada
                                </div>
                            ) : (
                                filteredConversations.map((conversation) => {
                                    const isSelected = selectedConversation?.id === conversation.id;
                                    return (
                                        <div
                                            key={conversation.id}
                                            onClick={() => handleSelectConversation(conversation)}
                                            className={`
                                                flex items-center gap-3 p-4 cursor-pointer transition-colors
                                                ${isSelected ? "bg-primary/10" : "hover:bg-default-100"}
                                            `}
                                        >
                                            <Avatar
                                                src={conversation.avatar}
                                                name={conversation.customerName}
                                                size="md"
                                                className="flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <span className="font-semibold text-sm truncate">
                                                        {conversation.customerName}
                                                    </span>
                                                    <span className="text-xs text-default-400 flex-shrink-0">
                                                        {formatTime(conversation.lastMessageTime)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        color={getChannelColor(conversation.channel)}
                                                        startContent={getChannelIcon(conversation.channel)}
                                                    >
                                                        {getChannelLabel(conversation.channel)}
                                                    </Chip>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs text-default-500 truncate">
                                                        {conversation.lastMessage}
                                                    </p>
                                                    {conversation.unreadCount > 0 && (
                                                        <div className="flex-shrink-0 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                            {conversation.unreadCount}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <Divider orientation="vertical" />

                {/* Área de Chat */}
                <div className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Header do Chat */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        src={selectedConversation.avatar}
                                        name={selectedConversation.customerName}
                                        size="md"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{selectedConversation.customerName}</h3>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color={getChannelColor(selectedConversation.channel)}
                                                startContent={getChannelIcon(selectedConversation.channel)}
                                            >
                                                {getChannelLabel(selectedConversation.channel)}
                                            </Chip>
                                        </div>
                                        {selectedConversation.customerPhone && (
                                            <p className="text-xs text-default-500">
                                                {selectedConversation.customerPhone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Divider />

                            {/* Mensagens */}
                            <ScrollArea className="flex-1 p-4">
                                <div className="flex flex-col gap-3">
                                    {selectedConversation.messages.map((message) => {
                                        const isSupport = message.sender === "support";
                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${isSupport ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`
                                                        max-w-[70%] rounded-2xl px-4 py-2
                                                        ${isSupport
                                                            ? "bg-primary text-white rounded-tr-sm"
                                                            : "bg-default-100 text-default-900 rounded-tl-sm"
                                                        }
                                                    `}
                                                >
                                                    {!isSupport && message.customerName && (
                                                        <div className="text-xs font-semibold mb-1 opacity-80">
                                                            {message.customerName}
                                                        </div>
                                                    )}
                                                    <p className="text-sm whitespace-pre-wrap break-words">
                                                        {message.text}
                                                    </p>
                                                    <div className={`text-xs mt-1 ${isSupport ? "text-white/70" : "text-default-500"}`}>
                                                        {formatTime(message.timestamp)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            <Divider />

                            {/* Input de Mensagem */}
                            <div className="p-4">
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Digite uma mensagem..."
                                        value={messageText}
                                        onValueChange={setMessageText}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        classNames={{
                                            input: "text-sm",
                                        }}
                                    />
                                    <Button
                                        color="primary"
                                        isIconOnly
                                        onPress={handleSendMessage}
                                        isDisabled={!messageText.trim()}
                                    >
                                        <Plain2 size={20} weight="Outline" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-center p-12">
                            <div>
                                <p className="text-lg text-default-500 mb-2">
                                    Selecione uma conversa para começar
                                </p>
                                <p className="text-sm text-default-400">
                                    Escolha uma conversa da lista ao lado para visualizar e responder às mensagens
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}