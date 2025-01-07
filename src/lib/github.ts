import { db } from '@/server/db';
import { Octokit } from '@octokit/rest';
import axios from 'axios';
import { summarizeCommitContent } from './gemini';

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

// const githubUrl = "https://github.com/rugg07/Web3.0-Final";

//Get all commit details
export const getCommitHashes = async (githubUrl: string) => {
    
    // https://github.com/<owner>/<repo-name>
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if(!owner || !repo){
        throw new Error('Invalid Github URL')
    }

    const { data } = await octokit.rest.repos.listCommits({
        owner: owner,
        repo: repo,
    });

    const sortedCommits = data.sort((a: any, b: any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()) as any[]

    //return first 10 sorted commits
    return sortedCommits.slice(0,10).map((commit:any)=>({
        commitHash: commit.sha as string,
        commitMessage: commit.commit.message ?? "",
        commitAuthorName: commit.commit?.author?.name ?? "",
        commitAuthorAvatar: commit?.author?.avatar_url ?? "",
        commitDate: commit.commit?.author?.date ?? ""
    }))

};

// console.log(await getCommitHashes(githubUrl))

// export const pollCommits = async (projectId: string) => {
//     const {project, githubUrl} = await fetchProjectsGithubUrl(projectId)
//     const commitHashes = await getCommitHashes(githubUrl)
//     //checking if we have already saved the commit to the db - Dont want to generate ai summary everytime
//     const unprocessedCommits = await filterUnproccessedCommits(projectId, commitHashes)
//     const summaryResponses = await Promise.allSettled(unprocessedCommits.map((commit) => {
//         return summarizeCommit(githubUrl, commit.commitHash)
//     }))
//     const summaries = summaryResponses.map((response)=>{
//         if (response.status === 'fulfilled') {
//             return response.value as string;
//         }
//         return ""
//     })
//     //save summaries to the db
//     const commits = await db.commit.createMany({
//         data: summaries.map((summary, index) => {
//             console.log(`processing commit ${index}`)
//             return {
//                 // ! - for what definitely exists. ? - for what might not exist
//                 projectId: projectId,
//                 commitHash: unprocessedCommits[index]!.commitHash,
//                 commitMessage: unprocessedCommits[index]!.commitMessage,
//                 commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
//                 commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
//                 commitDate: unprocessedCommits[index]!.commitDate,
//                 summary: summary
//             }
//         })
//     })
//     return commits
// }
export const pollCommits = async (projectId: string, userId: string) => {
    const {project, githubUrl} = await fetchProjectsGithubUrl(projectId)
    const commitHashes = await getCommitHashes(githubUrl)
    //checking if we have already saved the commit to the db - Dont want to generate ai summary everytime
    const unprocessedCommits = await filterUnproccessedCommits(projectId, commitHashes)
    const summaryResponses = await Promise.allSettled(unprocessedCommits.map((commit) => {
        return summarizeCommit(githubUrl, commit.commitHash)
    }))
    const summaries = summaryResponses.map((response)=>{
        if (response.status === 'fulfilled') {
            return response.value as string;
        }
        return ""
    })
    //save summaries to the db
    const commits = await db.commit.createMany({
        data: summaries.map((summary, index) => {
            console.log(`processing commit ${index}`)
            return {
                // ! - for what definitely exists. ? - for what might not exist
                projectId: projectId,
                commitHash: unprocessedCommits[index]!.commitHash,
                commitMessage: unprocessedCommits[index]!.commitMessage,
                commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
                commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
                commitDate: unprocessedCommits[index]!.commitDate,
                summary: summary
            }
        })
    })
    return commits
}

async function summarizeCommit(githubUrl: string, commitHash: string) {
    const {data} = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
        headers: {
            // custom gtihub formatting
            Accept: 'application/vnd.github.v3.diff'
        }
    })
    return await summarizeCommitContent(data) || ""
}

//getting deatils for specific project with its projectId
async function fetchProjectsGithubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: {id: projectId},
        select: {repoUrl: true}
    })
    if (!project?.repoUrl) {
        throw new Error('Project has no Github Url')
    }
    return {project, githubUrl: project?.repoUrl}
}


async function filterUnproccessedCommits(projectId: string, commitHashes: Response[]) {
    // commits saved in the DB
    const processedCommits = await db.commit.findMany({
        where: {projectId},
    })
    // filter out the commits that have already been processed
    const unprocessedCommits = commitHashes.filter((commit) => !processedCommits.some((processedCommit) => processedCommit.commitHash === commit.commitHash))
    return unprocessedCommits
}

// await pollCommits('cm5f9ms2j000idmeeo81di7od').then(console.log)