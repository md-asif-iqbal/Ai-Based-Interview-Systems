import mongoose, { Schema } from "mongoose";
import { INotification } from "@/types";

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "application_received",
        "application_status",
        "interview_scheduled",
        "interview_reminder",
        "interview_completed",
        "offer_received",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: String,
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

notificationSchema.index({ read: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema);
export default Notification;
