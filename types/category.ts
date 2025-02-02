type SubOneCategory = {
    createdAt: string;
    updatedAt: string;
    id: string;
    thumbnail: string;
    name: string;
    subcategoryId: string;
    subcategory: SubCategory
};

type SubCategory = {
    createdAt: string;
    updatedAt: string;
    id: string;
    thumbnail: string;
    name: string;
    categoryId: string;
    category: Category
    subonecategory: SubOneCategory[];
};

type Category = {
    createdAt: string;
    updatedAt: string;
    id: string;
    name: string;
    thumbnail: string;
    subcategory: SubCategory[];
};

export type CategoryDetailResponse = {
    data: {
        createdAt: string
        updatedAt: string
        id: string
        name: string
        thumbnail: string
    },
    meta: {
        version: string;
    };
}
export type CategoryResponse = {
    data: Category[];
    meta: {
        version: string;
    };
};

export type SubcategoryDetailResponse = {
    data: {
        createdAt: string
        updatedAt: string
        id: string
        thumbnail: string
        name: string
        categoryId: string
    },
    meta: {
        version: string;
    };
}
export type SubcategoryResponse = {
    data: SubCategory[];
    meta: {
        version: string;
    };
}

export type SubonecategoryDetailResponse = {
    data: {
        createdAt: string
        updatedAt: string
        id: string
        thumbnail: string
        name: string
        subcategoryId: string,
        subcategory: SubCategory
    },
    meta: {
        version: string;
    };
}

export type SubonecategoryResponse = {
    data: SubOneCategory[]
    meta: {
        version: string;
    };
}
