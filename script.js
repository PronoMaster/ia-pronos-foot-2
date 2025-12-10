let footballData = {}; // variable globale

// Charger data.json au chargement du site
async function charger() {
  try {
    footballData = await fetch("data.json").then(r => r.json());
    console.log("Data chargée :", Object.keys(footballData).length, "équipes");
  } catch(e) {
    console.log("Impossible de charger data.json pour l'instant", e);
    footballData = {};
  }
}
window.onload = charger;

// Chercher une équipe dans data.json
function trouverEquipe(nom) {
  return footballData[nom] || null;
}

// Calcul simple du pronostic basé sur les derniers matchs
function pronostic(A, B) {
  // Forme : W = victoire, D = nul, L = défaite
  const formScore = (form) => {
    if (!form) return 0;
    let score = 0;
    for (let c of form) {
      if (c === 'W') score += 3;
      if (c === 'D') score += 1;
    }
    return score;
  }

  let scoreA = formScore(A.form);
  let scoreB = formScore(B.form);

  // Derniers matchs pour BTTS (les deux équipes marquent)
  let butsA = 0, butsB = 0;
  A.last_matches.forEach(m => {
    let s = m.score.split('-').map(Number);
    butsA += s[0]; // score côté équipe A
  });
  B.last_matches.forEach(m => {
    let s = m.score.split('-').map(Number);
    butsB += s[0]; // score côté équipe B
  });

  let pronosticText = "";

  // BTTS
  pronosticText += (butsA/5 >=1 && butsB/5 >=1) ? "Pronostic BTTS ✅ Les deux équipes marquent\n" : "BTTS ❌ Probablement pas les deux équipes marquent\n";

  // Victoire / match nul
  if (scoreA > scoreB) pronosticText += `Victoire probable : ${A.team_name || "Équipe A"}\n`;
  else if (scoreB > scoreA) pronosticText += `Victoire probable : ${B.team_name || "Équipe B"}\n`;
  else pronosticText += "Match équilibré, nul possible\n";

  // Over/Under 2.5
  if ((butsA + butsB)/10 > 1.5) pronosticText += "Over 2.5 probable ✅\n";
  else pronosticText += "Under 2.5 probable ❌\n";

  return pronosticText;
}

// Bouton “Analyser”
function analyseRapide() {
  const match = document.getElementById("match").value;
  if (!match.includes("-")) {
    document.getElementById("output").innerText = "Format : ÉquipeA - ÉquipeB";
    return;
  }

  const [a,b] = match.split("-").map(s=>s.trim());
  const A = trouverEquipe(a);
  const B = trouverEquipe(b);

  if (!A || !B) {
    document.getElementById("output").innerText = "Équipe introuvable dans la base de données";
    return;
  }

  let text = `Analyse de ${a} vs ${b} :\n\n`;
  text += `${a} : Position ${A.position}, Points ${A.points}, Forme ${A.form}\n`;
  text += `${b} : Position ${B.position}, Points ${B.points}, Forme ${B.form}\n\n`;

  text += "Pronostics basés sur les derniers matchs :\n";
  text += pronostic(A,B);

  document.getElementById("output").innerText = text;
}

