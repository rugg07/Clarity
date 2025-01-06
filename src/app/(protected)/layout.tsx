//can only view this protected route if you are logged in
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserButton } from '@clerk/nextjs';
import { Separator } from '@radix-ui/react-context-menu';
import React from 'react'
import { AppSidebar } from './sidebar/app-sidebar';
import { CardWithForm } from './projectCreate';
import { NeonGradientCard } from '@/components/ui/neon-gradient-card';
import ShineBorder from '@/components/ui/shine-border';
import { ModeToggle } from '../_components/mode-toggle';

type Props = {
    children: React.ReactNode;
};

//children is whatever is being rendered in the main part of layout page. NOT sidebar or Nav 
const layout = ({children} : Props) => {
  return (
    <div>
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                </header>
            </SidebarInset>
            {/* main page */}
            <main className='w-full'>
                {/* Navbar */}
                <div className='flex items-center gap-2 border-sidebard-border bg-sidebar border shadow rounded md-2 p-x-4 ml-4 mr-4 mt-2 mb-2'>
                    {/* <SearchBar/> */}
                    <div className='ml-auto'></div>
                    <UserButton />
                    <ModeToggle/>
                </div>
                <div className='h-4 ml-4'></div>
                {/* {main content} */}
                <div className='border-sidebard-border bg-sidebar border shadow rounded md-2 m-4'>
                    {children}
                    {/* <CardWithForm /> */}
                </div>
            </main>
        </SidebarProvider>
    </div>
  )
}

export default layout
