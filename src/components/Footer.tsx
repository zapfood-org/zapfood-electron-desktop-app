export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-default-200 bg-background">
            <div className="container mx-auto py-4 px-6">
                <div className="flex flex-col items-center justify-center gap-2 text-sm text-default-500">
                    <p>© {currentYear} ZapFood. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
