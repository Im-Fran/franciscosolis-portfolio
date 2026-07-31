import type { Route } from '../../router'
import { getSessionUser } from '../auth/session'

interface CategoryRow {
  id: number
  key: string
  icon: string
  sort_order: number
}

interface CategoryI18nRow {
  category_id: number
  locale: string
  label: string
}

interface GroupRow {
  id: number
  category_id: number
  name: string
  sort_order: number
}

interface ToolRow {
  id: number
  category_id: number
  group_id: number | null
  name: string
  sort_order: number
}

export const adminToolboxRoutes: Route[] = [
  // GET /api/admin/toolbox - Fetch all categories, groups, tools with i18n
  {
    method: 'GET',
    pattern: '/api/admin/toolbox',
    handler: async ({ request, env }) => {
      const user = await getSessionUser(request, env)
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      try {
        const categoriesRes = await env.DB.prepare(
          'SELECT id, key, icon, sort_order FROM toolbox_categories ORDER BY sort_order ASC, id ASC',
        ).all<CategoryRow>()

        const i18nRes = await env.DB.prepare(
          'SELECT category_id, locale, label FROM toolbox_category_i18n',
        ).all<CategoryI18nRow>()

        const groupsRes = await env.DB.prepare(
          'SELECT id, category_id, name, sort_order FROM toolbox_groups ORDER BY sort_order ASC, id ASC',
        ).all<GroupRow>()

        const toolsRes = await env.DB.prepare(
          'SELECT id, category_id, group_id, name, sort_order FROM toolbox_tools ORDER BY sort_order ASC, id ASC',
        ).all<ToolRow>()

        const categories = categoriesRes.results || []
        const i18nRows = i18nRes.results || []
        const groups = groupsRes.results || []
        const tools = toolsRes.results || []

        const data = categories.map((cat) => {
          const catI18n = i18nRows.filter((row) => row.category_id === cat.id)
          const i18nMap: Record<string, { label: string }> = {}
          for (const row of catI18n) {
            i18nMap[row.locale] = { label: row.label }
          }

          const catGroups = groups
            .filter((g) => g.category_id === cat.id)
            .map((g) => ({
              ...g,
              tools: tools.filter((t) => t.group_id === g.id),
            }))

          const ungroupedTools = tools.filter((t) => t.category_id === cat.id && !t.group_id)

          return {
            ...cat,
            i18n: {
              es: i18nMap['es'] || { label: '' },
              en: i18nMap['en'] || { label: '' },
            },
            groups: catGroups,
            ungrouped_tools: ungroupedTools,
          }
        })

        return Response.json({ categories: data })
      } catch (err) {
        console.error('Error fetching admin toolbox:', err)
        return Response.json({ error: 'Failed to fetch toolbox' }, { status: 500 })
      }
    },
  },

  // POST /api/admin/toolbox/categories
  {
    method: 'POST',
    pattern: '/api/admin/toolbox/categories',
    handler: async ({ request, env }) => {
      const user = await getSessionUser(request, env)
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      try {
        const body = (await request.json()) as {
          key: string
          icon: string
          sort_order?: number
          i18n: { es: { label: string }; en: { label: string } }
        }

        if (!body.key || !body.icon || !body.i18n?.es?.label || !body.i18n?.en?.label) {
          return Response.json({ error: 'Missing required fields: key, icon, i18n.es.label, i18n.en.label' }, { status: 400 })
        }

        const sortOrder = body.sort_order ?? 0

        const insertRes = await env.DB.prepare(
          'INSERT INTO toolbox_categories (key, icon, sort_order) VALUES (?, ?, ?)',
        ).bind(body.key, body.icon, sortOrder).run()

        const categoryId = insertRes.meta.last_row_id

        await env.DB.batch([
          env.DB.prepare(
            'INSERT INTO toolbox_category_i18n (category_id, locale, label) VALUES (?, ?, ?)',
          ).bind(categoryId, 'es', body.i18n.es.label),
          env.DB.prepare(
            'INSERT INTO toolbox_category_i18n (category_id, locale, label) VALUES (?, ?, ?)',
          ).bind(categoryId, 'en', body.i18n.en.label),
        ])

        return Response.json({ id: categoryId, message: 'Category created' }, { status: 201 })
      } catch (err) {
        console.error('Error creating toolbox category:', err)
        return Response.json({ error: 'Failed to create category' }, { status: 500 })
      }
    },
  },

  // PUT /api/admin/toolbox/categories/:id
  {
    method: 'PUT',
    pattern: '/api/admin/toolbox/categories/:id',
    handler: async ({ request, params, env }) => {
      const user = await getSessionUser(request, env)
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const id = parseInt(params.id, 10)
      if (isNaN(id)) {
        return Response.json({ error: 'Invalid category ID' }, { status: 400 })
      }

      try {
        const body = (await request.json()) as {
          key?: string
          icon?: string
          sort_order?: number
          i18n?: { es?: { label?: string }; en?: { label?: string } }
        }

        if (body.key !== undefined || body.icon !== undefined || body.sort_order !== undefined) {
          await env.DB.prepare(
            `UPDATE toolbox_categories 
             SET key = COALESCE(?, key), icon = COALESCE(?, icon), sort_order = COALESCE(?, sort_order)
             WHERE id = ?`,
          ).bind(body.key ?? null, body.icon ?? null, body.sort_order ?? null, id).run()
        }

        if (body.i18n?.es?.label) {
          await env.DB.prepare(
            `INSERT INTO toolbox_category_i18n (category_id, locale, label) VALUES (?, 'es', ?)
             ON CONFLICT(category_id, locale) DO UPDATE SET label = excluded.label`,
          ).bind(id, body.i18n.es.label).run()
        }

        if (body.i18n?.en?.label) {
          await env.DB.prepare(
            `INSERT INTO toolbox_category_i18n (category_id, locale, label) VALUES (?, 'en', ?)
             ON CONFLICT(category_id, locale) DO UPDATE SET label = excluded.label`,
          ).bind(id, body.i18n.en.label).run()
        }

        return Response.json({ message: 'Category updated' })
      } catch (err) {
        console.error('Error updating category:', err)
        return Response.json({ error: 'Failed to update category' }, { status: 500 })
      }
    },
  },

  // DELETE /api/admin/toolbox/categories/:id
  {
    method: 'DELETE',
    pattern: '/api/admin/toolbox/categories/:id',
    handler: async ({ request, params, env }) => {
      const user = await getSessionUser(request, env)
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const id = parseInt(params.id, 10)
      if (isNaN(id)) {
        return Response.json({ error: 'Invalid category ID' }, { status: 400 })
      }

      try {
        await env.DB.prepare('DELETE FROM toolbox_categories WHERE id = ?').bind(id).run()
        return Response.json({ message: 'Category deleted' })
      } catch (err) {
        console.error('Error deleting category:', err)
        return Response.json({ error: 'Failed to delete category' }, { status: 500 })
      }
    },
  },

  // POST /api/admin/toolbox/groups
  {
    method: 'POST',
    pattern: '/api/admin/toolbox/groups',
    handler: async ({ request, env }) => {
      const user = await getSessionUser(request, env)
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      try {
        const body = (await request.json()) as {
          category_id: number
          name: string
          sort_order?: number
        }

        if (!body.category_id || !body.name) {
          return Response.json({ error: 'Missing required fields: category_id, name' }, { status: 400 })
        }

        const sortOrder = body.sort_order ?? 0

        const res = await env.DB.prepare(
          'INSERT INTO toolbox_groups (category_id, name, sort_order) VALUES (?, ?, ?)',
        ).bind(body.category_id, body.name, sortOrder).run()

        return Response.json({ id: res.meta.last_row_id, message: 'Group created' }, { status: 201 })
      } catch (err) {
        console.error('Error creating toolbox group:', err)
        return Response.json({ error: 'Failed to create group' }, { status: 500 })
      }
    },
  },

  // PUT /api/admin/toolbox/groups/:id
  {
    method: 'PUT',
    pattern: '/api/admin/toolbox/groups/:id',
    handler: async ({ request, params, env }) => {
      const user = await getSessionUser(request, env)
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const id = parseInt(params.id, 10)
      if (isNaN(id)) {
        return Response.json({ error: 'Invalid group ID' }, { status: 400 })
      }

      try {
        const body = (await request.json()) as {
          category_id?: number
          name?: string
          sort_order?: number
        }

        await env.DB.prepare(
          `UPDATE toolbox_groups
           SET category_id = COALESCE(?, category_id),
               name = COALESCE(?, name),
               sort_order = COALESCE(?, sort_order)
           WHERE id = ?`,
        ).bind(body.category_id ?? null, body.name ?? null, body.sort_order ?? null, id).run()

        return Response.json({ message: 'Group updated' })
      } catch (err) {
        console.error('Error updating group:', err)
        return Response.json({ error: 'Failed to update group' }, { status: 500 })
      }
    },
  },

  // DELETE /api/admin/toolbox/groups/:id
  {
    method: 'DELETE',
    pattern: '/api/admin/toolbox/groups/:id',
    handler: async ({ request, params, env }) => {
      const user = await getSessionUser(request, env)
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const id = parseInt(params.id, 10)
      if (isNaN(id)) {
        return Response.json({ error: 'Invalid group ID' }, { status: 400 })
      }

      try {
        await env.DB.prepare('DELETE FROM toolbox_groups WHERE id = ?').bind(id).run()
        return Response.json({ message: 'Group deleted' })
      } catch (err) {
        console.error('Error deleting group:', err)
        return Response.json({ error: 'Failed to delete group' }, { status: 500 })
      }
    },
  },

  // POST /api/admin/toolbox/tools
  {
    method: 'POST',
    pattern: '/api/admin/toolbox/tools',
    handler: async ({ request, env }) => {
      const user = await getSessionUser(request, env)
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      try {
        const body = (await request.json()) as {
          category_id: number
          group_id?: number | null
          name: string
          sort_order?: number
        }

        if (!body.category_id || !body.name) {
          return Response.json({ error: 'Missing required fields: category_id, name' }, { status: 400 })
        }

        const groupId = body.group_id ?? null
        const sortOrder = body.sort_order ?? 0

        const res = await env.DB.prepare(
          'INSERT INTO toolbox_tools (category_id, group_id, name, sort_order) VALUES (?, ?, ?, ?)',
        ).bind(body.category_id, groupId, body.name, sortOrder).run()

        return Response.json({ id: res.meta.last_row_id, message: 'Tool created' }, { status: 201 })
      } catch (err) {
        console.error('Error creating tool:', err)
        return Response.json({ error: 'Failed to create tool' }, { status: 500 })
      }
    },
  },

  // PUT /api/admin/toolbox/tools/:id
  {
    method: 'PUT',
    pattern: '/api/admin/toolbox/tools/:id',
    handler: async ({ request, params, env }) => {
      const user = await getSessionUser(request, env)
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const id = parseInt(params.id, 10)
      if (isNaN(id)) {
        return Response.json({ error: 'Invalid tool ID' }, { status: 400 })
      }

      try {
        const body = (await request.json()) as {
          category_id?: number
          group_id?: number | null
          name?: string
          sort_order?: number
        }

        await env.DB.prepare(
          `UPDATE toolbox_tools
           SET category_id = COALESCE(?, category_id),
               group_id = CASE WHEN ? THEN ? ELSE group_id END,
               name = COALESCE(?, name),
               sort_order = COALESCE(?, sort_order)
           WHERE id = ?`,
        ).bind(
          body.category_id ?? null,
          body.group_id !== undefined ? 1 : 0,
          body.group_id ?? null,
          body.name ?? null,
          body.sort_order ?? null,
          id,
        ).run()

        return Response.json({ message: 'Tool updated' })
      } catch (err) {
        console.error('Error updating tool:', err)
        return Response.json({ error: 'Failed to update tool' }, { status: 500 })
      }
    },
  },

  // DELETE /api/admin/toolbox/tools/:id
  {
    method: 'DELETE',
    pattern: '/api/admin/toolbox/tools/:id',
    handler: async ({ request, params, env }) => {
      const user = await getSessionUser(request, env)
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const id = parseInt(params.id, 10)
      if (isNaN(id)) {
        return Response.json({ error: 'Invalid tool ID' }, { status: 400 })
      }

      try {
        await env.DB.prepare('DELETE FROM toolbox_tools WHERE id = ?').bind(id).run()
        return Response.json({ message: 'Tool deleted' })
      } catch (err) {
        console.error('Error deleting tool:', err)
        return Response.json({ error: 'Failed to delete tool' }, { status: 500 })
      }
    },
  },
]

export default adminToolboxRoutes
