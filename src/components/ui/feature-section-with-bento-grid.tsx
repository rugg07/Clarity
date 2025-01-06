import { TextareaDemo } from "./textarea-with-button";
import { EmptyState } from "./empty-state";
import {Image} from "lucide-react";

import useProject from "@/hooks/use-project";
import React from "react";

function Feature() {
  const {project} = useProject();
  const [question, setQuestion] = React.useState("");
  return (
    <div className="w-full py-10">
      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-4">
          {/* "Ask Clarity" Section */}
          <div className="col-span-2 bg-muted rounded-md h-100 flex flex-col p-6">
            <h3 className="text-xl tracking-tight">Have a Question?</h3>
            <p className="text-muted-foreground max-w-xs text-base">
              Clarity knows it all!
            </p>
            <div className="h-8"></div>
            <div className="flex flex-col h-4/5 py-4">
              <TextareaDemo />
            </div>
          </div>

          {/* Meeting Section */}
          <div className="col-span-1 bg-muted rounded-md h-100 flex flex-col p-6">
            <h3 className="text-xl tracking-tight">Add a new meeting!</h3>
              <p className="text-muted-foreground max-w-xs text-base">
                Analyze your meeting with Clarity powered by AI
              </p>
              <div className="h-8"></div>
              <EmptyState
                title="No Images"
                description="Upload images to get started with your gallery."
                icons={[Image]}
                action={{
                  label: "Upload Images",
                  onClick: () => console.log("Upload clicked"),
                }}
              />
          </div>
          {/* <div className="col-span-1 bg-muted rounded-md aspect-square p-6 flex justify-between flex-col">
            <h3 className="text-xl tracking-tight">Create a new meeting</h3>
            <p className="text-muted-foreground max-w-xs text-base">
              Analyze your meeting with Clarity powered by AI
            </p>
            <div className="h-8"></div>
            <EmptyState
              title="No Images"
              description="Upload images to get started with your gallery."
              icons={[Image]}
              action={{
                label: "Upload Images",
                onClick: () => console.log("Upload clicked"),
              }}
            />
          </div> */}
        </div>
      </div>
    </div>
  );
}

export { Feature };
