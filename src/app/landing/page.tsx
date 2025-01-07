 'use client'
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { WavyBackground } from '@/components/ui/wavy-background';
import { useRouter } from 'next/navigation'
import Image from "next/image";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';


const LandingPage = () => {
  const router = useRouter();

  return (
    <div className='bg-black'>
        <WavyBackground className="max-w-4xl mx-auto">
            <div className='h-4'></div>
            <p className="text-2xl md:text-4xl lg:text-7xl text-white font-bold inter-var text-center">
                Your AI Powered Github Assistant
            </p>
            <p className="text-base md:text-lg lg:text-1xl mt-4 text-white font-normal inter-var text-center">
                Leverage the power of Clarity to manage your Github repositories and meetings.
            </p>
            <div className='h-8'></div>
            <div className="text-center">
                <Button
                    onClick={() => router.push('/sign-in')}
                    className="text-black bg-white hover:bg-gray-400 hover:text-black mx-4 my-2 rounded-sm transition-colors w-[120px]"
                >
                    Sign In
                </Button>
                <Button
                    variant={'secondary'}
                    onClick={() => router.push('/sign-up')}
                    className="text-white bg-gray-900 hover:bg-gray-700 mx-4 my-2 rounded-sm transition-colors w-[120px]"
                >
                    Sign Up
                </Button>
            </div>
        </WavyBackground>
        {/* <div className="flex flex-col overflow-hidden pb-[500px] pt-[1000px]"> */}
        <div className='flex flex-col overflow-hidden py-[50px] bg-black'>
            <ContainerScroll
                titleComponent={
                <>
                    <h1 className="text-4xl font-semibold text-white">
                    All your development needs<br />
                    <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-white">
                        Made Easy
                    </span>
                    </h1>
                </>
                }
            >
                <Image
                src='/scroll.png'
                alt="hero"
                height={720}
                width={1400}
                className="mx-auto rounded-2xl object-cover h-full object-left-top"
                draggable={false}
                />
            </ContainerScroll>
        </div>
    </div>
  );
};

export default LandingPage;