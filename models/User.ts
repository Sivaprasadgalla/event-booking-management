import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "customer" | "organiser" | "admin";
  avatar?: string;
  phone?: string;
  bio?: string;
  companyName?: string;
  isVerified: boolean;
  verificationCode?: string;
  verificationToken?: string;
  verificationExpires?: Date;
  savedCart?: any[];
  status: "active" | "suspended";
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: true },
    role: {
      type: String,
      enum: ["customer", "organiser", "admin"],
      default: "customer",
    },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    bio: { type: String, default: "" },
    companyName: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String, select: false },
    verificationToken: { type: String, select: false },
    verificationExpires: { type: Date, select: false },
    savedCart: { type: Array, default: [] },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
