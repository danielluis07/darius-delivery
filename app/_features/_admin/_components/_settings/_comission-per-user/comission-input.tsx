"use client";

import { useEffect, useState } from "react";
import { useUpdateUserComission } from "@/app/_features/_admin/_queries/use-update-user-comission";
import { Input } from "@/components/ui/input";

export const ComissionInput = ({
  id,
  comission,
}: {
  id: string;
  comission: string | null;
}) => {
  const { mutate, isPending } = useUpdateUserComission(id);
  const [value, setValue] = useState<string>(comission || "");

  useEffect(() => {
    setValue(comission || "");
  }, [comission]);

  const handleSave = () => {
    // Se o valor não mudou, não chama a mutação
    if (value === (comission || "")) return;

    // Converte para número e valida
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue) || parsedValue < 0) {
      setValue(comission || ""); // Reseta para o valor original se inválido
      return;
    }

    mutate(
      { comission: value },
      {
        onSuccess: () => {
          setValue("");
        },
        onError: () => {
          setValue(comission || ""); // Reseta para o valor original se falhar
        },
      }
    );
  };

  return (
    <Input
      className="text-center"
      value={value}
      placeholder="Valor (%)"
      onChange={(e) => setValue(e.target.value)} // Atualiza o estado local
      onBlur={handleSave} // Só chama a API se houver mudança
      disabled={isPending}
    />
  );
};
