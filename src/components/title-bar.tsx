"use client";

import {
    CloseCircle,
    MaximizeSquareMinimalistic,
    MinimizeSquareMinimalistic,
    MinusSquare
} from "@solar-icons/react";
import { useEffect, useState } from "react";

export function TitleBar() {
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        // Verificar se está maximizado ao montar
        if (typeof window !== 'undefined' && window.electron) {
            // Assuming window.electron exposes methods directly or via ipcRenderer
            // In our preload, we exposed ipcRenderer. We need to check how source app did it.
            // But typically we should use our exposed bridge.
            // For now, let's keep it as source, but note that we might need to adjust types globally.
            window.electron?.window?.isMaximized()?.then(setIsMaximized);
        }
    }, []);

    const handleMinimize = () => {
        if (typeof window !== 'undefined' && window.electron) {
            window.electron.window.minimize();
        }
    };

    const handleMaximize = async () => {
        if (typeof window !== 'undefined' && window.electron) {
            await window.electron.window.maximize();
            const maximized = await window.electron.window.isMaximized();
            setIsMaximized(maximized);
        }
    };

    const handleClose = () => {
        if (typeof window !== 'undefined' && window.electron) {
            window.electron.window.close();
        }
    };

    return (
        <div
            className="flex items-center justify-between h-8 bg-default-100 border-b border-default-200 select-none drag-region"
            style={{
                WebkitAppRegion: 'drag',
            } as React.CSSProperties}
        >
            {/* Lado esquerdo - Logo/Título */}
            <div className="flex items-center gap-2 px-3 no-drag" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                <span className="text-sm font-semibold text-default-700">ZapFood</span>
            </div>

            {/* Lado direito - Botões de controle */}
            <div
                className="flex items-center h-full no-drag"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
                <button
                    onClick={handleMinimize}
                    className="h-full px-4 hover:bg-default-200 transition-colors flex items-center justify-center"
                    title="Minimizar"
                >
                    <MinusSquare size={16} weight="Outline" className="text-default-700" />
                </button>

                <button
                    onClick={handleMaximize}
                    className="h-full px-4 hover:bg-default-200 transition-colors flex items-center justify-center"
                    title={isMaximized ? "Restaurar" : "Maximizar"}
                >
                    {isMaximized ? (
                        <MinimizeSquareMinimalistic size={16} weight="Outline" className="text-default-700" />
                    ) : (
                        <MaximizeSquareMinimalistic size={16} weight="Outline" className="text-default-700" />
                    )}
                </button>

                <button
                    onClick={handleClose}
                    className="h-full px-4 hover:bg-danger transition-colors flex items-center justify-center group"
                    title="Fechar"
                >
                    <CloseCircle size={16} weight="Outline" className="text-default-700 group-hover:text-white" />
                </button>
            </div>
        </div>
    );
}
