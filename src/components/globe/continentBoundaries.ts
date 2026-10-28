// High-precision continental boundary contours for 3D Globe visualization (lat, lon)
// Delineates the unmistakable contours of the World Map (Mapa Mundi)

export interface ContinentContour {
  name: string;
  points: [number, number][]; // [lat, lon]
}

export const CONTINENT_CONTOURS: ContinentContour[] = [
  // 1. América do Sul (com destaque para a costa do Brasil)
  {
    name: "América do Sul",
    points: [
      [11.5, -72.0],
      [10.5, -67.0],
      [8.0, -60.0],
      [5.5, -53.0],
      [1.5, -50.0],
      [-0.5, -48.0],
      [-3.0, -42.0],
      [-5.0, -35.5], // Cabo de São Roque / Nordeste Brasileiro
      [-8.5, -35.0], // Recife
      [-13.0, -38.5], // Salvador
      [-19.5, -39.5], // Espírito Santo
      [-23.0, -42.0], // Rio de Janeiro
      [-24.0, -46.5], // São Paulo / Santos
      [-28.0, -48.5], // Santa Catarina
      [-32.0, -52.0], // Rio Grande do Sul
      [-35.0, -56.0], // Uruguai
      [-38.5, -57.5], // Buenos Aires
      [-42.0, -64.0], // Patagônia
      [-46.0, -67.0],
      [-52.0, -68.5],
      [-55.0, -67.0], // Cabo Horn
      [-54.0, -71.5],
      [-48.0, -75.0], // Costa Chilena
      [-40.0, -74.0],
      [-33.0, -72.0],
      [-23.5, -70.5],
      [-17.0, -72.0],
      [-12.0, -77.5], // Lima / Peru
      [-5.0, -81.0],
      [-1.0, -80.5], // Equador
      [3.0, -78.0],
      [8.0, -77.5], // Panamá fronteira
      [9.5, -79.0],
      [11.5, -72.0],
    ],
  },

  // 2. América do Norte & América Central
  {
    name: "América do Norte",
    points: [
      [9.0, -79.5],
      [12.0, -86.5],
      [15.0, -88.0],
      [21.5, -87.0], // Cancún / Península de Yucatán
      [19.0, -91.0],
      [22.0, -97.5],
      [26.0, -97.0],
      [29.0, -95.0], // Houston
      [29.5, -89.0], // Nova Orleans
      [25.0, -81.0], // Flórida Sul / Miami
      [30.0, -81.5],
      [35.0, -75.5], // Outer Banks
      [40.5, -73.5], // Nova York
      [44.0, -69.0],
      [45.0, -63.5], // Nova Escócia
      [47.5, -53.0], // Terra Nova
      [52.0, -56.0],
      [58.0, -63.0],
      [62.5, -71.5],
      [64.0, -86.0], // Hudson Bay
      [58.0, -94.0],
      [51.5, -81.0],
      [45.0, -82.0], // Grandes Lagos
      [48.0, -89.0],
      [55.0, -95.0],
      [60.0, -110.0],
      [69.0, -135.0],
      [71.5, -156.5], // Point Barrow / Alasca
      [65.5, -168.0], // Estreito de Bering
      [60.0, -165.0],
      [58.0, -157.0],
      [59.0, -140.0],
      [54.0, -130.0],
      [48.5, -125.0], // Vancouver / Seattle
      [38.0, -123.0], // San Francisco
      [32.5, -117.0], // San Diego
      [23.0, -110.0], // Baja California
      [31.0, -114.5],
      [26.0, -109.0],
      [20.0, -105.5],
      [16.0, -98.0],
      [14.5, -92.0],
      [9.0, -79.5],
    ],
  },

  // 3. África
  {
    name: "África",
    points: [
      [36.0, -5.5], // Gibraltar
      [37.0, 10.5], // Tunísia
      [33.0, 11.5],
      [32.0, 24.0], // Líbia
      [31.5, 32.0], // Egito / Delta do Nilo
      [22.0, 37.0], // Mar Vermelho
      [12.5, 43.5], // Chifre da África
      [11.5, 51.0], // Somália
      [2.0, 45.5],
      [-4.0, 39.5], // Quênia / Mombaça
      [-11.0, 40.5],
      [-17.0, 39.0],
      [-26.0, 33.0], // Maputo
      [-34.5, 20.0], // Cabo das Agulhas
      [-34.0, 18.5], // Cidade do Cabo
      [-28.5, 16.5],
      [-22.0, 14.5], // Namíbia
      [-12.0, 13.5], // Angola
      [-5.0, 12.0],
      [4.5, 9.0], // Camarões
      [4.5, 6.5], // Nigéria
      [6.0, 2.5],
      [5.0, -1.0], // Gana
      [4.5, -7.5], // Costa do Marfim
      [9.5, -13.5], // Guiné
      [12.0, -16.5],
      [15.0, -17.5], // Dakar / Senegal
      [21.0, -17.0], // Mauritânia
      [28.0, -13.0],
      [32.0, -9.5], // Marrocos
      [36.0, -5.5],
    ],
  },

  // 4. Europa & Mediterrâneo
  {
    name: "Europa",
    points: [
      [36.0, -5.5], // Espanha / Gibraltar
      [43.5, -9.0], // Galiza
      [43.5, -1.5], // Golfo de Biscaia
      [47.5, -4.5], // Bretanha
      [50.0, 1.5],
      [53.5, 7.0], // Holanda / Alemanha
      [57.5, 10.5], // Dinamarca
      [55.5, 13.0], // Suécia Sul
      [59.5, 18.5], // Estocolmo
      [65.5, 23.5], // Báltico Norte
      [71.0, 26.0], // Cabo Norte
      [68.0, 14.5], // Noruega
      [60.0, 5.0],
      [58.0, 7.0],
      [54.0, 14.0], // Polônia
      [54.5, 19.5],
      [59.0, 25.0], // Estônia
      [60.0, 30.0], // São Petersburgo
      [46.5, 31.0], // Mar Negro
      [42.0, 28.5],
      [40.0, 26.0], // Turquia Europeia
      [37.5, 23.5], // Atenas / Grécia
      [40.5, 19.5],
      [44.0, 14.0], // Adriático
      [45.5, 12.5], // Veneza
      [41.0, 16.5], // Itália "Salto"
      [38.0, 16.0], // Calábria
      [41.0, 12.5], // Roma
      [44.0, 8.5], // Gênova
      [43.5, 4.0], // Marselha
      [41.5, 2.0], // Barcelona
      [37.0, -1.5],
      [36.0, -5.5],
    ],
  },

  // 5. Reino Unido e Irlanda
  {
    name: "Reino Unido & Irlanda",
    points: [
      [50.0, -5.5],
      [50.5, -1.5],
      [51.5, 1.5],
      [53.0, 0.5],
      [55.0, -1.5],
      [58.5, -3.0], // Escócia
      [58.0, -5.5],
      [55.5, -5.0],
      [53.5, -3.0],
      [51.5, -4.0],
      [50.0, -5.5],
    ],
  },

  // 6. Ásia (Oriente Médio, Índia, Sudeste Asiático, China, Japão)
  {
    name: "Ásia",
    points: [
      [41.0, 29.0], // Bósforo / Turquia
      [36.5, 36.0],
      [31.5, 34.5], // Levante
      [27.5, 34.5],
      [12.5, 43.5], // Iêmen
      [14.5, 53.5], // Omã
      [24.0, 57.0],
      [26.0, 56.5], // Estreito de Ormuz
      [27.0, 50.0], // Golfo Pérsico
      [30.0, 48.5],
      [25.0, 62.0], // Paquistão
      [24.0, 67.5], // Karachi
      [21.0, 72.5], // Índia / Gujarat
      [15.5, 73.5], // Goa
      [8.0, 77.5], // Cabo Comorim / Sul da Índia
      [13.0, 80.0], // Chennai
      [21.5, 87.0], // Calcutá / Bangladesh
      [21.0, 92.0], // Mianmar
      [16.0, 96.0],
      [8.0, 98.5], // Malásia
      [1.3, 103.8], // Singapura
      [4.5, 103.5],
      [10.0, 104.0], // Vietnã Sul
      [12.0, 109.0],
      [21.0, 108.0],
      [22.5, 114.0], // Hong Kong
      [28.0, 121.5],
      [31.5, 121.5], // Xangai
      [37.0, 122.5], // Shandong
      [39.0, 119.0], // Pequim costa
      [39.0, 124.0], // Coreia
      [34.5, 128.5], // Busan
      [37.5, 129.5],
      [43.0, 132.0], // Vladivostok
      [47.0, 142.0],
      [53.0, 143.0],
      [60.0, 163.0], // Kamchatka
      [66.0, 170.0],
      [71.5, 180.0],
      [73.0, 140.0], // Sibéria Norte
      [77.0, 105.0],
      [73.5, 80.0],
      [69.0, 60.0], // Montes Urais Norte
      [55.0, 60.0],
      [47.0, 52.0], // Cáspio
      [40.0, 50.0],
      [41.0, 29.0],
    ],
  },

  // 7. Japão
  {
    name: "Japão",
    points: [
      [31.0, 130.5], // Kyushu
      [33.5, 133.5], // Shikoku
      [35.0, 136.5],
      [35.5, 140.0], // Tóquio
      [38.5, 141.5], // Sendai
      [41.5, 141.0],
      [43.5, 145.0], // Hokkaido
      [45.5, 142.0],
      [42.0, 140.0],
      [37.0, 137.0],
      [34.5, 131.0],
      [31.0, 130.5],
    ],
  },

  // 8. Austrália & Nova Zelândia
  {
    name: "Austrália",
    points: [
      [-11.0, 142.5], // Cabo York
      [-17.0, 146.0], // Cairns
      [-23.5, 151.0],
      [-28.0, 153.5], // Brisbane / Gold Coast
      [-34.0, 151.2], // Sydney
      [-38.5, 146.5],
      [-38.0, 141.0], // Melbourne
      [-35.5, 138.5], // Adelaide
      [-32.0, 132.5],
      [-34.0, 122.0],
      [-34.5, 115.0], // Perth Sul
      [-28.0, 114.0],
      [-22.0, 114.0],
      [-15.0, 125.0],
      [-12.0, 131.0], // Darwin
      [-14.0, 136.0],
      [-11.0, 142.5],
    ],
  },
  {
    name: "Nova Zelândia",
    points: [
      [-35.0, 173.5],
      [-37.5, 178.0],
      [-41.5, 175.0],
      [-46.5, 169.0],
      [-44.0, 168.0],
      [-41.0, 172.5],
      [-37.0, 175.0],
      [-35.0, 173.5],
    ],
  },
];
