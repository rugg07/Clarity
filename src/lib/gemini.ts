import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const summarizeCommitContent = async (diff: string) => {
    // Creating summaries for code changes on specific commits. https://github.com/<owner>/<repo-name>/commit/<commit-hash>.diff;
 
    const response = await model.generateContent([
        `You are an expert programmer, and you are trying to summarize a git diff.
        Reminders about the git diff format:
        For every file, there are a few metadata lines, like (for example):
        \`\`\`
        diff - git a/lib/index.js b/lib/index.js 
        index aadf691. bfef603 100644
        --- a/lib/index.js
        +++ b/lib/index.js
        \`\`\`
        This means that \'lib/index.js\` was modified in this commit. Note that this is only an example.
        Then there is a specifier of the lines that were modified.
        A line starting with \`+\` means it was added.
        A line that starting with \`-\` means that line was deleted.
        A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
        It is not part of the diff.
        [...]
        EXAMPLE SUMMARY COMMENTS:
        Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
        Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
        Moved the \'octokit\` initialization to a separate file (src/octokit.ts], [src/index.ts]
        Added an OpenAI API for completions [packages/utils/apis/openai.ts]
        Lowered numeric tolerance for test files
        \`\`\`
        Most commits will have less comments than this examples list.
        The last comment does not include the file names.
        because there were more than two relevant files in the hypothetical commit.
        Do not include parts of the example in your summary.
        It is given as an example of appropriate comments.`, `Please summarize the followinf diff file: \n\n${diff}`,
    ]);
    return response.response.text()
}

export async function summarizeCode(doc: Document): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 60000; // 1 minute
  
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const code = doc.pageContent.slice(0, 10000);
        const prompt = `You are an expert programmer, and an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects.
                       You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.
                       Here is the code -
                       
                       ${code}
                       
                       Give a summary no more than 100 words of the code above`;
  
        const response = await model.generateContent({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }]
        });
  
        return response.response.text();
      } catch (error: any) {
        console.log(`Attempt ${attempt + 1} failed for ${doc.metadata.source}`);
        
        if (error.message?.includes('429') && attempt < MAX_RETRIES - 1) {
          console.log(`Rate limited, waiting ${RETRY_DELAY/1000} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          continue;
        }
        throw error;
      }
    }
  
    throw new Error(`Failed to summarize after ${MAX_RETRIES} attempts`);
  }
  
  export async function generateEmbedding(summary: string): Promise<number[]> {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 60000; // 1 minute
  
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const result = await model.embedContent(summary);
        const embedding = result.embedding;
        if (!embedding) {
          throw new Error('No embedding generated');
        }
        return embedding.values;
      } catch (error: any) {
        console.log(`Attempt ${attempt + 1} failed for embedding generation`);
        
        if (error.message?.includes('429') && attempt < MAX_RETRIES - 1) {
          console.log(`Rate limited, waiting ${RETRY_DELAY/1000} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          continue;
        }
        throw error;
      }
    }
  
    throw new Error(`Failed to generate embedding after ${MAX_RETRIES} attempts`);
  }