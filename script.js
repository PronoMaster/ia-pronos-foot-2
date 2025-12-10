let footballData;

async function charger() {
  footballData = await fetch("data.json").then(r => r.json());
}
window.onload = charger;

function trouverEquipe(nom) {
  return footballData[nom] || null;
}

function analyseRapide() {
  const match = document.getElementById("match").value;
  if (!match.includes("-")) {
    document.getElementById("output").innerText = "Format : ÉquipeA - ÉquipeB";
    return;
  }

  const [a,b] = match.split("-").map(s=>s.trim());
  const A = trouverEquipe(a), B = trouverEquipe(b);

  if (!A || !B) {
    document.getElementById("output").innerText = "Équipe introuvable";
    return;
  }

  let text = `Analyse de ${a} vs ${b} :\n`;
  text += `${a} : Position ${A.position}, Points ${A.points}, Forme ${A.form}\n`;
  text += `${b} : Position ${B.position}, Points ${B.points}, Forme ${B.form}\n`;
  text += "Derniers matchs :\n";
  text += `${a} : ${JSON.stringify(A.last_matches)}\n`;
  text += `${b} : ${JSON.stringify(B.last_matches)}\n`;
  text += "\n[Pronostic automatique basé sur les données]";

  document.getElementById("output").innerText = text;
}
