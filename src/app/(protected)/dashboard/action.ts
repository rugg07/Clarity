'use server'
import {streamText} from 'ai';
import {createStreamableValue} from 'ai/rsc'
import {createGoogleGenerativeAI} from '@ai-sdk/google'
import { generateEmbedding } from '@/lib/gemini'
import { db } from '@/server/db';

const google = createGoogleGenerativeAI({
   apiKey: process.env.GEMINI_API_KEY
})

// Retrieving relevant context from a database.
// Feeding the question and context to the AI model.
// Streaming the AI's response back to the client.
export async function askQuestion(question: string, projectId: string){
    // hold the dynamically generated AI response and stream updates to the clien
    const stream = createStreamableValue()

    // creates a vector representation of the user's question.
    const queryVector = await generateEmbedding(question)
    const vectorQuery = `[${queryVector.join(',')}]`
    console.log('Vector Query:', vectorQuery);


    // This query retrieves the top 10 database rows where:
    // The similarity between the query vector (summaryEmbedding <=> vectorQuery) is greater than 0.5 (threshold).
    // The project ID matches the given projectId.
    // The query orders results by similarity in descending order.

    const result = await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1-("summaryEmbedding" <=> ${vectorQuery}::vector) > .5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
    ` as {fileName: string; sourceCode: string; summary: string}[]

    // // Worked
    // const result = await db.$queryRaw`
    // SELECT "fileName", "sourceCode", "summary"
    // FROM "sourceCodeEmbedding"
    // WHERE "projectId" = ${projectId}
    // LIMIT 10;
    // ` as {fileName: string; sourceCode: string; summary: string}[]


    let context = ''

    // for (const doc of result){
    //     // Concatenates relevant codebase details (file name, code content, and summary) into a single context string.
    //     context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\n summary of file: ${doc.summary}\n\n`
    // }
    for (const doc of result) {
        context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\n summary of file: ${doc.summary}\n\n`;
    }
    // Query AI Model
    (async ()=>{
        const {textStream} = await streamText
        ({
            model: google('gemini-1.5-flash'),
            prompt: `
            You are a ai code assistant who answers questions about the codebase. Your target audience is a technical intern who is looking to understand the codebase.
            AI. assistant is a brand new, powerful, human-like artificial intelligence.
            The traits of AI include expert knowledge, helpfulness, cleverness, and
            articulateness.
            AI is a well-behaved and well-mannered individual.
            AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
            AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
            If the question is asking about code or a specific file, AI will provide the detailed answer, giving step by step instructions, including code snippets.,
            START CONTEXT BLOCK
            ${context}
            END OF CONTEXT BLOCK
            START QUESTION
            ${question}
            END OF QUESTION
            `,
        });
        // AI's response is streamed back in chunks (delta) and continuously updates the stream.
        // Once streaming is complete, stream.done() is called
        for await (const delta of textStream){
            stream.update(delta)
        }
        stream.done()
    })()
    console.log('Files referenced are:', result)
    return {
        output: stream.value,
        filesReferenced: result
    }
}