import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cookies" };

export default function Cookies() {
  return (
    <>
      <h1>Política de cookies</h1>
      <p>Última actualización: 20 de junio de 2026.</p>

      <h2>Qué usamos</h2>
      <p>Solo usamos una cookie técnica estrictamente necesaria para mantener tu sesión iniciada (autenticación). No requiere consentimiento porque es imprescindible para el funcionamiento del servicio.</p>

      <h2>Qué NO usamos</h2>
      <p>No usamos cookies de publicidad, de seguimiento de terceros ni perfiles de marketing.</p>

      <h2>Gestión</h2>
      <p>Puedes borrar las cookies desde tu navegador en cualquier momento; si lo haces, se cerrará tu sesión.</p>
    </>
  );
}
