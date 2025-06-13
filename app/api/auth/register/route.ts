import { connectToDB } from "@/lib/db.lib";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: "All the fields are required" }, { status: 400})
        }

        await connectToDB();

        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return NextResponse.json({error:"User already registered"},{status:401})
        }

       await User.create({
            email,password
       })
        
        return NextResponse.json({ message: "User created successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error in registration of the user");
        return NextResponse.json({ message: "failed in registration" }, { status: 500 });
    }
}