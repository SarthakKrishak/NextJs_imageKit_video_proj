import { authOption } from "@/lib/auth.lib";
import { connectToDB } from "@/lib/db.lib";
import Video, { IVideo } from "@/models/video.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        await connectToDB();
        const videos = await Video.find({}).sort({ createdAt: -1 }).lean();
        if (!videos || videos.length == 0) {
            return NextResponse.json([], { status: 200 });
        }

        return NextResponse.json(videos)
    } catch (error) {
        return NextResponse.json({error:"Failed to fetch video"},{status:500 })
    }
}

export async function POST(request:NextRequest) {
    try {
        const session = await getServerSession(authOption);
        if (!session) {
            return NextResponse.json({ error: "Unauthorize" }, { status: 401 });
        }

        await connectToDB();

        const body:IVideo = await request.json();
        if (!body.title || !body.description || !body.videoUrl || !body.thumbnailUrl) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 }); 
        }

        const videoData = {
            ...body,
            controls: body?.controls ?? true,
            tranformation: {
                height: 1920,
                width: 1080,
                quality: body.tranformation?.quality ?? 100,
            }
        }
        const newVideo = await Video.create(videoData);
        
        return NextResponse.json(newVideo)

    } catch (error) {
        return NextResponse.json({ error: "Failed to create video" }, { status: 500 });

    }
}