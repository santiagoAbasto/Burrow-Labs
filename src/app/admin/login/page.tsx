import { redirect } from "next/navigation";

/** El ingreso vive en /admin. Esta ruta queda por los enlaces viejos. */
export default function LoginRedirect() {
  redirect("/admin");
}
