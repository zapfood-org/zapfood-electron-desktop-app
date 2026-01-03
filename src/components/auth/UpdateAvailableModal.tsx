import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
} from "@heroui/react";
import { DownloadMinimalistic, Refresh } from "@solar-icons/react";

interface UpdateAvailableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateNow: () => void;
  downloadProgress?: number;
  isDownloaded?: boolean;
}

export function UpdateAvailableModal({
  isOpen,
  onClose,
  onUpdateNow,
  downloadProgress = 0,
  isDownloaded = false,
}: UpdateAvailableModalProps) {
  const handleUpdateLater = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      size="md"
      backdrop="blur"
      placement="center"
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Refresh size={24} className="text-primary" />
                <h2 className="text-2xl font-bold">Atualização Disponível</h2>
              </div>
              <p className="text-sm text-default-500 font-normal">
                Uma nova versão do ZapFood está disponível
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                {!isDownloaded ? (
                  <>
                    <p className="text-sm text-default-600">
                      Deseja atualizar agora? O download começará
                      automaticamente.
                    </p>
                    {downloadProgress > 0 && downloadProgress < 100 && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs text-default-500">
                          <span>Download em andamento...</span>
                          <span>{Math.round(downloadProgress)}%</span>
                        </div>
                        <Progress
                          value={downloadProgress}
                          color="primary"
                          className="w-full"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-default-600">
                    A atualização foi baixada e está pronta para instalação. O
                    aplicativo será reiniciado após a instalação.
                  </p>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              {!isDownloaded && (
                <Button variant="light" onPress={handleUpdateLater}>
                  Atualizar Depois
                </Button>
              )}
              {!isDownloaded && (
                <Button variant="light" onPress={onCloseModal}>
                  Fechar
                </Button>
              )}
              <Button
                color="primary"
                onPress={onUpdateNow}
                className="text-white"
                startContent={
                  isDownloaded ? (
                    <Refresh size={18} weight="Outline" />
                  ) : (
                    <DownloadMinimalistic size={18} weight="Outline" />
                  )
                }
              >
                {isDownloaded ? "Atualizar Agora" : "Baixar e Atualizar"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
