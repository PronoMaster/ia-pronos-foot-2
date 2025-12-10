let footballData = {};

// Charger data.json au lancement
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

// Trouver équipe en ignorant majuscules/minuscules
function trouverEquipe(nom) {
  const keys = Object.keys(footballData);
  for (let key of keys) {
    if (key.toLowerCase() === nom.toLowerCase()) return footballData[key];
  }
  return null;
}

// Calcul pronostic simple
function pronostic(A, B) {
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

  // Calcul BTTS et Over
  let butsA = 0, butsB = 0;
  A.last_matches.forEach(m => { let s=m.score.split('-').map(Number); butsA+=s[0]; });
  B.last_matches.forEach(m => { let s=m.score.split('-').map(Number); butsB+=s[0]; });

  let result = "";

  result += (butsA/5>=1 && butsB/5>=1) ? "✅ BTTS probable : les deux équipes marquent\n" : "❌ BTTS peu probable\n";
  if(scoreA > scoreB) result += `✅ Victoire probable : ${A.team_name || "Équipe A"}\n`;
  else if(scoreB > scoreA) result += `✅ Victoire probable : ${B.team_name || "Équipe B"}\n`;
  else result += "⚖️ Match équilibré, nul possible\n";
  result += (butsA + butsB)/10 > 1.5 ? "✅ Over 2.5 probable\n" : "❌ Under 2.5 probable\n";

  return result;
}

// Affichage des derniers matchs de manière lisible
function formatMatches(team) {
  if(!team.last_matches || team.last_matches.length === 0) return "Aucun match récent";
  let text = "";
  team.last_matches.forEach(m => {
    text += `- ${m.date} : vs ${m.adversaire}, score ${m.score}\n`;
  });
  return text;
}

// Bouton Analyser
function analyseRapide() {
  const match = document.getElementById("match").value;
  if (!match.includes("-")) {
    document.getElementById("output").innerText = "Format attendu : ÉquipeA - ÉquipeB";
    return;
  }

  const [a,b] = match.split("-").map(s=>s.trim());
  const A = trouverEquipe(a);
  const B = trouverEquipe(b);

  if(!A || !B) {
    document.getElementById("output").innerText = "Équipe introuvable dans la base de données";
    return;
  }

  let text = `⚽ Analyse de ${a} vs ${b} :\n\n`;
  text += `${a} : Position ${A.position}, Points ${A.points}, Forme ${A.form}\n`;
  text += `${b} : Position ${B.position}, Points ${B.points}, Forme ${B.form}\n\n`;

  text += "📊 Derniers matchs :\n";
  text += `${a} :\n${formatMatches(A)}\n`;
  text += `${b} :\n${formatMatches(B)}\n`;

  text += "\n🔮 Pronostics :\n";
  text += pronostic(A,B);

  document.getElementById("output").innerTe
