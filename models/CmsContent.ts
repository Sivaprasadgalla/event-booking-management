import mongoose, { Schema, Document, Model } from "mongoose";
import { CmsData } from "@/lib/defaultCms";

export interface ICmsContent extends Document, CmsData {
  createdAt: Date;
  updatedAt: Date;
}

const CmsContentSchema = new Schema<ICmsContent>(
  {
    header: {
      brandName: { type: String, default: "CelebrateHub" },
      brandTagline: { type: String, default: "Venue & Hosting" },
      searchPlaceholder: {
        type: String,
        default: "Search rooftops, villas, banquets, occasions...",
      },
      announcement: {
        enabled: { type: Boolean, default: true },
        text: { type: String, default: "" },
        linkText: { type: String, default: "" },
        linkUrl: { type: String, default: "" },
      },
      navLinks: [
        {
          label: { type: String, required: true },
          href: { type: String, required: true },
          isHighlighted: { type: Boolean, default: false },
        },
      ],
    },
    footer: {
      brandDescription: { type: String, default: "" },
      copyrightText: { type: String, default: "" },
      columns: [
        {
          title: { type: String, required: true },
          links: [
            {
              label: { type: String, required: true },
              href: { type: String, required: true },
            },
          ],
        },
      ],
      trustBadges: [
        {
          text: { type: String, required: true },
        },
      ],
      socialLinks: {
        instagram: { type: String, default: "" },
        twitter: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        facebook: { type: String, default: "" },
      },
    },
    hero: {
      badgeText: { type: String, default: "" },
      title: { type: String, default: "" },
      highlightedTitle: { type: String, default: "" },
      subtitle: { type: String, default: "" },
      primaryCta: {
        label: { type: String, default: "Explore All Venues" },
        href: { type: String, default: "/events" },
      },
      secondaryCta: {
        label: { type: String, default: "Host Celebrations" },
        href: { type: String, default: "/register" },
      },
      stats: [
        {
          label: { type: String, required: true },
          value: { type: String, required: true },
        },
      ],
    },
    occasions: [
      {
        label: { type: String, required: true },
        href: { type: String, required: true },
        color: { type: String, default: "purple" },
      },
    ],
  },
  { timestamps: true }
);

export const CmsContent: Model<ICmsContent> =
  mongoose.models.CmsContent ||
  mongoose.model<ICmsContent>("CmsContent", CmsContentSchema);

export default CmsContent;
