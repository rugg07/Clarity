'use client'

import { HeroHighlight } from "@/app/_components/hero-highlight";
import { Button } from "@/components/ui/button";
import { Feature } from "@/components/ui/feature-section-with-bento-grid";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";
import { ExternalLink } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import CommitLog from "./commit-log";



const dashboardPage = () => {
    //get logged in user
    const {user} = useUser();
    const {projects, projectId} = useProject();
    const selectedProject = projects?.find((project) => project.id === projectId);
    const {theme} = useTheme();

    return (
        <div className="h-full">
            <HeroHighlight className="h-auto w-auto">
            <div>
                {/* top row */}
                <div className="flex items-center justify-between flex-wrap gap-y-4">
                    {/* github button */}
                    <div className="rounded-md px-4 py-3">
                        {selectedProject && (
                            <Link href={selectedProject?.repoUrl ?? ""}>
                                <Button>
                                <Image
                                    src="./github.svg"
                                    width={20}
                                    height={20}
                                    alt="github logo"
                                    className={cn("mr-2",{
                                        "bg-white rounded-lg": theme === "light"
                                    })}
                                />
                                This project is linked to{" "}
                                <span className="pl-1">
                                    {selectedProject.repoUrl
                                    .split("/")
                                    .slice(0, -1)
                                    .join("/") + "/"}
                                    {selectedProject.repoUrl.split("/").pop()}
                                </span>
                                <ExternalLink className="ml-2 size-4"/>
                                </Button>
                            </Link>
                        )}
                    </div>
                    <div className="flex items-center gap-4 px-4 py-3">
                        {/* user logo */}
                        <div className="pr-2 pt-2">
                            <UserButton />
                        </div>
                        {/* collaborate button */}
                        <div>
                            <Button>Invite a Team Member!</Button>
                        </div>
                        {/* archive button */}
                        <div>
                            <Button>Archive</Button>
                        </div>
                    </div>
                </div>
                {/* card display */}
                <div className="flex">
                    <div className="px-4">
                        <Feature />
                    </div>
                </div>
                <div className="flex w-full">
                    <div className="my-8 w-full">
                        <CommitLog />
                    </div>
                </div>
                
                {/* {projects?.projectName} */}
            </div>
            </HeroHighlight>
        </div>
    );
}

export default dashboardPage;