import { SideBar } from "../components/side-bar";
import { cn } from "@/app/lib/util";
import { Inter } from "next/font/google";
import { Toaster } from "../components/toaster";
import { IUser } from "@/app/lib/definition";
import { logout } from "@/app/lib/action";

const inter = Inter({ subsets: ["latin"] });

interface Props {
  children: React.ReactNode;
  user: Omit<IUser, "password">;
}

export function Layout(props: Props) {
  const { children, user } = props;

  return (
    <html lang="en" className="h-full bg-white">
      <body className={cn(inter.className, "h-full")}>
        <div>
          <SideBar user={user} logout={logout} />

          <div className="lg:pl-72">
            <main className="py-10">
              <div className="px-4 sm:px-6 lg:px-8">{children}</div>
            </main>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
