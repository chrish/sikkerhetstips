import { initScene } from '../scene.js';

initScene({
  baseW: 1536, // coordinate system width
  baseH: 1024, // coordinate system height
  hotspots: [
    { x: 28, y: 24, text: "Hotellets gjestenett er åpent for alle gjestene. Bruk mobilt bredbånd eller VPN når du jobber, og unngå å sende sensitiv informasjon over nett du ikke kontrollerer." },
    { x: 34, y: 61, text: "Mobilen er også en jobbenhet. Hold den oppdatert, bruk skjermlås, og lad heller fra egen strømadapter enn fra ukjente USB-uttak på flyplasser og hoteller." },
    { x: 70, y: 48, text: "La aldri maskinen ligge ubevoktet – heller ikke på hotellrommet. Lås skjermen når du går fra den, og ta den med deg når du forlater rommet." },
    { x: 57.5, y: 21, text: "Pass på innsyn. Sitter du ved vinduet, i lobbyen eller på flyet, kan andre se skjermen din. Vurder personvernfilter, og snu skjermen bort fra folk." },
    { x: 55, y: 45, text: "Vær forsiktig med hva du snakker om når andre kan høre deg. Telefonsamtaler om jobb hører ikke hjemme i lobbyen, på toget eller i taxien." },
    { x: 11, y: 60, text: "Ikke legg igjen enheter, nøkkelkort eller papirer på rommet. Hotellsafen er bedre enn nattbordet, men den er ikke et sikkert sted for sensitiv informasjon." },
    { x: 67, y: 33, text: "Reiser du til utlandet? Andre land har andre regler. Sjekk hva som gjelder for enheter og data der du skal, og ta med minst mulig informasjon du ikke trenger." }
  ]
});
