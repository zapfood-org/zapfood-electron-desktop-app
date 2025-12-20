export function FooterBar() {
    return (
        <div className="h-8 bg-default-50 border-t border-default-200 flex items-center justify-between px-4 select-none">
            {/* Shortcuts */}
            <div className="flex items-center gap-4 text-xs text-default-500">
                <div className="flex items-center gap-2">
                    <span>Ctrl + B</span>
                    <span>(Alternar Menu)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>Ctrl + K</span>
                    <span>(Pesquisar)</span>
                </div>
            </div>

            {/* Copyright */}
            <div className="text-xs text-default-400">
                © {new Date().getFullYear()} ZapFood. Todos os direitos reservados.
            </div>
        </div>
    );
}
