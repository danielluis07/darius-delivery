"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PendingDocuments } from "@/types";
import { Uploader } from "./uploader";

export const DocumentsClient = ({
  documentsData,
  apiKey,
}: {
  documentsData: PendingDocuments;
  apiKey: string;
}) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    NOT_SENT: { label: "Não enviado", color: "text-gray-400" },
    PENDING: { label: "Em análise", color: "text-yellow-500" },
    APPROVED: { label: "Aprovado", color: "text-green-500" },
    REJECTED: { label: "Rejeitado", color: "text-red-500" },
    IGNORED: { label: "Ignorado", color: "text-blue-500" },
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {documentsData.data.map((item, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription className={statusMap[item.status]?.color}>
              {statusMap[item.status]?.label ?? "Status desconhecido"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Uploader
              id={item.id}
              type={item.type}
              apiKey={apiKey}
              status={item.status}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
