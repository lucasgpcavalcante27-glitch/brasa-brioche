/**
 * DADOS DO CARDÁPIO (demonstração — nomes, descrições e preços fictícios).
 * Para trocar fotos: coloque o arquivo em assets/images/menu/ e ajuste "image".
 * Enquanto a foto não existir, o site usa o SVG provisório indicado em "fallback".
 */
window.MENU_ITEMS = [
  {
    id: "classico",
    name: "O Clássico da Casa",
    description: "Carne bovina na brasa, cheddar derretido, alface, tomate e o molho da casa no brioche.",
    price: 34.9,
    image: "assets/images/menu/imagem01.jpg",
    fallback: "assets/images/menu/imagem 01.jpg",
    details: ["Brioche com gergelim", "Molho da casa", "Alface americana", "Tomate fresco", "Cheddar", "Carne bovina 180 g"]
  },
  {
    id: "smoke-cheddar",
    name: "Smoke & Cheddar",
    description: "Bacon defumado crocante, cebola caramelizada e cheddar cremoso sobre carne selada.",
    price: 39.9,
    image: "assets/images/menu/imagem02.jpg",
    fallback: "assets/images/menu/imagem02.jpg",
    details: ["Brioche com gergelim", "Molho da casa", "Cheddar", "Carne bovina 180 g", "Bacon crocante", "Cebola caramelizada"]
  },
  {
    id: "brasa-dupla",
    name: "Brasa Dupla",
    description: "Duas carnes, queijo em dobro e bacon. Para quem chega com muita fome.",
    price: 46.9,
    image: "assets/images/menu/imagem 03.jpg",
    fallback: "assets/images/menu/imagem03.jpg",
    details: ["Brioche com gergelim", "Alface americana", "Cheddar em dobro", "Duas carnes de 150 g", "Bacon crocante"]
  }
];
