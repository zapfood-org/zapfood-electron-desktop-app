
import { Button, Card, CardBody, Checkbox, Chip, Divider, Image, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, NumberInput, Select, SelectItem, Slider, Textarea, useDisclosure } from "@heroui/react";
import { AddCircle, ArrowLeft, CheckCircle, Gallery, TrashBinTrash } from "@solar-icons/react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Cropper, CropperCropArea, CropperDescription, CropperImage } from "../components/shadcn/ui/cropper";
import { ScrollArea } from "../components/ui/scroll-area";

interface Garnish {
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
    garnishes: Garnish[];
    requiredGarnishesCount: number;
}

export function EditProductPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { tenantId } = useParams<{ tenantId: string }>();
    const { isOpen: isCropModalOpen, onOpen: onCropModalOpen, onOpenChange: onCropModalOpenChange } = useDisclosure();

    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        description: "",
        price: 0,
        category: "",
        imageUrl: "",
        garnishes: [],
        requiredGarnishesCount: 0,
    });

    useEffect(() => {
        if (location.state && location.state.product) {
            setFormData(location.state.product);
        } else {
            toast.error("Produto não encontrado");
            navigate(`/${tenantId}/products`);
        }
    }, [location.state, navigate, tenantId]);

    const [newGarnishName, setNewGarnishName] = useState("");
    const [newGarnishPrice, setNewGarnishPrice] = useState<number>(0);
    const [newGarnishRequired, setNewGarnishRequired] = useState(false);
    const [originalImageUrl, setOriginalImageUrl] = useState<string>("");
    const [zoom, setZoom] = useState(1);
    const [cropData, setCropData] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddGarnish = () => {
        if (!newGarnishName.trim()) return;

        const newGarnish: Garnish = {
            id: Date.now().toString(),
            name: newGarnishName,
            price: newGarnishPrice > 0 ? newGarnishPrice : undefined,
            isRequired: newGarnishRequired,
        };

        setFormData({
            ...formData,
            garnishes: [...formData.garnishes, newGarnish],
            requiredGarnishesCount: newGarnishRequired
                ? formData.requiredGarnishesCount + 1
                : formData.requiredGarnishesCount,
        });

        setNewGarnishName("");
        setNewGarnishPrice(0);
        setNewGarnishRequired(false);
    };

    const handleRemoveGarnish = (id: string) => {
        const garnish = formData.garnishes.find((g: Garnish) => g.id === id);
        setFormData({
            ...formData,
            garnishes: formData.garnishes.filter((g: Garnish) => g.id !== id),
            requiredGarnishesCount:
                garnish?.isRequired && formData.requiredGarnishesCount > 0
                    ? formData.requiredGarnishesCount - 1
                    : formData.requiredGarnishesCount,
        });
    };

    const handleToggleGarnishRequired = (id: string) => {
        setFormData({
            ...formData,
            garnishes: formData.garnishes.map((g: Garnish) =>
                g.id === id ? { ...g, isRequired: !g.isRequired } : g
            ),
            requiredGarnishesCount: formData.garnishes.find((g: Garnish) => g.id === id)?.isRequired
                ? formData.requiredGarnishesCount - 1
                : formData.requiredGarnishesCount + 1,
        });
    };

    const processFile = (file: File) => {
        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            toast.error("Por favor, selecione um arquivo de imagem");
            return;
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("A imagem deve ter no máximo 5MB");
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

    const handleSave = () => {
        if (!formData.name.trim() || !formData.category || formData.price <= 0) {
            toast.error("Por favor, preencha todos os campos obrigatórios");
            return;
        }

        // Simulação de salvamento
        toast.success("Produto atualizado com sucesso!");

        // Voltar para a página de produtos
        navigate(`/${tenantId}/products`);
    };

    const handleCancel = () => {
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
                        <NumberInput
                            label="Preço"
                            placeholder="0.00"
                            value={formData.price}
                            onValueChange={(value) => setFormData({ ...formData, price: Number(value) })}
                            startContent={
                                <span className="text-default-500">R$</span>
                            }
                            minValue={0}
                            step={0.01}
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
                                </div>
                                <Button
                                    size="sm"
                                    variant="flat"
                                    className="w-full mt-2"
                                    onPress={handleOpenCropModal}
                                >
                                    Editar Corte
                                </Button>
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
                                    PNG, JPG ou WEBP (máx. 5MB)
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
                                    Configure as opções de acompanhamentos para este produto
                                </p>
                            </div>
                            {formData.requiredGarnishesCount > 0 && (
                                <Chip size="sm" color="primary" variant="flat">
                                    {formData.requiredGarnishesCount} obrigatória{formData.requiredGarnishesCount > 1 ? "s" : ""}
                                </Chip>
                            )}
                        </div>

                        {/* Lista de Guarnições */}
                        {formData.garnishes.length > 0 && (
                            <div className="flex flex-col gap-2 p-3 rounded-lg bg-default-50 border border-default-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-default-700">
                                        Guarnições cadastradas
                                    </span>
                                    <span className="text-xs text-default-500">
                                        {formData.garnishes.length} {formData.garnishes.length === 1 ? "item" : "itens"}
                                    </span>
                                </div>

                                <Divider />

                                <ScrollArea className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-4">
                                    <div className="flex flex-col gap-2">
                                        {formData.garnishes.map((garnish) => (
                                            <div
                                                key={garnish.id}
                                                className="flex items-center justify-between p-2 rounded-lg border border-default-200 hover:border-primary/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="light"
                                                        onPress={() => handleToggleGarnishRequired(garnish.id)}
                                                        className={garnish.isRequired ? "text-primary" : "text-default-400"}
                                                        aria-label={garnish.isRequired ? "Marcar como opcional" : "Marcar como obrigatória"}
                                                    >
                                                        <CheckCircle
                                                            size={18}
                                                            weight={garnish.isRequired ? "Bold" : "Outline"}
                                                        />
                                                    </Button>
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="text-sm font-medium truncate">
                                                            {garnish.name}
                                                        </span>
                                                        {garnish.price && garnish.price > 0 && (
                                                            <span className="text-xs text-default-500">
                                                                + R$ {garnish.price.toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {garnish.isRequired && (
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
                                                    onPress={() => handleRemoveGarnish(garnish.id)}
                                                    aria-label="Remover guarnição"
                                                >
                                                    <TrashBinTrash size={18} weight="Outline" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}

                        {/* Formulário para adicionar nova guarnição */}
                        <Card className="border-2 border-dashed border-default-300">
                            <CardBody className="p-4">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AddCircle size={20} weight="Outline" className="text-primary" />
                                        <span className="text-sm font-semibold">Adicionar Guarnição</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <Input
                                            label="Nome da guarnição"
                                            value={newGarnishName}
                                            onValueChange={setNewGarnishName}
                                            className="sm:col-span-2"
                                        />
                                        <NumberInput
                                            placeholder="Preço (opcional)"
                                            value={newGarnishPrice}
                                            onValueChange={(value) => setNewGarnishPrice(Number(value))}
                                            startContent={<span className="text-xs text-default-500">R$</span>}
                                            minValue={0}
                                            step={0.01}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Checkbox
                                            isSelected={newGarnishRequired}
                                            onValueChange={setNewGarnishRequired}
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
                                            onPress={handleAddGarnish}
                                            isDisabled={!newGarnishName.trim()}
                                            startContent={<AddCircle size={16} weight="Outline" />}
                                        >
                                            Adicionar
                                        </Button>
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
                            className="flex-1"
                        >
                            Salvar Alterações
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
            </Modal >
        </div >
    );
}
