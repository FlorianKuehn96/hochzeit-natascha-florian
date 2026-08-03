import { NextRequest, NextResponse } from "next/server";
import redis from "../../../lib/redis";

const GUESTS_KEY = "wedding-guests";

export async function GET() {
  try {
    const guests = await redis.get(GUESTS_KEY);
    const guestData = guests ? JSON.parse(guests) : [];
    
    return NextResponse.json({ guests: guestData });
  } catch (error) {
    console.error("Error fetching guests:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Gästeliste" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token || token !== localStorage.getItem('hochzeit_auth_session')) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const { name, email, code } = body;
    
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name und E-Mail sind erforderlich" },
        { status: 400 }
      );
    }

    const guests = await redis.get(GUESTS_KEY);
    const guestData = guests ? JSON.parse(guests) : [];
    
    const existingGuest = guestData.find((g: any) => g.email === email || g.code === code);
    if (existingGuest) {
      return NextResponse.json(
        { error: "Gast mit dieser E-Mail oder diesem Code existiert bereits" },
        { status: 400 }
      );
    }

    const newGuest = {
      name,
      email,
      code: code || Math.random().toString(36).substring(2, 8).toUpperCase(),
      rsvp: {
        status: "pending",
        guests: 1,
        lastUpdated: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };

    const updatedData = [newGuest, ...guestData];
    await redis.set(GUESTS_KEY, JSON.stringify(updatedData));

    return NextResponse.json({ guest: newGuest });
  } catch (error) {
    console.error("Error creating guest:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Gastes" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token || token !== localStorage.getItem('hochzeit_auth_session')) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const { code } = body;
    
    if (!code) {
      return NextResponse.json(
        { error: "Code ist erforderlich" },
        { status: 400 }
      );
    }

    const guests = await redis.get(GUESTS_KEY);
    const guestData = guests ? JSON.parse(guests) : [];
    
    const updatedData = guestData.filter((g: any) => g.code !== code);
    await redis.set(GUESTS_KEY, JSON.stringify(updatedData));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting guest:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen des Gastes" },
      { status: 500 }
    );
  }
}