import type { Comparator } from '../classes/comparator'
import type { OptionsOrLoose, RangeLike } from '../types'
import { Range } from '../classes/range'
import { SemVer } from '../classes/semver'
import { gt } from '../functions/gt'

export function minVersion(range: RangeLike, loose?: OptionsOrLoose): SemVer | null {
  const rangeObj = new Range(range, loose)

  let minver: SemVer | null = new SemVer('0.0.0')
  if (rangeObj.test(minver)) {
    return minver
  }

  minver = new SemVer('0.0.0-0')
  if (rangeObj.test(minver)) {
    return minver
  }

  minver = null
  for (let i = 0; i < rangeObj.set.length; ++i) {
    const comparators = rangeObj.set[i] as Comparator[]

    let setMin: SemVer | null = null
    comparators.forEach((comparator) => {
      // Clone to avoid manipulating the comparator's semver object.
      const sourceVersion = comparator.semver instanceof SemVer
        ? comparator.semver.version
        : '0.0.0'
      const compver = new SemVer(sourceVersion)
      switch (comparator.operator) {
        case '>':
          if (compver.prerelease.length === 0) {
            compver.patch++
          }
          else {
            compver.prerelease.push(0)
          }
          compver.raw = compver.format()
          /* fallthrough */
        case '':
        case '>=':
          if (!setMin || gt(compver, setMin)) {
            setMin = compver
          }
          break
        case '<':
        case '<=':
          /* Ignore maximum versions */
          break
        /* istanbul ignore next */
        default:
          throw new Error(`Unexpected operation: ${comparator.operator}`)
      }
    })
    if (setMin && (!minver || gt(minver, setMin))) {
      minver = setMin
    }
  }

  if (minver && rangeObj.test(minver)) {
    return minver
  }

  return null
}
