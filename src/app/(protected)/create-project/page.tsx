'use client'
import ShineBorder from '@/components/ui/shine-border'
import React from 'react'
import { CardWithForm } from '../projectCreate'
import { HeroHighlight, Highlight } from '@/app/_components/hero-highlight'
import { motion } from 'framer-motion'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import useRefetch from '@/hooks/use-refetch'


const CreateProjectPage = () => {
    // since we are on frontend we get api from @/trpc/react
    const createProject = api.project.createProject.useMutation()
    console.log('is pending', createProject.isPending)

    const refetch = useRefetch();

    const handleSubmit = (data: { repoUrl: string; projectName: string; githubToken?: string }) => {
        // console.log('Form Data:', data);
        window.alert('Form Data: ' + JSON.stringify(data, null, 2));
        createProject.mutate({
            githubUrl: data.repoUrl,
            name: data.projectName,
            githubToken: data.githubToken
        },{
            onSuccess: () => {
                toast.success('Project created successfully')
                refetch()
            },
            onError: () => {
                toast.error('Failed to create project')
            }
        })
    }

  return (
    <div className='h-screen w-auto'>
        <HeroHighlight className='flex flex-row items-center justify-center h-screen'>
            <div>
                <motion.h1
                    initial={{
                    opacity: 0,
                    y: 20,
                    }}
                    animate={{
                    opacity: 1,
                    y: [20, -5, 0],
                    }}
                    transition={{
                    duration: 0.5,
                    ease: [0.4, 0.0, 0.2, 1],
                    }}
                    className="text-2xl px-14 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto "
                >
                    Documentation made easy.{" "}<br/>
                    <Highlight className="text-black dark:text-white">
                    Link your Github
                    </Highlight>
                </motion.h1>
            </div>
            <div> 
                <ShineBorder
                className="relative flex flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl"
                color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                >
                    <CardWithForm onSubmit={handleSubmit} createProject={createProject}/>
                    {/* <CardWithForm/> */}
                </ShineBorder>
            </div>
        </HeroHighlight>
    </div>
  )
}

export default CreateProjectPage