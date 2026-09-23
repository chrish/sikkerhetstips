import { initScene } from '../scene.js';

initScene({
  baseW: 1545, // coordinate system width
  baseH: 1115, // coordinate system height
  hotspots: [
    { x: 38, y: 39, text: "Pass på innsyn. Vinduer, dører og andre åpninger gir tilgang til kontoret ditt." },
    { x: 20, y: 50, text: "Pass på at maskinvaren du bruker på kontoret er oppdatert med siste sikkerhetsoppdateringer. Dette gjelder både datamaskin, og programvare." },
    { x: 47, y: 41, text: "Når du forlater arbeidsplassen din, sørg for at maskinen er låst." }
  ]
});
