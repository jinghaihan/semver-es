const numeric = /^\d+$/
export function compareIdentifiers(a: string | number, b: string | number) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a === b ? 0 : a < b ? -1 : 1
  }

  const anum = numeric.test(String(a))
  const bnum = numeric.test(String(b))

  if (anum && bnum) {
    a = +a
    b = +b
  }

  return a === b
    ? 0
    : (anum && !bnum)
        ? -1
        : (bnum && !anum)
            ? 1
            : a < b
              ? -1
              : 1
}

export const rcompareIdentifiers = (a: string | number, b: string | number) => compareIdentifiers(b, a)
