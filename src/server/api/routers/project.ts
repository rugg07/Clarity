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
})