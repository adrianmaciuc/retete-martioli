type KoaCtx = any;

export default {
  async handle(ctx: KoaCtx) {
    try {
      // Quick DB check: fetch one category id to verify entity service & DB
      const categories = await strapi.entityService.findMany(
        "api::category.category",
        { fields: ["id"], limit: 1 }
      );
      ctx.body = {
        ok: true,
        db: Array.isArray(categories) ? categories.length > 0 : true,
        ts: new Date().toISOString(),
      };
    } catch (err) {
      // If DB/entity service fails, return 503 with minimal error
      ctx.status = 503;
      ctx.body = {
        ok: false,
        db: false,
        error: "DB or entity service unreachable",
      };
    }
  },
};
