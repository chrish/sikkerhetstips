import { initScene } from '../scene.js';

initScene({
  baseW: 1545, // coordinate system width
  baseH: 1115, // coordinate system height
  hotspots: [
    { x: 42.25, y: 22, text: "Ikke alle trenger å se alt du gjør. Pass på hvilken informasjon du deler med andre, og med gjster, i hjemmet ditt." },
    { x: 68, y: 40, text: "Har du tenkt over hva som skjer dersom noe uventet hender med deg? Har du en plan for hvordan dine nærmeste kan få tilgang til dine private enheter og brukerkontoer?" },
    { x: 60.5, y: 43, text: "Sørg for at alle enheter som brukes på hjemmekontoret er oppdatert med siste sikkerhetsoppdateringer." },
    { x: 35, y: 22, text: "Vi deler ofte nett med besøkende. Vurder å sette opp et eget gjestenett der de ikke kan nå dine enheter - vi stoler på dem, men det er ikke sikkert deres enhet er oppdatert eller sikker."  },
    { x: 40, y: 43, text: "Barn og unge laster gjerne ned apper og spill mer ukritisk enn voksne, og kan dermed utsette nettverket for større risiko. Vurder foreldrekontroll for å ha bedre oversikt, eller et eget nett der de ikke når dine enheter." },
    { x: 30, y: 50, text: "Robotstøvsugere og andre smartenheter kommuniserer ofte over internett. Sørg for å holde dem oppdatert, og vurder å sette dem på et eget nett uten tilgang til dine enheter." },
    { x: 83, y: 43.5, html: "Trådløsnett må krypteres for at du skal være beskyttet. Sjekk at trådløsnettet ditt bruker WPA2/WPA3, og at ruteren får automatiske oppdateringer. Pass på at du endrer defaultpassordet på ruter og trådløst nett." },
    { x: 72, y: 17, text: "Smartenheter kommer ofte med innebygde sensorer som kamera og mikrofon. Får TV'en på soverommet fremdeles oppdateringer, eller er den for gammel?" }
  ]
});
