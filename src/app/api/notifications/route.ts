import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Notification from "@/models/Notification";
import { getAuthUserFromRequest } from "@/lib/auth/middleware";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const notifications = await Notification.find({ userId: authUser.userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: authUser.userId,
      read: false,
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { notificationId, markAllAsRead } = body;

    await connectDB();

    if (markAllAsRead) {
      await Notification.updateMany(
        { userId: authUser.userId, read: false },
        { $set: { read: true } }
      );
    } else if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId: authUser.userId },
        { $set: { read: true } }
      );
    }

    return NextResponse.json({ success: true, message: "Notifications updated" });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
