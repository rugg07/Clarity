import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import AnimatedGradientText from "./animated-gradient-text";
import useProject from "@/hooks/use-project";
import React from "react";
import {Dialog, DialogContent, DialogTitle} from '@/components/ui/dialog';
import { DialogHeader } from "./dialog";
import Image from 'next/image';
import { askQuestion } from "@/app/(protected)/dashboard/action";
import { readStreamableValue } from "ai/rsc";
import MDEditor from '@uiw/react-md-editor';
import { Button } from "./button";
import CodesReferenced from "@/app/(protected)/dashboard/codes-referenced";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import useRefetch from "@/hooks/use-refetch";


function TextareaDemo() {
  const {project} = useProject();
  const [question, setQuestion] = React.useState("");
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [filesReferenced, setFilesReferenced] = React.useState<{ fileName: string; sourceCode: string; summary: string }[]>([]);
  const [answer, setAnswer] = React.useState("")
  const saveAnswer = api.project.saveAnswer.useMutation()
  const {theme} = useTheme()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setAnswer("")
    setFilesReferenced([])
    e.preventDefault();
    if(!project?.id) return
    setLoading(true)

    const {output , filesReferenced} = await askQuestion(question, project.id)
    setOpen(true)
    setFilesReferenced(filesReferenced)

    for await (const delta of readStreamableValue(output)){
      if(delta) setAnswer(ans => ans + delta)
    }
    setLoading(false)
  }

  const refetch = useRefetch()

  return (
    <div className="pt-2 h-4/5">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[80vw]'>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>
                <Image src='/mintlify.svg' alt='clarity' width={40} height={40}/>
              </DialogTitle>
              <Button disabled={saveAnswer.isPending} variant={"outline"} onClick={()=>{
                saveAnswer.mutate({
                  projectId: project!.id, 
                  question, 
                  answer, 
                  filesReferenced
                },
                  {
                    onSuccess:()=>{
                      toast.success("Answer saved successfully")
                      refetch()
                    },
                    onError:()=>{toast.error("Failed to save answer")}
                  }
                )
              }}>
                Save Answer
              </Button>
            </div>
          </DialogHeader>

          {/* <MDEditor.Markdown source={answer} className="max-w-[70vw] !h-full max-h-[40vh] overflow-scroll" /> */}
          <MDEditor.Markdown source={answer} className={cn("max-w-[70vw] !h-full max-h-[40vh] overflow-scroll p-2 rounded-lg",{"bg-gray-500": theme === "light", "bg-gray-50": theme === "dark"})}/>
          <div className="h-1"></div>
          <CodesReferenced filesReferenced={filesReferenced}/>
          <Button type='button' onClick={() => setOpen(false)} className="max-w-[70vw]">Close</Button>
        </DialogContent>
      </Dialog>
      <form onSubmit={onSubmit}>
        <Textarea id="textarea-12" placeholder="Ask away ..." value={question} onChange={e=>setQuestion(e.target.value)}  className="w-full h-[250px] border-2 border-gray-500"/>
          <div className="z-10 flex mt-9 items-center justify-center">
            <AnimatedGradientText type="submit" disabled={loading}>
              <Image src='/mintlify.svg' alt='clarity' width={20} height={20} className="mx-2"/>{" "}
              <span
                className={cn(
                  `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
                )}
              >
                Ask Clarity
              </span>
              <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
            </AnimatedGradientText>
          </div>
        </form>
    </div>
  );
}

export { TextareaDemo };


