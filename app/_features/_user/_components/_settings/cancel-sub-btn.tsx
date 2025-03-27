"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { cancelSubscription } from "../../_actions/cancel-subscription";
import { toast } from "sonner";

export const CancelSubBtn = ({
  subscriptionId,
}: {
  subscriptionId: string | null | undefined;
}) => {
  const [isPending, startTransition] = useTransition();
  const [ConfirmDialog, confirm] = useConfirm(
    "Tem certeza?",
    "Você está prestes a cancelar sua assinatura"
  );

  const router = useRouter();

  return (
    <>
      <ConfirmDialog />
      <Button
        variant="destructive"
        disabled={isPending}
        onClick={async () => {
          const ok = await confirm();

          if (ok) {
            startTransition(() => {
              cancelSubscription(subscriptionId).then((res) => {
                if (res.success && res.callbackUrl) {
                  router.push(res.callbackUrl);
                } else {
                  toast.error(res.message);
                }
              });
            });
          }
        }}>
        Cancelar
      </Button>
    </>
  );
};
