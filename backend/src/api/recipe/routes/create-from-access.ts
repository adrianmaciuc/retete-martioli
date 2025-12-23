export default {
  routes: [
    {
      method: "POST",
      path: "/recipes/create-from-access",
      handler: "create-from-access.handle",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
