import type { Error } from "./common";

export type LoginResponse = {
    data: {
        expiresIn: string;
        accessToken: string;
    };
    meta: {
        version: string;
    };
    error?: Error
};
export type UserDetailResponse = {
    data: {
        createdAt: string;
        updatedAt: string;
        id: string;
        email: string;
        roleId: string;
        role: {
            id: string;
            createdAt: string;
            updatedAt: string;
            name: string;
            displayName: string;
            deletedAt: string | null;
        };
        customer: {
            createdAt: string;
            updatedAt: string;
            id: string;
            name: string | null;
            phoneNumber: string;
            npwp: string | null;
            userId: string;
        };
    };
    meta: {
        version: string;
    };
};
