'use client'
import { HeroHighlight } from '@/app/_components/hero-highlight'
import { EmptyState } from '@/components/ui/empty-state'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React from 'react'
import { Image } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import useRefetch from '@/hooks/use-refetch'

const MeetingPage = () => {

  const {projectId} = useProject()
  const deleteMeeting = api.project.deleteMeetings.useMutation()
  const refetch = useRefetch()
  const {data: meetings, isLoading} = api.project.getMeetings.useQuery({projectId}, {
    refetchInterval: 4000 //keep refreshing every 4 seconds to see if meetings finished processing
  })
  return (
    <div>
      {/* <HeroHighlight> */}
        <div className='h-6'></div>
        <div className="bg-muted rounded-md h-100 flex flex-col pt-6 pb-8 ml-4 mr-4 items-center justify-center text-center">
          <h3 className="text-xl tracking-tight">Add a new meeting !</h3>
            <p className="text-muted-foreground max-w-sm text-base">
              Analyze your meeting with Clarity powered by AI
            </p>
            <div className="h-8"></div>
            <EmptyState
              title="No Videos"
              description="Upload audio files to analyze your meetings."
              icons={[Image]}
              action={{
                label: "Upload Meetings",
                onClick: () => console.log("Upload clicked"),
              }}
            />
        </div>
        <div className='h-6'></div>
        <h1 className='text-xl font-semibold m-4'>Meetings</h1>
        {meetings && meetings.length === 0 && <div>No meetings found</div>}
        {isLoading && <div>Loading...</div>}
        <ul className='divide-y divide-gray-200 m-4'>
            {meetings?.map(meeting => (
              <li key={meeting.id} className='py-4 flex items-center justify-between p-5 gap-x-6 bg-muted rounded-lg'>
                <div>
                  <div className='min-w-0'>
                    <div className='flex items-center gap-2'>
                      <Link href={`/meeting/${meeting.id}`} className='text-sm font-semibold'>
                        {meeting.name}
                      </Link>
                      {meeting.status === 'PROCESSING' && (
                        <Badge className='bg-yellow-500 text-white'>
                          Processing...
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center text-xs text-gray-500 gap-x-2'>
                    <p className='whitespace-nowrap'>
                        {meeting.createdAt.toLocaleDateString()}
                    </p>
                    <p className='truncate'>{meeting.issues.length}{" "}Issues</p>
                  </div>
                </div>
                <div className='flex items-center flex-none gap-x-4'>
                  <Link href={`/meeting/${meeting.id}`}>
                    <Button variant='outline'>
                      View Meeting
                    </Button>
                  </Link>
                  <Button disabled={deleteMeeting.isPending} variant={'destructive'} onClick={()=>{deleteMeeting.mutate({meetingId: meeting.id}, {
                    onSuccess: () => {
                      toast.success('Meeting deleted')
                      refetch()
                    }
                  })}}>
                    Delete Meetings
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      {/* </HeroHighlight> */}
    </div>
  )
}

export default MeetingPage
