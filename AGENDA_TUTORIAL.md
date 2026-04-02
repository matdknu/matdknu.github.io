# Tutorial: Como trabajar la seccion `My Current Agenda`

Este manual explica como editar y hacer crecer la pagina `agenda.qmd`, que hoy funciona como un tablero simple e interactivo para mostrar:

- lo que estas leyendo,
- lo que estas escribiendo,
- lo que estas produciendo,
- y lo que viene despues.

La idea es que esta seccion se mantenga viva y ligera: no reemplaza CV, publicaciones o posts, sino que muestra en que estas trabajando ahora.

## 1. Donde se edita

El archivo principal es:

- `agenda.qmd`

El estilo visual vive sobre todo en:

- `styles.css`

En `agenda.qmd` estan:

- la version en ingles,
- la version en espanol,
- los botones de filtro,
- las tarjetas,
- y el pequeno script que activa los filtros.

## 2. Como esta organizada la pagina

La pagina tiene cuatro partes:

1. Hero superior
2. Barra de filtros
3. Grilla de tarjetas
4. Script de interaccion

La estructura general se ve asi:

```html
<section class="agenda-page">
  <header class="agenda-hero">...</header>
  <div class="agenda-toolbar">...</div>
  <div class="agenda-grid" id="agenda-grid-en">
    <article class="agenda-card" data-category="literature">...</article>
    <article class="agenda-card" data-category="methods">...</article>
    <article class="agenda-card" data-category="outputs">...</article>
  </div>
</section>
```

Luego aparece la misma estructura para espanol.

## 3. Regla mas importante

Siempre que edites la agenda, actualiza ambos bloques:

- ingles: `data-lang="en"`
- espanol: `data-lang="es"`

Si cambias solo una version, el sitio va a quedar inconsistente al cambiar idioma.

## 4. Como editar una tarjeta existente

Cada tarjeta tiene esta forma:

```html
<article class="agenda-card" data-category="literature" style="--card-accent: #2563eb;">
  <span class="agenda-chip agenda-chip--active">In progress</span>
  <h2 class="agenda-card-title">Political discourse & legitimacy</h2>
  <p class="agenda-card-body">Literature reviews threading political discourse...</p>
  <ul class="agenda-card-meta">
    <li>ELRI / survey-text bridges</li>
    <li>Radical right discourse</li>
  </ul>
</article>
```

Puedes editar:

- `data-category`: categoria del filtro
- `--card-accent`: color lateral de la tarjeta
- `agenda-chip`: estado
- `agenda-card-title`: titulo
- `agenda-card-body`: descripcion breve
- `agenda-card-meta`: bullets concretos

## 5. Categorias actuales

Las categorias que hoy existen son:

- `literature`
- `methods`
- `outputs`

Estas categorias deben coincidir exactamente con los botones de filtro.

Ejemplo:

```html
<button type="button" class="agenda-filter" data-filter="methods">Methods</button>
```

y la tarjeta correspondiente:

```html
<article class="agenda-card" data-category="methods">
```

Si escribes una categoria distinta, el filtro no la va a reconocer bien.

## 6. Estados sugeridos para las tarjetas

Hoy ya usamos dos estilos:

- `agenda-chip agenda-chip--active`
- `agenda-chip agenda-chip--queued`

Recomendacion de uso:

- `agenda-chip--active`: para cosas en curso
- `agenda-chip--queued`: para cosas siguientes o planificadas

Texto sugerido para los chips:

- ingles: `In progress`, `Ongoing`, `Next`, `Drafting`, `Reading`
- espanol: `En curso`, `Activo`, `Proximo`, `Borrador`, `Lectura`

Si despues quieres mas estados, podemos agregar nuevas variantes en `styles.css`, por ejemplo:

- `agenda-chip--published`
- `agenda-chip--paused`
- `agenda-chip--review`

## 7. Como agregar una nueva tarjeta

### Paso 1

Elige en que bloque va:

- en ingles dentro de `#agenda-grid-en`
- en espanol dentro de `#agenda-grid-es`

### Paso 2

Copia una tarjeta existente y ajusta contenido.

Ejemplo en ingles:

```html
<article class="agenda-card" data-category="outputs" style="--card-accent: #f59e0b;">
  <span class="agenda-chip agenda-chip--queued">Drafting</span>
  <h2 class="agenda-card-title">Short note on survey-text integration</h2>
  <p class="agenda-card-body">A brief methodological note connecting survey measures with newspaper corpora and NLP-based coding.</p>
  <ul class="agenda-card-meta">
    <li>ELRI variables + press corpus</li>
    <li>Candidate post or methods memo</li>
  </ul>
</article>
```

Y su equivalente en espanol:

```html
<article class="agenda-card" data-category="outputs" style="--card-accent: #f59e0b;">
  <span class="agenda-chip agenda-chip--queued">Borrador</span>
  <h2 class="agenda-card-title">Nota breve sobre integracion encuesta-texto</h2>
  <p class="agenda-card-body">Una nota metodologica breve que conecta medidas de encuesta con corpus de prensa y codificacion basada en NLP.</p>
  <ul class="agenda-card-meta">
    <li>Variables ELRI + corpus de prensa</li>
    <li>Posible post o memo metodologico</li>
  </ul>
</article>
```

## 8. Como agregar una nueva categoria

Supongamos que quieres una categoria nueva: `teaching`.

Debes hacer tres cosas:

1. Agregar boton en ingles
2. Agregar boton en espanol
3. Usar `data-category="teaching"` en las tarjetas

Ejemplo de botones:

```html
<button type="button" class="agenda-filter" data-filter="teaching">Teaching</button>
```

```html
<button type="button" class="agenda-filter" data-filter="teaching">Docencia</button>
```

No hace falta tocar el script si solo agregas una categoria nueva y usas bien `data-filter`.

## 9. Como enlazar posts reales

La tercera tarjeta ya enlaza a `posts.html`, pero puedes enlazar a un post especifico.

Ejemplo:

```html
<p class="agenda-card-link">
  <a href="posts/datos-electorales/servel-2025/index.html">Open current draft →</a>
</p>
```

Consejos:

- usa links relativos del sitio,
- evita enlazar a archivos temporales,
- si el contenido aun no esta publico, mejor deja texto sin link o apunta a `posts.html`.

## 10. Como pensar el contenido

Una buena tarjeta no debe parecer un parrafo largo. Lo ideal:

- un titulo corto,
- una descripcion de 1 o 2 frases,
- 2 bullets concretos,
- y, si aplica, un link.

Buen formato:

- que estoy haciendo,
- con que datos o enfoque,
- que podria salir de ahi.

Ejemplo:

- tema: discurso politico y legitimidad
- metodo: NLP + prensa + encuestas
- salida: paper, post o memo

## 11. Flujo recomendado de actualizacion

Te propongo este flujo simple:

### Cada semana

1. Revisar si alguna tarjeta cambio de estado
2. Mover lo que ya no es prioridad
3. Agregar 1 o 2 lineas nuevas en bullets
4. Eliminar cosas demasiado viejas

### Cada vez que publiques algo

1. Cambiar el estado de la tarjeta
2. Agregar enlace al post o pagina
3. Si ya no es agenda sino historial, moverlo a otra seccion del sitio

### Cada vez que abras una nueva linea de trabajo

1. Crear tarjeta nueva
2. Duplicarla en EN y ES
3. Asignar categoria
4. Elegir color de acento

## 12. Colores recomendados

Hoy cada tarjeta usa `--card-accent` inline.

Sugerencia de convencion:

- literatura: `#2563eb`
- metodos: `#7c3aed`
- outputs/posts: `#0d9488`
- docencia: `#f59e0b`
- colaboraciones: `#ef4444`

Esto ayuda a que el tablero se lea rapido.

## 13. Cuando conviene editar `styles.css`

Edita `styles.css` si quieres cambiar:

- forma de las tarjetas,
- sombras,
- animaciones,
- colores de chips,
- hero de Agenda,
- distribucion de la grilla,
- estilo de filtros.

No hace falta tocar `styles.css` si solo vas a cambiar contenido.

## 14. Cuando conviene dejarlo simple

No intentes meter demasiado en la agenda.

La agenda funciona mejor si muestra:

- 3 a 6 tarjetas maximo,
- prioridades actuales,
- lenguaje breve,
- salidas concretas.

Si el contenido se vuelve muy largo, conviene derivarlo a:

- un post,
- una pagina de proyecto,
- o una seccion tipo notes / working papers.

## 15. Flujo tecnico recomendado

Para trabajar localmente:

```bash
quarto preview
```

Luego editar:

- `agenda.qmd`
- `styles.css`

Y revisar en local el resultado.

Si quieres render puntual:

```bash
quarto render agenda.qmd
```

Si cambias navbar, estilos globales o varias paginas:

```bash
quarto render
```

## 16. Propuesta de evolucion futura

Si queremos hacer esta seccion aun mejor, los siguientes pasos naturales son:

1. Agregar chips nuevos:
   `Published`, `Paused`, `Review`
2. Añadir fecha de ultima actualizacion por tarjeta
3. Enlazar tarjetas a posts reales
4. Agregar una categoria `Teaching` o `Fieldwork`
5. Cargar tarjetas desde un archivo de datos (`.yml` o `.json`) en vez de escribir todo en HTML

## 17. Regla editorial final

La agenda debe responder siempre estas tres preguntas:

1. Que estoy trabajando ahora
2. Con que enfoque o metodo
3. Que salida concreta podria producir

Si una tarjeta no responde esas tres cosas, conviene reescribirla.
