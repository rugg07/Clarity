'use client'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { TextareaDemo } from '@/components/ui/textarea-with-button'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import MDEditor from '@uiw/react-md-editor'
import React from 'react'
import CodesReferenced from '../dashboard/codes-referenced'
import { HeroHighlight } from '@/app/_components/hero-highlight'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'


const QaPage = () => {
  const {projectId} = useProject()
  const {data: questions} = api.project.getQuestions.useQuery({projectId}) 
  const [questionIndex, setQuestionIndex] = React.useState(0)
  const question = questions?.[questionIndex]
  const {theme} = useTheme()

  return (
    <div className='m-4 flex flex-col gap-2'> 
      <HeroHighlight>
        <Sheet>
          <div className="col-span-2 bg-muted rounded-md h-100 flex flex-col p-6">
              <h3 className="text-xl tracking-tight font-medium">Have a Question?</h3>
              <p className="text-muted-foreground max-w-xs text-base">
                Clarity knows it all!
              </p>
              <div className="h-8"></div>
              <div className="flex flex-col py-4">
                <TextareaDemo />
              </div>
            </div>
            <div className='h-4'></div>
            <h1 className='text-xl font-semibold'> Saved Questions</h1>
            <div className='h-2'></div>
            <div className='flex flex-col gap-2'>
              {questions?.map((question, index)=>{
                return (
                  <React.Fragment key={index}>
                    <SheetTrigger onClick={()=>setQuestionIndex(index)}>
                      {/* <div className='flex items-center gap-4 bg-white rounded-lg p-4 shadow border'> */}
                      <div className={cn("flex items-center gap-4 bg-white rounded-lg p-4 shadow border",{"bg-muted": theme === "light", "bg-gray-50": theme === "dark"})}> 
                        <img src={question.user.imageUrl ?? ""} alt='clarity' className='rounded-full' width={30} height={30}/>
                        <div className='text-left flex flex-col'>
                          <div className='flex items-center gap-2'>
                            <p className='line-clamp-1 text-lg font-medium text-black'> {question.question}</p>
                            <span className='text-xs text-gray-400 whitespace-nowrap'>{question.createdAt.toLocaleDateString()}</span>
                          </div>
                        <p className='text-gray-500 line-clamp-2 text-sm'>{question.answer}</p>
                        </div>
                      </div>
                    </SheetTrigger>
                  </React.Fragment>
                ) 
              })
              }
            </div>
            {question && (
              <SheetContent className='sm:max-w-[80vw] overflow-scroll'>
                <SheetHeader>
                  <SheetTitle>
                    {question.question}
                  </SheetTitle>
                  {/* <MDEditor.Markdown source={question.answer}/> */}
                  <MDEditor.Markdown source={question.answer} className={cn("overflow-scroll p-8 rounded-lg",{"bg-muted": theme === "light", "bg-gray-50": theme === "dark"})}/>
                  <div className='h-2'></div>
                  <CodesReferenced  filesReferenced={(question.filesReferenced ?? []) as any}/>
                </SheetHeader>
              </SheetContent>
            )} 
        </Sheet>
      </HeroHighlight>
    </div> 
  )
}

export default QaPage
