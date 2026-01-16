/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes: string[] = ["/"];

/**
 * An array of routes that require authentication
 * These routes will redirect unauthenticated users to /auth/signin
 * Supports dynamic path patterns (e.g., /artist/:artistId)
 * @type {string[]}
 */
export const privateRoutes: string[] = [
	"/settings",
	"/settings/ranking",
	"/sorter/artist/:artistId",
	"/artist/:artistId/album/:albumId",
	"/artist/:artistId/track/:trackId",
	"/artist/:artistId/community",
	"/artist/:artistId/:submissionId",
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes: string[] = ["/auth/signin", "/auth/signup"];

/**
 * The prefix for API authentication routes * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix: string = "/api/auth";

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT: string = "/";
