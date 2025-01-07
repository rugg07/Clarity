'use client'
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { uploadFile } from "@/lib/firebase"
import { useTheme } from "next-themes"
import {CircularProgressbar, buildStyles} from 'react-circular-progressbar'
import { api } from "@/trpc/react"
import useProject from "@/hooks/use-project"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"


interface EmptyStateProps {
  title: string
  description: string
  icons?: LucideIcon[]
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  title,
  description,
  icons = [],
  action,
  className
}: EmptyStateProps) {
  const [progress, setProgress] = React.useState(0)
  const [isUploading, setIsUploading] = React.useState(false)
  const {theme} = useTheme()
  const {project} = useProject()
  const uploadMeeting = api.project.uploadMeeting.useMutation()
  const proccessingMeeting = useMutation({
    mutationFn: async(data: {projectId: string, meetingUrl: string, meetingId: string}) => {
      const {meetingUrl, meetingId, projectId} = data
      const response = await axios.post(`/api/process-meeting`, {meetingUrl, meetingId, projectId})
      return response.data
    }
  })

  const router = useRouter()
  const {getRootProps, getInputProps} = useDropzone({
    accept:{
      'audio/*': ['.mp3', '.wav', '.m4a'],
    },
    multiple: false,
    maxSize: 50_000_000, //50MB
    // onDrop: async acceptedFiles => {
    //   setIsUploading(true)
    //   console.log(acceptedFiles)
    //   const file = acceptedFiles[0]
    //   if (!file) return
    //   const downloadUrl = await uploadFile(file as File, setProgress) as string
    //   uploadMeeting.mutate({
    //     projectId: project!.id,
    //     meetingUrl: downloadUrl,
    //     name: file.name
    //   },{
    //     onSuccess: (meeting) => {
    //       toast.success("Meeting uploaded successfully!")
    //       router.push('/meeting')
    //       proccessingMeeting.mutateAsync({meetingUrl: downloadUrl, meetingId: meeting.id, projectId: project!.id})
    //     },
    //     onError: (error) => {
    //       toast.error("Failed to upload meeting")
    //     }
    //   })
    //   window.alert(`File uploaded successfully! Download URL: ${downloadUrl}`)
    //   setIsUploading(false)
    // },


    onDrop: async acceptedFiles => {
      // Insert the new code here, replacing the existing onDrop function
      try {
        setIsUploading(true);
        const file = acceptedFiles[0];
        if (!file) return;
    
        // Upload to Firebase with logging
        console.log('Starting Firebase upload...');
        const downloadUrl = await uploadFile(file as File, setProgress) as string;
        console.log('Firebase upload successful:', downloadUrl);
        
        // Update database with detailed error handling
        try {
          const meeting = await uploadMeeting.mutateAsync({
            projectId: project!.id,
            meetingUrl: downloadUrl,
            name: file.name
          });
          console.log('Database upload successful:', meeting);
    
          toast.success("Meeting uploaded successfully!");
          router.push('/meeting');
          
          // Process meeting after successful database upload
          await proccessingMeeting.mutateAsync({
            meetingUrl: downloadUrl,
            meetingId: meeting.id,
            projectId: project!.id
          });
        } catch (dbError) {
          console.error('Database error:', dbError);
          console.log('Project ID:', project?.id);
          console.log('Meeting URL:', downloadUrl);
          console.log('File name:', file.name);
          throw dbError; // Re-throw to be caught by outer try-catch
        }
      } catch (error) {
        toast.error("Failed to upload meeting");
        console.error('Upload process error:', error);
      } finally {
        setIsUploading(false);
      }
    }
  })
  return (
    <div className="bg-background border-border hover:border-border/80 text-center border-2 border-dashed rounded-xl p-14 w-full max-w-[620px] group transition duration-500 hover:duration-200" {...getRootProps()}>
      {isUploading ? 
        ( 
          <div className="flex flex-col gap-4">
            <CircularProgressbar
              value={progress}
              text={`${progress}%`}
              className="size-20"
              styles={buildStyles({
                textColor: theme === "dark" ? "#fff" : "#000",
                pathColor: theme === "dark" ? "#fff" : "#000",
                trailColor: theme === "dark" ? "#333" : "#d6d6d6"
              })}
            />
            <p className="text-sm text-gray-500 text-center">Uploading your Meeting...</p>
          </div> 
        ):(
          <>
            <div className="flex justify-center isolate">
                <div className="bg-background size-12 grid place-items-center rounded-xl shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
                  {icons[0] && React.createElement(icons[0], {
                    className: "w-6 h-6 text-muted-foreground"
                  })}
                </div>
              
            </div>
            <h2 className="text-foreground font-medium mt-6">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{description}</p>
            <Button
              // onClick={action.onClick}
              disabled={isUploading}
              variant="outline"
              className={cn(
                "mt-4",
                "shadow-sm active:shadow-none",
                "border-gray-300 hover:text-black", { "hover:text-white": theme === "dark"}
              )}
            >
              {/* {action.label} */}Upload Meetings
              <input className="hidden" {...getInputProps()} />
            </Button>
          </>
        )
      }
    </div>
  )
}