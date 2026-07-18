import axios from "axios";

// Both providers use Bearer auth and return { data: [{ embedding: [...] }] }.
const PROVIDERS = {
  voyage: {
    url: "https://api.voyageai.com/v1/embeddings",
    defaultModel: "voyage-3-lite",
  },
  openai: {
    url: "https://api.openai.com/v1/embeddings",
    defaultModel: "text-embedding-3-small",
  },
};

// The whole feature is gated on this: no key in .env means questions are
// stored without vectors and the similar-questions endpoint returns nothing —
// the app never breaks, the feature just stays dark until configured.
export const isEmbeddingsEnabled = () =>
  Boolean(process.env.EMBEDDINGS_API_KEY);

export const embed = async (text) => {
  if (!isEmbeddingsEnabled()) return null;

  const providerName = process.env.EMBEDDINGS_PROVIDER || "voyage";
  const provider = PROVIDERS[providerName];
  if (!provider) {
    throw new Error(`Unknown embeddings provider: ${providerName}`);
  }

  const model = process.env.EMBEDDINGS_MODEL || provider.defaultModel;

  const response = await axios.post(
    provider.url,
    // Embedding models have input limits; question drafts are short anyway.
    { input: [text.slice(0, 8000)], model },
    {
      headers: { Authorization: `Bearer ${process.env.EMBEDDINGS_API_KEY}` },
      timeout: 10000,
    },
  );

  return response.data.data[0].embedding;
};

export const cosineSimilarity = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return 0;
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};
