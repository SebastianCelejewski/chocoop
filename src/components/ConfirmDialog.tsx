type Props = {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  isOpen,
  message,
  onConfirm,
  onCancel
}: Props) {
  if (!isOpen) return null;

  return (
    <div className='dialogBackdrop'>
      <div data-testid="confirm-dialog" className='dialog'>
        <p>{message}</p>
        <div className='dialogButtonContainer'>
          <button data-testid="confirm-button" onClick={onConfirm}>Tak</button>
          <button data-testid="cancel-button" onClick={onCancel}>Nie</button>
        </div>
      </div>
    </div>
  );
}

