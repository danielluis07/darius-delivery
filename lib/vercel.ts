export const createVercelDomain = async (domain: string) => {
  try {
    const res = await fetch(
      `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains?teamId=${process.env.VERCEL_TEAM_ID}`, // Adiciona teamId se existir
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: domain,
          gitBranch: null,
          customEnvironmentId: "",
          redirect: null,
        }),
      }
    );

    if (!res.ok) {
      const errorDetails = await res.json().catch(() => null);
      console.error("Error response from Vercel API:", {
        status: res.status,
        statusText: res.statusText,
        errorDetails,
      });

      if (res.statusText === "Conflict") {
        return {
          failed: true,
          failedMessage: "Esse domínio já está em uso",
        };
      }

      return {
        failed: true,
        failedMessage: "Falha ao criar o domínio",
      };
    }

    return {
      failed: false,
    };
  } catch (error) {
    console.error("Error creating creating vercel domain:", error);
    return {
      failed: true,
      failedMessage: "Erro interno ao criar o domínio.",
    };
  }
};
