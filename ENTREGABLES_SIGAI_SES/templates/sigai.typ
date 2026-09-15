// =============================================================================
// SIGAI-SES - Template Profesional para Documentos
// =============================================================================
// Estilo: Corporativo Técnico con normas APA
// Uso: typst compile --input title="Titulo" --input author="Autor" doc.typ output.pdf
// =============================================================================

// --- CONFIGURACIÓN ---
#set document(
  title: sys.inputs.at("title", default: "SIGAI-SES"),
  author: sys.inputs.at("author", default: "Wilson Ortiz"),
  date: datetime.today(),
)

#set page(
  paper: "a4",
  margin: (top: 3cm, bottom: 2.5cm, left: 2.5cm, right: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 [
      #set text(size: 8pt, fill: luma(120))
      #smallcaps[#sys.inputs.at("title", default: "SIGAI-SES")]
      #h(1fr)
      Securitas Colombia S.A. — SES
    ]
  },
  footer: context {
    set text(size: 8pt, fill: luma(120))
    h(1fr)
    counter(page).display("1")
    h(1fr)
  },
)

#set text(
  font: ("Inter", "Noto Sans"),
  size: 10.5pt,
  lang: "es",
  fill: luma(20),
)

#set par(
  justify: true,
  leading: 0.7em,
  first-line-indent: 1.5em,
)

#show heading: it => {
  set text(weight: "bold")
  set par(first-line-indent: 0em)
  v(1.2em)
  it
  v(0.3em)
}

#show heading.where(level: 1): it => {
  set text(size: 16pt, fill: rgb("#0055A4"))
  it
  v(0.5em)
  line(length: 100%, stroke: 0.5pt + rgb("#0055A4"))
  v(0.3em)
}

#show heading.where(level: 2): it => {
  set text(size: 13pt, fill: rgb("#003366"))
  it
  v(0.3em)
}

#show heading.where(level: 3): it => {
  set text(size: 11pt, fill: rgb("#FF6B35"))
  it
}

// --- PORTADA ---
#align(center)[
  #v(3cm)

  #block(width: 100%)[
    #set text(fill: rgb("#0055A4"))
    #text(size: 12pt, weight: "bold")[SISTEMA INTEGRAL DE GESTIÓN DE ACTIVOS E INVENTARIO]
    #v(0.3cm)
    #text(size: 28pt, weight: "bold")[SIGAI-SES]
  ]

  #v(1cm)

  #block(
    width: 60%,
    inset: (x: 1em, y: 0.8em),
    stroke: (left: 3pt + rgb("#FF6B35")),
    fill: rgb("#F8F9FA"),
  )[
    #set text(size: 11pt)
    #set par(first-line-indent: 0em)
    #align(center)[
      *#sys.inputs.at("title", default: "Documento Técnico")*
    ]
  ]

  #v(2cm)

  #set text(size: 10pt)
  #set par(first-line-indent: 0em)

  *Autor:* #sys.inputs.at("author", default: "Wilson Ortiz")

  *Programa:* Tecnología en Análisis y Desarrollo de Software — SENA

  *Modalidad:* Pasantía

  *Cliente:* Securitas Colombia S.A. — Unidad de Seguridad Electrónica (SES)

  #v(1cm)

  #text(size: 9pt, fill: luma(100))[
    #datetime.today().display("[day]/[month]/[year]")
  ]

  #v(2cm)

  #block(
    width: 80%,
    inset: 0.8em,
    stroke: 0.5pt + luma(200),
    radius: 4pt,
  )[
    #set text(size: 8pt, fill: luma(100))
    #set par(first-line-indent: 0em)
    #align(center)[
      *Documento Confidencial*\
      Securitas Colombia S.A. — Todos los derechos reservados\
      Versión 1.0.0 — Julio 2026
    ]
  ]

  pagebreak()
]

// --- CONTENIDO ---
