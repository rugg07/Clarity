'use client'
import React, { use } from 'react'
import { HeroHighlight } from "@/app/_components/hero-highlight"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from '@/trpc/react'
import { Info } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { createCheckoutSession } from '@/lib/stripe'


const BillingPage = () => {
  const {data: user} = api.project.getUserCredits.useQuery()
  const [creditToBuy, setCreditToBuy] = React.useState<number[]>([100])
  const creditToBuyAmount = creditToBuy[0]!
  const price = (creditToBuyAmount / 50).toFixed(2)

  const{theme} = useTheme()
  return (
    <>
        <div className='m-8 h-screen'>
          <h1 className='text-xl font-semibold'>Billing</h1>
          <div className='h-2'></div>
          <p className='text-sm text-gray-500'>You currently have <span className='font-semibold'>{user?.credits}</span> credits.</p>
          <div className='h-4'></div>
          {/* <div className='bg-muted px-4 py-2 rounded-sm text-black'> */}
          <div className={cn("bg-muted px-4 py-2 rounded-sm ",{
            'text-gray-600': theme === 'light',
            'text-white': theme === 'dark'
          })}>
            <div className='flex items-center gap-2'>
              <Info className='size-4'/>
              <p className='text-sm'>Each Credit allows you to index 1 file in the repository.</p>
            </div>
            <p className='text-sm'>E.g. If your project has 100 files, you will need 100 credits to index it.</p>
          </div>
          <div className='h-4'></div>
          <Slider defaultValue={[100]} onValueChange={(value)=>setCreditToBuy(value)} min={10} max={1000} step={10} value={creditToBuy}/>
          <div className='h-4'></div>
          <Button onClick={()=>{
            createCheckoutSession(creditToBuyAmount)
          }}>
            Buy {creditToBuyAmount} Credits for ${price}
          </Button>
        </div> 
    </>
  )
}

export default BillingPage
