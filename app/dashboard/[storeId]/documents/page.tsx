import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { getPendingDocuments } from "@/lib/asaas";
import { eq } from "drizzle-orm";
import { PendingDocuments } from "@/types";
import { DocumentsClient } from "@/app/_features/_user/_components/_documents/client";

const DocumentsPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Unauthorized</div>;
  }

  const [data] = await db
    .select({
      apiKey: users.asaasApiKey,
    })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!data || !data.apiKey) {
    return <div>ApiKey not found</div>;
  }

  const documents = await getPendingDocuments(data.apiKey);

  const documentsData: PendingDocuments = documents.data;

  return <DocumentsClient documentsData={documentsData} apiKey={data.apiKey} />;
};

export default DocumentsPage;
