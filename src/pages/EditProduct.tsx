
import { Button, Card, CardBody, Checkbox, Chip, Divider, Image, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Slider, Switch, Textarea, useDisclosure } from "@heroui/react";
import { AddCircle, Archive, ArrowLeft, CheckCircle, Gallery, TrashBinTrash } from "@solar-icons/react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Cropper, CropperCropArea, CropperDescription, CropperImage } from "../components/shadcn/ui/cropper";
import { ScrollArea } from "../components/ui/scroll-area";

interface Option {
    id: string;
    name: string;
    price?: number;
    isRequired: boolean;
}

interface ProductFormData {
    id?: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    options: Option[];
    requiredOptionsCount: number;
    isActive: boolean;
}

export function EditProductPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { tenantId, productId } = useParams<{ tenantId: string; productId: string }>();
    const { isOpen: isCropModalOpen, onOpen: onCropModalOpen, onOpenChange: onCropModalOpenChange } = useDisclosure();
    const { isOpen: isExitModalOpen, onOpen: onExitModalOpen, onOpenChange: onExitModalOpenChange } = useDisclosure();
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onOpenChange: onDeleteModalOpenChange } = useDisclosure();
    const { isOpen: isArchiveModalOpen, onOpen: onArchiveModalOpen, onOpenChange: onArchiveModalOpenChange } = useDisclosure();
    const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
    const [initialFormData, setInitialFormData] = useState<ProductFormData | null>(null);

    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        description: "",
        price: 0,
        category: "",
        imageUrl: "",
        options: [],
        requiredOptionsCount: 0,
        isActive: true,
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


    useEffect(() => {
        if (location.state && location.state.product) {
            const product = location.state.product;
            // Garantir que options e requiredOptionsCount estejam sempre definidos
            const formDataWithDefaults: ProductFormData = {
                ...product,
                options: product.options || [],
                requiredOptionsCount: product.requiredOptionsCount ?? 0,
                isActive: product.isActive ?? true,
            };
            setFormData(formDataWithDefaults);
            setInitialFormData(formDataWithDefaults);
            setPriceInput(formatPrice(product.price));
        } else {
            toast.error("Produto não encontrado");
            navigate(`/${tenantId}/products`);
        }
    }, [location.state, navigate, tenantId]);

    const [newOptionName, setNewOptionName] = useState("");
    const [newOptionPrice, setNewOptionPrice] = useState<number>(0);
    const [newOptionPriceInput, setNewOptionPriceInput] = useState<string>("");
    const [newOptionRequired, setNewOptionRequired] = useState(false);
    const [originalImageUrl, setOriginalImageUrl] = useState<string>("");
    const [zoom, setZoom] = useState(1);
    const [cropData, setCropData] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


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

    const handleAddOption = () => {
        if (!newOptionName.trim()) return;

        const newOption: Option = {
            id: Date.now().toString(),
            name: newOptionName,
            price: newOptionPrice > 0 ? newOptionPrice : undefined,
            isRequired: newOptionRequired,
        };

        setFormData({
            ...formData,
            options: [...formData.options, newOption],
            requiredOptionsCount: newOptionRequired
                ? formData.requiredOptionsCount + 1
                : formData.requiredOptionsCount,
        });

        setNewOptionName("");
        setNewOptionPrice(0);
        setNewOptionPriceInput("");
        setNewOptionRequired(false);
    };

    const handleRemoveOption = (id: string) => {
        const option = formData.options.find((o: Option) => o.id === id);
        setFormData({
            ...formData,
            options: formData.options.filter((o: Option) => o.id !== id),
            requiredOptionsCount:
                option?.isRequired && formData.requiredOptionsCount > 0
                    ? formData.requiredOptionsCount - 1
                    : formData.requiredOptionsCount,
        });
    };

    const handleToggleOptionRequired = (id: string) => {
        setFormData({
            ...formData,
            options: formData.options.map((o: Option) =>
                o.id === id ? { ...o, isRequired: !o.isRequired } : o
            ),
            requiredOptionsCount: formData.options.find((o: Option) => o.id === id)?.isRequired
                ? formData.requiredOptionsCount - 1
                : formData.requiredOptionsCount + 1,
        });
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

    // Verificar se há alterações no formulário
    const hasChanges = () => {
        if (!initialFormData) return false;

        return (
            formData.name !== initialFormData.name ||
            formData.description !== initialFormData.description ||
            formData.price !== initialFormData.price ||
            formData.category !== initialFormData.category ||
            formData.imageUrl !== initialFormData.imageUrl ||
            JSON.stringify(formData.options || []) !== JSON.stringify(initialFormData.options || []) ||
            formData.requiredOptionsCount !== initialFormData.requiredOptionsCount
        );
    };

    // Salvar rascunho no localStorage
    const saveDraft = () => {
        if (!productId) return;
        const draftKey = `product-draft-${tenantId}-${productId}`;
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
        if (!productId) return;
        const draftKey = `product-draft-${tenantId}-${productId}`;
        try {
            const draft = localStorage.getItem(draftKey);
            if (draft) {
                const parsedDraft = JSON.parse(draft);
                // Garantir que options e requiredOptionsCount estejam sempre definidos
                const draftWithDefaults: ProductFormData = {
                    ...parsedDraft,
                    options: parsedDraft.options || [],
                    requiredOptionsCount: parsedDraft.requiredOptionsCount ?? 0,
                };
                setFormData(draftWithDefaults);
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
        if (!productId) return;
        const draftKey = `product-draft-${tenantId}-${productId}`;
        localStorage.removeItem(draftKey);
    };

    // Carregar rascunho ao montar o componente
    useEffect(() => {
        loadDraft();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDelete = () => {
        // TODO: Integrate with backend delete endpoint
        toast.info(`Produto ${formData.name} excluído (Simulação)`);
        onDeleteModalOpenChange();
        navigate(`/${tenantId}/products`);
    };

    const handleConfirmArchive = async () => {
        // TODO: Integrate with backend archive endpoint
        toast.info(`Produto ${formData.name} arquivado (Simulação)`);
        onArchiveModalOpenChange();
        navigate(`/${tenantId}/products`);
    };

    const handleDeactivate = (isActive: boolean) => {
        setFormData({ ...formData, isActive });
        // TODO: Integrate with backend update endpoint immediately or wait for save?
        // For now, it updates the formData state, which will be saved on "Save"
    };

    const handleCancel = () => {
        if (hasChanges()) {
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
        onExitModalOpenChange();
        if (pendingNavigation) {
            pendingNavigation();
            setPendingNavigation(null);
        }
    };

    const handleDiscardAndExit = () => {
        clearDraft();
        onExitModalOpenChange();
        if (pendingNavigation) {
            pendingNavigation();
            setPendingNavigation(null);
        }
    };

    const handleSave = () => {
        if (!formData.name.trim() || !formData.category || formData.price <= 0) {
            toast.error("Por favor, preencha todos os campos obrigatórios");
            return;
        }

        // Simulação de salvamento
        toast.success("Produto atualizado com sucesso!");
        navigate(`/${tenantId}/products`);
    };

    if (!formData.name && !location.state?.product) {
        return null;
    }

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
                    <h1 className="text-3xl font-bold">Editar Produto</h1>
                    <p className="text-sm text-default-500 mt-1">
                        Atualize os dados do produto
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
                                    Configure as opções de acompanhamentos para este produto
                                </p>
                            </div>
                            {formData.requiredOptionsCount > 0 && (
                                <Chip size="sm" color="primary" variant="flat">
                                    {formData.requiredOptionsCount} obrigatória{formData.requiredOptionsCount > 1 ? "s" : ""}
                                </Chip>
                            )}
                        </div>

                        {/* Lista de Opções */}
                        {formData.options && formData.options.length > 0 && (
                            <div className="flex flex-col gap-2 p-3 rounded-lg bg-default-50 border border-default-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-default-700">
                                        Opções cadastradas
                                    </span>
                                    <span className="text-xs text-default-500">
                                        {formData.options.length} {formData.options.length === 1 ? "opção" : "opções"}
                                    </span>
                                </div>

                                <Divider />

                                <ScrollArea className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-4">
                                    <div className="flex flex-col gap-2">
                                        {formData.options.map((option) => (
                                            <div
                                                key={option.id}
                                                className="flex items-center justify-between p-2 rounded-lg border border-default-200 hover:border-primary/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        onPress={() => handleToggleOptionRequired(option.id)}
                                                        className={option.isRequired ? "text-primary" : "text-default-400"}
                                                        aria-label={option.isRequired ? "Marcar como opcional" : "Marcar como obrigatória"}
                                                    >
                                                        <CheckCircle
                                                            size={18}
                                                            weight={option.isRequired ? "Bold" : "Outline"}
                                                        />
                                                    </Button>
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="text-sm font-medium truncate">
                                                            {option.name}
                                                        </span>
                                                        {option.price && option.price > 0 && (
                                                            <span className="text-xs text-default-500">
                                                                + R$ {option.price.toFixed(2).replace(".", ",")}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {option.isRequired && (
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
                                                    onPress={() => handleRemoveOption(option.id)}
                                                    aria-label="Remover opção"
                                                >
                                                    <TrashBinTrash size={18} weight="Outline" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}

                        {/* Formulário para adicionar nova opção */}
                        <Card className="border-2 border-dashed border-default-300">
                            <CardBody className="p-4">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AddCircle size={20} weight="Outline" className="text-primary" />
                                        <span className="text-sm font-semibold">Adicionar Opção</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <Input
                                            label="Nome da opção"
                                            value={newOptionName}
                                            onValueChange={setNewOptionName}
                                            className="sm:col-span-2"
                                        />
                                        <Input
                                            placeholder="Preço (opcional)"
                                            value={newOptionPriceInput || formatPrice(newOptionPrice)}
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

                                                setNewOptionPriceInput(cleaned);
                                                const parsedPrice = parsePrice(cleaned);
                                                setNewOptionPrice(parsedPrice);
                                            }}
                                            type="text"
                                            inputMode="decimal"
                                            startContent={<span className="text-xs text-default-500">R$</span>}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Checkbox
                                            isSelected={newOptionRequired}
                                            onValueChange={setNewOptionRequired}
                                            size="sm"
                                        >
                                            <span className="text-sm text-default-600">
                                                Marcar como obrigatória
                                            </span>
                                        </Checkbox>
                                        <Button
                                            size="sm"
                                            color="primary"
                                            variant="flat"
                                            onPress={handleAddOption}
                                            isDisabled={!newOptionName.trim()}
                                            startContent={<AddCircle size={16} weight="Outline" />}
                                        >
                                            Adicionar Opção
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    <Divider className="my-2" />

                    {/* Zona de Perigo */}
                    <div className="flex flex-col gap-4 p-4 border border-danger/20 rounded-lg bg-danger/5">
                        <div className="flex items-center gap-2">
                            <TrashBinTrash size={20} className="text-danger" weight="Outline" />
                            <h3 className="text-lg font-semibold text-danger">Zona de Perigo</h3>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-foreground">Disponibilidade do Produto</p>
                                    <p className="text-sm text-default-500">
                                        {formData.isActive
                                            ? "O produto está visível para os clientes"
                                            : "O produto está oculto para os clientes"}
                                    </p>
                                </div>
                                <Switch
                                    isSelected={formData.isActive !== false} // Default to true if undefined
                                    onValueChange={handleDeactivate}
                                    color="success"
                                    size="sm"
                                >
                                    {formData.isActive ? "Ativo" : "Inativo"}
                                </Switch>
                            </div>

                            <Divider className="bg-danger/20" />

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-foreground">Arquivar Produto</p>
                                    <p className="text-sm text-default-500">
                                        O produto não aparecerá mais no catálogo, mas não será removido permanentemente
                                    </p>
                                </div>
                                <Button
                                    color="warning"
                                    variant="flat"
                                    onPress={onArchiveModalOpen}
                                    startContent={<Archive size={18} weight="Outline" />}
                                >
                                    Arquivar
                                </Button>
                            </div>

                            <Divider className="bg-danger/20" />

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-danger">Excluir Produto</p>
                                    <p className="text-sm text-danger/70">
                                        Esta ação não pode ser desfeita
                                    </p>
                                </div>
                                <Button
                                    color="danger"
                                    variant="flat"
                                    onPress={onDeleteModalOpen}
                                    startContent={<TrashBinTrash size={18} />}
                                >
                                    Excluir
                                </Button>
                            </div>
                        </div>
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
                >
                    Salvar Alterações
                </Button>
            </div>

            {/* Modal de Crop */}
            {/* Modal de Crop */}
            <Modal
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
                                <h2 className="text-xl font-bold">Alterações não salvas</h2>
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-default-600">
                                    Você tem alterações não salvas no formulário. O que deseja fazer?
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

            {/* Modal de Confirmação de Arquivamento */}
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
                                    <Archive size={24} className="text-warning" weight="Outline" />
                                    Arquivar Produto
                                </h2>
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-default-600">
                                    Tem certeza que deseja arquivar o produto <span className="font-bold">{formData.name}</span>?
                                </p>
                                <p className="text-sm text-default-500">
                                    Esta ação não removerá o produto permanentemente, mas ele não aparecerá mais no catálogo.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    variant="light"
                                    onPress={onClose}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    color="warning"
                                    onPress={handleConfirmArchive}
                                    className="text-primary-foreground"
                                >
                                    Arquivar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Modal de Confirmação de Exclusão */}
            <Modal
                isOpen={isDeleteModalOpen}
                onOpenChange={onDeleteModalOpenChange}
                size="md"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <h2 className="text-xl font-bold text-danger flex items-center gap-2">
                                    <TrashBinTrash size={24} />
                                    Excluir Produto
                                </h2>
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-default-600">
                                    Tem certeza que deseja excluir o produto <span className="font-bold">{formData.name}</span>?
                                </p>
                                <p className="text-sm text-default-500">
                                    Esta ação é irreversível e removerá o produto permanentemente do sistema.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    variant="light"
                                    onPress={onClose}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    color="danger"
                                    onPress={handleDelete}
                                >
                                    Excluir Permanentemente
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}