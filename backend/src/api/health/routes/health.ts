export default {
  routes: [
    {
      method: "GET",
      path: "/health",
      handler: "health.handle",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
