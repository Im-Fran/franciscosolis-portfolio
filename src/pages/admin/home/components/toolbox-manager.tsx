import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button/button.tsx";
import { Modal } from "@/components/ui/modal.tsx";
import { Card, CardBody } from "@/components/ui/card.tsx";
import { Plus, PencilSimple, Trash, Folder, Wrench } from "@phosphor-icons/react";

export interface ToolItem {
  id: number;
  category_id: number;
  group_id: number | null;
  name: string;
  sort_order: number;
}

export interface GroupItem {
  id: number;
  category_id: number;
  name: string;
  sort_order: number;
  tools: ToolItem[];
}

export interface CategoryItem {
  id: number;
  key: string;
  icon: string;
  sort_order: number;
  i18n: {
    es: { label: string };
    en: { label: string };
  };
  groups: GroupItem[];
  ungrouped_tools: ToolItem[];
}

export const ToolboxManager: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [catForm, setCatForm] = useState({
    key: "",
    icon: "code",
    sort_order: 0,
    i18n: { es: { label: "" }, en: { label: "" } },
  });

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupItem | null>(null);
  const [groupForm, setGroupForm] = useState({
    category_id: 0,
    name: "",
    sort_order: 0,
  });

  const [toolModalOpen, setToolModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolItem | null>(null);
  const [toolForm, setToolForm] = useState({
    category_id: 0,
    group_id: null as number | null,
    name: "",
    sort_order: 0,
  });

  const fetchToolbox = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/toolbox", { credentials: "include" });
      if (!res.ok) throw new Error("Error al obtener la toolbox");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar toolbox");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToolbox();
  }, []);

  // --- Category Handlers ---
  const handleOpenCatModal = (cat?: CategoryItem) => {
    if (cat) {
      setEditingCategory(cat);
      setCatForm({
        key: cat.key,
        icon: cat.icon,
        sort_order: cat.sort_order,
        i18n: {
          es: { label: cat.i18n?.es?.label || "" },
          en: { label: cat.i18n?.en?.label || "" },
        },
      });
    } else {
      setEditingCategory(null);
      setCatForm({
        key: "",
        icon: "code",
        sort_order: 0,
        i18n: { es: { label: "" }, en: { label: "" } },
      });
    }
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!editingCategory;
      const url = isEdit ? `/api/admin/toolbox/categories/${editingCategory.id}` : "/api/admin/toolbox/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catForm),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al guardar la categoría");
      setCatModalOpen(false);
      await fetchToolbox();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("¿Eliminar esta categoría y todo su contenido?")) return;
    try {
      const res = await fetch(`/api/admin/toolbox/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al eliminar la categoría");
      await fetchToolbox();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- Group Handlers ---
  const handleOpenGroupModal = (categoryId: number, group?: GroupItem) => {
    if (group) {
      setEditingGroup(group);
      setGroupForm({
        category_id: group.category_id,
        name: group.name,
        sort_order: group.sort_order,
      });
    } else {
      setEditingGroup(null);
      setGroupForm({
        category_id: categoryId,
        name: "",
        sort_order: 0,
      });
    }
    setGroupModalOpen(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!editingGroup;
      const url = isEdit ? `/api/admin/toolbox/groups/${editingGroup.id}` : "/api/admin/toolbox/groups";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(groupForm),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al guardar el grupo");
      setGroupModalOpen(false);
      await fetchToolbox();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (!confirm("¿Eliminar este grupo? Las herramientas pasarán a sin grupo.")) return;
    try {
      const res = await fetch(`/api/admin/toolbox/groups/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al eliminar el grupo");
      await fetchToolbox();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- Tool Handlers ---
  const handleOpenToolModal = (categoryId: number, groupId: number | null = null, tool?: ToolItem) => {
    if (tool) {
      setEditingTool(tool);
      setToolForm({
        category_id: tool.category_id,
        group_id: tool.group_id,
        name: tool.name,
        sort_order: tool.sort_order,
      });
    } else {
      setEditingTool(null);
      setToolForm({
        category_id: categoryId,
        group_id: groupId,
        name: "",
        sort_order: 0,
      });
    }
    setToolModalOpen(true);
  };

  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!editingTool;
      const url = isEdit ? `/api/admin/toolbox/tools/${editingTool.id}` : "/api/admin/toolbox/tools";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toolForm),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al guardar la herramienta");
      setToolModalOpen(false);
      await fetchToolbox();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteTool = async (id: number) => {
    if (!confirm("¿Eliminar esta herramienta?")) return;
    try {
      const res = await fetch(`/api/admin/toolbox/tools/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al eliminar la herramienta");
      await fetchToolbox();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-neutral-400">Cargando toolbox...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text">Gestión de Toolbox</h2>
          <p className="text-xs text-neutral-400">Administra Categorías, Grupos y Herramientas</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenCatModal()}>
          <Plus size={18} className="mr-1.5" />
          Nueva Categoría
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded bg-red-950/50 border border-red-800 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Categorías Tree */}
      <div className="space-y-6">
        {categories.map((cat) => (
          <Card key={cat.id} className="border border-neutral-800 bg-neutral-900/40">
            <CardBody className="p-5 space-y-4">
              {/* Categoría Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-neutral-800/80 text-accent-300">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text text-base flex items-center gap-2">
                      {cat.i18n?.es?.label || cat.key}
                      <span className="text-xs font-normal text-neutral-400">({cat.i18n?.en?.label})</span>
                    </h3>
                    <div className="text-xs text-neutral-500 flex items-center gap-3">
                      <span>Key: <code className="text-neutral-400">{cat.key}</code></span>
                      <span>Icon: <code className="text-neutral-400">{cat.icon}</code></span>
                      <span>Orden: {cat.sort_order}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleOpenGroupModal(cat.id)}>
                    <Plus size={14} className="mr-1" />
                    Grupo
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleOpenToolModal(cat.id, null)}>
                    <Plus size={14} className="mr-1" />
                    Herramienta
                  </Button>
                  <button
                    onClick={() => handleOpenCatModal(cat)}
                    className="p-1.5 text-neutral-400 hover:text-accent-300 rounded transition-colors ml-1"
                    title="Editar Categoría"
                  >
                    <PencilSimple size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-400 rounded transition-colors"
                    title="Eliminar Categoría"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>

              {/* Grupos */}
              {cat.groups.length > 0 && (
                <div className="space-y-3 pl-2 sm:pl-4">
                  {cat.groups.map((group) => (
                    <div key={group.id} className="p-3 rounded border border-neutral-800/60 bg-neutral-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Folder size={16} className="text-accent-400" />
                          <span className="text-xs font-semibold text-neutral-200">{group.name}</span>
                          <span className="text-[11px] text-neutral-500">(Ord: {group.sort_order})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenToolModal(cat.id, group.id)}
                            className="text-xs text-accent-400 hover:underline px-2 py-0.5"
                          >
                            + Herramienta
                          </button>
                          <button
                            onClick={() => handleOpenGroupModal(cat.id, group)}
                            className="p-1 text-neutral-400 hover:text-accent-300 rounded"
                          >
                            <PencilSimple size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="p-1 text-neutral-400 hover:text-red-400 rounded"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Tools inside group */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {group.tools.length === 0 ? (
                          <span className="text-[11px] text-neutral-600 italic">Sin herramientas</span>
                        ) : (
                          group.tools.map((tool) => (
                            <div
                              key={tool.id}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800/60 border border-neutral-700/50 text-xs text-neutral-300"
                            >
                              <span>{tool.name}</span>
                              <div className="flex items-center gap-0.5 opacity-70 hover:opacity-100">
                                <button
                                  onClick={() => handleOpenToolModal(cat.id, group.id, tool)}
                                  className="hover:text-accent-300"
                                >
                                  <PencilSimple size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTool(tool.id)}
                                  className="hover:text-red-400"
                                >
                                  <Trash size={12} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Ungrouped Tools */}
              {cat.ungrouped_tools.length > 0 && (
                <div className="pl-2 sm:pl-4 space-y-1">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">
                    Sin Grupo
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {cat.ungrouped_tools.map((tool) => (
                      <div
                        key={tool.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800/40 border border-neutral-800 text-xs text-neutral-300"
                      >
                        <span>{tool.name}</span>
                        <div className="flex items-center gap-0.5 opacity-70 hover:opacity-100">
                          <button
                            onClick={() => handleOpenToolModal(cat.id, null, tool)}
                            className="hover:text-accent-300"
                          >
                            <PencilSimple size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteTool(tool.id)}
                            className="hover:text-red-400"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Category Modal */}
      <Modal
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={editingCategory ? "Editar Categoría" : "Nueva Categoría"}
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Key *</label>
            <input
              type="text"
              required
              placeholder="frontend, backend, AI..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200"
              value={catForm.key}
              onChange={(e) => setCatForm({ ...catForm, key: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Icon *</label>
            <input
              type="text"
              required
              placeholder="code, cpu, layout..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200"
              value={catForm.icon}
              onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Orden</label>
            <input
              type="number"
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200"
              value={catForm.sort_order}
              onChange={(e) => setCatForm({ ...catForm, sort_order: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 p-3 rounded bg-neutral-900/40 border border-neutral-800">
            <div>
              <label className="block text-xs font-semibold text-accent-400 mb-1">Label (ES) *</label>
              <input
                type="text"
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-sm text-neutral-200"
                value={catForm.i18n.es.label}
                onChange={(e) =>
                  setCatForm({
                    ...catForm,
                    i18n: { ...catForm.i18n, es: { label: e.target.value } },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-accent-400 mb-1">Label (EN) *</label>
              <input
                type="text"
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-sm text-neutral-200"
                value={catForm.i18n.en.label}
                onChange={(e) =>
                  setCatForm({
                    ...catForm,
                    i18n: { ...catForm.i18n, en: { label: e.target.value } },
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setCatModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Categoría
            </Button>
          </div>
        </form>
      </Modal>

      {/* Group Modal */}
      <Modal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        title={editingGroup ? "Editar Grupo" : "Nuevo Grupo"}
      >
        <form onSubmit={handleSaveGroup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Nombre *</label>
            <input
              type="text"
              required
              placeholder="Frameworks, Databases..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200"
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Orden</label>
            <input
              type="number"
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200"
              value={groupForm.sort_order}
              onChange={(e) => setGroupForm({ ...groupForm, sort_order: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setGroupModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Grupo
            </Button>
          </div>
        </form>
      </Modal>

      {/* Tool Modal */}
      <Modal
        open={toolModalOpen}
        onClose={() => setToolModalOpen(false)}
        title={editingTool ? "Editar Herramienta" : "Nueva Herramienta"}
      >
        <form onSubmit={handleSaveTool} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Nombre *</label>
            <input
              type="text"
              required
              placeholder="React, TypeScript, Docker..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200"
              value={toolForm.name}
              onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Orden</label>
            <input
              type="number"
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200"
              value={toolForm.sort_order}
              onChange={(e) => setToolForm({ ...toolForm, sort_order: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setToolModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Herramienta
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
