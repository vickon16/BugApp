import { Metadata } from "next";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function Page() {
  return (
    <>
      <div className="space-y-1 text-center">
        <h1 className="text-3xl font-bold">Sign up to BugApp</h1>
        <p className="text-muted-foreground">
          A place where even <span className="italic">you</span> can find a
          friend.
        </p>
      </div>
      <SignUpForm />
    </>
  );
}
