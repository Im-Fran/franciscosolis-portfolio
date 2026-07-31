import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal.tsx";
import { Button } from "@/components/ui/button/button.tsx";
import { Badge } from "@/components/ui/badge/badge.tsx";
import { MediaUploader } from "./media-uploader.tsx";
import { X, Plus } from "@phosphor-icons/react";

export interface ProjectFormData {
  id?: number;
  uuid?: string;
  kind: "featured" | "secondary";
  category: "landing" | "mobile" | "webapp" | "api" | null;
  href: string;
  media_r2_key: string | null;
  sort_order: number;
  i18n: {
    es: { title: string; description: string; long_description?: string | null };
    en: { title: string; description: string; long_description?: string | null };
  };
  technologies: string[];
  toolbox_category_ids: number[];
}

interface ToolboxCategoryOption {
  id: number;
  key: string;
  label_es: string;
  label_en: string;
}

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProjectFormData) => Promise<void>;
  project?: ProjectFormData | null;
  toolboxCategories: ToolboxCategoryOption[];
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  open,
  onClose,
  onSave,
  project,
  toolboxCategories,
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    kind: "featured",
    category: "webapp",
    href: "",
    media_r2_key: null,
    sort_order: 0,
    i18n: {
      es: { title: "", description: "", long_description: "" },
      en: { title: "", description: "", long_description: "" },
    },
    technologies: [],
    toolbox_category_ids: [],
  });

  const [techInput, setTechInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        category: project.category || "webapp",
        i18n: {
          es: {
            title: project.i18n?.es?.title || "",
            description: project.i18n?.es?.description || "",
            long_description: project.i18n?.es?.long_description || "",
          },
          en: {
            title: project.i18n?.en?.title || "",
            description: project.i18n?.en?.description || "",
            long_description: project.i18n?.en?.long_description || "",
          },
        },
        technologies: project.technologies || [],
        toolbox_category_ids: project.toolbox_category_ids || [],
      });
    } else {
      setFormData({
        kind: "featured",
        category: "webapp",
        href: "",
        media_r2_key: null,
        sort_order: 0,
        i18n: {
          es: { title: "", description: "", long_description: "" },
          en: { title: "", description: "", long_description: "" },
        },
        technologies: [],
        toolbox_category_ids: [],
      });
    }
    setTechInput("");
    setError(null);
  }, [project, open]);

  const handleAddTech = () => {
    const trimmed = techInput.trim();
    if (trimmed && !formData.technologies.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, trimmed],
      }));
      setTechInput("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }));
  };

  const handleToggleToolboxCategory = (catId: number) => {
    setFormData((prev) => {
      const exists = prev.toolbox_category_ids.includes(catId);
      return {
        ...prev,
        toolbox_category_ids: exists
          ? prev.toolbox_category_ids.filter((id) => id !== catId)
          : [...prev.toolbox_category_ids, catId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.i18n.es.title || !formData.i18n.en.title || !formData.href) {
      setError("Título (ES y EN) y URL/Href son obligatorios.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar proyecto");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={project ? "Editar Proyecto" : "Nuevo Proyecto"} className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded bg-red-950/50 border border-red-800/80 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Datos Básicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Tipo / Kind
            </label>
            <select
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-accent-500"
              value={formData.kind}
              onChange={(e) =>
                setFormData({ ...formData, kind: e.target.value as "featured" | "secondary" })
              }
            >
              <option value="featured">Destacado (Featured)</option>
              <option value="secondary">Secundario (Secondary)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Categoría
            </label>
            <select
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-accent-500"
              value={formData.category || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: (e.target.value || null) as any,
                })
              }
            >
              <option value="webapp">Web App</option>
              <option value="landing">Landing</option>
              <option value="mobile">Mobile</option>
              <option value="api">API</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Orden (Sort Order)
            </label>
            <input
              type="number"
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-accent-500"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Enlace / Href *
          </label>
          <input
            type="text"
            required
            placeholder="https://..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-accent-500"
            value={formData.href}
            onChange={(e) => setFormData({ ...formData, href: e.target.value })}
          />
        </div>

        {/* Media Uploader */}
        <MediaUploader
          projectUuid={formData.uuid}
          value={formData.media_r2_key}
          onChange={(key) => setFormData({ ...formData, media_r2_key: key })}
        />

        {/* Bilingüe ES/EN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg border border-neutral-800 bg-neutral-900/30">
          {/* Español */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent-400 flex items-center gap-1.5">
              <span>ES</span> Español
            </h4>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Título (ES) *</label>
              <input
                type="text"
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-accent-500"
                value={formData.i18n.es.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    i18n: {
                      ...formData.i18n,
                      es: { ...formData.i18n.es, title: e.target.value },
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Descripción corta (ES)</label>
              <textarea
                rows={2}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-accent-500"
                value={formData.i18n.es.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    i18n: {
                      ...formData.i18n,
                      es: { ...formData.i18n.es, description: e.target.value },
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Descripción detallada (ES)</label>
              <textarea
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-accent-500"
                value={formData.i18n.es.long_description || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    i18n: {
                      ...formData.i18n,
                      es: { ...formData.i18n.es, long_description: e.target.value },
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Inglés */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent-400 flex items-center gap-1.5">
              <span>EN</span> English
            </h4>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Title (EN) *</label>
              <input
                type="text"
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-accent-500"
                value={formData.i18n.en.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    i18n: {
                      ...formData.i18n,
                      en: { ...formData.i18n.en, title: e.target.value },
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Short Description (EN)</label>
              <textarea
                rows={2}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-accent-500"
                value={formData.i18n.en.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    i18n: {
                      ...formData.i18n,
                      en: { ...formData.i18n.en, description: e.target.value },
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Detailed Description (EN)</label>
              <textarea
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-accent-500"
                value={formData.i18n.en.long_description || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    i18n: {
                      ...formData.i18n,
                      en: { ...formData.i18n.en, long_description: e.target.value },
                    },
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Tecnologías (Tags) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Tecnologías (Tags)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Ej: React, Tailwind, Cloudflare..."
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-accent-500"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTech();
                }
              }}
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleAddTech}>
              <Plus size={16} />
              Agregar
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {formData.technologies.map((tech) => (
              <Badge key={tech} variant="neutral" className="gap-1 pr-1.5 text-xs py-1">
                {tech}
                <button
                  type="button"
                  onClick={() => handleRemoveTech(tech)}
                  className="hover:text-red-400 text-neutral-400 ml-1"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Toolbox Categories Multi-Select */}
        {toolboxCategories.length > 0 && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Categorías de Toolbox Asociadas
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {toolboxCategories.map((cat) => {
                const checked = formData.toolbox_category_ids.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleToggleToolboxCategory(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded text-xs border text-left transition-colors ${
                      checked
                        ? "bg-accent-950/40 border-accent-600/60 text-accent-300"
                        : "bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <input type="checkbox" checked={checked} readOnly className="accent-accent-500" />
                    <span className="truncate">{cat.label_es || cat.key}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar Proyecto"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
