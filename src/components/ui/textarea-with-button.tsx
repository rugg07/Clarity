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


function TextareaDemo() {
  const {project} = useProject();
  const [question, setQuestion] = React.useState("");
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [filesReferenced, setFilesReferenced] = React.useState<{ fileName: string; sourceCode: string; summary: string }[]>([]);
  const [answer, setAnswer] = React.useState("")

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

  return (
    <div className="pt-2 h-4/5 w-full">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw]">
          <DialogHeader>
            <DialogTitle>
              <Image src='/mintlify.svg' alt='clarity' width={40} height={40}/>
            </DialogTitle>
          </DialogHeader>

          <MDEditor.Markdown source={answer} className="max-w-[70vw] !h-full max-h-[40vh] overflow-scroll"/>
          <div className="h-4"></div>
          <CodesReferenced filesReferenced={filesReferenced}/>
          <Button type='button' onClick={() => setOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
      <form onSubmit={onSubmit}>
        <Textarea id="textarea-12" placeholder="Leave a comment" value={question} onChange={e=>setQuestion(e.target.value)}  className="w-full h-[250px] border-2 border-gray-500"/>
          <div className="z-10 flex mt-9 items-center justify-center">
            <AnimatedGradientText type="submit" disabled={loading}>
              🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />{" "}
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


