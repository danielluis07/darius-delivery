"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cancelSubscription } from "../../_actions/cancel-subscription";
import { toast } from "sonner";
import { useConfirmContext } from "@/context/confirm-context";

export const CancelSubBtn = ({
  subscriptionId,
}: {
  subscriptionId: string | null | undefined;
}) => {
  const [isPending, startTransition] = useTransition();
  const { confirm } = useConfirmContext();

  const router = useRouter();

  return (
    <Button
      variant="destructive"
      disabled={isPending}
      onClick={async () => {
        const ok = await confirm({
          title: "Tem certeza?",
          message: "Você está prestes a cancelar sua assinatura",
        });

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
  );
};
