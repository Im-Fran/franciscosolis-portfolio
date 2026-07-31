type Env = {
    GH_TOKEN: string
    ASSETS: Fetcher
    DB: D1Database
    BUCKET: R2Bucket
    SESSION_SECRET: string
}

export type { Env }