'use client'
import useProject from '@/hooks/use-project';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

interface Commit {
  id: string;
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: Date;
  summary: string;
}

interface CommitData {
  commits: Commit[];
  totalPages: number;
  currentPage: number;
  totalCommits: number;
}

const CommitLog = () => {
  const { projectId, project } = useProject();
  const { data } = api.project.getCommits.useQuery(
    { projectId, page: 1 },
    { enabled: !!projectId }
  ) as { data: CommitData | undefined };

  if (!data?.commits) return <div className='font-semibold text-xl pl-8'>No commits found</div>;
  return (
    <>
        <ul className='space-y-6 w-full'>
            {data.commits?.map((commit, commitIdx) => {
                return (
                    <li key={commit.id} className='relative flex gap-x-4 mx-4'>
                        <div className={cn(
                            commitIdx === data.commits.length-1 ? 'h-6' : '-bottom-6',
                            'absolute left-0 top-2 flex w-6 justify-center'
                        )}
                        >
                            <div className='w-px translate-x-2.5 bg-gray-300 -mb-2'></div>
                        </div>
                        <>
                            <img src={commit.commitAuthorAvatar} alt='commit avatar' className='relative mt-2 size-8 flex-none bg-gray-500 w-12 h-12 rounded-full' />
                            <div className='flex-auto rounded-mg bg-white p-3 ring-1 ring-inset ring-gray-300 rounded-sm'>
                                <div className='flex justify-between gap-x-4'>
                                    <Link target='_blank' href={`${project?.repoUrl}/commits/${commit.commitHash}`} className='py-0.5 text-xs leading-5 text-gray-500'>
                                        <span className='font-medium text-gray-900'>
                                            {commit.commitAuthorName}
                                        </span>{" "}
                                        <span className='inline-flex items-center'>
                                            committed 
                                            <ExternalLink className='ml-1 size-4' />
                                        </span>
                                    </Link>
                                </div>
                                <h2 className='font-semibold text-gray-500'>{commit.commitMessage}</h2>
                                <p className='text-sm text-gray-500'>{commit.summary}</p>
                            </div>
                            
                        </>
                    </li> 
                )
            }
            )}
        </ul>
    </>
  )
}

export default CommitLog
