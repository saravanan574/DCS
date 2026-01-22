"use client";

import { Logo } from "@/components/logo";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userType, setUserType] = useState<"donor" | "hospital" | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => setIsMenuOpen(false), [pathname]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const type = localStorage.getItem("userType") as "donor" | "hospital" | null;
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!token);
      setUserType(type);
      setUserName(user ? JSON.parse(user).name : null);
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserType(null);
    setUserName(null);
    window.dispatchEvent(new Event("storage"));
    router.push("/");
  };

  const dashboardHref = userType === "hospital" ? "/hospital-dashboard" : "/donor-dashboard";
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
  ];

  const navClass = "sticky top-0 z-50 w-full bg-white shadow-md transition-all duration-300";

  const linkClass = (href: string) =>
    cn(
      "relative font-medium transition-colors after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-red-600 after:transition-all after:duration-300",
      pathname === href
        ? "text-red-600 after:w-full" // Active page highlight
        : "text-gray-800 hover:text-red-600 hover:after:w-full"
    );

  return (
    <header className={navClass}>
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <Logo className="text-red-600 hover:text-red-700 transition-colors" />
        <div className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
          { isLoggedIn && <Link
                href={dashboardHref}
                className={cn(
                  "font-medium transition-colors",
                  pathname === dashboardHref
                    ? "text-red-600"
                    : "text-gray-800 hover:text-red-600"
                )}
              >
                Dashboard
              </Link>}
        </div>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          

          {isLoggedIn ? (
            <>
              <AlertDialog>
                      <AlertDialogTrigger asChild>
                      <Button
                className="rounded-full bg-red-600 text-white hover:bg-red-700 transition px-4 py-2"
              >
                Logout
              </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure? You want to logout</AlertDialogTitle>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLogout}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogHeader>
                      </AlertDialogContent>
                    </AlertDialog>
              <Link
                key = "/notification"
                href="/notification"
                className={cn(
                  "w-5/6 rounded-full bg-background-600 text-red-500 hover:text-lg hover:bg-red-100",
                  pathname === "/notification"
                    ? "text-red-600"
                    : "text-gray-800 hover:text-red-600"
                )}
              >
                <Bell />
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button className="rounded-full border border-red-600 text-red-600 bg-white hover:bg-red-50 hover:text-red-700 transition px-4 py-2">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full bg-red-600 text-white hover:bg-red-700 transition px-4 py-2">
                  Register
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 hover:text-red-600 transition-transform duration-300"
          >
            {isMenuOpen ? <X className="h-6 w-6 rotate-90 transition-transform duration-300" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 pl-2 shadow-md items-left animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col items-left gap-4 py-4 ">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-gray-800 text-lg font-medium transition ",
                  pathname === link.href ? "text-red-600":"hover:text-blue-200"
                )}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn &&<> <Link
                    href={dashboardHref}
                    className={cn(
                      "text-gray-800 text-lg font-medium w-5/6  transition ",
                      pathname === dashboardHref ? "text-red-600":"hover:text-blue-200"
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link
                  href= "/notification"
                  className={cn(
                    "text-gray-800 text-lg font-medium w-5/6 transition hover:text-blue-200",
                    pathname === "/notification" ? "text-red-600":"hover:text-blue-200"
                  )}>
                  Notification
                </Link>
                </>}
                  
            <div className=" pt-4 flex flex-col gap-3 w-full items-center">
              {isLoggedIn ? (
                <>
                 <AlertDialog>
                      <AlertDialogTrigger asChild>
                      <Button
                className="rounded-full bg-red-600 text-white hover:bg-red-700 transition px-4 py-2"
              >
                Logout
              </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure? You want to logout</AlertDialogTitle>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLogout}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogHeader>
                      </AlertDialogContent>
                    </AlertDialog>
                  
                </>
              ) : (
                <>
                  <Link href="/login" className="w-5/6">
                    <Button className="w-full rounded-full border border-red-600 text-red-600 bg-white hover:bg-red-50 hover:text-red-700 transition px-4 py-2">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" className="w-5/6">
                    <Button className="w-full rounded-full bg-red-600 text-white hover:bg-red-700 transition px-4 py-2">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
