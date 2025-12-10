import os, requests, json
API_KEY = os.environ.get("FOOTBALL_DATA_API_KEY")
HEADERS = {"X-Auth-Token": API_KEY}
BASE_URL = "https://api.football-data.org/v4"

LEAGUES = {"Ligue 1":"FL1","Premier League":"PL","Serie A":"SA","LaLiga":"PD","Bundesliga":"BL1"}
database = {}

def get_standings(code):
    r = requests.get(f"{BASE_URL}/competitions/{code}/standings", headers=HEADERS, timeout=30)
    return r.json()

def get_matches(code):
    r = requests.get(f"{BASE_URL}/competitions/{code}/matches?status=FINISHED", headers=HEADERS, timeout=30)
    return r.json()

for league_name, code in LEAGUES.items():
    try:
        standings = get_standings(code)
        matches = get_matches(code)
    except:
        continue
    if "standings" not in standings:
        continue

    for team in standings["standings"][0]["table"]:
        team_name = team["team"]["name"]
        last = [m for m in matches.get("matches", []) if m.get("homeTeam",{}).get("name")==team_name or m.get("awayTeam",{}).get("name")==team_name]
        last = last[-5:]
        last_matches = []
        for m in last:
            try:
                ft = m["score"]["fullTime"]
                if ft["home"] is None or ft["away"] is None: continue
                home = m["homeTeam"]["name"]
                away = m["awayTeam"]["name"]
                score_home = ft["home"]
                score_away = ft["away"]
                if home==team_name:
                    adversaire=away
                    score=f"{score_home}-{score_away}"
                else:
                    adversaire=home
                    score=f"{score_away}-{score_home}"
                last_matches.append({"date":m["utcDate"],"adversaire":adversaire,"score":score})
            except:
                continue
        database[team_name]={"league":league_name,"position":team.get("position"),"points":team.get("points"),"goalFor":team.get("goalsFor"),"goalAgainst":team.get("goalsAgainst"),"form":team.get("form"),"last_matches":last_matches}

with open("data.json","w",encoding="utf-8") as f:
    json.dump(database,f,indent=2,ensure_ascii=False)
print("data.json généré, équipes:", len(database))
