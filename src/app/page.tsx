import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
// import { ClerkProvider, SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";

export default async function Home() {
  return (
    // <div>
    //   redirect('/dashboard');
    //     {/* <Button>Click me</Button>
    //     <SignOutButton>Sign Out</SignOutButton> */}
    // </div>
    redirect('/dashboard')
  )
}
