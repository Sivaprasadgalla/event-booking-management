// Cloudinary image handler and high-quality photography fallbacks

export const EVENT_IMAGE_PRESETS = [
  {
    category: "Music & Concerts",
    url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    label: "Live Stadium Festival",
  },
  {
    category: "Technology & Conferences",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    label: "Tech Keynote Stage",
  },
  {
    category: "Food & Drinks",
    url: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80",
    label: "Gourmet Food Festival",
  },
  {
    category: "Workshops & Masterclasses",
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
    label: "Interactive Workshop",
  },
  {
    category: "Fitness & Wellness",
    url: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80",
    label: "Sunrise Yoga Retreat",
  },
  {
    category: "Arts & Theatre",
    url: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80",
    label: "Theatre Performance",
  },
  {
    category: "Nightlife & Parties",
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    label: "DJ Club Night",
  },
];

export async function uploadImageToCloudinary(fileBase64: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;

  // If Cloudinary keys are not provided, return the base64 string directly or a fallback
  if (!cloudName || !apiKey) {
    // Return base64 or preset
    return fileBase64;
  }

  try {
    const formData = new FormData();
    formData.append("file", fileBase64);
    formData.append("upload_preset", "eventhub_default");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url || fileBase64;
  } catch (error) {
    console.error("Cloudinary upload failed, using local fallback", error);
    return fileBase64;
  }
}
