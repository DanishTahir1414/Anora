import { getHeader, createError, defineEventHandler, readMultipartFormData } from "h3";
import { verifyAdminAccess } from "../../../../lib/admin";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import crypto from "node:crypto";

export default defineEventHandler(async (event) => {
  const authorization = getHeader(event, "authorization") ?? "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: "Authentication required" });
  }

  await verifyAdminAccess(accessToken);

  const form = await readMultipartFormData(event);
  if (!form) {
    throw createError({ statusCode: 400, statusMessage: "No form data received" });
  }

  let productId = "";
  let fileData: Buffer | null = null;
  let filename = "";
  let mimeType = "";

  for (const part of form) {
    if (part.name === "productId") {
      productId = Buffer.from(part.data).toString("utf-8");
    } else if (part.name === "file") {
      fileData = Buffer.from(part.data);
      filename = part.filename ?? "image.jpg";
      mimeType = part.type ?? "image/jpeg";
    }
  }

  if (!productId || !fileData) {
    throw createError({ statusCode: 400, statusMessage: "Missing required fields" });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const isWebP = ext === "webp" || mimeType === "image/webp";

  let outputData: Buffer;
  let outputMimeType = mimeType;

  if (isWebP) {
    outputData = fileData;
  } else if (["jpg", "jpeg", "png"].includes(ext) || ["image/jpeg", "image/png"].includes(mimeType)) {
    try {
      const sharp = (await import("sharp")).default;
      outputData = await sharp(fileData)
        .webp({ quality: 90 })
        .toBuffer();
      outputMimeType = "image/webp";
    } catch (err: any) {
      throw createError({
        statusCode: 500,
        statusMessage: `Image conversion failed: ${err.message}`,
      });
    }
  } else {
    throw createError({ statusCode: 400, statusMessage: "Unsupported file format" });
  }

  const uuid = crypto.randomUUID();
  const filePath = `products/${productId}/${uuid}.webp`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("product-images")
    .upload(filePath, outputData, {
      contentType: outputMimeType,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Storage upload failed: ${uploadError.message}`,
    });
  }

  const { data: urlData } = supabaseAdmin.storage.from("product-images").getPublicUrl(filePath);
  const imageUrl = urlData?.publicUrl ?? "";
  if (!imageUrl) {
    throw createError({ statusCode: 500, statusMessage: "Failed to generate public URL" });
  }

  const { data: insertData, error: insertError } = await supabaseAdmin
    .from("product_images")
    .insert({
      product_id: productId,
      image_url: imageUrl,
      sort_order: 0,
    })
    .select("id, image_url")
    .single();

  if (insertError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Database insert failed: ${insertError.message}`,
    });
  }

  return { image_url: insertData.image_url, id: insertData.id };
});
