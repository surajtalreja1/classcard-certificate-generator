// Fallback skin map for running outside Astro. index.astro overrides this
// with inline data URIs. Skins are grouped by orientation.
const SKINS = {
  "landscape": {
    "default": "/free-tools/certificates/skins/gymnastics.svg",
    "dance": "/free-tools/certificates/skins/dance.svg",
    "football": "/free-tools/certificates/skins/football.svg",
    "swim": "/free-tools/certificates/skins/swim.svg",
    "academic": "/free-tools/certificates/skins/academic.svg",
    "wellness": "/free-tools/certificates/skins/wellness.svg",
    "logo": "/free-tools/certificates/skins/classcard-logo.svg"
  },
  "portrait": {
    "default": "/free-tools/certificates/skins/portrait/gymnastics.svg",
    "dance": "/free-tools/certificates/skins/portrait/dance.svg",
    "football": "/free-tools/certificates/skins/portrait/football.svg",
    "swim": "/free-tools/certificates/skins/portrait/swim.svg",
    "academic": "/free-tools/certificates/skins/portrait/academic.svg",
    "wellness": "/free-tools/certificates/skins/portrait/wellness.svg"
  }
};
