/**
 * Single source of truth for the forge version.
 *
 * Read from package.json so `forge --version`, the /api/health endpoint, and
 * any other surface stay in lockstep with the published package version — bump
 * package.json and everything follows.
 */
import pkg from "../../package.json";

export const VERSION: string = pkg.version;
