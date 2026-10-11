import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vasudev — Filmmaking Workspace",
    short_name: "Vasudev",
    description: "Write, plan, and make your film.",
    start_url: "/",
    display: "standalone",
    background_color: "#111317",
    theme_color: "#111317",
    orientation: "any",
    categories: ["productivity", "video"],
  };
}
