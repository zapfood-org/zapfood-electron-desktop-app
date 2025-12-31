import { Button } from "@heroui/react";
import { Delete } from "lucide-react";

interface KeypadProps {
  onPress: (value: string) => void;
  onClear: () => void;
  onBackspace: () => void;
}

export function Keypad({ onPress, onBackspace }: KeypadProps) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0"];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="grid grid-cols-3 gap-4 w-full">
        {keys.map((key) => (
          <Button
            key={key}
            size="lg"
            variant="flat"
            className="h-20 text-3xl font-bold bg-default-100 dark:bg-default-50 hover:bg-default-200 dark:hover:bg-default-100 active:bg-default-300 dark:active:bg-default-200 text-foreground transition-colors border border-default"
            onPress={() => onPress(key)}
          >
            {key}
          </Button>
        ))}
        <Button
          size="lg"
          color="danger"
          variant="flat"
          className="h-20 text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-950 hover:bg-danger-100 dark:hover:bg-danger-900 active:bg-danger-200 dark:active:bg-danger-800 border border-danger-200"
          onPress={onBackspace}
        >
          <Delete size={28} />
        </Button>
      </div>
    </div>
  );
}
