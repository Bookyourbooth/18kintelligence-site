import type { MetadataRoute } from "next";
import { site } from "@/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/privacy"].map((path) => ({ url: `${site.url}${path}`, changeFrequency: "monthly" }));
}
