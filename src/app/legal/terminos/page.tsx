import type { Metadata } from "next";

export const metadata: Metadata = { title: "Términos de servicio" };

export default function Terminos() {
  return (
    <>
      <h1>Términos de servicio</h1>
      <p>Última actualización: 20 de junio de 2026.</p>

      <h2>1. El servicio</h2>
      <p>Imagination es una herramienta de generación de imágenes con inteligencia artificial. Al usarla aceptas estos términos.</p>

      <h2>2. Cuenta</h2>
      <p>Debes facilitar un correo válido y mantener tu contraseña segura. Eres responsable de la actividad de tu cuenta. Debes ser mayor de edad.</p>

      <h2>3. Créditos y pagos</h2>
      <p>Las generaciones consumen créditos. Los planes de pago se facturan de forma recurrente mediante Stripe. Los créditos mensuales no se acumulan al siguiente ciclo. Los packs de créditos comprados no caducan. Puedes cancelar tu suscripción en cualquier momento desde tu cuenta; el acceso continúa hasta el fin del periodo pagado.</p>

      <h2>4. Uso aceptable</h2>
      <p>No está permitido generar contenido ilegal, que infrinja derechos de terceros, sexual explícito, violento extremo, ni contenido que suplante a personas reales sin permiso. Nos reservamos el derecho de suspender cuentas que incumplan estas normas.</p>

      <h2>5. Contenido generado</h2>
      <p>Las imágenes que generas son tuyas para el uso permitido por la ley aplicable. No garantizamos exclusividad ni originalidad absoluta de los resultados.</p>

      <h2>6. Responsabilidad</h2>
      <p>El servicio se ofrece &quot;tal cual&quot;. No nos hacemos responsables de daños derivados del uso del servicio en la medida que permita la ley.</p>

      <h2>7. Cambios</h2>
      <p>Podemos actualizar estos términos. Los cambios relevantes se comunicarán en la web.</p>

      <h2>8. Contacto</h2>
      <p>Para cualquier consulta: <a href="mailto:soporte@olcas.app">soporte@olcas.app</a>.</p>
    </>
  );
}
