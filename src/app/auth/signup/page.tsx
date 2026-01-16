import AuthPage from "../components/AuthPage";

type SignupPageProps = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function SignupPage({ searchParams }: SignupPageProps) {
	return <AuthPage mode="signup" searchParams={searchParams} />;
}
