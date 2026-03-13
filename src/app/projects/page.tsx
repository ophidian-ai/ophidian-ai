"use client";

import { useEffect, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CircularGallery, type GalleryItem } from "@/components/ui/circular-gallery";
import { usePageContent } from "@/lib/use-page-content";
import { EditableText } from "@/components/editable/editable-text";
import { EditableImage } from "@/components/editable/editable-image";
import { useEditMode } from "@/lib/edit-mode-context";
import { getPortfolioProjects, type PortfolioProject } from "@/lib/portfolio";

// Placeholder projects for visual density in the gallery
const placeholderProjects: GalleryItem[] = [
  { title: "AI Dashboard", subtitle: "Analytics & monitoring", photo: { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80", text: "Data analytics dashboard on monitor", pos: "50% 50%" } },
  { title: "E-Commerce Platform", subtitle: "Modern shopping experience", photo: { url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&auto=format&fit=crop&q=80", text: "Person shopping online on laptop", pos: "50% 50%" } },
  { title: "SaaS Landing Page", subtitle: "Conversion-focused design", photo: { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80", text: "Modern website design on laptop screen", pos: "50% 30%" } },
  { title: "Restaurant Site", subtitle: "Local business web presence", photo: { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80", text: "Modern restaurant interior", pos: "50% 50%" } },
];

function dbToGalleryItem(p: PortfolioProject): GalleryItem {
  return {
    title: p.title,
    subtitle: p.subtitle,
    href: `/portfolio/${p.slug}`,
    photo: {
      url: p.gallery_image || p.hero_image,
      text: p.gallery_image_alt || p.hero_image_alt,
      pos: p.gallery_image_pos || p.hero_image_pos,
    },
  };
}

export default function ProjectsPage() {
  const content = usePageContent("projects");
  const { isEditMode } = useEditMode();
  const [dbProjects, setDbProjects] = useState<PortfolioProject[]>([]);

  useEffect(() => {
    getPortfolioProjects().then(setDbProjects);
  }, []);

  // Real projects first, then placeholders to fill the gallery
  const galleryItems: GalleryItem[] = [
    ...dbProjects.map(dbToGalleryItem),
    ...placeholderProjects,
  ].map((p, i) => ({
    ...p,
    title: content[`project_${i + 1}_title`] || p.title,
    subtitle: content[`project_${i + 1}_subtitle`] || p.subtitle,
    photo: {
      ...p.photo,
      url: content[`project_${i + 1}_image`] || p.photo.url,
    },
  }));

  // For edit mode, show all items in grid
  const editItems = galleryItems;

  return (
    <PageWrapper>
      <div className="grain">
        <div className="w-full h-screen flex flex-col items-center justify-center overflow-hidden relative">
          <div className="text-center mb-8 absolute top-16 z-10">
            {isEditMode ? (
              <>
                <div className="flex items-center justify-center gap-2">
                  <EditableText page="projects" contentKey="projects_heading" defaultValue="Our" dbValue={content["projects_heading"]} as="span" className="text-4xl font-bold text-foreground" />
                  <EditableText page="projects" contentKey="projects_heading_accent" defaultValue="Work" dbValue={content["projects_heading_accent"]} as="span" className="text-4xl font-bold gradient-text" />
                </div>
                <EditableText page="projects" contentKey="projects_subtitle" defaultValue="Scroll to explore the gallery" dbValue={content["projects_subtitle"]} as="p" className="text-foreground-muted mt-2" />
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold text-foreground">
                  {content["projects_heading"] || "Our"}{" "}
                  <span className="gradient-text">{content["projects_heading_accent"] || "Work"}</span>
                </h2>
                <p className="text-foreground-muted mt-2">
                  {content["projects_subtitle"] || "Scroll to explore the gallery"}
                </p>
              </>
            )}
          </div>

          {isEditMode ? (
            <div className="w-full max-w-4xl mx-auto px-4 mt-32 grid grid-cols-2 md:grid-cols-3 gap-4">
              {editItems.map((p, i) => (
                <div key={i} className="glass rounded-xl border border-primary/10 overflow-hidden text-center">
                  <div className="relative aspect-video">
                    <EditableImage
                      page="projects"
                      contentKey={`project_${i + 1}_image`}
                      defaultSrc={p.photo.url}
                      dbValue={content[`project_${i + 1}_image`]}
                      alt={p.photo.text}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <EditableText page="projects" contentKey={`project_${i + 1}_title`} defaultValue={p.title} dbValue={content[`project_${i + 1}_title`]} as="h3" className="text-sm font-semibold text-foreground mb-1" />
                    <EditableText page="projects" contentKey={`project_${i + 1}_subtitle`} defaultValue={p.subtitle} dbValue={content[`project_${i + 1}_subtitle`]} as="p" className="text-xs text-foreground-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full">
              <CircularGallery items={galleryItems} />
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
