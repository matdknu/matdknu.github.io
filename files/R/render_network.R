#!/usr/bin/env Rscript

# <- PARA ANADIR NODOS: editar theoretical_network.csv con nuevas filas
# Cada nodo nuevo necesita al menos una fila con su conexion a un nodo existente
# Luego ejecutar: source("files/R/render_network.R")
# Luego: quarto render agenda.qmd

suppressPackageStartupMessages({
  library(readr)
  library(dplyr)
  library(tidygraph)
  library(ggraph)
  library(ggplot2)
  library(showtext)
})

`%||%` <- function(x, y) {
  if (is.null(x) || length(x) == 0 || identical(x, "")) y else x
}

script_path <- tryCatch(normalizePath(sys.frame(1)$ofile, mustWork = FALSE), error = function(e) "")
root_dir <- if (nzchar(script_path)) {
  normalizePath(file.path(dirname(script_path), "..", ".."), mustWork = FALSE)
} else {
  normalizePath(getwd(), mustWork = FALSE)
}

csv_path <- file.path(root_dir, "files", "data", "theoretical_network.csv")
output_path <- file.path(root_dir, "files", "images", "theoretical_network.png")
dir.create(dirname(output_path), recursive = TRUE, showWarnings = FALSE)

edges_raw <- read_csv(csv_path, show_col_types = FALSE)

nodes <- bind_rows(
  transmute(
    edges_raw,
    id = from,
    label = from_label,
    color = from_color,
    cat = from_cat,
    size = from_size,
    desc = from_desc
  ),
  transmute(
    edges_raw,
    id = to,
    label = to_label,
    color = to_color,
    cat = to_cat,
    size = to_size,
    desc = to_desc
  )
) |>
  distinct(id, .keep_all = TRUE)

graph <- tbl_graph(nodes = nodes, edges = transmute(edges_raw, from = from, to = to), directed = FALSE)

showtext_auto()
font_add_google("Inter", "Inter")

category_colors <- c(
  comp = "#8b7cf8",
  pol = "#2dd4bf",
  soc = "#f472b6",
  meth = "#fb923c"
)

category_labels <- c(
  comp = "Computational",
  pol = "Political",
  soc = "Social",
  meth = "Methods"
)

plot_obj <- ggraph(graph, layout = "fr") +
  geom_edge_link(color = "#3d3560", alpha = 0.6, linewidth = 0.5) +
  geom_node_point(aes(size = size, color = cat), alpha = 0.95) +
  geom_node_text(
    aes(label = label),
    color = "white",
    family = "Inter",
    size = 3.2,
    repel = TRUE
  ) +
  scale_color_manual(values = category_colors, labels = category_labels) +
  scale_size_continuous(range = c(6, 14), guide = "none") +
  guides(color = guide_legend(override.aes = list(size = 5, alpha = 1))) +
  theme_void() +
  theme(
    plot.background = element_rect(fill = "#0a0a0f", color = NA),
    panel.background = element_rect(fill = "#0a0a0f", color = NA),
    legend.position = "bottom",
    legend.text = element_text(color = "#9898b0", size = 9, family = "Inter"),
    legend.title = element_blank(),
    plot.margin = margin(20, 20, 20, 20)
  )

ggsave(
  filename = output_path,
  plot = plot_obj,
  width = 1400 / 150,
  height = 900 / 150,
  dpi = 150,
  bg = "#0a0a0f"
)
