import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "DormMate — Shared homes, fair splits",
    short_name: "DormMate",
    description:
      "Chores, receipts, and shared expenses for dorms and flats — fair splits with housemates.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    orientation: "portrait-primary",
    background_color: "#e8dfd2",
    theme_color: "#5a7a5f",
    categories: ["finance", "productivity", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
