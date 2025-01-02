'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

export function CardWithForm({ onSubmit }: { 
  onSubmit: (data: FormInput) => void;
  createProject?: any;
}) {
  const { register, handleSubmit } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation()

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
          </div>
          <CardFooter className="flex justify-between mt-4">
            <Button variant="outline" type="reset">
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending}>Create</Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
