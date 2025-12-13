import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link as HeroLink } from "@heroui/react";
import { Link } from "react-router-dom";

const primaryLinks = [
    { label: "Site Institucional", href: "#" },
    { label: "Fale Conosco", href: "#" },
    { label: "Conta e Segurança", href: "#" },
    { label: "Carreiras", href: "#" },
    { label: "Entregadores", href: "#" },
];

const discoverLinks = [
    { label: "Cadastre seu Restaurante ou Mercado", href: "#" },
    { label: "Smart Market Shop", href: "#" },
    { label: "Smart Market Empresas", href: "#" },
    { label: "Blog Smart Market Empresas", href: "#" },
];

const policyLinks = [
    { label: "Termos e condições de uso", href: "#" },
    { label: "Código de conduta", href: "#" },
    { label: "Privacidade", href: "#" },
    { label: "Dicas de segurança", href: "#" },
];

const socialLinks = [
    { label: "Facebook", href: "#", icon: Facebook },
    { label: "Twitter", href: "#", icon: Twitter },
    { label: "YouTube", href: "#", icon: Youtube },
    { label: "Instagram", href: "#", icon: Instagram },
];

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-divider bg-background">
            <div className="container mx-auto py-10 px-6">
                <div className="grid gap-10 md:grid-cols-3">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-default-500">
                            ZapFood
                        </h2>
                        <ul className="mt-4 space-y-2 text-sm text-default-500">
                            {primaryLinks.map((link) => (
                                <li key={link.label}>
                                    <HeroLink as={Link} to={link.href} className="transition-colors hover:text-primary cursor-pointer">
                                        {link.label}
                                    </HeroLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-default-500">
                            Descubra
                        </h2>
                        <ul className="mt-4 space-y-2 text-sm text-default-500">
                            {discoverLinks.map((link) => (
                                <li key={link.label}>
                                    <HeroLink as={Link} to={link.href} className="transition-colors hover:text-primary cursor-pointer">
                                        {link.label}
                                    </HeroLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-default-500">
                            Social
                        </h2>
                        <div className="mt-4 flex gap-4 text-default-500">
                            {socialLinks.map(({ icon: Icon, label, href }) => (
                                <HeroLink
                                    key={label}
                                    as={Link}
                                    to={href}
                                    aria-label={label}
                                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-divider transition-colors hover:border-primary hover:text-primary cursor-pointer"
                                >
                                    <Icon className="h-5 w-5 text-default-500 group-hover:text-primary" />
                                </HeroLink>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-12 grid gap-8 border-t border-divider pt-8 text-sm text-default-500 md:grid-cols-[auto,1fr] md:items-center">
                    <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary text-xl font-semibold text-primary">
                            :)
                        </span>
                        <div>
                            <p className="font-semibold text-foreground">© 2025 ZapFood</p>
                            <p>Todos os direitos reservados.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6 md:justify-end">
                        {policyLinks.map((link) => (
                            <HeroLink key={link.label} as={Link} to={link.href} className="transition-colors hover:text-primary cursor-pointer">
                                {link.label}
                            </HeroLink>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
