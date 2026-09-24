import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User, SlotHold } from "@/models";

export const dynamic = "force-dynamic";

// GET user's saved cart
export async function GET(req: NextRequest) {
  try {
    const sessionUser = getUserFromRequest(req);
    if (!sessionUser) {
      return NextResponse.json({ items: [] });
    }

    await connectToDatabase();
    const user = await User.findById(sessionUser.id).select("savedCart");
    return NextResponse.json({ items: user?.savedCart || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch cart" }, { status: 500 });
  }
}

// POST: Merge incoming guest cart with user's saved cart in DB
export async function POST(req: NextRequest) {
  try {
    const sessionUser = getUserFromRequest(req);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { items: guestItems = [], sessionId } = body;

    const user = await User.findById(sessionUser.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingCart: any[] = user.savedCart || [];
    const mergedMap = new Map<string, any>();

    // Key generator for item uniqueness: eventId + slotId + date
    const getItemKey = (item: any) =>
      `${item.eventId}_${item.selectedSlot?.slotId || ""}_${item.selectedSlot?.date || ""}`;

    // 1. Seed with existing user cart items
    for (const item of existingCart) {
      if (item && item.eventId) {
        mergedMap.set(getItemKey(item), item);
      }
    }

    // 2. Merge guest items
    for (const guestItem of guestItems) {
      if (!guestItem || !guestItem.eventId) continue;
      const key = getItemKey(guestItem);

      if (mergedMap.has(key)) {
        // Merge item: take latest or higher guest count
        const current = mergedMap.get(key);
        const mergedGuests = Math.max(current.guestsCount || 1, guestItem.guestsCount || 1);

        // Merge add-ons
        const addOnsMap = new Map<string, any>();
        (current.selectedAddOns || []).forEach((a: any) => addOnsMap.set(a.addOnId, a));
        (guestItem.selectedAddOns || []).forEach((a: any) => {
          if (addOnsMap.has(a.addOnId)) {
            const existing = addOnsMap.get(a.addOnId);
            addOnsMap.set(a.addOnId, {
              ...existing,
              quantity: Math.max(existing.quantity, a.quantity),
              total: existing.unitPrice * Math.max(existing.quantity, a.quantity),
            });
          } else {
            addOnsMap.set(a.addOnId, a);
          }
        });

        const mergedAddOns = Array.from(addOnsMap.values());
        const addOnsCost = mergedAddOns.reduce((sum, a) => sum + (a.total || 0), 0);
        const itemTotal = (guestItem.packageDetails?.price || current.packageDetails?.price || 0) + addOnsCost;

        mergedMap.set(key, {
          ...current,
          ...guestItem,
          guestsCount: mergedGuests,
          selectedAddOns: mergedAddOns,
          itemTotal,
        });
      } else {
        mergedMap.set(key, guestItem);
      }
    }

    const mergedItems = Array.from(mergedMap.values());
    user.savedCart = mergedItems;
    await user.save();

    // 3. Transfer any slot holds from this guest sessionId to the user
    if (sessionId) {
      await SlotHold.updateMany({ sessionId }, { $set: { userId: user._id } });
    }

    return NextResponse.json({
      success: true,
      items: mergedItems,
      count: mergedItems.length,
      message: "Cart items synchronized and merged successfully.",
    });
  } catch (error: any) {
    console.error("Cart merge error:", error);
    return NextResponse.json({ error: error.message || "Failed to merge cart" }, { status: 500 });
  }
}
