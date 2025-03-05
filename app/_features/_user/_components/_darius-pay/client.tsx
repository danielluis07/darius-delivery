"use client";

import {
  columns,
  ResponseType,
} from "@/app/_features/_user/_components/_darius-pay/columns";
import { TransfersDataTable } from "@/app/_features/_user/_components/_darius-pay/data-table";

export const TransfersClient = ({ data }: { data: ResponseType[] }) => {
  return (
    <div className="w-full">
      <h1 className="text-xl font-bold mb-10">Pedidos de saque</h1>
      <TransfersDataTable
        columns={columns}
        data={data || []}
        searchKey="value"
      />
    </div>
  );
};
