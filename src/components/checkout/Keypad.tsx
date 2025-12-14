
import { Button } from "@heroui/react";
import { Delete } from "lucide-react";

interface KeypadProps {
    onPress: (value: string) => void;
    onClear: () => void;
    onBackspace: () => void;
}

export function Keypad({ onPress, onClear, onBackspace }: KeypadProps) {
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0"];

    return (
        <div className="w-full flex flex-col items-center">
            <div className="grid grid-cols-3 gap-4 w-full max-w-[380px]">
                {keys.map((key) => (
                    <Button
                        key={key}
                        size="lg"
                        variant="flat"
                        className="h-20 text-3xl font-bold bg-default-100 hover:bg-default-200 active:bg-default-300 transition-colors"
                        onPress={() => onPress(key)}
                    >
                        {key}
                    </Button>
                ))}
                <Button
                    size="lg"
                    color="danger"
                    variant="flat"
                    className="h-20"
                    onPress={onBackspace}
                >
                    <Delete size={28} />
                </Button>
            </div>
        </div>
    );
}
