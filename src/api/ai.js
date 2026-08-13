const API_URL =
  "https://ai-api.userfacet.com/v1/chat/completions";

export async function callAI(messages) {
  const token =
    import.meta.env.VITE_USERFACET_API_TOKEN;

  if (!token) {
    throw new Error(
      "Userfacet API token is missing."
    );
  }

  const response = await fetch(API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1000,
      temperature: 0.4,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "Userfacet API request failed."
    );
  }

  return data.choices[0].message.content;
}