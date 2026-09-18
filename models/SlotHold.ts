import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISlotHold extends Document {
  eventId: mongoose.Types.ObjectId;
  slotId: string;
  date: string; // "YYYY-MM-DD"
  sessionId: string; // client cart token
  userId?: mongoose.Types.ObjectId;
  guestsCount: number;
  expiresAt: Date;
  createdAt: Date;
}

const SlotHoldSchema = new Schema<ISlotHold>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    slotId: { type: String, required: true },
    date: { type: String, required: true },
    sessionId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    guestsCount: { type: Number, default: 1 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  {
    timestamps: true,
  }
);

SlotHoldSchema.index({ eventId: 1, slotId: 1, date: 1 });

export const SlotHold: Model<ISlotHold> =
  mongoose.models.SlotHold || mongoose.model<ISlotHold>("SlotHold", SlotHoldSchema);
