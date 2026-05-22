import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { noteSchema } from "@/lib/validations";

// GET single note
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const note = await prisma.note.findUnique({
      where: { id, userId: user.id },
    });

    if (!note) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("GET /api/notepad/[id] error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

// PUT update note
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = noteSchema.parse(body);

    const note = await prisma.note.update({
      where: { id, userId: user.id },
      data: validated,
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("PUT /api/notepad/[id] error:", error);
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}

// PATCH - toggle pin
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const note = await prisma.note.update({
      where: { id, userId: user.id },
      data: body,
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("PATCH /api/notepad/[id] error:", error);
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}

// DELETE note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.note.delete({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/notepad/[id] error:", error);
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}
