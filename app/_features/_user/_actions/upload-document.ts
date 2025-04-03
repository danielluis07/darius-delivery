"use server";

export async function uploadDocumentToAsaas(
  id: string,
  type: string,
  file: File,
  apikey: string
) {
  const formData = new FormData();
  formData.append("documentFile", file);
  formData.append("type", type);

  const response = await fetch(
    `${process.env.ASAAS_API_URL}/myAccount/documents/${id}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        access_token: apikey,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao enviar: ${errorText}`);
  }

  return await response.json();
}
