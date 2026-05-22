import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validations";

// PUT update event
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
    const validated = eventSchema.parse(body);

    const event = await prisma.event.update({
      where: { id, userId: user.id },
      data: {
        title: validated.title,
        description: validated.description,
        startDate: new Date(validated.startDate),
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        allDay: validated.allDay ?? false,
        color: validated.color,
        location: validated.location,
        reminder: validated.reminder,
        recurrence: validated.recurrence || null,
        category: validated.category,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("PUT /api/kalender/[id] error:", error);
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}

// PATCH - quick update (drag & drop reschedule)
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

    const data: Record<string, unknown> = {};
    if (body.startDate) data.startDate = new Date(body.startDate);
    if (body.endDate) data.endDate = new Date(body.endDate);
    if (body.allDay !== undefined) data.allDay = body.allDay;

    const event = await prisma.event.update({
      where: { id, userId: user.id },
      data,
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("PATCH /api/kalender/[id] error:", error);
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}

// DELETE event
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

    await prisma.event.delete({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/kalender/[id] error:", error);
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}
