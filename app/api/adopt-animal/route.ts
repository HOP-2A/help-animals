import prisma from "@/lib/prisma";
import { AdoptStatus } from "@prisma/client";

import { NextResponse } from "next/server";

export async function POST (req:Request) {

    try{
        const body = await req.json()
         const {description, images,status,userId } = body
         
       if(!description || !images || !userId || !status ) {
        return NextResponse.json({error : 
            "Missing fields"
        })
       }
 
      const isUser = await prisma.user.findUnique({
        where : {
            id : userId
        }
      })

      if(!isUser) {
        return NextResponse.json({error:"user not found"})
      }


     const createdAdoptAnimal = await prisma.adoptAnimal.create({
      data:{
        description: description,
        images:images,
        status:status,
        userId : userId
      }
     })

     return NextResponse.json(createdAdoptAnimal, {status : 200})

    }catch(err) {
        return NextResponse.json({error : err}, {status : 500})
    }
}


export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { userId, description } = body;

    if (!userId && !description) {
      return NextResponse.json(
        { error: "userId esvel description ugugduugui baina " },
        { status: 400 }
      );
    }

    // Build dynamic delete query
    const deleted = await prisma.adoptAnimal.deleteMany({
      where: {
        AND: [
          userId ? { userId } : {},
          description ? { description } : {},
        ],
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Item is not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedCount: deleted.count });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json({ error: "Failed to delete", details: String(err) }, { status: 500 });
  }
} 