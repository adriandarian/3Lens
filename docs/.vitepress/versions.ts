/**
 * 3Lens Documentation Versioning Configuration
 * 
 * This file manages documentation versions for the 3Lens project.
 * 
 * How versioning works:
 * - The `current` version is always at the root of /docs
 * - Older versions are stored in /docs/versions/{version}/
 * - Each version can have its own sidebar configuration
 * 
 * When releasing a new version:
 * 1. Copy current docs to /docs/versions/{oldVersion}/
 * 2. Update this file with the new version info
 * 3. Run the version script: pnpm docs:version
 */

export interface DocVersion {
  /** Version label (e.g., 'v1.0', 'v2.0') */
  label: string
  /** URL path for this version */
  path: string
  /** Whether this is the current/latest version */
  current?: boolean
  /** Release date (optional) */
  date?: string
  /** Version status */
  status?: 'stable' | 'beta' | 'alpha' | 'deprecated'
  /** Link to release notes */
  releaseNotes?: string
}

/**
 * All available documentation versions
 * Listed in reverse chronological order (newest first)
 */
export const versions: DocVersion[] = [
  {
    label: 'v1.x (Current)',
    path: '/',
    current: true,
    status: 'stable',
    date: '2026-01',
    releaseNotes: '/changelog#v1.0.0'
  },
  // Future versions will be added here
  // {
  //   label: 'v2.x',
  //   path: '/versions/v2/',
  //   current: true,
  //   status: 'stable',
  //   date: '2027-01',
  //   releaseNotes: '/changelog#v2.0.0'
  // },
  // {
  //   label: 'v1.x',
  //   path: '/versions/v1/',
  //   current: false,
  //   status: 'deprecated',
  //   date: '2026-01',
  //   releaseNotes: '/versions/v1/changelog#v1.0.0'
  // },
]

/**
 * Get the current documentation version
 */
export function getCurrentVersion(): DocVersion {
  return versions.find(v => v.current) || versions[0]
}

/**
 * Get all non-current versions
 */
export function getOlderVersions(): DocVersion[] {
  return versions.filter(v => !v.current)
}

/**
 * Version badge colors based on status
 */
export const statusColors: Record<DocVersion['status'] & string, string> = {
  stable: '#42d392',     // Green
  beta: '#ffc517',       // Yellow
  alpha: '#747bff',      // Purple
  deprecated: '#ff5757', // Red
}

/**
 * Generate nav item for version switcher
 */
export function getVersionNavItem() {
  const current = getCurrentVersion()
  
  return {
    text: current.label,
    items: versions.map(version => ({
      text: version.label + (version.status === 'deprecated' ? ' (deprecated)' : ''),
      link: version.path + (version.path === '/' ? '' : 'guide/getting-started'),
      activeMatch: version.current ? undefined : version.path
    }))
  }
}

/**
 * Map of version paths to their sidebar configurations
 * This allows each version to have different sidebar structure
 */
export const versionSidebars: Record<string, string> = {
  '/': 'default',
  // '/versions/v1/': 'v1',
}
