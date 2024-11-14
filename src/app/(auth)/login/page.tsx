import { Metadata } from "next";
import LoginForm from "./LoginForm";
import GoogleSignInButton from "./GoogleSignInButton";

export const metadata: Metadata = {
  title: "Login to BugApp",
};

export default function Page() {
  return (
    <>
      <div className="space-y-1 text-center">
        <h1 className="text-3xl font-bold">Login to BugApp</h1>
      </div>
      <div className="w-full space-y-4">
        <div className="mx-auto w-full max-w-[80%]">
          <GoogleSignInButton />
        </div>
        <hr className="h-px w-full border border-muted" />
      </div>
      <LoginForm />
    </>
  );
}
