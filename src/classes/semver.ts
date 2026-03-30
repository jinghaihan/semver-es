import type {
  CompareResult,
  IdentifierBase,
  ParsedOptions,
  RangeOptionsOrLoose,
  ReleaseType,
  SemVerLike,
} from '../types'
import { MAX_LENGTH, MAX_SAFE_INTEGER } from '../internal/constants'
import { debug } from '../internal/debug'
import { compareIdentifiers } from '../internal/identifiers'
import { parseOptions } from '../internal/parse-options'
import { safeRe as re, t } from '../internal/re'

const NUMERIC_IDENTIFIER = /^\d+$/

export class SemVer {
  public raw: string = ''
  public loose: boolean = false
  public options: ParsedOptions = {}
  public includePrerelease: boolean = false
  public major: number = 0
  public minor: number = 0
  public patch: number = 0
  public version: string = ''
  public build: string[] = []
  public prerelease: Array<string | number> = []

  constructor(version: SemVerLike, optionsOrLoose?: RangeOptionsOrLoose) {
    const parsedOptions = parseOptions(optionsOrLoose)
    let versionString: string

    if (version instanceof SemVer) {
      if (version.loose === !!parsedOptions.loose
        && version.includePrerelease === !!parsedOptions.includePrerelease) {
        return version
      }

      versionString = version.version
    }
    else if (typeof version === 'string') {
      versionString = version
    }

    else {
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`)
    }

    if (versionString.length > MAX_LENGTH) {
      throw new TypeError(
        `version is longer than ${MAX_LENGTH} characters`,
      )
    }

    debug('SemVer', versionString, parsedOptions)
    this.options = parsedOptions
    this.loose = !!parsedOptions.loose
    // this isn't actually relevant for versions, but keep it so that we
    // don't run into trouble passing this.options around.
    this.includePrerelease = !!parsedOptions.includePrerelease

    const m = versionString.trim().match(parsedOptions.loose ? re[t.LOOSE] : re[t.FULL])

    if (!m)
      throw new TypeError(`Invalid Version: ${versionString}`)

    this.raw = versionString

    // these are actually numbers
    this.major = +m[1]
    this.minor = +m[2]
    this.patch = +m[3]

    if (this.major > MAX_SAFE_INTEGER || this.major < 0)
      throw new TypeError('Invalid major version')

    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0)
      throw new TypeError('Invalid minor version')

    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0)
      throw new TypeError('Invalid patch version')

    // numberify any prerelease numeric ids
    if (!m[4]) {
      this.prerelease = []
    }

    else {
      this.prerelease = m[4].split('.').map((id: string) => {
        if (NUMERIC_IDENTIFIER.test(id)) {
          const num = +id
          if (num >= 0 && num < MAX_SAFE_INTEGER) {
            return num
          }
        }
        return id
      })
    }
    this.build = m[5] ? m[5].split('.') : []
    this.format()
  }

  format(): string {
    this.version = `${this.major}.${this.minor}.${this.patch}`
    if (this.prerelease.length)
      this.version += `-${this.prerelease.join('.')}`

    return this.version
  }

  toString(): string {
    return this.version
  }

  inspect(): string {
    return `<SemVer "${this.version}">`
  }

  private asSemVer(other: SemVerLike): SemVer {
    return other instanceof SemVer ? other : new SemVer(other, this.options)
  }

  /**
   * Compares two versions excluding build identifiers (the bit after `+` in the semantic version string).
   *
   * @return
   * - `0` if `this` == `other`
   * - `1` if `this` is greater
   * - `-1` if `other` is greater.
   */
  compare(other: SemVerLike): CompareResult {
    debug('SemVer.compare', this.version, this.options, other)
    let otherVersion: SemVer
    if (other instanceof SemVer) {
      otherVersion = other
    }

    else {
      if (typeof other === 'string' && other === this.version)
        return 0

      otherVersion = this.asSemVer(other)
    }

    if (otherVersion.version === this.version)
      return 0

    return this.compareMain(otherVersion) || this.comparePre(otherVersion)
  }

  /**
   * Compares the release portion of two versions.
   *
   * @return
   * - `0` if `this` == `other`
   * - `1` if `this` is greater
   * - `-1` if `other` is greater.
   */
  compareMain(other: SemVerLike): CompareResult {
    const otherVersion = this.asSemVer(other)

    if (this.major < otherVersion.major)
      return -1

    if (this.major > otherVersion.major)
      return 1

    if (this.minor < otherVersion.minor)
      return -1

    if (this.minor > otherVersion.minor)
      return 1

    if (this.patch < otherVersion.patch)
      return -1

    if (this.patch > otherVersion.patch)
      return 1

    return 0
  }

  /**
   * Compares the prerelease portion of two versions.
   *
   * @return
   * - `0` if `this` == `other`
   * - `1` if `this` is greater
   * - `-1` if `other` is greater.
   */
  comparePre(other: SemVerLike): CompareResult {
    const otherVersion = this.asSemVer(other)

    // NOT having a prerelease is > having one
    if (this.prerelease.length && !otherVersion.prerelease.length)
      return -1

    else if (!this.prerelease.length && otherVersion.prerelease.length)
      return 1

    else if (!this.prerelease.length && !otherVersion.prerelease.length)
      return 0

    let i = 0
    do {
      const a = this.prerelease[i]
      const b = otherVersion.prerelease[i]
      debug('prerelease compare', i, a, b)
      if (a === undefined && b === undefined)
        return 0

      else if (b === undefined)
        return 1

      else if (a === undefined)
        return -1

      else if (a === b)
        continue

      else
        return compareIdentifiers(a, b)
    } while (++i)

    return 0
  }

  /**
   * Compares the build identifier of two versions.
   *
   * @return
   * - `0` if `this` == `other`
   * - `1` if `this` is greater
   * - `-1` if `other` is greater.
   */
  compareBuild(other: SemVerLike): CompareResult {
    const otherVersion = this.asSemVer(other)

    let i = 0
    do {
      const a = this.build[i]
      const b = otherVersion.build[i]
      debug('build compare', i, a, b)
      if (a === undefined && b === undefined)
        return 0

      else if (b === undefined)
        return 1

      else if (a === undefined)
        return -1

      else if (a === b)
        continue

      else
        return compareIdentifiers(a, b)
    } while (++i)

    return 0
  }

  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(release: ReleaseType, identifier?: string, identifierBase?: IdentifierBase): SemVer
  inc(release: ReleaseType | 'pre', identifier?: string, identifierBase?: IdentifierBase): SemVer {
    const releaseType = release
    const identifierString = identifier

    if (releaseType.startsWith('pre')) {
      if (!identifierString && identifierBase === false)
        throw new Error('invalid increment argument: identifier is empty')

      // Avoid an invalid semver results
      if (identifierString) {
        const match = `-${identifierString}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE])
        if (!match || match[1] !== identifierString)
          throw new Error(`invalid identifier: ${identifierString}`)
      }
    }

    switch (releaseType) {
      case 'premajor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor = 0
        this.major++
        this.inc('pre' as ReleaseType, identifierString, identifierBase)
        break
      case 'preminor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor++
        this.inc('pre' as ReleaseType, identifierString, identifierBase)
        break
      case 'prepatch':
        // If this is already a prerelease, it will bump to the next version
        // drop any prereleases that might already exist, since they are not
        // relevant at this point.
        this.prerelease.length = 0
        this.inc('patch', identifierString, identifierBase)
        this.inc('pre' as ReleaseType, identifierString, identifierBase)
        break
      // If the input is a non-prerelease version, this acts the same as
      // prepatch.
      case 'prerelease':
        if (this.prerelease.length === 0)
          this.inc('patch', identifierString, identifierBase)

        this.inc('pre' as ReleaseType, identifierString, identifierBase)
        break
      case 'release':
        if (this.prerelease.length === 0)
          throw new Error(`version ${this.raw} is not a prerelease`)

        this.prerelease.length = 0
        break

      case 'major':
        // If this is a pre-major version, bump up to the same major version.
        // Otherwise increment major.
        // 1.0.0-5 bumps to 1.0.0
        // 1.1.0 bumps to 2.0.0
        if (
          this.minor !== 0
          || this.patch !== 0
          || this.prerelease.length === 0
        ) {
          this.major++
        }

        this.minor = 0
        this.patch = 0
        this.prerelease = []
        break
      case 'minor':
        // If this is a pre-minor version, bump up to the same minor version.
        // Otherwise increment minor.
        // 1.2.0-5 bumps to 1.2.0
        // 1.2.1 bumps to 1.3.0
        if (this.patch !== 0 || this.prerelease.length === 0)
          this.minor++

        this.patch = 0
        this.prerelease = []
        break
      case 'patch':
        // If this is not a pre-release version, it will increment the patch.
        // If it is a pre-release it will bump up to the same patch version.
        // 1.2.0-5 patches to 1.2.0
        // 1.2.0 patches to 1.2.1
        if (this.prerelease.length === 0)
          this.patch++

        this.prerelease = []
        break
      // This probably shouldn't be used publicly.
      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
      case 'pre': {
        const base = Number(identifierBase) ? 1 : 0

        if (this.prerelease.length === 0) {
          this.prerelease = [base]
        }

        else {
          let i = this.prerelease.length
          while (--i >= 0) {
            if (typeof this.prerelease[i] === 'number') {
              this.prerelease[i] = ((this.prerelease[i] as number) + 1)
              i = -2
            }
          }
          if (i === -1) {
            // didn't increment anything
            if (identifierString === this.prerelease.join('.') && identifierBase === false)
              throw new Error('invalid increment argument: identifier already exists')

            this.prerelease.push(base)
          }
        }
        if (identifierString) {
          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
          let prerelease: Array<string | number> = [identifierString, base]
          if (identifierBase === false)
            prerelease = [identifierString]

          if (compareIdentifiers(this.prerelease[0], identifierString) === 0) {
            if (Number.isNaN(Number(this.prerelease[1])))
              this.prerelease = prerelease
          }
          else {
            this.prerelease = prerelease
          }
        }
        break
      }
      default:
        throw new Error(`invalid increment argument: ${releaseType}`)
    }
    this.raw = this.format()
    if (this.build.length)
      this.raw += `+${this.build.join('.')}`

    return this
  }
}
