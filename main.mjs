// Load the "default" project

import { Mirage, Project } from "./mirage.mjs";


const cnv = document.getElementById("mirage-canvas");

Mirage.set_canvas(cnv);
await Mirage.load(new Project("/projects/default/export.mjs", Project.Canvas2D));
Mirage.start();
