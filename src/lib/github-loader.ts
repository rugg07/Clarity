//takes github url and returns back bunch of files present in the github url
import {GithubRepoLoader} from '@langchain/community/document_loaders/web/github'
import {Document} from '@langchain/core/documents'
import { generateEmbedding, summarizeCode } from './gemini';
import { db } from '@/server/db';

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
    const branches = ['main', 'master']; // List of branches to try
    // let docs;
    let docs = null;
  
    for (const branch of branches) {
      try {
        console.log(`Trying branch: ${branch}`);
        const loader = new GithubRepoLoader(githubUrl, {
          //Either token from the user or empty
          accessToken: githubToken || "",
          branch: branch,
          ignoreFiles: [
            "package-lock.json",
            "yarn.lock",
            ".gitignore",
            "pnpm-lock.yaml",
            "bun.lockb",
          ],
          // if true it sees every file in repo otherwise it sees only top level files
          recursive: true,
          // if binary file or pdfs present
          unknown: "warn",
          maxConcurrency: 5,
        });
        docs = await loader.load();
        console.log(`Successfully loaded from branch: ${branch}`);
        break; // Exit the loop if successful
      } catch (error) {
        console.warn(`Failed to load from branch ${branch}:`, error);
      }
    }
  
    if (!docs) {
      throw new Error(
        `Unable to load repository. Tried branches: ${branches.join(", ")}`
      );
    }
  
    return docs;
  };
  
//   // Example usage:
//   console.log(
//     await loadGithubRepo("https://github.com/rugg07/Web3.0-Final", process.env.GITHUB_TOKEN)
//   );
export const indexGithubRepo = async (projectId: string ,githubUrl: string, githubToken?: string) => {
    const docs = await loadGithubRepo(githubUrl, githubToken);
    const allEmbeddings = await generateEmbeddings(docs);
    await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
        console.log(`processing ${index} embedding of ${allEmbeddings.length}`)
        if(!embedding) return
        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
            // insert row first without vector then update it with vector (SQL query below)
            data: {
                projectId,
                fileName: embedding.fileName,
                sourceCode: embedding.sourceCode,
                summary: embedding.summary
            }
        })
        // embedding.embedding is the vector. Cant put vector directly in data{} since it is not supported yet so we need to write raw sql query
        await db.$executeRaw`
        UPDATE "SourceCodeEmbedding" 
        SET "summaryEmbedding" = ${embedding.embedding}::vector 
        WHERE "id" = ${sourceCodeEmbedding.id}
        `
    }))
}


// 1. Look through files -Generate Ai summary of file
// 2. Take summary and create vector embedding of it
const generateEmbeddings = async (docs: Document[]) => {
      return await Promise.all(docs.map(async (doc) => {
        const summary = await summarizeCode(doc);
        const embedding = await generateEmbedding(summary);
        console.log('Data being inserted:', {
          sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
          fileName:  doc.metadata.source,
          summary: summary,
          embedding: embedding
        });
        return { 
          summary, 
          embedding,
          sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
          fileName: doc.metadata.source,
        };
      }))
}

