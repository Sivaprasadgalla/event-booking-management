import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  event: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  organiserResponse?: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    booking: { type: Schema.Types.ObjectId, ref: "Booking" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    organiserResponse: { type: String, default: "" },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ event: 1, createdAt: -1 });

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
export default Review;
