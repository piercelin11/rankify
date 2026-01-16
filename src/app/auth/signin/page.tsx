import AuthPage from "../components/AuthPage";

type LoginPageProps = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
	return <AuthPage mode="signin" searchParams={searchParams} />;
}
