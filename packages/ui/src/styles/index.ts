/**
 * Style exports
 */

import { THEME_VARIABLES } from './theme';
import { PANEL_STYLES } from './panels';

export { THEME_VARIABLES, PANEL_STYLES };

/**
 * Get all shared styles as a single string
 */
export function getSharedStyles(): string {
  return THEME_VARIABLES + '\n' + PANEL_STYLES;
}
