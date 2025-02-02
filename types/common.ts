export type Response<T> = {
    data: T,
    meta: {
        version: string
    },
    error?: Error
}

export type IMeta = {
    page: number;
    limit: number;
    total: number;
    order: string;
    orderBy: string
}

export type Error = {
    code: number
    title: string
    message: string
}

export type OFetchError = {
    data: Response<{}>
}

export type Query = {
    page: number;
    limit: number;
    order: 'asc' | 'desc';
    orderBy: string
}