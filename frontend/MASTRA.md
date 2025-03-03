# How to Setup a RAG Project with Mastra.ai? (I'm a Senior Software Engineer)

As a senior software engineer, you're likely familiar with the core concepts of Retrieval-Augmented Generation (RAG) and are looking for a practical, hands-on guide to setting up a RAG project with Mastra.ai. Mastra is a TypeScript-based AI agent framework that simplifies building RAG pipelines by providing abstractions for document processing, embedding generation, vector storage, and retrieval. Below, I'll walk you through the steps to set up a RAG project using Mastra, tailored to your expertise, with code examples and explanations grounded in its official documentation and capabilities as of March 02, 2025.

## Prerequisites

Before diving in, ensure you have:

- Node.js (v18+ recommended) and npm installed.
- A TypeScript project environment (you can use an existing one or set up a new one).
- An API key for an embedding provider (e.g., OpenAI's text-embedding-3-small model).
- A vector store setup (e.g., PostgreSQL with pgvector, Pinecone, or Qdrant). For this example, I'll use pgvector since it's common and integrates well with Mastra.

## Step 1: Initialize a Mastra Project

Mastra provides a CLI to scaffold a project. Open your terminal and run:

```bash
npm create mastra@latest
```

Follow the prompts:

- Name your project (e.g., rag-demo).
- Select components: Choose Agents and RAG.
- Pick an LLM provider (e.g., OpenAI) and opt for example code if you want a starting point.

This generates a project structure with a mastra.config.ts file, src/ directory, and dependencies.

Next, install the dependencies:

```bash
cd rag-demo
npm install
```

Add your OpenAI API key to a .env file in the root:

```env
OPENAI_API_KEY=your-openai-api-key
POSTGRES_CONNECTION_STRING=postgres://user:password@localhost:5432/dbname
```

## Step 2: Configure the Vector Store

For this example, we'll use pgvector with PostgreSQL. Ensure your PostgreSQL instance has the pgvector extension installed (e.g., via CREATE EXTENSION vector; in your DB).

In mastra.config.ts, configure the vector store:

```typescript
import { Mastra } from "@mastra/core";
import { PgVector } from "@mastra/pg";

const pgVector = new PgVector(process.env.POSTGRES_CONNECTION_STRING!);

export const mastra = new Mastra({
  vectors: {
    pgVector,
  },
  agents: {}, // We'll add an agent later
});
```

This sets up pgVector as your vector store. Mastra supports other stores like Pinecone or Qdrant if you prefer—check the Mastra Docs for alternatives.

## Step 3: Process Documents and Generate Embeddings

RAG requires splitting documents into chunks, embedding them, and storing them in the vector store. Create a file src/rag/setup.ts to handle this:

```typescript
import { MDocument } from "@mastra/rag";
import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { mastra } from "../../mastra.config";

async function setupRAG() {
  // 1. Initialize a document (e.g., from text)
  const doc = MDocument.fromText(`
    Mastra is a TypeScript framework for building AI agents.
    It supports RAG, workflows, and integrations.
    Use it to prototype and productionize AI features quickly.
  `);

  // 2. Chunk the document
  const chunks = await doc.chunk({
    strategy: "recursive", // Recursive splitting
    size: 512,             // Chunk size in characters
    overlap: 50,           // Overlap between chunks
  });

  // 3. Generate embeddings
  const { embeddings } = await embedMany({
    values: chunks.map(chunk => chunk.text),
    model: openai.embedding("text-embedding-3-small"),
  });

  // 4. Store embeddings in the vector store
  const vectorStore = mastra.getVector("pgVector");
  await vectorStore.createIndex("embeddings", 1536); // Dimension matches OpenAI's embedding model
  await vectorStore.upsert(
    "embeddings",
    embeddings,
    chunks.map(chunk => ({ text: chunk.text })) // Metadata
  );

  console.log("RAG setup complete!");
}

setupRAG().catch(console.error);
```

Run this script:

```bash
npx ts-node src/rag/setup.ts
```

This processes a sample text, but you can extend it to load files (PDFs, Markdown, etc.) using MDocument.fromFile() or fetch data from APIs.

## Step 4: Create an Agent with RAG Capabilities

Now, let's create an agent that uses the RAG pipeline. In src/agents/ragAgent.ts:

```typescript
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { createGraphRAGTool } from "@mastra/rag";

export const ragAgent = new Agent({
  name: "RAGAgent",
  instructions: `
    You are an assistant that answers questions based on retrieved context.
    Use the provided RAG tool to fetch relevant information before responding.
  `,
  model: openai("gpt-4o-mini"),
  tools: {
    graphRagTool: createGraphRAGTool({
      vectorStoreName: "pgVector",
      indexName: "embeddings",
      model: openai.embedding("text-embedding-3-small"),
      topK: 5, // Retrieve top 5 relevant chunks
    }),
  },
});
```

Update mastra.config.ts to include the agent:

```typescript
import { Mastra } from "@mastra/core";
import { PgVector } from "@mastra/pg";
import { ragAgent } from "./src/agents/ragAgent";

const pgVector = new PgVector(process.env.POSTGRES_CONNECTION_STRING!);

export const mastra = new Mastra({
  vectors: {
    pgVector,
  },
  agents: {
    ragAgent,
  },
});
```

The createGraphRAGTool enhances retrieval by building a knowledge graph, but you can use simpler retrieval if preferred.

## Step 5: Query the RAG System

Test your setup with a query function in src/rag/query.ts:

```typescript
import { mastra } from "../../mastra.config";

async function queryRAG(query: string) {
  const agent = mastra.getAgent("ragAgent");
  const response = await agent.generate([
    { role: "user", content: query },
  ]);
  console.log("Query:", query);
  console.log("Response:", response.text);
}

queryRAG("What does Mastra do?").catch(console.error);
```

Run it:

```bash
npx ts-node src/rag/query.ts
```

The agent retrieves relevant chunks from the vector store and generates a response grounded in that context.

## Step 6: Run the Development Environment

Mastra's playground lets you interact with your agent locally. Start it with:

```bash
npm run dev
```

Visit `http://localhost:4111` (or the port specified) to chat with your agent and inspect its state, memory, and retrievals.

## Step 7: Deploy (Optional)

For production, bundle your project:

```bash
mastra build
```

Deploy to a Node.js server or a serverless platform (e.g., Vercel, Cloudflare Workers) using Mastra's deploy helpers. For example, with Vercel:

```typescript
import { VercelDeployer } from "@mastra/deployer-vercel";
// Add to mastra.config.ts
deployer: new VercelDeployer({ scope: "your-scope", projectName: "rag-demo" }),
```

## Key Customization Tips for a Senior Engineer

- **Chunking Strategy**: Experiment with strategy: "sliding" or semantic chunking in doc.chunk() for better context preservation.
- **Embedding Model**: Swap OpenAI for Cohere or another provider if latency or cost is a concern.
- **Vector Store**: Scale up with Pinecone for large datasets or stick with pgvector for simplicity.
- **Observability**: Enable OpenTelemetry tracing in workflows (built into Mastra) to debug retrieval performance.
- **Error Handling**: Add retries or fallbacks in setupRAG() and queryRAG() for robustness.

## Why Mastra?

Mastra abstracts away much of the RAG boilerplate (chunking, embedding, retrieval) while giving you TypeScript's type safety and flexibility to integrate with existing Node.js apps. As a senior engineer, you'll appreciate its modularity and developer-first experience, letting you focus on application logic rather than infrastructure.

Let me know if you want to dive deeper into any part—e.g., optimizing retrieval, integrating with a specific data source, or scaling the vector store!

## Can I use Anthropic API key instead?

Yes, you can absolutely use an Anthropic API key instead of OpenAI's for your RAG project with Mastra.ai! Mastra's framework is designed to be LLM-agnostic, supporting multiple providers, including Anthropic, through the @ai-sdk library or direct integration. Below, I'll show you how to adapt the setup from my previous response to use Anthropic's models (e.g., Claude) instead of OpenAI's, focusing on the key changes you'd need to make as a senior software engineer.

### Prerequisites Update

Replace or supplement the OpenAI API key with an Anthropic API key in your .env file:

```env
ANTHROPIC_API_KEY=your-anthropic-api-key
POSTGRES_CONNECTION_STRING=postgres://user:password@localhost:5432/dbname
```

Install the Anthropic SDK if you plan to use it directly (optional, since @ai-sdk/anthropic is sufficient for Mastra):

```bash
npm install @anthropic-ai/sdk
```

### Key Considerations

Anthropic doesn't provide embedding models (as of March 02, 2025), so you'll still need an embedding provider like OpenAI, Cohere, or a local model (e.g., via @xenova/transformers) for the RAG retrieval step. However, you can use Anthropic's Claude models (e.g., claude-3-5-sonnet) for the generation step. I'll assume you'll pair Anthropic's Claude for generation with OpenAI for embeddings, but I'll note alternatives where applicable.

### Step 1: Update the Embedding Setup

Since Anthropic doesn't offer embeddings, keep OpenAI (or another provider) for this part. The src/rag/setup.ts file from the previous example remains mostly unchanged:

```typescript
import { MDocument } from "@mastra/rag";
import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { mastra } from "../../mastra.config";

async function setupRAG() {
  const doc = MDocument.fromText(`
    Mastra is a TypeScript framework for building AI agents.
    It supports RAG, workflows, and integrations.
    Use it to prototype and productionize AI features quickly.
  `);

  const chunks = await doc.chunk({
    strategy: "recursive",
    size: 512,
    overlap: 50,
  });

  const { embeddings } = await embedMany({
    values: chunks.map(chunk => chunk.text),
    model: openai.embedding("text-embedding-3-small"),
  });

  const vectorStore = mastra.getVector("pgVector");
  await vectorStore.createIndex("embeddings", 1536); // Matches OpenAI embedding dimension
  await vectorStore.upsert(
    "embeddings",
    embeddings,
    chunks.map(chunk => ({ text: chunk.text }))
  );

  console.log("RAG setup complete!");
}

setupRAG().catch(console.error);
```

Alternative: If you want to avoid OpenAI entirely, use Cohere's embeddings:

```bash
npm install @ai-sdk/cohere
```

```typescript
import { cohere } from "@ai-sdk/cohere";
// ...
const { embeddings } = await embedMany({
  values: chunks.map(chunk => chunk.text),
  model: cohere.embedding("embed-english-v3.0"),
});
await vectorStore.createIndex("embeddings", 1024); // Cohere's dimension
```

### Step 2: Update the Agent to Use Anthropic

Modify src/agents/ragAgent.ts to use Anthropic's Claude model for generation. You'll need to import @ai-sdk/anthropic and configure the agent:

```typescript
import { Agent } from "@mastra/core/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { createGraphRAGTool } from "@mastra/rag";
import { openai } from "@ai-sdk/openai"; // Still needed for embeddings

export const ragAgent = new Agent({
  name: "RAGAgent",
  instructions: `
    You are an assistant that answers questions based on retrieved context.
    Use the provided RAG tool to fetch relevant information before responding.
  `,
  model: anthropic("claude-3-5-sonnet-20241022"), // Use Anthropic's Claude model
  tools: {
    graphRagTool: createGraphRAGTool({
      vectorStoreName: "pgVector",
      indexName: "embeddings",
      model: openai.embedding("text-embedding-3-small"), // Embedding model remains OpenAI
      topK: 5,
    }),
  },
});
```

Update mastra.config.ts as before to register the agent (no changes needed there unless you're adding more agents).

### Step 3: Test the Query

The src/rag/query.ts file remains the same, as it's agnostic to the model provider:

```typescript
import { mastra } from "../../mastra.config";

async function queryRAG(query: string) {
  const agent = mastra.getAgent("ragAgent");
  const response = await agent.generate([
    { role: "user", content: query },
  ]);
  console.log("Query:", query);
  console.log("Response:", response.text);
}

queryRAG("What does Mastra do?").catch(console.error);
```

Run it:

```bash
npx ts-node src/rag/query.ts
```

Claude will now generate the response using the context retrieved by the RAG tool.

### Step 4: Dependency Check

Ensure you have the Anthropic SDK installed:

```bash
npm install @ai-sdk/anthropic
```

Your package.json should include:

```json
{
  "dependencies": {
    "@ai-sdk/anthropic": "^latest",
    "@ai-sdk/openai": "^latest", // If keeping OpenAI for embeddings
    "@mastra/core": "^latest",
    "@mastra/pg": "^latest",
    "@mastra/rag": "^latest"
  }
}
```

### Fully Anthropic-Free Alternative (Optional)

If you want to ditch OpenAI entirely and Anthropic doesn't provide embeddings, use a local embedding model with Mastra. Install @xenova/transformers:

```bash
npm install @xenova/transformers
```

Update src/rag/setup.ts:

```typescript
import { MDocument } from "@mastra/rag";
import { TransformersEmbeddingModel } from "@xenova/transformers";
import { mastra } from "../../mastra.config";

const embedder = new TransformersEmbeddingModel("all-MiniLM-L6-v2"); // ~384 dimensions

async function setupRAG() {
  const doc = MDocument.fromText(`...`);
  const chunks = await doc.chunk({ strategy: "recursive", size: 512, overlap: 50 });

  const embeddings = await embedder.embed(chunks.map(chunk => chunk.text));

  const vectorStore = mastra.getVector("pgVector");
  await vectorStore.createIndex("embeddings", 384); // Match MiniLM dimension
  await vectorStore.upsert(
    "embeddings",
    embeddings,
    chunks.map(chunk => ({ text: chunk.text }))
  );
}

setupRAG().catch(console.error);
```

Then update the RAG tool in ragAgent.ts:

```typescript
tools: {
  graphRagTool: createGraphRAGTool({
    vectorStoreName: "pgVector",
    indexName: "embeddings",
    model: embedder, // Use the local embedder
    topK: 5,
  }),
},
```

This keeps everything local except for Claude's generation, minimizing external API dependencies.

### Final Notes

- **Anthropic Strengths**: Claude excels at reasoning and safety, so it's a great choice for generation in a RAG setup. Its token limit (e.g., 200k for Claude 3.5 Sonnet) also handles large contexts well.
- **Embedding Limitation**: Since Anthropic lacks embeddings, you're still tied to another provider unless you go local. Check Anthropic's roadmap—they might add embeddings post-March 2025.
- **Performance**: Local embeddings (e.g., MiniLM) are lighter but less powerful than OpenAI/Cohere. Test retrieval quality with your data.

Let me know if you need help tweaking this further—say, optimizing Claude's prompt or integrating a different embedding provider!
