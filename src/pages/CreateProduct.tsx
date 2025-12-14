
import { Button, Card, CardBody, Checkbox, Chip, Divider, Image, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Slider, Textarea, useDisclosure } from "@heroui/react";
import { AddCircle, ArrowLeft, CheckCircle, Gallery, TrashBinTrash } from "@solar-icons/react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Cropper, CropperCropArea, CropperDescription, CropperImage } from "../components/shadcn/ui/cropper";
import { ScrollArea } from "../components/ui/scroll-area";

interface GarnishItem {
    id: string;
    name: string;
    price?: number;
}

interface GarnishClass {
    id: string;
    name: string;
    isRequired: boolean;
    items: GarnishItem[];
}

interface ProductFormData {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    garnishClasses: GarnishClass[];
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
        garnishClasses: [],
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

    const [newGarnishClassName, setNewGarnishClassName] = useState("");
    const [newGarnishClassRequired, setNewGarnishClassRequired] = useState(false);
    const [newGarnishItemName, setNewGarnishItemName] = useState("");
    const [newGarnishItemPrice, setNewGarnishItemPrice] = useState<number>(0);
    const [newGarnishItemPriceInput, setNewGarnishItemPriceInput] = useState<string>("");
    const [selectedGarnishClassId, setSelectedGarnishClassId] = useState<string>("");
    const [originalImageUrl, setOriginalImageUrl] = useState<string>("");
    const [zoom, setZoom] = useState(1);
    const [cropData, setCropData] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddGarnishClass = () => {
        if (!newGarnishClassName.trim()) return;

        const newGarnishClass: GarnishClass = {
            id: Date.now().toString(),
            name: newGarnishClassName,
            isRequired: newGarnishClassRequired,
            items: [],
        };

        setFormData({
            ...formData,
            garnishClasses: [...formData.garnishClasses, newGarnishClass],
        });

        setNewGarnishClassName("");
        setNewGarnishClassRequired(false);
        setSelectedGarnishClassId(newGarnishClass.id);
    };

    const handleRemoveGarnishClass = (classId: string) => {
        setFormData({
            ...formData,
            garnishClasses: formData.garnishClasses.filter((gc) => gc.id !== classId),
        });
        if (selectedGarnishClassId === classId) {
            setSelectedGarnishClassId("");
        }
    };

    const handleToggleGarnishClassRequired = (classId: string) => {
        setFormData({
            ...formData,
            garnishClasses: formData.garnishClasses.map((gc) =>
                gc.id === classId ? { ...gc, isRequired: !gc.isRequired } : gc
            ),
        });
    };

    const handleAddGarnishItem = (classId: string) => {
        if (!newGarnishItemName.trim() || !classId) return;

        const newGarnishItem: GarnishItem = {
            id: Date.now().toString(),
            name: newGarnishItemName,
            price: newGarnishItemPrice > 0 ? newGarnishItemPrice : undefined,
        };

        setFormData({
            ...formData,
            garnishClasses: formData.garnishClasses.map((gc) =>
                gc.id === classId
                    ? { ...gc, items: [...gc.items, newGarnishItem] }
                    : gc
            ),
        });

        if (selectedGarnishClassId === classId) {
            setNewGarnishItemName("");
            setNewGarnishItemPrice(0);
            setNewGarnishItemPriceInput("");
        }
    };

    const handleRemoveGarnishItem = (classId: string, itemId: string) => {
        setFormData({
            ...formData,
            garnishClasses: formData.garnishClasses.map((gc) =>
                gc.id === classId
                    ? { ...gc, items: gc.items.filter((item) => item.id !== itemId) }
                    : gc
            ),
        });
    };

    const processFile = (file: File) => {
        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            toast.error("Por favor, selecione um arquivo de imagem");
            return;
        }

        // Validar tamanho (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("A imagem deve ter no máximo 10MB");
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
            formData.garnishClasses.length > 0
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
                restaurantId: "cmj6b8z6b0000u4vsgfh8y9g6",
                garnishClasses: formData.garnishClasses.map((garnishClass) => ({
                    name: garnishClass.name,
                    isRequired: garnishClass.isRequired,
                    items: garnishClass.items.map((item) => ({
                        name: item.name,
                        price: item.price || 0,
                    })),
                })),
            };

            await axios.post("http://localhost:5000/products", payload, {
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
            if (axios.isAxiosError(error)) {
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
                                    PNG, JPG ou WEBP (máx. 10MB)
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

                    {/* Seção de Guarnições */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Guarnições</h3>
                                <p className="text-xs text-default-500 mt-1">
                                    Configure as classes de guarnições e seus itens. A obrigatoriedade é por classe.
                                </p>
                            </div>
                            {formData.garnishClasses.filter((gc) => gc.isRequired).length > 0 && (
                                <Chip size="sm" color="primary" variant="flat">
                                    {formData.garnishClasses.filter((gc) => gc.isRequired).length} classe{formData.garnishClasses.filter((gc) => gc.isRequired).length > 1 ? "s" : ""} obrigatória{formData.garnishClasses.filter((gc) => gc.isRequired).length > 1 ? "s" : ""}
                                </Chip>
                            )}
                        </div>

                        {/* Lista de Classes de Guarnições */}
                        {formData.garnishClasses.length > 0 && (
                            <div className="flex flex-col gap-3">
                                {formData.garnishClasses.map((garnishClass) => (
                                    <Card key={garnishClass.id} className="border border-default-200">
                                        <CardBody className="p-4">
                                            <div className="flex flex-col gap-3">
                                                {/* Cabeçalho da Classe */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            onPress={() => handleToggleGarnishClassRequired(garnishClass.id)}
                                                            className={garnishClass.isRequired ? "text-primary" : "text-default-400"}
                                                            aria-label={garnishClass.isRequired ? "Marcar classe como opcional" : "Marcar classe como obrigatória"}
                                                        >
                                                            <CheckCircle
                                                                size={18}
                                                                weight={garnishClass.isRequired ? "Bold" : "Outline"}
                                                            />
                                                        </Button>
                                                        <div className="flex flex-col flex-1 min-w-0">
                                                            <span className="text-sm font-semibold">
                                                                {garnishClass.name}
                                                            </span>
                                                            {garnishClass.isRequired && (
                                                                <span className="text-xs text-primary font-medium">
                                                                    Obrigatória
                                                                </span>
                                                            )}
                                                        </div>
                                                        {garnishClass.isRequired && (
                                                            <Chip size="sm" color="primary" variant="flat">
                                                                Obrigatória
                                                            </Chip>
                                                        )}
                                                    </div>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        color="danger"
                                                        onPress={() => handleRemoveGarnishClass(garnishClass.id)}
                                                        aria-label="Remover classe"
                                                    >
                                                        <TrashBinTrash size={18} weight="Outline" />
                                                    </Button>
                                                </div>

                                                {/* Itens da Classe */}
                                                {garnishClass.items.length > 0 && (
                                                    <div className="flex flex-col gap-2 pl-6 border-l-2 border-default-200">
                                                        {garnishClass.items.map((item) => (
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
                                                                            + R$ {item.price.toFixed(2)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    variant="light"
                                                                    color="danger"
                                                                    onPress={() => handleRemoveGarnishItem(garnishClass.id, item.id)}
                                                                    aria-label="Remover item"
                                                                >
                                                                    <TrashBinTrash size={16} weight="Outline" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Formulário para adicionar item na classe */}
                                                <div className="flex flex-col gap-2 pl-6 border-l-2 border-dashed border-default-300 pt-2">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <AddCircle size={16} weight="Outline" className="text-default-500" />
                                                        <span className="text-xs font-medium text-default-600">
                                                            Adicionar item em {garnishClass.name}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                        <Input
                                                            placeholder="Nome do item"
                                                            label="Nome do item"
                                                            value={selectedGarnishClassId === garnishClass.id ? newGarnishItemName : ""}
                                                            onValueChange={(value) => {
                                                                setSelectedGarnishClassId(garnishClass.id);
                                                                setNewGarnishItemName(value);
                                                            }}
                                                            className="sm:col-span-2"
                                                            size="md"
                                                        />
                                                        <Input
                                                            placeholder="Preço (opcional)"
                                                            value={selectedGarnishClassId === garnishClass.id ? (newGarnishItemPriceInput || formatPrice(newGarnishItemPrice)) : ""}
                                                            onValueChange={(value) => {
                                                                setSelectedGarnishClassId(garnishClass.id);
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

                                                                setNewGarnishItemPriceInput(cleaned);
                                                                const parsedPrice = parsePrice(cleaned);
                                                                setNewGarnishItemPrice(parsedPrice);
                                                            }}
                                                            startContent={<span className="text-xs text-default-500">R$</span>}
                                                            type="text"
                                                            inputMode="decimal"
                                                            size="md"
                                                        />
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        color="primary"
                                                        variant="flat"
                                                        onPress={() => {
                                                            setSelectedGarnishClassId(garnishClass.id);
                                                            handleAddGarnishItem(garnishClass.id);
                                                        }}
                                                        isDisabled={!newGarnishItemName.trim() || selectedGarnishClassId !== garnishClass.id}
                                                        startContent={<AddCircle size={14} weight="Outline" />}
                                                        className="self-start"
                                                    >
                                                        Adicionar Item
                                                    </Button>
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
                                        <span className="text-sm font-semibold">Adicionar Classe de Guarnição</span>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <Input
                                            label="Nome da classe"
                                            placeholder="Ex: Carne, Incrementos, Pão"
                                            value={newGarnishClassName}
                                            onValueChange={setNewGarnishClassName}
                                        />
                                        <div className="flex items-center justify-between">
                                            <Checkbox
                                                isSelected={newGarnishClassRequired}
                                                onValueChange={setNewGarnishClassRequired}
                                                size="sm"
                                            >
                                                <span className="text-sm text-default-600">
                                                    Marcar classe como obrigatória
                                                </span>
                                            </Checkbox>
                                            <Button
                                                size="sm"
                                                color="primary"
                                                variant="flat"
                                                onPress={handleAddGarnishClass}
                                                isDisabled={!newGarnishClassName.trim()}
                                                startContent={<AddCircle size={16} weight="Outline" />}
                                            >
                                                Adicionar Classe
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            variant="light"
                            onPress={handleCancel}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            color="primary"
                            onPress={handleSave}
                            isLoading={isSaving}
                            isDisabled={isSaving}
                            className="flex-1"
                        >
                            Adicionar Produto
                        </Button>
                    </div>
                </div>
            </ScrollArea >

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
