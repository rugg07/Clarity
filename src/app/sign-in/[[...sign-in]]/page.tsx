import { HeroHighlight } from '@/app/_components/hero-highlight'
import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div>
      <HeroHighlight>
        <div className='flex items-center justify-center h-screen'>
          <SignIn forceRedirectUrl='/dashboard'/>
        </div>
      </HeroHighlight> 
    </div>
  )
}