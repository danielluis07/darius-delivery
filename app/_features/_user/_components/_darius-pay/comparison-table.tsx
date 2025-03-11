"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const comparisonData = [
  {
    descricao: "Taxa para Parceria Premium",
    outraPlataforma: "15%",
    dariusPay: "8%",
  },
  {
    descricao: "Taxa de Suporte Prioritário",
    outraPlataforma: "Cobrança adicional",
    dariusPay: "Incluso",
  },
  {
    descricao: "Taxa de Pagamento Online",
    outraPlataforma: "3,99% por transação",
    dariusPay: "1,9% por transação",
  },
  {
    descricao: "Taxa de Adesão",
    outraPlataforma: "R$ 600",
    dariusPay: "R$ 250",
  },
];

export function ComparisonTable() {
  return (
    <div className="rounded-md border my-5">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Outra Plataforma</TableHead>
            <TableHead>Darius Pay</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comparisonData.map((item) => (
            <TableRow key={item.descricao}>
              <TableCell className="font-medium">{item.descricao}</TableCell>
              <TableCell>{item.outraPlataforma}</TableCell>
              <TableCell>{item.dariusPay}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
