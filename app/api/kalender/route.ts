import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validations";

// GET all events
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const where: Record<string, unknown> = { userId: user.id };

    if (start || end) {
      where.startDate = {};
      if (start) (where.startDate as Record<string, unknown>).gte = new Date(start);
      if (end) (where.startDate as Record<string, unknown>).lte = new Date(end);
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/kalender error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST create event
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = eventSchema.parse(body);

    const event = await prisma.event.create({
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
        userId: user.id,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("POST /api/kalender error:", error);
    return NextResponse.json(
      { error: "Validation Error" },
      { status: 400 }
    );
  }
}
