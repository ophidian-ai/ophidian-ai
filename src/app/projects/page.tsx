"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { CircularGallery, type GalleryItem } from "@/components/ui/circular-gallery";
import { usePageContent } from "@/lib/use-page-content";
import { EditableText } from "@/components/editable/editable-text";
import { useEditMode } from "@/lib/edit-mode-context";

const defaultProjects = [
  { title: "Bloomin' Acres", subtitle: "Sourdough bakery & produce", href: "https://bloomin-acres.vercel.app", photo: { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&auto=format&fit=crop&q=80", text: "Artisan sourdough bread on wooden cutting board", pos: "50% 40%" } },
  { title: "AI Dashboard", subtitle: "Analytics & monitoring", photo: { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80", text: "Data analytics dashboard on monitor", pos: "50% 50%" } },
  { title: "E-Commerce Platform", subtitle: "Modern shopping experience", photo: { url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&auto=format&fit=crop&q=80", text: "Person shopping online on laptop", pos: "50% 50%" } },
  { title: "SaaS Landing Page", subtitle: "Conversion-focused design", photo: { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80", text: "Modern website design on laptop screen", pos: "50% 30%" } },
  { title: "Restaurant Site", subtitle: "Local business web presence", photo: { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80", text: "Modern restaurant interior", pos: "50% 50%" } },
  { title: "AI Chatbot", subtitle: "Customer service automation", photo: { url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&auto=format&fit=crop&q=80", text: "AI chatbot interface on screen", pos: "50% 50%" } },
];

export default function ProjectsPage() {
  const content = usePageContent("projects");
  const { isEditMode } = useEditMode();

  const resolvedProjects: GalleryItem[] = defaultProjects.map((p, i) => ({
    ...p,
    title: content[`project_${i + 1}_title`] || p.title,
    subtitle: content[`project_${i + 1}_subtitle`] || p.subtitle,
  }));

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
              {defaultProjects.map((p, i) => (
                <div key={i} className="glass rounded-xl border border-primary/10 p-4 text-center">
                  <EditableText page="projects" contentKey={`project_${i + 1}_title`} defaultValue={p.title} dbValue={content[`project_${i + 1}_title`]} as="h3" className="text-sm font-semibold text-foreground mb-1" />
                  <EditableText page="projects" contentKey={`project_${i + 1}_subtitle`} defaultValue={p.subtitle} dbValue={content[`project_${i + 1}_subtitle`]} as="p" className="text-xs text-foreground-muted" />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full">
              <CircularGallery items={resolvedProjects} />
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
