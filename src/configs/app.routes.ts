// Root
const usersRoot = 'users';

// Api Versions
const v1 = 'v1';

export const routesV1 = {
  version: v1,
  user: {
    root: usersRoot,
    find: `/${usersRoot}/:id`,
    delete: `/${usersRoot}/:id`,
    updateAddress: `/${usersRoot}/address/:id`,
  },
};
