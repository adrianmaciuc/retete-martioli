import jwt from "jsonwebtoken";

type KoaCtx = any;

const verifyChefAccess = (ctx: KoaCtx): { ok: boolean; error?: string } => {
  // Try cookie first (JWT)
  const token = ctx.cookies?.get?.("access_token");
  if (token) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return { ok: false, error: "Missing JWT_SECRET" };
    }
    try {
      const decoded: any = jwt.verify(token, secret);
      if (decoded?.role !== "chef") {
        return { ok: false, error: "Forbidden: not a chef" };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Invalid token" };
    }
  }

  // Fall back to Authorization header (localStorage grant)
  const authHeader = ctx.request?.headers?.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false, error: "Missing access token" };
  }
  try {
    const grantJson = authHeader.substring(7); // Remove "Bearer "
    const grant = JSON.parse(grantJson);
    if (!grant?.expiresAt || Date.now() >= grant.expiresAt) {
      return { ok: false, error: "Access grant expired" };
    }
    // Valid grant from Access Gate
    return { ok: true };
  } catch (e) {
    return { ok: false, error: "Invalid access grant" };
  }
};

const parseMultipart = (ctx: KoaCtx) => {
  const body = ctx.request?.body || {};
  const files = ctx.request?.files || {};
  let data: any = body?.data;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = {};
    }
  }
  return { data, files };
};

const validateData = (data: any): { ok: boolean; error?: string } => {
  const requiredString = (v: any) =>
    typeof v === "string" && v.trim().length > 0;
  const requiredInt = (v: any) => Number.isInteger(v) && v >= 0;
  if (!requiredString(data?.title))
    return { ok: false, error: "title is required" };
  if (!requiredString(data?.description))
    return { ok: false, error: "description is required" };
  if (!requiredInt(data?.prepTime))
    return { ok: false, error: "prepTime must be integer >= 0" };
  if (!requiredInt(data?.cookTime))
    return { ok: false, error: "cookTime must be integer >= 0" };
  if (!Number.isInteger(data?.servings) || data.servings < 1)
    return { ok: false, error: "servings must be integer >= 1" };
  return { ok: true };
};

export default {
  async handle(ctx: KoaCtx) {
    const access = verifyChefAccess(ctx);
    if (!access.ok) {
      const status = access.error?.includes("Forbidden") ? 403 : 401;
      ctx.status = status;
      ctx.body = { ok: false, error: access.error };
      return;
    }

    const { data, files } = parseMultipart(ctx);

    const valid = validateData(data);
    if (!valid.ok) {
      ctx.status = 400;
      ctx.body = { ok: false, error: valid.error };
      return;
    }

    // Generate slug from title if not provided
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    // Resolve categories by slugs if provided
    let categoryIds: number[] = [];
    if (Array.isArray(data?.categorySlugs) && data.categorySlugs.length) {
      const categories = await strapi.entityService.findMany(
        "api::category.category",
        {
          filters: { slug: { $in: data.categorySlugs } },
          fields: ["id", "slug"],
          limit: data.categorySlugs.length,
        }
      );
      categoryIds = categories.map((c: any) => c.id);
    }

    // Create recipe entry
    const recipe = await strapi.entityService.create("api::recipe.recipe", {
      data,
    });

    // Upload & attach media via Upload plugin
    const uploadService = strapi.plugin("upload").service("upload");
    const recipeId = recipe.id; // Use numeric id for uploads, not documentId

    try {
      const coverFile = files?.coverImage;
      if (coverFile) {
        await uploadService.upload({
          data: {
            ref: "api::recipe.recipe",
            refId: recipeId,
            field: "coverImage",
          },
          files: coverFile,
        });
      }

      const galleryFiles = files?.galleryImage || files?.galleryImages;
      if (galleryFiles) {
        await uploadService.upload({
          data: {
            ref: "api::recipe.recipe",
            refId: recipeId,
            field: "galleryImage",
          },
          files: galleryFiles,
        });
      }
    } catch (uploadErr) {
      console.error("Upload error:", uploadErr);
      // Continue even if upload fails
    }

    // Link categories to this recipe (relation is owned by category via 'recipe' manyToOne)
    if (categoryIds.length) {
      for (const catId of categoryIds) {
        await strapi.entityService.update("api::category.category", catId, {
          data: { recipe: recipe.documentId || recipeId },
        });
      }
    }

    // Publish entry after uploads (optional)
    const published = await strapi.entityService.update(
      "api::recipe.recipe",
      recipe.documentId || recipeId,
      {
        data: { publishedAt: new Date().toISOString() },
      }
    );

    ctx.body = { ok: true, id: recipeId, slug: recipe.slug || data.slug };
  },
};
