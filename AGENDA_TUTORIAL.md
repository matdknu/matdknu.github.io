# Tutorial: como hacer crecer `agenda.qmd`

Este manual explica como trabajar la pagina `agenda.qmd` tal como quedo ahora:

- una red conceptual dinamica arriba,
- y una agenda editorial abajo.

La idea es que la pagina responda siempre dos preguntas:

1. Cuales son hoy los conceptos y metodos que estructuran la investigacion.
2. Que piezas concretas estan en desarrollo y hacia que salida pueden crecer.

## 1. Que se edita

El archivo principal es:

- `agenda.qmd`

Los estilos visuales viven en:

- `styles.css`

Este tutorial no depende de `docs/`. La fuente de verdad es siempre `agenda.qmd`.

## 2. Como esta organizada la pagina

La pagina tiene dos capas:

1. Red dinamica de conceptos
2. Agenda editorial filtrable

La red se controla con JavaScript dentro del mismo `agenda.qmd`.
La agenda editorial tambien vive ahi, en bloques HTML separados por idioma.

## 3. Red dinamica: donde agregar nodos

Dentro de `agenda.qmd` vas a encontrar este comentario:

```js
// <- EDIT HERE TO ADD NODES
```

Justo debajo aparecen dos estructuras:

```js
const NODES = [ ... ];
const EDGES = [ ... ];
```

## 4. Como leer `NODES`

Cada nodo tiene esta forma:

```js
{
  id: "nlp",
  label: "NLP",
  color: "#8b7cf8",
  size: 34,
  cat: "comp",
  desc: "Natural Language Processing - discourse analysis at scale"
}
```

### Que significa cada campo

- `id`: identificador unico del nodo
- `label`: texto visible en el canvas
- `color`: color del nodo
- `size`: tamano relativo
- `cat`: categoria
- `desc`: texto del tooltip al hacer hover

## 5. Categorias actuales de la red

Las categorias usadas hoy son:

- `comp`
- `meth`
- `pol`
- `soc`

Conviene mantenerlas porque ya coinciden con la leyenda visual.

## 6. Como agregar un nodo nuevo

Ejemplo: quieres agregar `Field Experiments`.

### Paso 1

Agregar un nodo nuevo en `NODES`:

```js
{
  id: "field",
  label: "Field Experiments",
  color: "#fb923c",
  size: 18,
  cat: "meth",
  desc: "Experimental interventions and causal design in social settings"
}
```

### Paso 2

Conectarlo en `EDGES`:

```js
["field", "survey"],
["field", "demo"]
```

### Regla practica

Todo nodo nuevo debe conectarse al menos con un nodo existente.
Si no, quedara flotando solo y la red se vera rara.

## 7. Como borrar un nodo

Para borrar un nodo:

1. Eliminalo de `NODES`
2. Elimina tambien sus conexiones en `EDGES`

Si borras el nodo y dejas enlaces viejos, el script no los podra usar bien.

## 8. Como cambiar solo el texto del tooltip

No necesitas tocar nada del dibujo.
Solo cambia `desc` dentro del nodo correspondiente.

Eso actualiza el texto que aparece al pasar el mouse.

## 9. Agenda editorial: como esta pensada ahora

La seccion de abajo ya no funciona como una lista simple.
Cada entrada intenta verse mas inteligente porque obliga a definir:

- una pregunta,
- el material con el que se trabaja,
- y la salida esperable.

Cada entrada tiene cuatro capas:

1. Tipo de pieza
2. Fecha
3. Titulo
4. Grilla analitica

## 10. Estructura de una entrada

Cada entrada usa esta forma:

```html
<article class="agenda-entry" data-entry-type="literature">
  <div class="agenda-entry-meta">
    <span class="agenda-badge agenda-badge--lit">Literature Review</span>
    <span class="agenda-date">April 2026</span>
  </div>
  <h3>How is democratic legitimacy narrated in digital public arenas?</h3>
  <p>Short synthesis of the issue.</p>
  <div class="agenda-intel-grid">
    <div class="agenda-intel-item">
      <span class="agenda-intel-label">Question</span>
      <p>What is the core problem?</p>
    </div>
    <div class="agenda-intel-item">
      <span class="agenda-intel-label">Material</span>
      <p>What data, corpus, or literature supports it?</p>
    </div>
    <div class="agenda-intel-item">
      <span class="agenda-intel-label">Output</span>
      <p>What will likely come out of this?</p>
    </div>
  </div>
  <div class="agenda-tags">
    <span class="agenda-tag">NLP</span>
    <span class="agenda-tag">Legitimacy</span>
  </div>
</article>
```

## 11. Regla editorial de oro

Si quieres que la agenda se vea realmente buena, cada entrada debe responder tres preguntas:

1. Que problema estoy tratando de aclarar.
2. Con que material o metodo lo estoy trabajando.
3. Que salida concreta podria producir.

Si una entrada no responde eso, se vuelve decorativa y pierde fuerza.

## 12. Tipos de entrada que ya existen

Hoy los filtros trabajan con:

- `literature`
- `methods`
- `post`

Esos valores deben coincidir entre:

- el boton de filtro
- y `data-entry-type` de cada entrada

## 13. Como agregar una entrada nueva

### Paso 1

Elegir el idioma:

- bloque en ingles `data-lang="en"`
- bloque en espanol `data-lang="es"`

### Paso 2

Copiar una entrada existente y cambiar:

- fecha
- titulo
- parrafo corto
- Question / Material / Output
- tags

### Paso 3

Duplicar la misma entrada en el otro idioma.

## 14. Plantilla recomendada para agregar muchas entradas

Puedes usar siempre esta mini plantilla:

```text
Tipo:
Fecha:
Titulo:
Parrafo corto:
Question:
Material:
Output:
Tags:
```

Eso ayuda mucho a sumar entradas rapido sin perder orden.

## 15. Ejemplo de entrada nueva

### Ingles

```html
<article class="agenda-entry" data-entry-type="methods">
  <div class="agenda-entry-meta">
    <span class="agenda-badge agenda-badge--methods">Methods Note</span>
    <span class="agenda-date">August 2026</span>
  </div>
  <h3>How should newspapers be sampled before topic modelling?</h3>
  <p>A note on sampling bias, temporal coverage, and interpretability before unsupervised text analysis.</p>
  <div class="agenda-intel-grid">
    <div class="agenda-intel-item">
      <span class="agenda-intel-label">Question</span>
      <p>What kind of sampling decision changes the substantive story?</p>
    </div>
    <div class="agenda-intel-item">
      <span class="agenda-intel-label">Material</span>
      <p>Archived newspapers, corpus diagnostics, and topic model sensitivity tests.</p>
    </div>
    <div class="agenda-intel-item">
      <span class="agenda-intel-label">Output</span>
      <p>Methods post or appendix note for future text papers.</p>
    </div>
  </div>
  <div class="agenda-tags">
    <span class="agenda-tag">Sampling</span>
    <span class="agenda-tag">Topic models</span>
    <span class="agenda-tag">Press data</span>
  </div>
</article>
```

### Espanol

Haz la misma estructura, pero traducida.

## 16. Como agregar un filtro nuevo

Si algun dia quieres un filtro nuevo, por ejemplo `fieldwork`, necesitas:

1. Agregar un boton nuevo
2. Usar `data-entry-type="fieldwork"` en las entradas respectivas

No hace falta tocar el script si mantienes la misma logica de nombres.

## 17. Como evitar que la agenda se vuelva caotica

Recomendacion practica:

- mantener entre 4 y 8 entradas activas
- archivar o borrar lo que ya no importa
- no escribir parrafos demasiado largos
- usar tags cortos
- mantener la grilla `Question / Material / Output`

## 18. Flujo recomendado de actualizacion

### Cada semana

1. Revisar si cambian prioridades
2. Ajustar fechas
3. Reescribir una o dos preguntas
4. Eliminar lo que ya no represente la agenda actual

### Cada vez que nace una linea nueva

1. Agregar nodo en `NODES`
2. Conectarlo en `EDGES`
3. Crear una entrada editorial asociada
4. Duplicarla en EN y ES

### Cada vez que una idea madura

1. Moverla de `literature` a `post`, o de `post` a salida publicada
2. Cambiar la descripcion para reflejar mejor el avance
3. Si deja de ser agenda, sacarla de aqui

## 19. Render y chequeo local

Para revisar la pagina:

```bash
quarto render agenda.qmd
```

O el sitio completo:

```bash
quarto render
```

## 20. Resumen final

La pagina funciona mejor si:

- la red muestra relaciones vivas entre conceptos,
- la agenda muestra pocas piezas pero bien pensadas,
- y cada entrada deja claro problema, material y salida.

Esa combinacion hace que la agenda se vea activa, legible y realmente inteligente.
