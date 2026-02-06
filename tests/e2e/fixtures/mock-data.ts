export const mockFactories = {
    data: [
        {
            id: '1',
            code: 'F01',
            name: 'Factory One',
            location: 'Location A',
            status: 'ACTIVE',
            equipmentCount: 5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '2',
            code: 'F02',
            name: 'Factory Two',
            location: 'Location B',
            status: 'INACTIVE',
            equipmentCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ],
    meta: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
    },
};

export const mockStats = {
    totalFactories: 10,
    activeFactories: 7,
    totalEquipment: 50,
};
