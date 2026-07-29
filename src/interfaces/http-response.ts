type HttpResponse<T> = {
    status: number;
    error?: string;
    data?: T;
}

export type { HttpResponse }