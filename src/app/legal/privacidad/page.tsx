import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacidad" };

export default function Privacidad() {
  return (
    <>
      <h1>Política de privacidad</h1>
      <p>Última actualización: 20 de junio de 2026. Cumplimos el RGPD (UE) 2016/679.</p>

      <h2>Responsable</h2>
      <p>Imagination (Olcas). Contacto: <a href="mailto:soporte@olcas.app">soporte@olcas.app</a>.</p>

      <h2>Datos que tratamos</h2>
      <p>Correo electrónico, contraseña cifrada, dirección IP (anti-abuso y seguridad), historial de generaciones (tus prompts e imágenes) y datos de facturación gestionados por Stripe (no almacenamos tu tarjeta).</p>

      <h2>Finalidad y base legal</h2>
      <p>Prestar el servicio y gestionar tu cuenta (ejecución de contrato); prevenir abuso y fraude (interés legítimo); facturación (obligación legal); comunicaciones del servicio (ejecución de contrato).</p>

      <h2>Conservación</h2>
      <p>Mantenemos tus datos mientras tengas cuenta. Puedes solicitar su eliminación en cualquier momento.</p>

      <h2>Encargados de tratamiento</h2>
      <p>Stripe (pagos), Resend (correo transaccional) y proveedores de generación de imágenes/IA, que procesan los prompts necesarios para crear tus imágenes.</p>

      <h2>Tus derechos</h2>
      <p>Acceso, rectificación, supresión, oposición, limitación y portabilidad. Escríbenos a <a href="mailto:soporte@olcas.app">soporte@olcas.app</a>. También puedes reclamar ante la autoridad de control (en España, la AEPD).</p>

      <h2>Seguridad</h2>
      <p>Contraseñas con hash, conexiones cifradas (HTTPS) y acceso restringido a los datos.</p>
    </>
  );
}
