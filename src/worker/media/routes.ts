import type { Route } from '../router'
import { getSessionUser } from '../admin/auth/session'

const getContentType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  switch (ext) {
    case 'gif':
      return 'image/gif'
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'webp':
      return 'image/webp'
    case 'svg':
      return 'image/svg+xml'
    default:
      return 'application/octet-stream'
  }
}

export const mediaRoutes: Route[] = [
  {
    method: 'POST',
    pattern: '/api/admin/projects/upload',
    handler: async ({ request, env }) => {
      const user = await getSessionUser(request, env)
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      try {
        const formData = await request.formData()
        const file = formData.get('file')

        if (!file || !(file instanceof File)) {
          return Response.json({ error: 'No file uploaded or invalid file field' }, { status: 400 })
        }

        const projectUuid = (formData.get('project_uuid') as string) || crypto.randomUUID()
        const fileUuid = crypto.randomUUID()
        const rawFilename = file.name || 'image'
        const parts = rawFilename.split('.')
        const ext = parts.length > 1 ? parts.pop()?.toLowerCase() : ''
        const baseName = parts.join('.').replace(/[^a-zA-Z0-9_-]/g, '_')

        const filenameWithExt = ext ? `${baseName}_${fileUuid}.${ext}` : `${baseName}_${fileUuid}`
        const key = `projects/${projectUuid}/${filenameWithExt}`

        const buffer = await file.arrayBuffer()
        await env.BUCKET.put(key, buffer, {
          httpMetadata: {
            contentType: file.type || getContentType(filenameWithExt),
          },
        })

        const url = `/api/media/projects/${projectUuid}/${filenameWithExt}`

        return Response.json({ key, url }, { status: 201 })
      } catch (err) {
        console.error('Error uploading project media:', err)
        return Response.json({ error: 'Failed to upload media file' }, { status: 500 })
      }
    },
  },
  {
    method: 'GET',
    pattern: '/api/media/projects/:uuid/:filename',
    handler: async ({ params, env }) => {
      const { uuid, filename } = params
      if (!uuid || !filename) {
        return Response.json({ error: 'Invalid parameters' }, { status: 400 })
      }

      const key = `projects/${uuid}/${filename}`

      try {
        const object = await env.BUCKET.get(key)
        if (!object) {
          return Response.json({ error: 'Media asset not found' }, { status: 404 })
        }

        const headers = new Headers()
        object.writeHttpMetadata(headers)
        headers.set('etag', object.httpEtag)
        if (!headers.has('Content-Type') || headers.get('Content-Type') === 'application/octet-stream') {
          headers.set('Content-Type', getContentType(filename))
        }
        headers.set('Cache-Control', 'public, max-age=31536000, immutable')

        return new Response(object.body, { headers })
      } catch (err) {
        console.error('Error serving project media:', err)
        return Response.json({ error: 'Failed to retrieve media asset' }, { status: 500 })
      }
    },
  },
]

export default mediaRoutes
