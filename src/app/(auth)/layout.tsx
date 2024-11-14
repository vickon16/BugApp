import Image from "next/image";
import { PropsWithChildren } from "react";
import signUpImage from "@/assets/signup-image.jpg";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

const AuthLayout = async ({ children }: PropsWithChildren) => {
  const { user } = await validateRequest();
  if (user) redirect("/");

  return (
    <main className="flex h-screen">
      <div className="flex h-full w-full flex-1 flex-col items-center justify-center space-y-10 overflow-y-auto p-4 pt-14 md:min-w-[400px] md:flex-[0.3]">
        {children}
      </div>
      <div className="relative hidden h-full w-full flex-1 md:flex md:flex-[0.7] md:flex-col">
        <Image
          src={signUpImage}
          alt=""
          className="h-full w-full object-cover"
          fill
        />
      </div>
    </main>
  );
};

export default AuthLayout;
