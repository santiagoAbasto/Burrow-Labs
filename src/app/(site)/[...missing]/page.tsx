import { notFound } from "next/navigation";

// Cualquier ruta que no exista cae aquí y muestra el 404 con el header y el footer del sitio.
export default function Missing() {
  notFound();
}
