export function optimizeCld(
  url: string | null | undefined,
  opts: { width?: number } = {},
): string {
  if (!url) return "";
  const marker = "/image/upload/";
  const i = url.indexOf(marker);
  if (i === -1) return url;

  const tx = ["f_auto", "q_auto", "c_limit"];
  if (opts.width) tx.push(`w_${Math.round(opts.width * 2)}`);

  return url.slice(0, i + marker.length) + tx.join(",") + "/" + url.slice(i + marker.length);
}
