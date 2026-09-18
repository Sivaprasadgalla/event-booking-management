import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPackage {
  id: string;
  name: string;
  price: number;
  capacity: number;
  features: string[];
  isDefault?: boolean;
}

export interface IAddOn {
  id: string;
  name: string;
  price: number;
  description?: string;
  maxPerBooking: number;
}

export interface IDailyTimeSlot {
  id: string;
  title: string;
  startTime: string; // "11:00"
  endTime: string; // "15:00"
  capacity: number;
  slotType: "morning" | "afternoon" | "evening" | "night";
  isActive: boolean;
}

export interface IScheduleSlot {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
}

export interface IVenue {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  virtualLink?: string;
  googleMapsUrl?: string;
}

export interface IContactInfo {
  phone: string;
  whatsapp?: string;
  contactPerson?: string;
  email?: string;
}

export interface ICancellationPolicy {
  allowed: boolean;
  maxDaysBefore: number;
  refundPercentage: number;
}

export interface IEvent extends Document {
  title: string;
  slug: string;
  organiser: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  shortDescription: string;
  fullDescription: string;
  eventType: "physical" | "online";
  venueType: string;
  celebrationTypes: string[];
  venue: IVenue;
  contactInfo?: IContactInfo;
  coverImage: string;
  gallery: string[];
  packages: IPackage[];
  addOns: IAddOn[];
  operatingDays: "all_days" | "weekdays_only" | "weekends_only" | "custom_days";
  customOperatingDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  dailyTimeSlots: IDailyTimeSlot[];
  scheduleSlots: IScheduleSlot[];
  termsAndConditions: string[];
  cancellationPolicy: ICancellationPolicy;
  policyText?: string;
  status: "draft" | "pending_approval" | "approved" | "rejected" | "published" | "unpublished";
  adminFeedback?: string;
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema = new Schema<IPackage>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    features: [{ type: String }],
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const AddOnSchema = new Schema<IAddOn>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    maxPerBooking: { type: Number, default: 5 },
  },
  { _id: false }
);

const DailyTimeSlotSchema = new Schema<IDailyTimeSlot>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    slotType: {
      type: String,
      enum: ["morning", "afternoon", "evening", "night"],
      default: "evening",
    },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const ScheduleSlotSchema = new Schema<IScheduleSlot>(
  {
    id: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    bookedCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const VenueSchema = new Schema<IVenue>(
  {
    name: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    virtualLink: { type: String, default: "" },
    googleMapsUrl: { type: String, default: "" },
  },
  { _id: false }
);

const CancellationPolicySchema = new Schema<ICancellationPolicy>(
  {
    allowed: { type: Boolean, default: true },
    maxDaysBefore: { type: Number, default: 2 },
    refundPercentage: { type: Number, default: 80 },
  },
  { _id: false }
);

const ContactInfoSchema = new Schema<IContactInfo>(
  {
    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    contactPerson: { type: String, default: "" },
    email: { type: String, default: "" },
  },
  { _id: false }
);

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    organiser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    eventType: { type: String, enum: ["physical", "online"], default: "physical" },
    venueType: { type: String, default: "Rooftop Lounge" },
    celebrationTypes: [{ type: String }],
    venue: { type: VenueSchema, required: true },
    contactInfo: { type: ContactInfoSchema, default: () => ({}) },
    coverImage: { type: String, required: true },
    gallery: [{ type: String }],
    packages: { type: [PackageSchema], default: [] },
    addOns: { type: [AddOnSchema], default: [] },
    operatingDays: {
      type: String,
      enum: ["all_days", "weekdays_only", "weekends_only", "custom_days"],
      default: "all_days",
    },
    customOperatingDays: { type: [Number], default: [1, 2, 3, 4, 5, 6, 0] },
    dailyTimeSlots: { type: [DailyTimeSlotSchema], default: [] },
    scheduleSlots: { type: [ScheduleSlotSchema], default: [] },
    termsAndConditions: [{ type: String }],
    cancellationPolicy: { type: CancellationPolicySchema, default: () => ({}) },
    policyText: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "pending_approval", "approved", "rejected", "published", "unpublished"],
      default: "draft",
    },
    adminFeedback: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

EventSchema.index({ status: 1, isFeatured: 1 });
EventSchema.index({ category: 1, status: 1 });
EventSchema.index({ "venue.city": 1, status: 1 });
EventSchema.index({ title: "text", shortDescription: "text" });

export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
export default Event;
