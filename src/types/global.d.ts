declare namespace NodeJS {
	export interface ProcessEnv {
		NEXT_PUBLIC_BASE_URL: string;
		DATABASE_URL: string;
		SPOTIFY_CLIENT_ID: string;
		SPOTIFY_CLIENT_SECRET: string;
	}
}
