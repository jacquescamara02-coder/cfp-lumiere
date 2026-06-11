export const SITE = {
  name: "CFP Lumière",
  longName: "Centre de Formation Professionnelle Lumière",
  tagline: "Espace de Développement des Compétences Professionnelles",
  phone: "+243852382925",
  phoneDisplay: "+243 852 382 925",
  whatsapp: "243852382925",
  email: "contact@cfp-lumiere.cd",
  address: "Avenue Lomami, impasse derrière la Cour d'appel, Centre-ville de Lubumbashi (à 5 min de la Poste)",
  city: "Lubumbashi, RDC",
  // Lubumbashi center coordinates
  mapEmbed:
    "https://www.google.com/maps?q=Lubumbashi+Centre+ville+Avenue+Lomami&hl=fr&z=16&output=embed",
  mapLink:
    "https://www.google.com/maps/search/?api=1&query=Lubumbashi+Centre+ville+Avenue+Lomami",
};

export const whatsappUrl = (text = "Bonjour CFP Lumière, je souhaite plus d'informations sur vos formations.") =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
