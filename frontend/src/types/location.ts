export type Court = {
    id: number;
    courtNumber: number;
};

export type Location = {
    id: number;
    name: string;
    address: string;
    phone: string | null;
    email: string | null;
    courts: Court[];
};