import { HeroHighlight } from '@/app/_components/hero-highlight'
import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div>
      <HeroHighlight>
        <div className='flex items-center justify-center h-screen'>
          <SignUp />
        </div>
      </HeroHighlight> 
    </div>
  )
}