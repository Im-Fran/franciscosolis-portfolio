import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button/button.tsx";
import { Badge } from "@/components/ui/badge/badge.tsx";
import { Card, CardBody } from "@/components/ui/card.tsx";
import { ProjectModal, type ProjectFormData } from "./project-modal.tsx";
import { Plus, PencilSimple, Trash, ArrowSquareOut, Star, Folder } from "@phosphor-icons/react";

interface ToolboxCategoryOption {
  id: number;
  key: string;
  label_es: string;
  label_en: string;
}

export interface ProjectItem {
  id: number;
  uuid: string;
  kind: "featured" | "secondary";
  category: "landing" | "mobile" | "webapp" | "api" | null;
  href: string;
  media_r2_key: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  i18n: {
    es: { title: string; description: string; long_description: string | null };
    en: { title: string; description: string; long_description: string | null };
  };
  technologies: Array<{ id: number; name: string; sort_order: number }>;
  toolbox_category_ids: number[];
}

export const ProjectsManager: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [toolboxCategories, setToolboxCategories] = useState<ToolboxCategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectFormData | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/projects", { credentials: "include" });
      if (!res.ok) throw new Error("Error al obtener los proyectos");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar proyectos");
    } finally {
      setLoading(false);
    }
  };

  const fetchToolboxCategories = async () => {
    try {
      const res = await fetch("/api/admin/toolbox", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const cats: ToolboxCategoryOption[] = (data.categories || []).map((cat: any) => ({
          id: cat.id,
          key: cat.key,
          label_es: cat.i18n?.es?.label || cat.key,
          label_en: cat.i18n?.en?.label || cat.key,
        }));
        setToolboxCategories(cats);
      }
    } catch (err) {
      console.error("Error fetching toolbox categories:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchToolboxCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (project: ProjectItem) => {
    setEditingProject({
      id: project.id,
      uuid: project.uuid,
      kind: project.kind,
      category: project.category,
      href: project.href,
      media_r2_key: project.media_r2_key,
      sort_order: project.sort_order,
      i18n: {
        es: {
          title: project.i18n.es.title,
          description: project.i18n.es.description,
          long_description: project.i18n.es.long_description,
        },
        en: {
          title: project.i18n.en.title,
          description: project.i18n.en.description,
          long_description: project.i18n.en.long_description,
        },
      },
      technologies: project.technologies.map((t) => t.name),
      toolbox_category_ids: project.toolbox_category_ids,
    });
    setModalOpen(true);
  };

  const handleSaveProject = async (formData: ProjectFormData) => {
    const isEdit = !!formData.id;
    const url = isEdit ? `/api/admin/projects/${formData.id}` : "/api/admin/projects";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
      credentials: "include",
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Error al guardar el proyecto");
    }

    await fetchProjects();
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este proyecto?")) return;

    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al eliminar el proyecto");
      await fetchProjects();
    } catch (err: any) {
      alert(err.message || "Error al eliminar");
    }
  };

  const featuredProjects = projects.filter((p) => p.kind === "featured");
  const secondaryProjects = projects.filter((p) => p.kind === "secondary");

  const renderProjectCard = (p: ProjectItem) => {
    const mediaUrl = p.media_r2_key
      ? p.media_r2_key.startsWith("/api/media/")
        ? p.media_r2_key
        : `/api/media/${p.media_r2_key}`
      : null;

    return (
      <Card key={p.id} className="border border-neutral-800/80 bg-neutral-900/40 hover:border-neutral-700 transition-colors">
        <CardBody className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-text truncate">{p.i18n.es.title || p.i18n.en.title}</span>
                <Badge variant={p.kind === "featured" ? "accent" : "neutral"} size="sm">
                  {p.kind}
                </Badge>
                {p.category && (
                  <Badge variant="outline" size="sm">
                    {p.category}
                  </Badge>
                )}
                <span className="text-[11px] text-neutral-500">Ord: {p.sort_order}</span>
              </div>
              <p className="text-xs text-neutral-400 line-clamp-2">{p.i18n.es.description || p.i18n.en.description}</p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <a
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-neutral-400 hover:text-text rounded transition-colors"
                title="Ver enlace"
              >
                <ArrowSquareOut size={16} />
              </a>
              <button
                onClick={() => handleOpenEdit(p)}
                className="p-1.5 text-neutral-400 hover:text-accent-300 rounded transition-colors"
                title="Editar"
              >
                <PencilSimple size={16} />
              </button>
              <button
                onClick={() => handleDeleteProject(p.id)}
                className="p-1.5 text-neutral-400 hover:text-red-400 rounded transition-colors"
                title="Eliminar"
              >
                <Trash size={16} />
              </button>
            </div>
          </div>

          {/* Media Preview & Tech Tags */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-neutral-800/60">
            {mediaUrl && (
              <div className="w-full sm:w-28 h-16 rounded overflow-hidden bg-black/40 shrink-0 border border-neutral-800">
                {mediaUrl.match(/\.(mp4|webm)$/i) ? (
                  <video src={mediaUrl} className="w-full h-full object-cover" />
                ) : (
                  <img src={mediaUrl} alt={p.i18n.es.title} className="w-full h-full object-cover" />
                )}
              </div>
            )}

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-1">
                {p.technologies.map((t) => (
                  <Badge key={t.id} variant="neutral" size="sm" className="text-[10px] py-0 px-1.5">
                    {t.name}
                  </Badge>
                ))}
              </div>

              {p.toolbox_category_ids.length > 0 && (
                <div className="text-[11px] text-neutral-500">
                  Toolbox:{" "}
                  {p.toolbox_category_ids
                    .map((id) => toolboxCategories.find((c) => c.id === id)?.label_es || id)
                    .join(", ")}
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-neutral-400">Cargando proyectos...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header & Add Action */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text">Gestión de Proyectos</h2>
          <p className="text-xs text-neutral-400">Administra tus proyectos destacados y secundarios</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          <Plus size={18} className="mr-1.5" />
          Nuevo Proyecto
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded bg-red-950/50 border border-red-800 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Featured Projects */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-accent-300 uppercase tracking-wider">
          <Star size={18} className="text-accent-400" />
          Destacados ({featuredProjects.length})
        </div>
        {featuredProjects.length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
            No hay proyectos destacados creados.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">{featuredProjects.map(renderProjectCard)}</div>
        )}
      </div>

      {/* Secondary Projects */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-400 uppercase tracking-wider">
          <Folder size={18} />
          Secundarios ({secondaryProjects.length})
        </div>
        {secondaryProjects.length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
            No hay proyectos secundarios creados.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">{secondaryProjects.map(renderProjectCard)}</div>
        )}
      </div>

      {/* Modal Form */}
      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveProject}
        project={editingProject}
        toolboxCategories={toolboxCategories}
      />
    </div>
  );
};
