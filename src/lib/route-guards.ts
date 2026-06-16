export function isProtectedCustomerRoute(pathname: string) {
  return (
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/wishlist") ||
    pathname.startsWith("/addresses") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/settings")
  );
}

export function isAdminRoute(pathname: string) {
  return pathname.startsWith("/admin");
}
