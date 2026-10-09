import { useEffect } from 'react';
import { useBlockUser } from '../../../factories/security';
import { personName } from '../../../model/services/securityFormat';
import { ConfirmDialog } from '../ui/ConfirmDialog';

/** "Bloquear Ana Paula?" (Figma 09.02): confirma e avisa quem chamou quando deu certo. */
export function BlockUserDialog({
  visible,
  userId,
  firstName,
  onCancel,
  onBlocked,
}: {
  visible: boolean;
  userId: string | null;
  firstName: string | null;
  onCancel: () => void;
  onBlocked: () => void;
}) {
  const vm = useBlockUser(userId);
  const name = personName(firstName);

  useEffect(() => {
    if (vm.blocked) onBlocked();
    // Só a mudança para "bloqueado" interessa; `onBlocked` costuma ser uma função nova a cada render.
  }, [vm.blocked]);

  return (
    <ConfirmDialog
      visible={visible}
      title={`Bloquear ${name}?`}
      message="Os anúncios dessa pessoa somem do seu catálogo. Dá para desbloquear em Configurações, em Pessoas bloqueadas."
      confirmLabel="Bloquear"
      onConfirm={vm.submit}
      onCancel={() => {
        vm.clearError();
        onCancel();
      }}
      busy={vm.submitting}
      error={vm.error}
    />
  );
}
