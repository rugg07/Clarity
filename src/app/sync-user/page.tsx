import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

//save user into DB when registering on clerk
const syncUser = async () => {
    const {userId} = await auth();
    if (!userId) throw new Error("No User Found");

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    if(!user.emailAddresses[0]?.emailAddress){
        return notFound();
        // throw new Error("No Email Found");
    }
       
    await db.user.upsert({
        where:{
            emailAddress: user.emailAddresses[0]?.emailAddress ?? ""
        },
        create:{
            id: userId,
            firstName: user.firstName,
            lastName: user.lastName,
            emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
            imageUrl: user.imageUrl,
        },
        update:{
            imageUrl: user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,
        }
    })
    return redirect('/dashboard');
}

export default syncUser;