"use client"

import * as React from "react"
import {
  Bot,
  SquareTerminal,
  CreditCard,
  Presentation,
  Plus
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"


import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

import { useTheme } from "next-themes"

import ShinyButton from "@/components/ui/shiny-button"
import Image from "next/image"
import useProject from "@/hooks/use-project"



// This is sample data.
const items = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Q&A",
      url: "/qa",
      icon: Bot,
    },
    {
      title: "Meetings",
      url: "/meeting",
      icon: Presentation,
    },
    {
      title: "Billing",
      url: "/billing",
      icon: CreditCard,
    },
]


export function AppSidebar() {
  const pathname = usePathname();
  const {theme} = useTheme();
  const {open} = useSidebar();
  const {projects, projectId, setProjectId} = useProject();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex flex-row gap-0.5">
          <Image src='/mintlify.svg' width={30} height={30} alt='Mintlify Logo' className="m-2"/>
          {open && (<span className={cn("font-bold text-3xl pt-2",{
              "!text-white": theme === "dark",
              "!text-black ": theme === "light" 
          })}>Clarity</span>)}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel>
              Application
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {items.map(item => {
                return(
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url} className={cn({
                          "!bg-white !text-black": (pathname === item.url) &&  theme === "dark", // Dark theme styles,
                          "!bg-black !text-white ": (pathname === item.url) && theme === "light", // Light theme styles
                          },
                          "list-none")}>
                          <item.icon />
                          <span className="ml-2">{item.title}</span> 
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                )
              })}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarMenu>
        <SidebarGroup>
          <SidebarGroupLabel>
            Projects
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map(project => {
                return(
                    <SidebarMenuItem key={project.projectName}>
                      <SidebarMenuButton asChild>
                        <div onClick={()=> setProjectId(project.id)}>
                          <div className={cn("rounded border size-6 flex items-center justify-center text-md p-1",{
                            "!bg-white !text-black": theme === "dark" && project.id === projectId, // Dark theme styles,
                            "!bg-black !text-white ": theme === "light" && project.id === projectId, // Light theme styles}
                          },
                          "list-none")}>
                            {project.projectName[0]}
                          </div>
                            <span className="ml-2">{project.projectName}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                )
              })}
              <div className="h-3"></div>
              <SidebarMenuItem>
                <Link href='/create-project'>
                  {open && 
                    (<ShinyButton className="text-sidebar-primary-foreground">
                      <div className="flex flex row gap-1.5">
                        <Plus className="size-4 mt-0.5"/>
                        <span>Create a Project</span>
                      </div>
                    </ShinyButton>)
                  }
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
