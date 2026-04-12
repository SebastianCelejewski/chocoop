import { useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";

type ConfirmState = {
  message: string;
  resolve: (value: boolean) => void;
} | null;

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>(null);

  const confirm = (message: string) => {
    return new Promise<boolean>((resolve) => {
      setState({ message, resolve });
    });
  };

  const handleConfirm = () => {
    state?.resolve(true);
    setState(null);
  };

  const handleCancel = () => {
    state?.resolve(false);
    setState(null);
  };

  const dialog = (
    <ConfirmDialog
      isOpen={!!state}
      message={state?.message ?? ""}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, dialog };
}