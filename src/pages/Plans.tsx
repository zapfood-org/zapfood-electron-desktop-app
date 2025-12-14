import { Button, Card, CardBody, Chip, Divider } from "@heroui/react";
import { CheckCircle, Star } from "@solar-icons/react";

interface PlanFeature {
    text: string;
    included: boolean;
}

interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    period: "month" | "year";
    features: PlanFeature[];
    popular?: boolean;
    current?: boolean;
}

const plans: Plan[] = [
    {
        id: "freemium",
        name: "Freemium",
        description: "Perfeito para começar e testar a plataforma",
        price: 0,
        period: "month",
        current: true,
        features: [
            { text: "Até 1 restaurante", included: true },
            { text: "Até 50 pedidos/mês", included: true },
            { text: "Gestão básica de produtos", included: true },
            { text: "Cardápio digital", included: true },
            { text: "Suporte por email", included: true },
            { text: "Relatórios básicos", included: true },
            { text: "Integração WhatsApp", included: false },
            { text: "Promoções e cupons", included: false },
            { text: "Múltiplos restaurantes", included: false },
            { text: "API completa", included: false },
            { text: "Suporte prioritário", included: false },
            { text: "Relatórios avançados", included: false },
        ],
    },
    {
        id: "starter",
        name: "Starter",
        description: "Ideal para pequenos negócios em crescimento",
        price: 99,
        period: "month",
        popular: true,
        features: [
            { text: "Até 3 restaurantes", included: true },
            { text: "Pedidos ilimitados", included: true },
            { text: "Gestão completa de produtos", included: true },
            { text: "Cardápio digital", included: true },
            { text: "Suporte por email e chat", included: true },
            { text: "Relatórios detalhados", included: true },
            { text: "Integração WhatsApp", included: true },
            { text: "Promoções e cupons", included: true },
            { text: "Múltiplos restaurantes", included: true },
            { text: "API básica", included: true },
            { text: "Suporte prioritário", included: false },
            { text: "Relatórios avançados", included: false },
        ],
    },
    {
        id: "premium",
        name: "Premium",
        description: "Solução completa para grandes operações",
        price: 299,
        period: "month",
        features: [
            { text: "Restaurantes ilimitados", included: true },
            { text: "Pedidos ilimitados", included: true },
            { text: "Gestão completa de produtos", included: true },
            { text: "Cardápio digital", included: true },
            { text: "Suporte 24/7", included: true },
            { text: "Relatórios avançados", included: true },
            { text: "Integração WhatsApp", included: true },
            { text: "Promoções e cupons", included: true },
            { text: "Múltiplos restaurantes", included: true },
            { text: "API completa", included: true },
            { text: "Suporte prioritário", included: true },
            { text: "Relatórios avançados", included: true },
        ],
    },
];

export function PlansPage() {
    const handleSelectPlan = (planId: string) => {
        console.log("Plano selecionado:", planId);
        // Aqui você pode adicionar a lógica para processar a seleção do plano
    };

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h1 className="text-3xl font-bold">Planos e Preços</h1>
                    <p className="text-default-500 mt-1">
                        Escolha o plano ideal para o seu negócio
                    </p>
                </div>
            </div>

            <Divider />

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={`relative ${plan.popular
                                        ? "border-2 border-primary shadow-lg"
                                        : "border border-default-200"
                                    } ${plan.current ? "bg-primary-50 dark:bg-primary-950/20" : ""}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                        <Chip
                                            color="primary"
                                            variant="solid"
                                            startContent={<Star size={16} />}
                                            className="font-semibold"
                                        >
                                            Mais Popular
                                        </Chip>
                                    </div>
                                )}
                                {plan.current && (
                                    <div className="absolute -top-3 right-4 z-10">
                                        <Chip
                                            color="success"
                                            variant="flat"
                                            className="font-semibold"
                                        >
                                            Plano Atual
                                        </Chip>
                                    </div>
                                )}

                                <CardBody className="p-6">
                                    <div className="flex flex-col h-full">
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                                            <p className="text-sm text-default-500 mb-4">
                                                {plan.description}
                                            </p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-bold">
                                                    {plan.price === 0 ? (
                                                        "Grátis"
                                                    ) : (
                                                        <>
                                                            R$ {plan.price.toFixed(2)}
                                                            <span className="text-lg font-normal text-default-500">
                                                                /mês
                                                            </span>
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <Divider className="my-4" />

                                        <div className="flex-1 mb-6">
                                            <ul className="space-y-3">
                                                {plan.features.map((feature, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-start gap-2"
                                                    >
                                                        {feature.included ? (
                                                            <CheckCircle
                                                                size={20}

                                                                className="text-success flex-shrink-0 mt-0.5"
                                                            />
                                                        ) : (
                                                            <div className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center">
                                                                <div className="w-4 h-4 rounded-full border-2 border-default-300" />
                                                            </div>
                                                        )}
                                                        <span
                                                            className={
                                                                feature.included
                                                                    ? "text-default-700"
                                                                    : "text-default-400 line-through"
                                                            }
                                                        >
                                                            {feature.text}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <Button
                                            color={plan.popular ? "primary" : "default"}
                                            variant={plan.current ? "flat" : "solid"}
                                            className="w-full font-semibold"
                                            size="lg"
                                            onPress={() => handleSelectPlan(plan.id)}
                                            isDisabled={plan.current}
                                        >
                                            {plan.current
                                                ? "Plano Atual"
                                                : plan.price === 0
                                                    ? "Começar Grátis"
                                                    : "Assinar Plano"}
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-8 p-6 bg-default-100 dark:bg-default-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">
                            Todos os planos incluem
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle
                                    size={18}

                                    className="text-success flex-shrink-0"
                                />
                                <span className="text-sm text-default-600">
                                    Atualizações automáticas
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle
                                    size={18}

                                    className="text-success flex-shrink-0"
                                />
                                <span className="text-sm text-default-600">
                                    Segurança de dados
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle
                                    size={18}

                                    className="text-success flex-shrink-0"
                                />
                                <span className="text-sm text-default-600">
                                    Backup automático
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle
                                    size={18}

                                    className="text-success flex-shrink-0"
                                />
                                <span className="text-sm text-default-600">
                                    Cancelamento a qualquer momento
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

