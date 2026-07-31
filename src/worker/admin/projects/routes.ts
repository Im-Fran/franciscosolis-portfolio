import type { Route } from '../../router'
import { getSessionUser } from '../auth/session'

interface ProjectRow {
  id: number
  uuid: string
  kind: 'featured' | 'secondary'
  category: 'landing' | 'mobile' | 'webapp' | 'api' | null
  href: string
  media_r2_key: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

interface ProjectI18nRow {
  project_id: number
  locale: string
  title: string
  description: string
  long_description: string | null
}

interface ProjectTechnologyRow {
  id: number
  project_id: number
  name: string
  sort_order: number
}

interface ProjectToolboxRow {
  project_id: number
  toolbox_category_id: number
}

export const adminProjectsRoutes: Route[] = [
  // GET /api/admin/projects - Fetch all projects with i18n, technologies, toolbox categories
  {
    method: 'GET',
    pattern: '/api/admin/projects',
    handler: async ({ request, env }) => {
      const user = await getSessionUser(request, env)
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      try {
        const projectsRes = await env.DB.prepare(
          'SELECT id, uuid, kind, category, href, media_r2_key, sort_order, created_at, updated_at FROM projects ORDER BY sort_order ASC, id DESC',
        ).all<ProjectRow>()

        const i18nRes = await env.DB.prepare(
          'SELECT project_id, locale, title, description, long_description FROM project_i18n',
        ).all<ProjectI18nRow>()

        const techRes = await env.DB.prepare(
          'SELECT id, project_id, name, sort_order FROM project_technologies ORDER BY sort_order ASC, id ASC',
        ).all<ProjectTechnologyRow>()

        const toolboxRes = await env.DB.prepare(
          'SELECT project_id, toolbox_category_id FROM project_toolbox',
        ).all<ProjectToolboxRow>()

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

          const technologies = techRows
            .filter((t) => t.project_id === p.id)
            .map((t) => ({ id: t.id, name: t.name, sort_order: t.sort_order }))

          const toolbox_category_ids = toolboxRows
            .filter((tb) => tb.project_id === p.id)
            .map((tb) => tb.toolbox_category_id)

          return {
            ...p,
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
        console.error('Error fetching admin projects:', err)
        return Response.json({ error: 'Failed to fetch projects' }, { status: 500 })
      }
    },
  },

  // POST /api/admin/projects - Create a new project with i18n, technologies, toolbox
  {
    method: 'POST',
    pattern: '/api/admin/projects',
    handler: async ({ request, env }) => {
      const user = await getSessionUser(request, env)
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      try {
        const body = (await request.json()) as {
          uuid?: string
          kind: 'featured' | 'secondary'
          category?: 'landing' | 'mobile' | 'webapp' | 'api' | null
          href: string
          media_r2_key?: string | null
          sort_order?: number
          i18n: {
            es: { title: string; description: string; long_description?: string | null }
            en: { title: string; description: string; long_description?: string | null }
          }
          technologies?: Array<string | { name: string; sort_order?: number }>
          toolbox_category_ids?: number[]
        }

        if (!body.kind || !body.href || !body.i18n?.es?.title || !body.i18n?.en?.title) {
          return Response.json(
            { error: 'Missing required fields: kind, href, i18n.es.title, i18n.en.title' },
            { status: 400 },
          )
        }

        const projectUuid = body.uuid || crypto.randomUUID()
        const sortOrder = body.sort_order ?? 0
        const mediaR2Key = body.media_r2_key ?? null
        const category = body.category ?? null

        const insertRes = await env.DB.prepare(
          `INSERT INTO projects (uuid, kind, category, href, media_r2_key, sort_order, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        )
          .bind(projectUuid, body.kind, category, body.href, mediaR2Key, sortOrder)
          .run()

        const projectId = insertRes.meta.last_row_id

        const statements = [
          env.DB.prepare(
            'INSERT INTO project_i18n (project_id, locale, title, description, long_description) VALUES (?, ?, ?, ?, ?)',
          ).bind(projectId, 'es', body.i18n.es.title, body.i18n.es.description || '', body.i18n.es.long_description ?? null),
          env.DB.prepare(
            'INSERT INTO project_i18n (project_id, locale, title, description, long_description) VALUES (?, ?, ?, ?, ?)',
          ).bind(projectId, 'en', body.i18n.en.title, body.i18n.en.description || '', body.i18n.en.long_description ?? null),
        ]

        if (body.technologies && Array.isArray(body.technologies)) {
          body.technologies.forEach((tech, idx) => {
            const name = typeof tech === 'string' ? tech : tech.name
            const techSort = typeof tech === 'string' ? idx : (tech.sort_order ?? idx)
            if (name && name.trim() !== '') {
              statements.push(
                env.DB.prepare(
                  'INSERT INTO project_technologies (project_id, name, sort_order) VALUES (?, ?, ?)',
                ).bind(projectId, name.trim(), techSort),
              )
            }
          })
        }

        if (body.toolbox_category_ids && Array.isArray(body.toolbox_category_ids)) {
          body.toolbox_category_ids.forEach((catId) => {
            statements.push(
              env.DB.prepare(
                'INSERT INTO project_toolbox (project_id, toolbox_category_id) VALUES (?, ?)',
              ).bind(projectId, catId),
            )
          })
        }

        await env.DB.batch(statements)

        return Response.json({ id: projectId, uuid: projectUuid, message: 'Project created' }, { status: 201 })
      } catch (err) {
        console.error('Error creating project:', err)
        return Response.json({ error: 'Failed to create project' }, { status: 500 })
      }
    },
  },

  // PUT /api/admin/projects/:id - Update project, i18n, technologies, toolbox
  {
    method: 'PUT',
    pattern: '/api/admin/projects/:id',
    handler: async ({ request, params, env }) => {
      const user = await getSessionUser(request, env)
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const id = parseInt(params.id, 10)
      if (isNaN(id)) {
        return Response.json({ error: 'Invalid project ID' }, { status: 400 })
      }

      try {
        const body = (await request.json()) as {
          kind?: 'featured' | 'secondary'
          category?: 'landing' | 'mobile' | 'webapp' | 'api' | null
          href?: string
          media_r2_key?: string | null
          sort_order?: number
          i18n?: {
            es?: { title?: string; description?: string; long_description?: string | null }
            en?: { title?: string; description?: string; long_description?: string | null }
          }
          technologies?: Array<string | { name: string; sort_order?: number }>
          toolbox_category_ids?: number[]
        }

        await env.DB.prepare(
          `UPDATE projects
           SET kind = COALESCE(?, kind),
               category = CASE WHEN ? THEN ? ELSE category END,
               href = COALESCE(?, href),
               media_r2_key = CASE WHEN ? THEN ? ELSE media_r2_key END,
               sort_order = COALESCE(?, sort_order),
               updated_at = datetime('now')
           WHERE id = ?`,
        )
          .bind(
            body.kind ?? null,
            body.category !== undefined ? 1 : 0,
            body.category ?? null,
            body.href ?? null,
            body.media_r2_key !== undefined ? 1 : 0,
            body.media_r2_key ?? null,
            body.sort_order ?? null,
            id,
          )
          .run()

        if (body.i18n?.es) {
          await env.DB.prepare(
            `INSERT INTO project_i18n (project_id, locale, title, description, long_description)
             VALUES (?, 'es', ?, ?, ?)
             ON CONFLICT(project_id, locale) DO UPDATE SET
               title = excluded.title,
               description = excluded.description,
               long_description = excluded.long_description`,
          )
            .bind(
              id,
              body.i18n.es.title ?? '',
              body.i18n.es.description ?? '',
              body.i18n.es.long_description ?? null,
            )
            .run()
        }

        if (body.i18n?.en) {
          await env.DB.prepare(
            `INSERT INTO project_i18n (project_id, locale, title, description, long_description)
             VALUES (?, 'en', ?, ?, ?)
             ON CONFLICT(project_id, locale) DO UPDATE SET
               title = excluded.title,
               description = excluded.description,
               long_description = excluded.long_description`,
          )
            .bind(
              id,
              body.i18n.en.title ?? '',
              body.i18n.en.description ?? '',
              body.i18n.en.long_description ?? null,
            )
            .run()
        }

        if (body.technologies !== undefined && Array.isArray(body.technologies)) {
          const statements = [env.DB.prepare('DELETE FROM project_technologies WHERE project_id = ?').bind(id)]
          body.technologies.forEach((tech, idx) => {
            const name = typeof tech === 'string' ? tech : tech.name
            const techSort = typeof tech === 'string' ? idx : (tech.sort_order ?? idx)
            if (name && name.trim() !== '') {
              statements.push(
                env.DB.prepare(
                  'INSERT INTO project_technologies (project_id, name, sort_order) VALUES (?, ?, ?)',
                ).bind(id, name.trim(), techSort),
              )
            }
          })
          await env.DB.batch(statements)
        }

        if (body.toolbox_category_ids !== undefined && Array.isArray(body.toolbox_category_ids)) {
          const statements = [env.DB.prepare('DELETE FROM project_toolbox WHERE project_id = ?').bind(id)]
          body.toolbox_category_ids.forEach((catId) => {
            statements.push(
              env.DB.prepare(
                'INSERT INTO project_toolbox (project_id, toolbox_category_id) VALUES (?, ?)',
              ).bind(id, catId),
            )
          })
          await env.DB.batch(statements)
        }

        return Response.json({ message: 'Project updated' })
      } catch (err) {
        console.error('Error updating project:', err)
        return Response.json({ error: 'Failed to update project' }, { status: 500 })
      }
    },
  },

  // DELETE /api/admin/projects/:id - Delete project, relations, and media in R2
  {
    method: 'DELETE',
    pattern: '/api/admin/projects/:id',
    handler: async ({ request, params, env }) => {
      const user = await getSessionUser(request, env)
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const id = parseInt(params.id, 10)
      if (isNaN(id)) {
        return Response.json({ error: 'Invalid project ID' }, { status: 400 })
      }

      try {
        const project = await env.DB.prepare('SELECT media_r2_key FROM projects WHERE id = ?')
          .bind(id)
          .first<{ media_r2_key: string | null }>()

        if (!project) {
          return Response.json({ error: 'Project not found' }, { status: 404 })
        }

        if (project.media_r2_key) {
          try {
            await env.BUCKET.delete(project.media_r2_key)
          } catch (r2Err) {
            console.error('Error deleting R2 object:', r2Err)
          }
        }

        await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id).run()

        return Response.json({ message: 'Project deleted successfully' })
      } catch (err) {
        console.error('Error deleting project:', err)
        return Response.json({ error: 'Failed to delete project' }, { status: 500 })
      }
    },
  },
]

export default adminProjectsRoutes
