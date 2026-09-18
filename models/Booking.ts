import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISelectedAddOn {
  addOnId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface IRefundDetails {
  status: "none" | "requested" | "approved" | "rejected";
  amount: number;
  reason?: string;
  requestedAt?: Date;
  processedAt?: Date;
  adminNote?: string;
}

export interface IBooking extends Document {
  bookingReference: string;
  order: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  organiser: mongoose.Types.ObjectId;
  packageDetails: {
    packageId: string;
    name: string;
    price: number;
  };
  guestsCount: number;
  selectedSlot: {
    slotId: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  selectedAddOns: ISelectedAddOn[];
  subtotal: number;
  totalAmount: number;
  status: "confirmed" | "cancelled" | "attended";
  checkInStatus: "pending" | "checked_in";
  checkedInAt?: Date;
  qrCodeData: string;
  refundDetails: IRefundDetails;
  createdAt: Date;
  updatedAt: Date;
}

const SelectedAddOnSchema = new Schema<ISelectedAddOn>(
  {
    addOnId: { type: String, required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const RefundDetailsSchema = new Schema<IRefundDetails>(
  {
    status: {
      type: String,
      enum: ["none", "requested", "approved", "rejected"],
      default: "none",
    },
    amount: { type: Number, default: 0 },
    reason: { type: String, default: "" },
    requestedAt: { type: Date },
    processedAt: { type: Date },
    adminNote: { type: String, default: "" },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    bookingReference: { type: String, required: true, unique: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    organiser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    packageDetails: {
      packageId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
    },
    guestsCount: { type: Number, required: true, default: 1 },
    selectedSlot: {
      slotId: { type: String, required: true },
      date: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
    selectedAddOns: { type: [SelectedAddOnSchema], default: [] },
    subtotal: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "attended"],
      default: "confirmed",
    },
    checkInStatus: {
      type: String,
      enum: ["pending", "checked_in"],
      default: "pending",
    },
    checkedInAt: { type: Date },
    qrCodeData: { type: String, required: true },
    refundDetails: { type: RefundDetailsSchema, default: () => ({ status: "none", amount: 0 }) },
  },
  { timestamps: true }
);

BookingSchema.index({ customer: 1, createdAt: -1 });
BookingSchema.index({ organiser: 1, createdAt: -1 });
BookingSchema.index({ event: 1 });

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
export default Booking;
