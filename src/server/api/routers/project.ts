import { pollCommits } from '@/lib/github'
import { checkCredits, indexGithubRepo } from '@/lib/github-loader'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
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
        await pollCommits(project.id)
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
    getCommits: protectedProcedure.input(z.object({
        projectId: z.string()
    })).query(async({ctx, input})=>{
        //fetch new commits, if new commits present summarize it
        pollCommits(input.projectId).then().catch(console.error)
        return await ctx.db.commit.findMany({
            where:{
                projectId: input.projectId
            }
        })
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