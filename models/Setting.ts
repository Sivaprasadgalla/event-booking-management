import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISetting extends Document {
  platformName: string;
  platformFeePercent: number;
  taxPercent: number;
  currency: string;
  supportEmail: string;
  allowNewOrganiserRegistration: boolean;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    platformName: { type: String, default: "CelebrateHub Luxury Celebrations" },
    platformFeePercent: { type: Number, default: 5 },
    taxPercent: { type: Number, default: 18 },
    currency: { type: String, default: "INR" },
    supportEmail: { type: String, default: "support@celebratehub.com" },
    allowNewOrganiserRegistration: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Setting: Model<ISetting> =
  mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);
export default Setting;
