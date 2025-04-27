League of Legends Local Live Client Data API Documentation
Base URL
text

https://127.0.0.1:2999/liveclientdata/

    Note: Uses a self-signed certificate. You must ignore SSL errors in your HTTP client.

Endpoints
1. /allgamedata

    Returns: All available game data in a single JSON object.
    Recommended for most use cases.

2. /activeplayer

    Returns: Data about the currently active player (you).

3. /activeplayername

    Returns: The summoner name of the active player.

4. /playerlist

    Returns: Array of all players in the game with their stats.

5. /gamestats

    Returns: General game stats (game time, map, etc).

6. /eventdata

    Returns: List of in-game events (kills, objectives, etc).

Detailed Data Structures
1. /allgamedata
Example Response (abridged):
json

{
  "activePlayer": {
    "abilities": { ... },
    "championStats": { ... },
    "currentGold": 500,
    "level": 1,
    "summonerName": "YourName",
    "summonerSpells": { ... },
    "teamRelativeColors": true
  },
  "allPlayers": [
    {
      "championName": "Seraphine",
      "isBot": false,
      "isDead": false,
      "items": [ ... ],
      "level": 7,
      "position": "MID",
      "rawChampionName": "game_character_displayname_Seraphine",
      "respawnTimer": 0,
      "runes": { ... },
      "scores": {
        "assists": 1,
        "creepScore": 10,
        "deaths": 1,
        "kills": 0,
        "wardScore": 0
      },
      "skinID": 0,
      "summonerName": "YourName",
      "summonerSpells": { ... },
      "team": "ORDER"
    },
    ...
  ],
  "events": {
    "Events": [
      {
        "EventID": 1,
        "EventName": "ChampionKill",
        "EventTime": 123.45,
        "KillerName": "Player1",
        "VictimName": "Player2",
        "Assisters": ["Player3"]
      },
      ...
    ]
  },
  "gameData": {
    "gameMode": "CLASSIC",
    "gameTime": 123.45,
    "mapName": "Summoner's Rift",
    "mapNumber": 11,
    "mapTerrain": "Default"
  }
}

2. /activeplayer
Example:
json

{
  "abilities": {
    "E": { "abilityLevel": 1, "displayName": "Beat Drop", ... },
    "Passive": { ... },
    "Q": { ... },
    "R": { ... },
    "W": { ... }
  },
  "championStats": {
    "abilityHaste": 0,
    "abilityPower": 0,
    "armor": 30,
    "attackDamage": 55,
    "attackRange": 525,
    "attackSpeed": 0.625,
    "bonusArmorPenetration": 0,
    "bonusMagicPenetration": 0,
    "cooldownReduction": 0,
    "critChance": 0,
    "critDamage": 200,
    "currentHealth": 600,
    "healthRegenRate": 6,
    "lifeSteal": 0,
    "magicLethality": 0,
    "magicPenetration": 0,
    "magicResist": 30,
    "maxHealth": 600,
    "moveSpeed": 325,
    "omnivamp": 0,
    "physicalLethality": 0,
    "physicalVamp": 0,
    "resourceType": "MP",
    "resourceValue": 400,
    "spellVamp": 0,
    "tenacity": 0
  },
  "currentGold": 500,
  "level": 1,
  "summonerName": "YourName",
  "summonerSpells": {
    "D": { "displayName": "Flash", ... },
    "F": { "displayName": "Ignite", ... }
  },
  "teamRelativeColors": true
}

3. /activeplayername
Example:
json

"YourName"

4. /playerlist
Example:
json

[
  {
    "championName": "Seraphine",
    "isBot": false,
    "isDead": false,
    "items": [
      { "canUse": false, "consumable": false, "count": 1, "displayName": "Doran's Ring", "itemID": 1056, "price": 400, "rawDescription": "...", "rawDisplayName": "game_item_displayname_1056", "slot": 0 }
    ],
    "level": 7,
    "position": "MID",
    "rawChampionName": "game_character_displayname_Seraphine",
    "respawnTimer": 0,
    "runes": {
      "keystone": { "displayName": "Summon Aery", ... },
      "primaryRuneTree": { "displayName": "Sorcery", ... },
      "secondaryRuneTree": { "displayName": "Inspiration", ... }
    },
    "scores": {
      "assists": 1,
      "creepScore": 10,
      "deaths": 1,
      "kills": 0,
      "wardScore": 0
    },
    "skinID": 0,
    "summonerName": "YourName",
    "summonerSpells": {
      "summonerSpellOne": { "displayName": "Flash", ... },
      "summonerSpellTwo": { "displayName": "Ignite", ... }
    },
    "team": "ORDER"
  },
  ...
]

5. /gamestats
Example:
json

{
  "gameMode": "CLASSIC",
  "gameTime": 123.45,
  "mapName": "Summoner's Rift",
  "mapNumber": 11,
  "mapTerrain": "Default"
}

6. /eventdata
Example:
json

{
  "Events": [
    {
      "EventID": 1,
      "EventName": "ChampionKill",
      "EventTime": 123.45,
      "KillerName": "Player1",
      "VictimName": "Player2",
      "Assisters": ["Player3"]
    },
    {
      "EventID": 2,
      "EventName": "FirstBlood",
      "EventTime": 130.00,
      "KillerName": "Player1"
    },
    ...
  ]
}

Common Data Fields
Player Object

    championName: String
    isBot: Boolean
    isDead: Boolean
    items: Array of item objects
    level: Number
    position: String (e.g., "TOP", "JUNGLE", "MID", "BOTTOM", "UTILITY")
    rawChampionName: String
    respawnTimer: Number (seconds)
    runes: Object (keystone, primary, secondary)
    scores: Object (kills, deaths, assists, creepScore, wardScore)
    skinID: Number
    summonerName: String
    summonerSpells: Object
    team: "ORDER" or "CHAOS"

Item Object

    canUse: Boolean
    consumable: Boolean
    count: Number
    displayName: String
    itemID: Number
    price: Number
    rawDescription: String
    rawDisplayName: String
    slot: Number

Event Object

    EventID: Number
    EventName: String (e.g., "ChampionKill", "FirstBlood", "DragonKill", etc.)
    EventTime: Number (seconds)
    KillerName: String
    VictimName: String
    Assisters: Array of Strings
