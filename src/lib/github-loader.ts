//takes github url and returns back bunch of files present in the github url
import {GithubRepoLoader} from '@langchain/community/document_loaders/web/github'
import {Document} from '@langchain/core/documents'
import { generateEmbedding, summarizeCode } from './gemini';
import { db } from '@/server/db';
import { Octokit } from '@octokit/rest';

export const getFileCount = async (path: string, octokit: Octokit, githubOwner: string, githubRepo: string, acc: number = 0) => {
  //recursive: to get all files in the repo, acc: to keep track of the number of files
  const {data} = await octokit.rest.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path
  })
  if(!Array.isArray(data) && data.type === 'file'){
    return acc + 1
  }
  if(Array.isArray(data)){
    let fileCount = 0
    const directories: string [] = []
    for (const item of data){
      if(item.type === 'file'){
        fileCount++
      } else if(item.type === 'dir'){
        directories.push(item.path)
      }
    }

    if(directories.length > 0){
      const directoryCounts = await Promise.all(
        directories.map(dirPath => getFileCount(dirPath, octokit, githubOwner, githubRepo, 0))
      )
      fileCount += directoryCounts.reduce((acc, count) => acc + count, 0)
    }
    return acc + fileCount
  }
  return acc
}
export const checkCredits = async(githubUrl: string, githubToken?: string) => {
  // find out how many files are in the repo
  const octokit = new Octokit({auth: githubToken})
  const githubOwner = githubUrl.split('/')[3]
  const githubRepo = githubUrl.split('/')[4]
  if(!githubOwner || !githubRepo){
    return 0
  }
  const fileCount = await getFileCount('', octokit, githubOwner, githubRepo, 0)
  return fileCount
}

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

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
  const BATCH_SIZE = 5; // Process just 2 files at a time
  const BATCH_DELAY = 30000; // 2 minutes between batches

  try {
    // Check for existing embeddings first
    const existingEmbeddings = await db.sourceCodeEmbedding.findMany({
      where: { projectId },
      select: { fileName: true }
    });
    const processedFiles = new Set(existingEmbeddings.map(e => e.fileName));

    const docs = await loadGithubRepo(githubUrl, githubToken);
    const remainingDocs = docs.filter(doc => !processedFiles.has(doc.metadata.source));
    
    console.log(`Found ${remainingDocs.length} files to process out of ${docs.length} total files`);

    for (let i = 0; i < remainingDocs.length; i += BATCH_SIZE) {
      const batch = remainingDocs.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(remainingDocs.length/BATCH_SIZE)}`);

      for (const doc of batch) {
        try {
          const summary = await summarizeCode(doc);
          const embedding = await generateEmbedding(summary);

          // Insert row first without vector
          await db.sourceCodeEmbedding.create({
            data: {
              // projectId,
              fileName: doc.metadata.source,
              sourceCode: doc.pageContent,
              summary,
              project: {
                connect: { id: projectId }
              }
            }
          });

          // Then update with vector data
          const createdEmbedding = await db.sourceCodeEmbedding.findFirst({
            where: {
              projectId,
              fileName: doc.metadata.source
            },
            // orderBy: { createdAt: 'desc' }
          });

          if (createdEmbedding) {
            await db.$executeRaw`
              UPDATE "SourceCodeEmbedding"
              SET "summaryEmbedding" = ${embedding}::vector
              WHERE "id" = ${createdEmbedding.id}
            `;
            console.log(`Successfully processed ${doc.metadata.source}`);
          }
        } catch (error) {
          console.error(`Failed to process ${doc.metadata.source}:`, error);
          // Continue with next file even if this one fails
        }
      }

      if (i + BATCH_SIZE < remainingDocs.length) {
        console.log(`Waiting ${BATCH_DELAY/1000} seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    return true;
  } catch (error) {
    console.error('Error in indexGithubRepo:', error);
    throw error;
  }
};
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

