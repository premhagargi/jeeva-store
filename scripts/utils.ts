import slugify from 'slugify';

/**
 * Parse quantity string like "1kg" or "500g" into { value, unit }
 */
export function parseQuantity(qtyString: string): { value: number; unit: string } | null {
  if (!qtyString || typeof qtyString !== 'string') {
    return null;
  }

  const match = qtyString.trim().match(/^([\d.]+)\s*([a-zA-Z]+)$/);
  if (!match) {
    return null;
  }

  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  if (isNaN(value)) {
    return null;
  }

  return { value, unit };
}

/**
 * Generate a slug from a name
 */
export function slugifyName(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
}

/**
 * Safely convert a value to a number, returning undefined for invalid values
 */
export function safeNumber(value: any): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const num = Number(value);
  return isNaN(num) ? undefined : num;
}