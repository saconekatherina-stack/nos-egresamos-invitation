# Nos Egresamos Invitation

CREACIÓN DE INVITACIÓN INTERACTIVA DE EGRESADOS – KATHERINA & NAOMI



Quiero crear una página web interactiva, elegante, romántica y moderna para celebrar nuestra graduación.



La página será una invitación digital compartida mediante un enlace público. Debe funcionar perfectamente en celulares, tablets y computadoras, sin que los invitados tengan que descargar aplicaciones ni registrarse.



1. IDENTIDAD VISUAL



- Nombres principales: Katherina & Naomi.

- Frase principal: «¡Nos egresamos!».

- Año: 2026.

- Estilo: Romantic, delicado, elegante y juvenil.

- Paleta de colores: diferentes tonos de lila y lavanda, incluyendo lavanda pastel, lila suave, violeta y blanco malva.

- Utilizar degradados suaves, transparencias, detalles florales delicados y elementos decorativos elegantes.

- Tipografías combinadas: una tipografía serif elegante para los nombres y títulos, y una tipografía sencilla y legible para los textos.

- Animaciones: Dynamic. Incorporar transiciones suaves, elementos que aparezcan progresivamente, efectos delicados y animaciones al desplazarse por la página.

- No incorporar música ni reproducción automática de sonidos.



Evitar un diseño infantil, recargado o excesivamente simple. Busco una estética romántica y sofisticada.



2. ESTRUCTURA DE LA INVITACIÓN



Crear las siguientes secciones:



A. Portada



- Mostrar Katherina & Naomi como protagonistas.

- Frase destacada: «¡Nos egresamos!».

- Año 2026.

- Una animación inicial elegante.

- Botón «Abrir invitación» con una transición hacia el contenido.



B. Presentación del evento



Crear una sección donde se pueda mostrar un mensaje de invitación personalizado.



C. Información del evento



Incluir campos editables para:



- Fecha.

- Horario.

- Nombre del salón o lugar.

- Dirección.

- Enlace de Google Maps.



Si todavía no se completaron los datos, mostrar un texto provisional discreto que no parezca información definitiva.



D. Confirmación de asistencia



Crear un botón que permita confirmar asistencia mediante WhatsApp.



Utilizar este número como destinatario:

+5492635013396



El botón debe abrir WhatsApp con un mensaje predeterminado que incluya la confirmación y el nombre del invitado.



E. Libro de mensajes



Crear un espacio donde los invitados puedan escribir mensajes para las egresadas.



REQUISITO FUNDAMENTAL DE PRIVACIDAD:



- Los mensajes deben guardarse en una base de datos.

- Solamente las administradoras autorizadas podrán leerlos.

- Ningún invitado debe poder visualizar los mensajes de otras personas.

- No mostrar los mensajes públicamente ni mediante consultas accesibles para visitantes.

- Permitir que las administradoras eliminen mensajes.



F. Galería de fotografías



Crear una galería colaborativa donde los invitados puedan subir fotografías.



Funcionamiento:



1. Cualquier persona que tenga el enlace podrá enviar fotografías sin crear una cuenta.

2. Las fotografías se guardarán inicialmente como pendientes de aprobación.

3. Las imágenes pendientes no serán visibles para los invitados.

4. Las administradoras podrán aprobar o rechazar cada fotografía.

5. Solamente las fotografías aprobadas aparecerán en la galería pública.

6. Permitir eliminar fotografías publicadas.

7. Mostrar las fotografías en una galería atractiva, adaptable a celulares y con posibilidad de ampliarlas.



Incluir validación de archivos, límite de tamaño y protección contra envíos abusivos.



G. Despedida



Crear una última sección emotiva y elegante para agradecer a los invitados y cerrar la experiencia.



3. PANEL PRIVADO DE ADMINISTRACIÓN



Crear un panel de administración separado de la invitación pública.



Debe tener autenticación segura y acceso exclusivo para las dos administradoras autorizadas.



Funciones:



Editar invitación



- Cambiar nombres y textos.

- Modificar fecha y horario.

- Cambiar lugar y dirección.

- Modificar enlaces.

- Editar mensajes de presentación y despedida.



Administrar mensajes



- Consultar mensajes privados.

- Eliminar mensajes.



Administrar galería



- Ver fotografías pendientes.

- Aprobar fotografías.

- Rechazar fotografías.

- Eliminar fotografías publicadas.



Administrar contenido



- Modificar los textos de las distintas secciones sin necesidad de editar código.



No permitir que cualquier visitante pueda acceder al panel de administración. No utilizar contraseñas compartidas ni guardar credenciales en el código del navegador.



4. REQUISITOS TÉCNICOS



- Crear una aplicación web real y funcional.

- Utilizar Lovable Cloud para base de datos, autenticación y almacenamiento si está disponible en el plan gratuito.

- Configurar correctamente los permisos y las políticas de seguridad de la base de datos.

- Aplicar Row Level Security (RLS) cuando corresponda.

- Los visitantes solamente podrán consultar información pública y fotografías aprobadas.

- Los mensajes privados serán accesibles exclusivamente por las administradoras.

- Las fotografías pendientes deberán permanecer privadas.

- No exponer credenciales, contraseñas ni claves privadas en el frontend.

- Evitar servicios externos que requieran pagos o suscripciones.

- Mantener un diseño responsive.

- Optimizar la carga de imágenes y el rendimiento.

- Incorporar estados de carga, confirmaciones y mensajes de error claros.

- Respetar las preferencias de accesibilidad y movimiento reducido.



5. INDICACIONES DE DESARROLLO



Quiero que construyas una aplicación completa, no solamente un prototipo visual.



Primero desarrolla la estructura visual y la navegación. Después configura la base de datos, la autenticación, el panel administrativo y las funciones de privacidad.



No simules que los mensajes se guardan si todavía no existe una conexión real con la base de datos.



Antes de considerar terminada la aplicación, comprueba que:



- Los mensajes no pueden ser consultados por visitantes.

- Las fotografías pendientes no son públicas.

- Las fotografías aprobadas sí aparecen en la galería.

- El panel administrativo está protegido.

- Los visitantes pueden utilizar la invitación sin registrarse.



Prioriza la seguridad y el funcionamiento real sobre los efectos visuales.



Mantén todos los datos del evento editables desde el panel privado.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nos-egresamos-invitation.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/085e59ff-fee9-4808-895a-cbce286a2cfa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
