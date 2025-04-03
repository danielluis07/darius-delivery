"use client";

import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import { CloudUpload } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadDocumentToAsaas } from "@/app/_features/_user/_actions/upload-document";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export const Uploader = ({
  id,
  type,
  apiKey,
  status,
}: {
  id: string;
  type: string;
  apiKey: string;
  status: string;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleFileChange = (newFiles: File[] | null) => {
    if (newFiles && newFiles.length > 0) {
      setFile(newFiles[0]);
    } else {
      setFile(null);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    startTransition(async () => {
      try {
        await uploadDocumentToAsaas(id, type, file, apiKey);
        setSuccess(true);
        toast.success("Documento enviado com sucesso!");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao enviar o documento.");
      }
    });
  };

  return (
    <div className="space-y-4">
      <FileUploader
        dropzoneOptions={{ maxFiles: 1, maxSize: 1024 * 1024 * 5 }}
        value={file ? [file] : []}
        onValueChange={handleFileChange}
        className="relative bg-background rounded-lg p-5">
        <FileInput
          id="fileInput"
          style={{ cursor: status === "PENDING" ? "not-allowed" : "pointer" }}
          className={cn(
            status === "PENDING" && "pointer-events-none",
            "outline-dashed outline-1 outline-slate-500"
          )}>
          <div className="flex items-center justify-center flex-col p-8 w-full">
            <CloudUpload className="text-gray-500 w-10 h-10" />
            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Clique para fazer o upload</span>{" "}
              ou arraste
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PDF, JPG ou PNG
            </p>
          </div>
        </FileInput>
        <FileUploaderContent>
          {file && (
            <FileUploaderItem index={0}>
              <span>{file.name}</span>
            </FileUploaderItem>
          )}
        </FileUploaderContent>
      </FileUploader>

      <Button
        disabled={!file || isPending}
        onClick={handleUpload}
        className="w-full">
        {isPending ? "Enviando..." : success ? "Enviado com sucesso" : "Enviar"}
      </Button>
    </div>
  );
};
