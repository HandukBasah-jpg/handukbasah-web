import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { transactionSchema } from "@/lib/validations";

// PUT update transaction
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
    const validated = transactionSchema.parse(body);

    const transaction = await prisma.transaction.update({
      where: { id, userId: user.id },
      data: {
        ...validated,
        date: new Date(validated.date),
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("PUT /api/keuangan/[id] error:", error);
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}

// DELETE transaction
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

    await prisma.transaction.delete({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/keuangan/[id] error:", error);
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}
