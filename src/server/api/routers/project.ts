import { pollCommits } from '@/lib/github'
import { checkCredits, indexGithubRepo } from '@/lib/github-loader'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { Octokit } from '@octokit/rest'
import React from 'react'
import {z} from 'zod'

export const projectRouter = createTRPCRouter({
createProject: protectedProcedure.input(
    z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional()
    })
    ).mutation(async({ctx, input})=>{    
        const user = await ctx.db.user.findUnique({where: {id: ctx.user.userId!}, select: {credits: true}})   
        if(!user){
            throw new Error('User not found')
        }
        const currentCredits = user.credits || 0
        const fileCount = await checkCredits(input.githubUrl, input.githubToken)

        if(currentCredits < fileCount){
            throw new Error('Insufficient credits')
        }
        // create a row in the project table of our DB
        const project = await ctx.db.project.create({
            data: {
                projectName: input.name,
                repoUrl: input.githubUrl,
                // since this field is optional we need to keep || null
                githubToken: input.githubToken || null,
                UserToProjects:{
                    create:{
                        // ! means we are sure that the user is logged in if not user shouldn't be here
                        userId: ctx.user.userId!,
                    }
                }
            }
        })
        await indexGithubRepo(project.id, input.githubUrl, input.githubToken)
        await pollCommits(project.id, ctx.user.userId!)
        await ctx.db.user.update({where: {id: ctx.user.userId!}, data: {credits: {decrement: fileCount}}})
        return project
    }),
    //get all logged in projects
    getProjects: protectedProcedure.query(async({ctx})=>{
        return await ctx.db.project.findMany({
            where:{
                UserToProjects:{
                    some:{
                        userId: ctx.user.userId!
                    }
                },
                deletedAt: null
            }
        })
    }),
    //get all commits for a specific project
    // getCommits: protectedProcedure.input(z.object({
    //     projectId: z.string()
    // })).query(async({ctx, input})=>{
    //     //fetch new commits, if new commits present summarize it
    //     pollCommits(input.projectId).then().catch(console.error)
    //     return await ctx.db.commit.findMany({
    //         where:{
    //             projectId: input.projectId
    //         }
    //     })
    // }),
    // -----------------------------------------------------
    // getCommits: protectedProcedure.input(z.object({
    //     projectId: z.string()
    //   })).query(async({ctx, input})=>{
    //     // First verify user has access to this project
    //     const project = await ctx.db.project.findFirst({
    //       where: {
    //         id: input.projectId,
    //         UserToProjects: {
    //           some: {
    //             userId: ctx.user.userId!
    //           }
    //         },
    //         deletedAt: null
    //       }
    //     });
      
    //     if (!project) {
    //       throw new Error("Project not found or user doesn't have access");
    //     }
      
    //     // Then get commits
    //     return await ctx.db.commit.findMany({
    //       where:{
    //         projectId: input.projectId
    //       }
    //     });
    // }),
    // -----------------------------------------------------
    // getCommits: protectedProcedure
    // .input(z.object({
    //   projectId: z.string()
    // }))
    // .query(async ({ ctx, input }) => {
    //   // First verify project access
    //   const project = await ctx.db.project.findFirst({
    //     where: {
    //       id: input.projectId,
    //       UserToProjects: {
    //         some: {
    //           userId: ctx.user.userId!
    //         }
    //       },
    //       deletedAt: null
    //     }
    //   });

    //   if (!project?.repoUrl) {
    //     throw new Error("Project not found or user doesn't have access");
    //   }

    //   // Extract owner and repo from repoUrl
    //   const repoUrlMatch = project.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    //   if (!repoUrlMatch?.[1] || !repoUrlMatch?.[2]) {
    //     throw new Error("Invalid GitHub repository URL");
    //   }

    //   const owner = repoUrlMatch[1];
    //   const repo = repoUrlMatch[2];

    //   // Initialize Octokit with fallback to environment token
    //   const token = project.githubToken || process.env.GITHUB_TOKEN;
    //   if (!token) {
    //     throw new Error("No GitHub token available");
    //   }

    //   const octokit = new Octokit({
    //     auth: token
    //   });

    //   try {
    //     // Fetch commits from GitHub
    //     const { data: githubCommits } = await octokit.repos.listCommits({
    //       owner,
    //       repo,
    //       per_page: 100 // Fetch up to 100 commits
    //     });

    //     // Process commits and handle database operations
    //     await Promise.all(
    //       githubCommits.map(async (commit) => {
    //         if (!commit.sha || !commit.commit) return;

    //         return ctx.db.commit.upsert({
    //           where: {
    //             commitHash: commit.sha
    //           },
    //           create: {
    //             commitHash: commit.sha,
    //             commitMessage: commit.commit.message || "",
    //             commitDate: new Date(commit.commit.author?.date || Date.now()),
    //             commitAuthorName: commit.commit.author?.name || "Unknown",
    //             commitAuthorAvatar: commit.author?.avatar_url || "",
    //             summary: "", // Required by schema
    //             projectId: project.id
    //           },
    //           update: {
    //             commitMessage: commit.commit.message || "",
    //             commitAuthorName: commit.commit.author?.name || "Unknown",
    //             commitAuthorAvatar: commit.author?.avatar_url || "",
    //           }
    //         });
    //       })
    //     );

    //     // Return all commits for the project
    //     return await ctx.db.commit.findMany({
    //       where: {
    //         projectId: project.id
    //       },
    //       orderBy: {
    //         commitDate: 'desc'
    //       }
    //     });

    //   } catch (error) {
    //     console.error('Error fetching commits:', error);
    //     throw new Error('Failed to fetch commits from GitHub');
    //   }
    // }),
    // -----------------------------------------------------
    getCommits: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      page: z.number().default(1)
    }))
    .query(async ({ ctx, input }) => {
      const COMMITS_PER_PAGE = 10;

      // First verify project access
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          UserToProjects: {
            some: {
              userId: ctx.user.userId!
            }
          },
          deletedAt: null
        }
      });

      if (!project?.repoUrl) {
        throw new Error("Project not found or user doesn't have access");
      }

      // Extract owner and repo from repoUrl
      const repoUrlMatch = project.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!repoUrlMatch?.[1] || !repoUrlMatch?.[2]) {
        throw new Error("Invalid GitHub repository URL");
      }

      const owner = repoUrlMatch[1];
      const repo = repoUrlMatch[2];

      // Initialize Octokit
      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
      });

      try {
        // Fetch commits from GitHub
        const { data: githubCommits } = await octokit.repos.listCommits({
          owner,
          repo,
          per_page: 100 // Fetch up to 100 commits to ensure we have enough for pagination
        });

        console.log(`Fetched ${githubCommits.length} commits from GitHub`);

        // Store commits in database
        for (const commit of githubCommits) {
          if (!commit.sha || !commit.commit) continue;

          try {
            await ctx.db.commit.upsert({
              where: {
                commitHash: commit.sha
              },
              create: {
                commitHash: commit.sha,
                commitMessage: commit.commit.message || "",
                commitDate: new Date(commit.commit.author?.date || Date.now()),
                commitAuthorName: commit.commit.author?.name || "Unknown",
                commitAuthorAvatar: commit.author?.avatar_url || "",
                summary: "", // Required by schema
                projectId: project.id
              },
              update: {
                commitMessage: commit.commit.message || "",
                commitAuthorName: commit.commit.author?.name || "Unknown",
                commitAuthorAvatar: commit.author?.avatar_url || ""
              }
            });
          } catch (error) {
            console.error('Error upserting commit:', error);
            // Continue with other commits even if one fails
          }
        }

        // Calculate pagination
        const skip = (input.page - 1) * COMMITS_PER_PAGE;

        // Return paginated commits from database
        const commits = await ctx.db.commit.findMany({
          where: {
            projectId: project.id
          },
          orderBy: {
            commitDate: 'desc'
          },
          skip,
          take: COMMITS_PER_PAGE
        });

        // Get total count for pagination
        const totalCommits = await ctx.db.commit.count({
          where: {
            projectId: project.id
          }
        });

        return {
          commits,
          totalPages: Math.ceil(totalCommits / COMMITS_PER_PAGE),
          currentPage: input.page,
          totalCommits
        };

      } catch (error) {
        console.error('Error fetching commits:', error);
        throw new Error('Failed to fetch commits from GitHub');
      }
    }),
    saveAnswer: protectedProcedure.input(z.object({
        projectId: z.string(),
        question: z.string(),
        filesReferenced: z.any(),
        answer: z.string()
    })).mutation(async({ctx, input})=>{
        //save the answer in the database
        return await ctx.db.question.create({
            data:{
                answer: input.answer,
                filesReferenced: input.filesReferenced,
                projectId: input.projectId,
                question: input.question,
                userId: ctx.user.userId!
            }
        })
    }),
    getQuestions: protectedProcedure.input(z.object({projectId: z.string()})).query(async({ctx, input})=>{
        return await ctx.db.question.findMany({
            where:{
                projectId: input.projectId
            },
            include:{
                user: true
            },
            orderBy:{
                createdAt: 'desc'
            }
        })
    }),
    // uploadMeeting: protectedProcedure.input(z.object({projectId: z.string(), meetingUrl: z.string(), name: z.string()}))
    // .mutation(async({ctx, input})=>{
    //     const meeting = await ctx.db.meeting.create({
    //         data:{
    //             meetingUrl: input.meetingUrl,
    //             name: input.name,
    //             projectId: input.projectId,
    //             status: 'PROCESSING'
    //         }
    //     })
    //     return meeting
    // }),
    uploadMeeting: protectedProcedure.input(z.object({projectId: z.string(), meetingUrl: z.string(), name: z.string()}))
    .mutation(async({ctx, input})=>{
        const meeting = await ctx.db.meeting.create({
            data:{
                meetingUrl: input.meetingUrl,
                name: input.name,
                projectId: input.projectId,
                status: 'PROCESSING'
            }
        })
        return meeting
    }),
    getMeetings: protectedProcedure.input(z.object({projectId: z.string()})).query(async({ctx, input})=>{
        return await ctx.db.meeting.findMany({
            where:{
                projectId: input.projectId
            },
            include:{
                issues: true
            }
        })
    }),
    deleteMeetings: protectedProcedure.input(z.object({meetingId: z.string()})).mutation(async({ctx, input})=>{
        return await ctx.db.meeting.delete({
            where:{
                id: input.meetingId
            }
        })
    }),
    getMeetingById: protectedProcedure.input(z.object({meetingId: z.string()})).query(async({ctx, input})=>{
        return await ctx.db.meeting.findUnique({
            where:{
                id: input.meetingId
            },
            include:{
                issues: true
            }
        })
    }),
    archiveProject: protectedProcedure.input(z.object({projectId: z.string()})).mutation(async({ctx, input})=>{
        return await ctx.db.project.update({
            where:{
                id: input.projectId
            },
            data:{
                deletedAt: new Date()
            }
        })
    }),
    getTeamMembers: protectedProcedure.input(z.object({projectId: z.string()})).query(async({ctx, input})=>{
        return await ctx.db.userToProject.findMany({
            where:{
                projectId: input.projectId
            },
            include:{
                user: true
            }
        })
    }),
    getUserCredits: protectedProcedure.query(async({ctx})=>{
        return await ctx.db.user.findUnique({
            where:{
                id: ctx.user.userId!
            },
            select:{
                credits: true
            }
        })
    }),
    checkCredits: protectedProcedure.input(z.object({githubUrl: z.string(), githubToken: z.string().optional()})).mutation(async({ctx, input})=>{
        console.log('checkCredits input:', input); // Log the input
        
        try {
            const fileCount = await checkCredits(input.githubUrl, input.githubToken);
            console.log('File count result:', fileCount); // Log the file count
      
            const userCredits = await ctx.db.user.findUnique({
              where: { id: ctx.user.userId! },
              select: { credits: true }
            });
            console.log('User credits:', userCredits); // Log user credits
      
            const result = {
              fileCount,
              userCredits: userCredits?.credits || 0
            };
            console.log('Final result:', result); // Log the final result
      
            return result;
          } catch (error) {
            console.error('Error in checkCredits:', error); // Log any errors
            throw error;
          }

        // const fileCount = await checkCredits(input.githubUrl, input.githubToken)
        // const userCredits = await ctx.db.user.findUnique({where: {id: ctx.user.userId!}, select: {credits: true}})
        // return {fileCount, userCredits: userCredits?.credits || 0}
    })
})