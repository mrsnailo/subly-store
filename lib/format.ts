/** Format a whole-taka amount as BDT, e.g. 2899 -> "৳2,899". */
export function bdt(n: number): string {
  return "৳" + n.toLocaleString("en-IN");
}
