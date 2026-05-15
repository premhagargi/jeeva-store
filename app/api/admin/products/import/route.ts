import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { slugifyName } from "@/scripts/utils";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuote) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuote = true;
    } else if (c === ",") {
      cur.push(field);
      field = "";
    } else if (c === "\n") {
      cur.push(field);
      rows.push(cur);
      cur = [];
      field = "";
    } else if (c === "\r") {
      // skip
    } else {
      field += c;
    }
  }
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    rows.push(cur);
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

export async function POST(req: NextRequest) {
  const me = await requireAdmin();

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return NextResponse.json({ error: "Empty CSV" }, { status: 400 });
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  const iId = idx("id");
  const iName = idx("name");
  const iCategory = idx("category");
  const iUnit = idx("unit");
  const iQty = idx("quantityvalue");
  const iPrice = idx("price");
  const iStock = idx("stockqty");
  const iAvail = idx("isavailable");

  if (iName < 0 || iCategory < 0 || iUnit < 0) {
    return NextResponse.json(
      { error: "CSV must have at least: name, category, unit columns" },
      { status: 400 },
    );
  }

  let updated = 0;
  let created = 0;
  const errors: string[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const id = iId >= 0 ? row[iId]?.trim() : "";
    const name = row[iName]?.trim();
    const categoryName = row[iCategory]?.trim();
    const unit = row[iUnit]?.trim();
    const quantityValue = iQty >= 0 && row[iQty]?.trim() ? Number(row[iQty]) : null;
    const price = iPrice >= 0 && row[iPrice]?.trim() ? Number(row[iPrice]) : 0;
    const stockQty = iStock >= 0 && row[iStock]?.trim() ? parseInt(row[iStock], 10) : 0;
    const isAvailable = iAvail >= 0 ? row[iAvail]?.trim() !== "0" : true;

    if (!name || !categoryName || !unit) {
      errors.push(`Row ${r + 1}: missing name/category/unit`);
      continue;
    }

    try {
      const categorySlug = slugifyName(categoryName);
      const category = await prisma.category.upsert({
        where: { slug: categorySlug },
        update: { name: categoryName },
        create: { name: categoryName, slug: categorySlug },
      });

      if (id) {
        await prisma.product.update({
          where: { id },
          data: {
            name,
            categoryId: category.id,
            inventory: {
              update: { unit, quantityValue, price, stockQty, isAvailable },
            },
          },
        });
        updated++;
      } else {
        const slug = slugifyName(`${name} ${quantityValue ?? 1} ${unit}`);
        const existing = await prisma.product.findUnique({ where: { slug } });
        if (existing) {
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              name,
              categoryId: category.id,
              inventory: {
                update: { unit, quantityValue, price, stockQty, isAvailable },
              },
            },
          });
          updated++;
        } else {
          await prisma.product.create({
            data: {
              name,
              slug,
              categoryId: category.id,
              inventory: {
                create: { unit, quantityValue, price, stockQty, isAvailable },
              },
            },
          });
          created++;
        }
      }
    } catch (err) {
      errors.push(`Row ${r + 1}: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  await logAudit(
    me.id,
    "import",
    "product",
    null,
    `created=${created} updated=${updated} errors=${errors.length}`,
  );

  revalidatePath("/admin/products");
  revalidatePath("/");

  return NextResponse.json({ created, updated, errors });
}
