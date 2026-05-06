import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { parseQuantity, slugifyName, safeNumber } from './utils';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

const DATA_DIR = path.join(__dirname, '..', 'data');

/**
 * Extract category name from filename
 * Example: "Food Grains and Pulses_report.xlsx" → "Food Grains and Pulses"
 */
function extractCategoryName(filename: string): string {
  // Remove file extension
  let name = filename.replace(/\.[^/.]+$/, '');

  // Remove common suffixes like _report, _data, etc.
  name = name.replace(/_(report|data|import|export)$/i, '');

  return name.trim();
}

/**
 * Clean product name
 */
function cleanProductName(name: string): string {
  return name.trim();
}

/**
 * Process a single Excel file
 */
async function processExcelFile(filePath: string, filename: string) {
  console.log(`\nProcessing: ${filename}`);

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const rows = XLSX.utils.sheet_to_json(worksheet) as Array<Record<string, any>>;

  console.log(`  Total rows: ${rows.length}`);

  const categoryName = extractCategoryName(filename);
  const categorySlug = slugifyName(categoryName);

  let successCount = 0;
  const failedRows: Array<{ row: any; error: string }> = [];

  // Upsert category
  const category = await prisma.category.upsert({
    where: { slug: categorySlug },
    update: { name: categoryName },
    create: {
      name: categoryName,
      slug: categorySlug,
    },
  });

  console.log(`  Category: ${category.name} (ID: ${category.id})`);

  // Process each row
  for (const row of rows) {
    try {
      const itemName = row['item'] || row['Item'] || row['product'] || row['Product'];
      const amount = row['amount'] || row['Amount'] || row['price'] || row['Price'];
      const quantity = row['quantity'] || row['Quantity'] || row['qty'] || row['Qty'];

      if (!itemName) {
        throw new Error('Missing item name');
      }

      const productName = cleanProductName(itemName);

      // Parse quantity
      const parsedQuantity = parseQuantity(String(quantity || ''));
      if (!parsedQuantity) {
        throw new Error(`Invalid quantity: ${quantity}`);
      }

      // Generate product slug: name + quantityValue + unit
      const productSlug = slugifyName(`${productName} ${parsedQuantity.value} ${parsedQuantity.unit}`);

      // Parse price
      const price = safeNumber(amount);

      // Upsert product
      const product = await prisma.product.upsert({
        where: { slug: productSlug },
        update: {
          name: productName,
          categoryId: category.id,
        },
        create: {
          name: productName,
          slug: productSlug,
          categoryId: category.id,
        },
      });

      // Upsert inventory
      await prisma.inventory.upsert({
        where: { productId: product.id },
        update: {
          unit: parsedQuantity.unit,
          quantityValue: parsedQuantity.value,
          price: price,
          stockQty: 100,
          isAvailable: true,
        },
        create: {
          productId: product.id,
          unit: parsedQuantity.unit,
          quantityValue: parsedQuantity.value,
          price: price,
          stockQty: 100,
          isAvailable: true,
        },
      });

      successCount++;
    } catch (error: any) {
      failedRows.push({
        row,
        error: error.message,
      });
    }
  }

  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failedRows.length}`);

  if (failedRows.length > 0) {
    console.log(`  Failed rows:`);
    failedRows.forEach(({ row, error }) => {
      console.log(`    - ${JSON.stringify(row)} | Error: ${error}`);
    });
  }

  return { successCount, failedRows, totalRows: rows.length };
}

/**
 * Main function
 */
async function main() {
  console.log('=== Excel Import Script ===\n');

  // Check if data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`Data directory not found: ${DATA_DIR}`);
    console.log('Creating data directory...');
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Read all .xlsx files from data directory
  const files = fs.readdirSync(DATA_DIR).filter((file) =>
    file.toLowerCase().endsWith('.xlsx')
  );

  if (files.length === 0) {
    console.log('No .xlsx files found in data directory.');
    console.log(`Please place Excel files in: ${DATA_DIR}`);
    return;
  }

  console.log(`Found ${files.length} Excel file(s) to process.\n`);

  let totalSuccess = 0;
  let totalFailed = 0;
  let totalRows = 0;

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const result = await processExcelFile(filePath, file);
    totalSuccess += result.successCount;
    totalFailed += result.failedRows.length;
    totalRows += result.totalRows;
  }

  console.log('\n=== Summary ===');
  console.log(`Total files processed: ${files.length}`);
  console.log(`Total rows: ${totalRows}`);
  console.log(`Total success: ${totalSuccess}`);
  console.log(`Total failed: ${totalFailed}`);
}

// Run main function
main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });