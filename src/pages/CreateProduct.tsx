
import { Button, Card, CardBody, Checkbox, Chip, Divider, Image, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Select, SelectItem, Slider, Textarea, useDisclosure } from "@heroui/react";
import { AddCircle, ArrowLeft, CheckCircle, Gallery, TrashBinTrash } from "@solar-icons/react";
import { api, restaurantId } from "../services/api";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Cropper, CropperCropArea, CropperDescription, CropperImage } from "../components/shadcn/ui/cropper";
import { ScrollArea } from "../components/ui/scroll-area";

interface OptionItem {
    id: string;
    name: string;
    price?: number;
}

interface OptionGroup {
    id: string;
    name: string;
    isRequired: boolean;
    minSelections: number;
    maxSelections: number;
    items: OptionItem[];
}

interface ProductFormData {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    optionGroups: OptionGroup[];
}

export function CreateProductPage() {
    const navigate = useNavigate();
    const { tenantId } = useParams<{ tenantId: string }>();
    const { isOpen: isCropModalOpen, onOpen: onCropModalOpen, onOpenChange: onCropModalOpenChange } = useDisclosure();
    const { isOpen: isExitModalOpen, onOpen: onExitModalOpen, onOpenChange: onExitModalOpenChange } = useDisclosure();
    const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        description: "",
        price: 0,
        category: "",
        imageUrl: "",
        optionGroups: [],
    });
    const [priceInput, setPriceInput] = useState<string>("");

    // Função para converter string com vírgula para número
    const parsePrice = (value: string): number => {
        if (!value || value.trim() === "") return 0;
        // Substituir vírgula por ponto e converter para número
        const normalized = value.replace(",", ".");
        const parsed = parseFloat(normalized);
        return isNaN(parsed) ? 0 : parsed;
    };

    // Função para formatar número para string com vírgula
    const formatPrice = (value: number): string => {
        if (value === 0) return "";
        return value.toFixed(2).replace(".", ",");
    };

    const [newOptionGroupName, setNewOptionGroupName] = useState("");
    const [newOptionGroupRequired, setNewOptionGroupRequired] = useState(false);
    const [newOptionGroupMin, setNewOptionGroupMin] = useState<number>(0);
    const [newOptionGroupMax, setNewOptionGroupMax] = useState<number>(1);
    const [newOptionItemName, setNewOptionItemName] = useState("");
    const [newOptionItemPrice, setNewOptionItemPrice] = useState<number>(0);
    const [newOptionItemPriceInput, setNewOptionItemPriceInput] = useState<string>("");
    const [selectedOptionGroupId, setSelectedOptionGroupId] = useState<string>("");
    const [originalImageUrl, setOriginalImageUrl] = useState<string>("");
    const [zoom, setZoom] = useState(1);
    const [cropData, setCropData] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddOptionGroup = () => {
        if (!newOptionGroupName.trim()) return;

        const minSelections = newOptionGroupRequired ? 1 : newOptionGroupMin;
        const maxSelections = newOptionGroupMax;

        const newOptionGroup: OptionGroup = {
            id: Date.now().toString(),
            name: newOptionGroupName,
            isRequired: newOptionGroupRequired,
            minSelections,
            maxSelections,
            items: [],
        };

        setFormData({
            ...formData,
            optionGroups: [...formData.optionGroups, newOptionGroup],
        });

        setNewOptionGroupName("");
        setNewOptionGroupRequired(false);
        setNewOptionGroupMin(0);
        setNewOptionGroupMax(1);
        setSelectedOptionGroupId(newOptionGroup.id);
    };

    const handleRemoveOptionGroup = (groupId: string) => {
        setFormData({
            ...formData,
            optionGroups: formData.optionGroups.filter((og) => og.id !== groupId),
        });
        if (selectedOptionGroupId === groupId) {
            setSelectedOptionGroupId("");
        }
    };

    const handleToggleOptionGroupRequired = (groupId: string) => {
        setFormData({
            ...formData,
            optionGroups: formData.optionGroups.map((og) => {
                if (og.id === groupId) {
                    const isRequired = !og.isRequired;
                    return {
                        ...og,
                        isRequired,
                        minSelections: isRequired ? 1 : og.minSelections,
                    };
                }
                return og;
            }),
        });
    };

    const handleUpdateOptionGroupLimits = (groupId: string, min: number, max: number) => {
        setFormData({
            ...formData,
            optionGroups: formData.optionGroups.map((og) => {
                if (og.id === groupId) {
                    const itemsCount = og.items.length;
                    const minSelections = og.isRequired ? Math.max(1, min) : min;
                    const maxSelections = Math.min(max, itemsCount || 1);
                    return {
                        ...og,
                        minSelections,
                        maxSelections,
                    };
                }
                return og;
            }),
        });
    };

    const handleAddOptionItem = (groupId: string) => {
        if (!newOptionItemName.trim() || !groupId) return;

        const newOptionItem: OptionItem = {
            id: Date.now().toString(),
            name: newOptionItemName,
            price: newOptionItemPrice > 0 ? newOptionItemPrice : undefined,
        };

        setFormData({
            ...formData,
            optionGroups: formData.optionGroups.map((og) => {
                if (og.id === groupId) {
                    const updatedItems = [...og.items, newOptionItem];
                    const itemsCount = updatedItems.length;
                    return {
                        ...og,
                        items: updatedItems,
                        maxSelections: Math.min(og.maxSelections, itemsCount),
                    };
                }
                return og;
            }),
        });

        if (selectedOptionGroupId === groupId) {
            setNewOptionItemName("");
            setNewOptionItemPrice(0);
            setNewOptionItemPriceInput("");
        }
    };

    const handleRemoveOptionItem = (groupId: string, itemId: string) => {
        setFormData({
            ...formData,
            optionGroups: formData.optionGroups.map((og) => {
                if (og.id === groupId) {
                    const updatedItems = og.items.filter((item) => item.id !== itemId);
                    const itemsCount = updatedItems.length;
                    return {
                        ...og,
                        items: updatedItems,
                        maxSelections: Math.min(og.maxSelections, itemsCount || 1),
                    };
                }
                return og;
            }),
        });
    };

    const processFile = (file: File) => {
        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            toast.error("Por favor, selecione um arquivo de imagem");
            return;
        }

        // Validar tamanho (máximo 25MB)
        if (file.size > 25 * 1024 * 1024) {
            toast.error("A imagem deve ter no máximo 25MB");
            return;
        }

        // Converter para base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setFormData(prev => ({ ...prev, imageUrl: base64String }));
        };
        reader.onerror = () => {
            toast.error("Erro ao carregar a imagem");
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const handleRemoveImage = () => {
        setFormData({ ...formData, imageUrl: "" });
        setOriginalImageUrl("");
        setZoom(1);
        setCropData(null);
        // Resetar o input de arquivo para permitir selecionar o mesmo arquivo novamente
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleOpenCropModal = () => {
        if (!formData.imageUrl) {
            toast.warning("Selecione uma imagem primeiro");
            return;
        }
        setOriginalImageUrl(formData.imageUrl);
        setZoom(1);
        setCropData(null);
        onCropModalOpen();
    };

    const handleApplyCrop = async () => {
        if (!originalImageUrl || !cropData) {
            toast.error("Nenhuma área de corte selecionada");
            return;
        }

        try {
            // Validar dados do crop
            if (cropData.width <= 0 || cropData.height <= 0) {
                throw new Error("Área de corte inválida");
            }

            // Criar uma nova imagem a partir da URL original
            const img = document.createElement("img");
            img.crossOrigin = "anonymous";

            // Aguardar a imagem carregar
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error("Timeout ao carregar a imagem"));
                }, 10000);

                img.onload = () => {
                    clearTimeout(timeout);
                    resolve();
                };
                img.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error("Erro ao carregar a imagem"));
                };
                img.src = originalImageUrl;
            });

            // Usar diretamente as coordenadas do crop (já estão relativas ao tamanho natural da imagem)
            const cropX = Math.floor(cropData.x);
            const cropY = Math.floor(cropData.y);
            const cropWidth = Math.floor(cropData.width);
            const cropHeight = Math.floor(cropData.height);

            // Validação final de limites
            if (
                cropWidth <= 0 ||
                cropHeight <= 0 ||
                cropX < 0 ||
                cropY < 0 ||
                cropX + cropWidth > img.naturalWidth ||
                cropY + cropHeight > img.naturalHeight
            ) {
                // Pequena tolerância para erros de arredondamento se necessário, ou apenas clamp
                // Mas como vem do componente, deve estar certo. Vamos logar se estiver errado.
                console.warn("Crop fora dos limites:", { cropX, cropY, cropWidth, cropHeight, natural: { w: img.naturalWidth, h: img.naturalHeight } });
            }

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                throw new Error("Não foi possível criar o contexto do canvas");
            }

            // Configurar o canvas com as dimensões do crop
            canvas.width = cropWidth;
            canvas.height = cropHeight;

            // Desenhar a parte cortada da imagem
            ctx.drawImage(
                img,
                cropX,
                cropY,
                cropWidth,
                cropHeight,
                0,
                0,
                cropWidth,
                cropHeight
            );

            // Converter para base64
            const croppedBase64 = canvas.toDataURL("image/png");

            if (!croppedBase64 || croppedBase64 === "data:,") {
                throw new Error("Falha ao gerar a imagem cortada");
            }

            setFormData({ ...formData, imageUrl: croppedBase64 });

            toast.success("Imagem cortada com sucesso!");
        } catch (error) {
            console.error("Erro ao cortar imagem:", error);
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            toast.error(`Erro ao processar a imagem cortada: ${errorMessage}`);
        }
    };

    const handleApplyCropWithClose = async (onClose: () => void) => {
        await handleApplyCrop();
        onClose();
    };

    const handleCancelCropWithClose = (onClose: () => void) => {
        setZoom(1);
        setCropData(null);
        onClose();
    };

    const [isSaving, setIsSaving] = useState(false);

    // Verificar se há dados no formulário
    const hasFormData = () => {
        return (
            formData.name.trim() !== "" ||
            formData.description.trim() !== "" ||
            formData.price > 0 ||
            formData.category !== "" ||
            formData.imageUrl !== "" ||
            formData.optionGroups.length > 0
        );
    };

    // Salvar rascunho no localStorage
    const saveDraft = () => {
        const draftKey = `product-draft-${tenantId}`;
        try {
            localStorage.setItem(draftKey, JSON.stringify(formData));
            toast.success("Rascunho salvo com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar rascunho:", error);
            toast.error("Erro ao salvar rascunho");
        }
    };

    // Carregar rascunho do localStorage
    const loadDraft = () => {
        const draftKey = `product-draft-${tenantId}`;
        try {
            const draft = localStorage.getItem(draftKey);
            if (draft) {
                const parsedDraft = JSON.parse(draft);
                setFormData(parsedDraft);
                if (parsedDraft.price > 0) {
                    setPriceInput(formatPrice(parsedDraft.price));
                }
                toast.info("Rascunho carregado. Deseja continuar?");
            }
        } catch (error) {
            console.error("Erro ao carregar rascunho:", error);
        }
    };

    // Limpar rascunho do localStorage
    const clearDraft = () => {
        const draftKey = `product-draft-${tenantId}`;
        localStorage.removeItem(draftKey);
    };

    // Carregar rascunho ao montar o componente
    useEffect(() => {
        loadDraft();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.category || formData.price <= 0) {
            toast.error("Por favor, preencha todos os campos obrigatórios");
            return;
        }

        if (!tenantId) {
            toast.error("ID do restaurante não encontrado");
            return;
        }

        setIsSaving(true);

        try {
            // Mapear os dados para o formato da API
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim() || "",
                price: formData.price,
                category: formData.category,
                imageUrl: formData.imageUrl || "",
                restaurantId: restaurantId,
                optionGroups: formData.optionGroups.map((optionGroup) => ({
                    name: optionGroup.name,
                    isRequired: optionGroup.isRequired,
                    minSelections: optionGroup.minSelections,
                    maxSelections: optionGroup.maxSelections,
                    items: optionGroup.items.map((item) => ({
                        name: item.name,
                        price: item.price || 0,
                    })),
                })),
            };

            await api.post("/products", payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            toast.success("Produto criado com sucesso!");

            // Limpar rascunho após salvar com sucesso
            clearDraft();

            navigate(`/${tenantId}/products`);
        } catch (error) {
            console.error("Erro ao criar produto:", error);
            if (error) {
                // @ts-ignore
                const errorMessage = error.response?.data?.message || error.message || "Erro ao criar produto";
                toast.error(errorMessage);
            } else {
                const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao criar produto";
                toast.error(errorMessage);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (hasFormData()) {
            setPendingNavigation(() => () => {
                clearDraft();
                navigate(`/${tenantId}/products`);
            });
            onExitModalOpen();
        } else {
            navigate(`/${tenantId}/products`);
        }
    };

    const handleSaveDraftAndExit = () => {
        saveDraft();
        if (pendingNavigation) {
            pendingNavigation();
            setPendingNavigation(null);
        }
        onExitModalOpenChange();
    };

    const handleDiscardAndExit = () => {
        clearDraft();
        if (pendingNavigation) {
            pendingNavigation();
            setPendingNavigation(null);
        }
        onExitModalOpenChange();
    };

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center gap-4 p-6">
                <Button
                    isIconOnly
                    variant="light"
                    onPress={handleCancel}
                    aria-label="Voltar"
                >
                    <ArrowLeft size={20} weight="Outline" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">Adicionar Produto</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Preencha os dados do novo produto
                    </p>
                </div>
            </div>

            <Divider />

            <ScrollArea className="flex flex-col grow h-0 overflow-y-auto">
                <div className="flex flex-col gap-4 p-6 max-w-4xl mx-auto w-full">
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
                        <Input
                            label="Preço"
                            placeholder="0,00"
                            value={priceInput || formatPrice(formData.price)}
                            onValueChange={(value) => {
                                // Remover tudo exceto números, vírgula e ponto
                                let cleaned = value.replace(/[^\d,.]/g, "");

                                // Se tiver ponto, converter para vírgula (formato brasileiro)
                                cleaned = cleaned.replace(/\./g, ",");

                                // Garantir apenas uma vírgula
                                const commaIndex = cleaned.indexOf(",");
                                if (commaIndex !== -1) {
                                    // Tem vírgula: manter apenas a primeira e limitar decimais a 2
                                    const beforeComma = cleaned.substring(0, commaIndex);
                                    const afterComma = cleaned.substring(commaIndex + 1).replace(/,/g, "").substring(0, 2);
                                    cleaned = beforeComma + "," + afterComma;
                                }

                                setPriceInput(cleaned);
                                const parsedPrice = parsePrice(cleaned);
                                setFormData({ ...formData, price: parsedPrice });
                            }}
                            startContent={
                                <span className="text-default-500">R$</span>
                            }
                            type="text"
                            inputMode="decimal"
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
                            <SelectItem key="bebidas_alcoolicas">Bebidas Alcoólicas</SelectItem>
                            <SelectItem key="sucos">Sucos</SelectItem>
                            <SelectItem key="lanches">Lanches</SelectItem>
                            <SelectItem key="pizzas">Pizzas</SelectItem>
                            <SelectItem key="saladas">Saladas</SelectItem>
                            <SelectItem key="marmitas">Marmitas</SelectItem>
                            <SelectItem key="pratos">Pratos</SelectItem>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-foreground">
                            Imagem do Produto
                        </label>

                        {formData.imageUrl ? (
                            <div className="relative">
                                <div className="relative w-full aspect-square max-w-xs mx-auto rounded-lg overflow-hidden border-2 border-default-200">
                                    <Image
                                        src={formData.imageUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        radius="none"
                                    />
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        color="danger"
                                        variant="solid"
                                        className="absolute top-2 right-2 z-50"
                                        onPress={handleRemoveImage}
                                        aria-label="Remover imagem"
                                    >
                                        <TrashBinTrash size={16} weight="Outline" />
                                    </Button>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        color="primary"
                                        variant="solid"
                                        className="absolute bottom-2 left-2 z-50"
                                        onPress={handleOpenCropModal}
                                        aria-label="Editar corte"
                                    >
                                        <Gallery size={16} weight="Outline" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`
                                    flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-all cursor-pointer group
                                    ${isDragging
                                        ? "border-primary bg-primary/10"
                                        : "border-default-300 bg-default-50 hover:border-primary hover:bg-default-100"
                                    }
                                `}
                            >
                                <div className={`
                                    p-4 rounded-full mb-3 transition-colors
                                    ${isDragging ? "bg-primary/20 text-primary" : "bg-default-200 text-default-500 group-hover:text-primary group-hover:bg-primary/10"}
                                `}>
                                    <Gallery size={32} weight="Outline" />
                                </div>
                                <p className="text-sm font-medium text-default-700 mb-1">
                                    {isDragging ? "Solte a imagem aqui" : "Clique para fazer upload"}
                                </p>
                                <p className="text-xs text-default-500 text-center">
                                    Ou arraste e solte<br />
                                    PNG, JPG ou WEBP (máx. 25MB)
                                </p>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>

                    <Divider className="my-2" />

                    {/* Seção de Opções */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Opções</h3>
                                <p className="text-xs text-default-500 mt-1">
                                    Configure os grupos de opções e seus itens. Defina o mínimo e máximo de seleções por grupo.
                                </p>
                            </div>
                            {formData.optionGroups.filter((og) => og.isRequired).length > 0 && (
                                <Chip size="sm" color="primary" variant="flat">
                                    {formData.optionGroups.filter((og) => og.isRequired).length} grupo{formData.optionGroups.filter((og) => og.isRequired).length > 1 ? "s" : ""} obrigatório{formData.optionGroups.filter((og) => og.isRequired).length > 1 ? "s" : ""}
                                </Chip>
                            )}
                        </div>

                        {/* Lista de Grupos de Opções */}
                        {formData.optionGroups.length > 0 && (
                            <div className="flex flex-col gap-3">
                                {formData.optionGroups.map((optionGroup) => (
                                    <Card key={optionGroup.id} className="border border-default-200">
                                        <CardBody className="p-4">
                                            <div className="flex flex-col gap-3">
                                                {/* Cabeçalho do Grupo */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            onPress={() => handleToggleOptionGroupRequired(optionGroup.id)}
                                                            className={optionGroup.isRequired ? "text-primary" : "text-default-400"}
                                                            aria-label={optionGroup.isRequired ? "Marcar grupo como opcional" : "Marcar grupo como obrigatório"}
                                                        >
                                                            <CheckCircle
                                                                size={18}
                                                                weight={optionGroup.isRequired ? "Bold" : "Outline"}
                                                            />
                                                        </Button>
                                                        <div className="flex flex-col flex-1 min-w-0">
                                                            <span className="text-sm font-semibold">
                                                                {optionGroup.name}
                                                            </span>
                                                            {optionGroup.isRequired && (
                                                                <span className="text-xs text-primary font-medium">
                                                                    Obrigatório
                                                                </span>
                                                            )}
                                                        </div>
                                                        {optionGroup.isRequired && (
                                                            <Chip size="sm" color="primary" variant="flat">
                                                                Obrigatório
                                                            </Chip>
                                                        )}
                                                    </div>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        color="danger"
                                                        onPress={() => handleRemoveOptionGroup(optionGroup.id)}
                                                        aria-label="Remover grupo"
                                                    >
                                                        <TrashBinTrash size={18} weight="Outline" />
                                                    </Button>
                                                </div>

                                                {/* Configuração de Mínimo e Máximo */}
                                                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-default-50 border border-default-200">
                                                    <div className="flex flex-col gap-1">
                                                        <NumberInput
                                                            label="Mínimo de seleções"
                                                            size="sm"
                                                            value={optionGroup.minSelections}
                                                            onValueChange={(value) => {
                                                                const min = value || 0;
                                                                const max = optionGroup.maxSelections;
                                                                const itemsCount = optionGroup.items.length;
                                                                const newMin = optionGroup.isRequired ? Math.max(1, min) : Math.max(0, min);
                                                                const newMax = Math.min(max, itemsCount || 1);
                                                                handleUpdateOptionGroupLimits(optionGroup.id, newMin, newMax);
                                                            }}
                                                            minValue={optionGroup.isRequired ? 1 : 0}
                                                            maxValue={optionGroup.items.length || 1}
                                                            isDisabled={optionGroup.isRequired}
                                                            description={optionGroup.isRequired ? "Obrigatório: mínimo é 1" : undefined}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <NumberInput
                                                            label="Máximo de seleções"
                                                            size="sm"
                                                            value={optionGroup.maxSelections}
                                                            onValueChange={(value) => {
                                                                const max = value || 1;
                                                                const min = optionGroup.minSelections;
                                                                const itemsCount = optionGroup.items.length;
                                                                const newMax = Math.min(Math.max(max, min), itemsCount || 1);
                                                                handleUpdateOptionGroupLimits(optionGroup.id, min, newMax);
                                                            }}
                                                            minValue={optionGroup.minSelections}
                                                            maxValue={optionGroup.items.length || 1}
                                                            description={`Máximo: ${optionGroup.items.length || 1} opção(ões) disponível(is)`}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Itens do Grupo */}
                                                {optionGroup.items.length > 0 && (
                                                    <div className="flex flex-col gap-2 pl-6 border-l-2 border-default-200">
                                                        {optionGroup.items.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                className="flex items-center justify-between p-2 rounded-lg bg-default-50 border border-default-200"
                                                            >
                                                                <div className="flex flex-col flex-1 min-w-0">
                                                                    <span className="text-sm font-medium truncate">
                                                                        {item.name}
                                                                    </span>
                                                                    {item.price && item.price > 0 && (
                                                                        <span className="text-xs text-default-500">
                                                                            + R$ {item.price.toFixed(2).replace(".", ",")}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    variant="light"
                                                                    color="danger"
                                                                    onPress={() => handleRemoveOptionItem(optionGroup.id, item.id)}
                                                                    aria-label="Remover opção"
                                                                >
                                                                    <TrashBinTrash size={16} weight="Outline" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Formulário para adicionar opção no grupo */}
                                                <div className="flex flex-col gap-2 pl-6 border-l-2 border-dashed border-default-300 pt-2">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <AddCircle size={16} weight="Outline" className="text-default-500" />
                                                        <span className="text-xs font-medium text-default-600">
                                                            Adicionar opção em {optionGroup.name}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-8 gap-2">
                                                        <Input
                                                            placeholder="Nome da opção"
                                                            value={selectedOptionGroupId === optionGroup.id ? newOptionItemName : ""}
                                                            onValueChange={(value) => {
                                                                setSelectedOptionGroupId(optionGroup.id);
                                                                setNewOptionItemName(value);
                                                            }}
                                                            className="sm:col-span-4"
                                                            size="md"
                                                        />
                                                        <Input
                                                            placeholder="0,00"
                                                            value={selectedOptionGroupId === optionGroup.id ? (newOptionItemPriceInput || formatPrice(newOptionItemPrice)) : ""}
                                                            onValueChange={(value) => {
                                                                setSelectedOptionGroupId(optionGroup.id);
                                                                // Remover tudo exceto números, vírgula e ponto
                                                                let cleaned = value.replace(/[^\d,.]/g, "");

                                                                // Se tiver ponto, converter para vírgula (formato brasileiro)
                                                                cleaned = cleaned.replace(/\./g, ",");

                                                                // Garantir apenas uma vírgula
                                                                const commaIndex = cleaned.indexOf(",");
                                                                if (commaIndex !== -1) {
                                                                    // Tem vírgula: manter apenas a primeira e limitar decimais a 2
                                                                    const beforeComma = cleaned.substring(0, commaIndex);
                                                                    const afterComma = cleaned.substring(commaIndex + 1).replace(/,/g, "").substring(0, 2);
                                                                    cleaned = beforeComma + "," + afterComma;
                                                                }

                                                                setNewOptionItemPriceInput(cleaned);
                                                                const parsedPrice = parsePrice(cleaned);
                                                                setNewOptionItemPrice(parsedPrice);
                                                            }}
                                                            startContent={<span className="text-xs text-default-500">R$</span>}
                                                            type="text"
                                                            inputMode="decimal"
                                                            size="md"
                                                            className="sm:col-span-2"
                                                        />
                                                        <Button
                                                            size="md"
                                                            color="primary"
                                                            variant="flat"
                                                            onPress={() => {
                                                                setSelectedOptionGroupId(optionGroup.id);
                                                                handleAddOptionItem(optionGroup.id);
                                                            }}
                                                            isDisabled={!newOptionItemName.trim() || selectedOptionGroupId !== optionGroup.id}
                                                            startContent={<AddCircle size={14} weight="Outline" />}
                                                            className="sm:col-span-2"
                                                        >
                                                            Adicionar Opção
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Formulário para adicionar nova classe */}
                        <Card className="border-2 border-dashed border-default-300">
                            <CardBody className="p-4">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AddCircle size={20} weight="Outline" className="text-primary" />
                                        <span className="text-sm font-semibold">Adicionar Grupo de Opções</span>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <Input
                                            label="Nome do grupo"
                                            placeholder="Ex: Carne, Incrementos, Pão"
                                            value={newOptionGroupName}
                                            onValueChange={setNewOptionGroupName}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberInput
                                                label="Mínimo de seleções"
                                                value={newOptionGroupMin}
                                                onValueChange={(value) => {
                                                    const min = value || 0;
                                                    setNewOptionGroupMin(newOptionGroupRequired ? Math.max(1, min) : min);
                                                }}
                                                minValue={newOptionGroupRequired ? 1 : 0}
                                                isDisabled={newOptionGroupRequired}
                                                description={newOptionGroupRequired ? "Obrigatório: mínimo é 1" : undefined}
                                            />
                                            <NumberInput
                                                label="Máximo de seleções"
                                                value={newOptionGroupMax}
                                                onValueChange={(value) => {
                                                    const max = value || 1;
                                                    setNewOptionGroupMax(Math.max(max, newOptionGroupMin));
                                                }}
                                                minValue={newOptionGroupMin}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Checkbox
                                                isSelected={newOptionGroupRequired}
                                                onValueChange={(checked) => {
                                                    setNewOptionGroupRequired(checked);
                                                    if (checked) {
                                                        setNewOptionGroupMin(1);
                                                    }
                                                }}
                                                size="sm"
                                            >
                                                <span className="text-sm text-default-600">
                                                    Marcar grupo como obrigatório (mínimo sempre será 1)
                                                </span>
                                            </Checkbox>
                                            <Button
                                                size="sm"
                                                color="primary"
                                                variant="flat"
                                                onPress={handleAddOptionGroup}
                                                isDisabled={!newOptionGroupName.trim()}
                                                startContent={<AddCircle size={16} weight="Outline" />}
                                            >
                                                Adicionar Grupo
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                </div>
            </ScrollArea >

            <Divider />

            <div className="flex gap-4 py-3 px-6 justify-end">
                <Button
                    variant="light"
                    onPress={handleCancel}
                >
                    Cancelar
                </Button>
                <Button
                    color="primary"
                    onPress={handleSave}
                    isLoading={isSaving}
                    isDisabled={isSaving}
                >
                    Adicionar Produto
                </Button>
            </div>

            {/* Modal de Crop */}
            < Modal
                isOpen={isCropModalOpen}
                onOpenChange={onCropModalOpenChange}
                backdrop="blur"
                size="lg"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold">Editar Imagem</h2>
                                <p className="text-sm text-default-500 font-normal">
                                    Ajuste o zoom e posicione a área de corte da imagem
                                </p>
                            </ModalHeader>
                            <Divider />
                            <ModalBody className="flex flex-col gap-4 py-6">
                                {originalImageUrl && (
                                    <>
                                        <div className="relative w-full aspect-square max-w-2xl mx-auto rounded-lg overflow-hidden border-2 border-default-200 bg-default-100">
                                            <Cropper
                                                className="h-full w-full"
                                                image={originalImageUrl}
                                                onZoomChange={setZoom}
                                                zoom={zoom}
                                                onCropChange={setCropData}
                                                aspectRatio={1}
                                            >
                                                <CropperDescription />
                                                <CropperImage />
                                                <CropperCropArea />
                                            </Cropper>
                                        </div>
                                        <div className="flex flex-col gap-2 px-2">
                                            <div className="mx-auto flex w-full max-w-80 items-center gap-1">
                                                <Slider
                                                    aria-label="Zoom slider"
                                                    value={[zoom]}
                                                    maxValue={3}
                                                    minValue={1}
                                                    step={0.1}
                                                    onChange={(value) => setZoom(Array.isArray(value) ? value[0] : value)}
                                                    className="flex-1"
                                                />
                                                <output className="block w-10 shrink-0 text-right font-medium text-sm tabular-nums text-default-600">
                                                    {Number.parseFloat(zoom.toFixed(1))}x
                                                </output>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </ModalBody>
                            <Divider />
                            <ModalFooter>
                                <Button
                                    variant="light"
                                    onPress={() => handleCancelCropWithClose(onClose)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={() => handleApplyCropWithClose(onClose)}
                                    isDisabled={!cropData}
                                >
                                    Aplicar Corte
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Modal de Confirmação de Saída */}
            <Modal
                isOpen={isExitModalOpen}
                onOpenChange={onExitModalOpenChange}
                size="md"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <h2 className="text-xl font-bold">Dados não salvos</h2>
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-default-600">
                                    Você tem dados não salvos no formulário. O que deseja fazer?
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    variant="light"
                                    onPress={() => {
                                        onClose();
                                        setPendingNavigation(null);
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    color="danger"
                                    variant="flat"
                                    onPress={handleDiscardAndExit}
                                >
                                    Descartar
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleSaveDraftAndExit}
                                >
                                    Salvar Rascunho
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
