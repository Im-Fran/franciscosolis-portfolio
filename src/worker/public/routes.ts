import type { Route } from '../router'

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

export const publicRoutes: Route[] = [
  // GET /api/toolbox - Public endpoint for landing page
  {
    method: 'GET',
    pattern: '/api/toolbox',
    handler: async ({ request, env }) => {
      try {
        const url = new URL(request.url)
        const requestedLocale = url.searchParams.get('locale')

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
              id: g.id,
              name: g.name,
              sort_order: g.sort_order,
              tools: tools.filter((t) => t.group_id === g.id).map((t) => ({
                id: t.id,
                name: t.name,
                sort_order: t.sort_order,
              })),
            }))

          const ungroupedTools = tools
            .filter((t) => t.category_id === cat.id && !t.group_id)
            .map((t) => ({
              id: t.id,
              name: t.name,
              sort_order: t.sort_order,
            }))

          let label = i18nMap['es']?.label || cat.key
          if (requestedLocale && i18nMap[requestedLocale]) {
            label = i18nMap[requestedLocale].label
          }

          return {
            id: cat.id,
            key: cat.key,
            icon: cat.icon,
            sort_order: cat.sort_order,
            label,
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
        console.error('Error fetching public toolbox:', err)
        return Response.json({ error: 'Failed to fetch public toolbox' }, { status: 500 })
      }
    },
  },

  // GET /api/projects - Public endpoint for landing page
  {
    method: 'GET',
    pattern: '/api/projects',
    handler: async ({ request, env }) => {
      try {
        const url = new URL(request.url)
        const requestedLocale = url.searchParams.get('locale')

        const projectsRes = await env.DB.prepare(
          'SELECT id, uuid, kind, category, href, media_r2_key, sort_order FROM projects ORDER BY sort_order ASC, id DESC',
        ).all<{
          id: number
          uuid: string
          kind: 'featured' | 'secondary'
          category: 'landing' | 'mobile' | 'webapp' | 'api' | null
          href: string
          media_r2_key: string | null
          sort_order: number
        }>()

        const i18nRes = await env.DB.prepare(
          'SELECT project_id, locale, title, description, long_description FROM project_i18n',
        ).all<{
          project_id: number
          locale: string
          title: string
          description: string
          long_description: string | null
        }>()

        const techRes = await env.DB.prepare(
          'SELECT id, project_id, name, sort_order FROM project_technologies ORDER BY sort_order ASC, id ASC',
        ).all<{
          id: number
          project_id: number
          name: string
          sort_order: number
        }>()

        const toolboxRes = await env.DB.prepare(
          'SELECT project_id, toolbox_category_id FROM project_toolbox',
        ).all<{
          project_id: number
          toolbox_category_id: number
        }>()

        const projects = projectsRes.results || []
        const i18nRows = i18nRes.results || []
        const techRows = techRes.results || []
        const toolboxRows = toolboxRes.results || []

        const data = projects.map((p) => {
          const projectI18n = i18nRows.filter((r) => r.project_id === p.id)
          const i18nMap: Record<string, { title: string; description: string; long_description: string | null }> = {}
          for (const row of projectI18n) {
            i18nMap[row.locale] = {
              title: row.title,
              description: row.description,
              long_description: row.long_description,
            }
          }

          const activeI18n = requestedLocale && i18nMap[requestedLocale]
            ? i18nMap[requestedLocale]
            : i18nMap['es'] || { title: '', description: '', long_description: null }

          const technologies = techRows
            .filter((t) => t.project_id === p.id)
            .map((t) => t.name)

          const toolbox_category_ids = toolboxRows
            .filter((tb) => tb.project_id === p.id)
            .map((tb) => tb.toolbox_category_id)

          const media_url = p.media_r2_key ? `/api/media/${p.media_r2_key}` : null

          return {
            id: p.id,
            uuid: p.uuid,
            kind: p.kind,
            category: p.category,
            href: p.href,
            media_r2_key: p.media_r2_key,
            media_url,
            sort_order: p.sort_order,
            title: activeI18n.title,
            description: activeI18n.description,
            long_description: activeI18n.long_description,
            i18n: {
              es: i18nMap['es'] || { title: '', description: '', long_description: null },
              en: i18nMap['en'] || { title: '', description: '', long_description: null },
            },
            technologies,
            toolbox_category_ids,
          }
        })

        return Response.json({ projects: data })
      } catch (err) {
        console.error('Error fetching public projects:', err)
        return Response.json({ error: 'Failed to fetch public projects' }, { status: 500 })
      }
    },
  },
]

export default publicRoutes
