export interface IconSvgProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    width?: string | number;
    height?: string | number;
}

declare global {
    interface Window {
        electron: {
            window: {
                minimize: () => void;
                maximize: () => Promise<void>;
                close: () => void;
                isMaximized: () => Promise<boolean>;
            };
            shell: {
                openExternal: (url: string) => void;
            };
            notifications: {
                show: (
                    title: string,
                    body: string,
                    options?: { icon?: string; tag?: string }
                ) => Promise<{ success: boolean; error?: string }>;
            };
        }
    }
}
