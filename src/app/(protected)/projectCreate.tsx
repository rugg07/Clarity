'use client';

import React, { use } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';
import { Info } from 'lucide-react';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';
import { useRouter } from 'next/navigation';

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

export function CardWithForm() {
  // const { register, handleSubmit } = useForm<FormInput>();
  const { register, handleSubmit, watch } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation()
  const checkCredits = api.project.checkCredits.useMutation()
  const refetch = useRefetch()
  const router = useRouter();

  const repoUrl = watch('repoUrl'); 
  const githubToken = watch('githubToken');

  const onSubmit = async (data: FormInput) => {
    if(!!checkCredits.data) {
        createProject.mutate({
            githubUrl: data.repoUrl,
            name: data.projectName,
            githubToken: data.githubToken
        },{
            onSuccess: () => {
                toast.success('Project created successfully')
                refetch()
                router.push('/dashboard');
            },
            onError: (error) => {
                console.error('Project creation error:', error);
                toast.error(error.message || 'Failed to create project');
            }
        })
    }
    else{
        checkCredits.mutate({
            githubUrl: data.repoUrl,
            githubToken: data.githubToken
        })
    }
    // console.log('Form Data:', data);
  }
  const hasEnoughCredits = checkCredits?.data?.userCredits ? checkCredits.data.fileCount <= checkCredits.data.userCredits : true;
  
  // Also log the current state
  console.log('Current checkCredits state:', {
    data: checkCredits.data,
    isPending: checkCredits.isPending,
    error: checkCredits.error
  });


  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create Project</CardTitle>
        <CardDescription>Provide the details for your new project.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid w-full items-center gap-4">
            {/* Project Name */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                {...register('projectName', { required: true })}
                placeholder="Name of your project"
                required
              />
            </div>
            {/* GitHub Repository URL */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="repoUrl">GitHub Repository URL</Label>
              <Input
                id="repoUrl"
                {...register('repoUrl', { required: true })}
                placeholder="https://github.com/your-repo"
                required
              />
            </div>
            {/* GitHub Token */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="githubToken">GitHub Token (Optional)</Label>
              <Input
                id="githubToken"
                {...register('githubToken')}
                placeholder="Personal access token (if required)"
              />
            </div>
            {!!checkCredits.data && (
              <>
                <div className='mt-4 bg-orange-50 px-4 py-2 rounded-md border border-orange-200 text-orange-700'>
                  <div className='flex items-center gap-2'>
                    <Info className='size-4'/>
                    <p className='text-sm'>You will be charged <span className='font-semibold'>{checkCredits.data?.fileCount}</span> credits for this repository.</p>
                  </div>
                  <p className='text-sm text-blue ml-6'>You have <span className='font-semibold'>{checkCredits.data?.userCredits}</span> credits remaining.</p>
                </div>
              </>
            )}
          </div>
          <CardFooter className="flex justify-between mt-4">
            <Button variant="outline" type="reset">
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending || checkCredits.isPending || !hasEnoughCredits}>
              {!!checkCredits.data ? 'Create Project' : 'Check Credits'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}