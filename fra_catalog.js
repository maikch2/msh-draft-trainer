// Pinned booster inventory, independent of Untapped coverage. Sources and odds: README.md.
// Scryfall unique=cards: set:fra (base printing); set:spg cn>=159 cn<=168, 2026-10-01.
// Pair identities: Wizards legends article; the five Way pairs share matching artwork/artists.
// Rows: name, set, rarity, slot, cost, colors, mana value, is land, image.
(function(root) {
  const catalog = {
    pairs: [
  [
    "Jace, Reality Sculptor",
    "Tam, the Possibility"
  ],
  [
    "Ajani Resolute",
    "Ajani Unrelenting"
  ],
  [
    "Chandra, Torch of Defiance",
    "Chandra, Chill of Compliance"
  ],
  [
    "Garruk, Curse Breaker",
    "Garruk, Veiled Butcher"
  ],
  [
    "Liliana the Repentant",
    "Liliana the Faultless"
  ],
  [
    "Vraska, the Cutting Glare",
    "Vraska, Soul of Stone"
  ],
  [
    "Arni, Renowned Champion",
    "Arni, Humble Scribe"
  ],
  [
    "Danitha, Sword of Hope",
    "Danitha, Spear of Agony"
  ],
  [
    "Edgar, Ancient Bloodlord",
    "Edgar, Moonlit Sovereign"
  ],
  [
    "Fblthp, Impossibly Lost",
    "Fblthp, Knows the Way"
  ],
  [
    "Gallia, the Merrymaker",
    "Gallia, Tragic Host"
  ],
  [
    "Ghalta the Unstoppable",
    "Ghalta the Immovable"
  ],
  [
    "Gideon's Memorial",
    "Gideon the Oathless"
  ],
  [
    "Hapatra, the Desert Fang",
    "Hapatra, the Desert Frost"
  ],
  [
    "Jiang Yanggu, Never Alone",
    "Jiang Yanggu, Alone"
  ],
  [
    "Karn, Argent Defender",
    "Karn, Gilded Guardian"
  ],
  [
    "Kiora of Salt and Sand",
    "Kiora of Fire and Ashes"
  ],
  [
    "Koth, the Geomancer",
    "Koth of the Homestead"
  ],
  [
    "Loot, the Nexus",
    "Loot, the Anomaly"
  ],
  [
    "Lyra, Archangel of Dawn",
    "Lyra, Tolarian Archangel"
  ],
  [
    "Mabel, Valley Hero",
    "Mabel, Bitter Recluse"
  ],
  [
    "Marwyn, the Preserver",
    "Marwyn, the Clearcutter"
  ],
  [
    "Massacre Girl, Most Wanted",
    "Rescue Girl, First Responder"
  ],
  [
    "Pia, Determined Rebuilder",
    "Pia, Aether Ascetic"
  ],
  [
    "Proft, Consulting Detective",
    "Proft, Sinister Mastermind"
  ],
  [
    "Ruric Thar, Magecrusher",
    "Ruric Thar, Biomagus"
  ],
  [
    "Saheeli, Jewel of Avishkar",
    "Saheeli, Consul of Oversight"
  ],
  [
    "Samut, Hazoret's Champion",
    "Samut, Tyrant of Naktamun"
  ],
  [
    "Tetsuko Umezawa, Fugitive",
    "Tetsuko Umezawa, Pursuer"
  ],
  [
    "Teyo, Lightshield Expert",
    "Teyo, Diamondblade Mage"
  ],
  [
    "Thalia, the Survivor",
    "Geist of Saint Thalia"
  ],
  [
    "Tinybones, Pocket Nuisance",
    "Titanbones, Towering Heart"
  ],
  [
    "Tomik, Orzhov Lawmage",
    "Tomik, Izzet Sparkmage"
  ],
  [
    "Traxos, Scourge Eternal",
    "Traxos, Academy Guardian"
  ],
  [
    "Winter, Tormented Loner",
    "Winter, Team Player"
  ],
  [
    "Yargle, Glutton of Urborg",
    "Yargle, Goliath of Otaria"
  ],
  [
    "Yoshimaru, Beloved Companion",
    "Yoshimaru, Scrappy Stray"
  ],
  [
    "Yuriko, Hope from the Shadows",
    "Yuriko, Blade of the Mighty"
  ],
  [
    "Way of the Healer",
    "Way of the Necromancer"
  ],
  [
    "Way of the Mentor",
    "Way of the Warlord"
  ],
  [
    "Way of the Cryomancer",
    "Way of the Pyromancer"
  ],
  [
    "Way of the Mind Sculptor",
    "Way of the Paradox"
  ],
  [
    "Way of the Deathbringer",
    "Way of the Wildspeaker"
  ]
],
    cards: [
      ["Emrakul, the Exigent Doom", "FRA", "mythic", "main", "{10}", [], 10.0, false, "https://cards.scryfall.io/normal/front/c/3/c3ff8dd3-88a8-49dc-a59b-e2748680623c.jpg?1790829846"],
      ["Academic Ascent", "FRA", "common", "main", "{1}{W}", ["W"], 2.0, false, "https://cards.scryfall.io/normal/front/7/3/730d8c28-1e58-4b8e-89e9-445d154d2e83.jpg?1788878081"],
      ["Blossom-Blessed Angel", "FRA", "common", "main", "{3}{W}", ["W"], 4.0, false, "https://cards.scryfall.io/normal/front/5/e/5e77fbf0-9d1f-4e7d-a02e-43065d11b0d9.jpg?1789692643"],
      ["Campus Crier", "FRA", "common", "main", "{1}{W}", ["W"], 2.0, false, "https://cards.scryfall.io/normal/front/6/0/6047b14c-91d5-4f8e-af3f-057a541e2546.jpg?1788878120"],
      ["Enlightened Confidant", "FRA", "mythic", "main", "{1}{W}", ["W"], 2.0, false, "https://cards.scryfall.io/normal/front/4/8/483fcc58-cc6e-4452-a696-7b38e117c837.jpg?1788329184"],
      ["Fateshaper Aspirant", "FRA", "common", "main", "{4}{W}", ["W"], 5.0, false, "https://cards.scryfall.io/normal/front/f/0/f0c8400d-824f-4d79-84bc-7615a0deb831.jpg?1789556683"],
      ["Flickering Hound", "FRA", "rare", "main", "{3}{W}", ["W"], 4.0, false, "https://cards.scryfall.io/normal/front/6/8/686f3a25-305d-4f02-8972-eba7b8e9635f.jpg?1789470769"],
      ["Generous Revival", "FRA", "uncommon", "main", "{2}{W}", ["W"], 3.0, false, "https://cards.scryfall.io/normal/front/f/8/f82f181b-a43b-4cec-b8f6-f6c1dd4c64fd.jpg?1788433351"],
      ["Germinate Recruits", "FRA", "rare", "main", "{2}{W}", ["W"], 3.0, false, "https://cards.scryfall.io/normal/front/1/b/1b5d7d19-b32a-4786-ae9a-00da5e6658ad.jpg?1789644810"],
      ["Graft Surgeon", "FRA", "common", "main", "{2}{W}", ["W"], 3.0, false, "https://cards.scryfall.io/normal/front/3/2/32a7a905-11bf-4b66-a28e-1066a0e372b8.jpg?1789644811"],
      ["Guiding Hydra", "FRA", "rare", "main", "{X}{W}", ["W"], 1.0, false, "https://cards.scryfall.io/normal/front/a/5/a53eb840-039d-4c45-b701-d58cb26b1a6c.jpg?1789644816"],
      ["Hexhaven Battalion", "FRA", "common", "main", "{4}{W}{W}", ["W"], 6.0, false, "https://cards.scryfall.io/normal/front/3/b/3b6ac80e-c726-4bd0-893a-e666041a04a6.jpg?1789556695"],
      ["Kindred Judgment", "FRA", "rare", "main", "{5}{W}{W}", ["W"], 7.0, false, "https://cards.scryfall.io/normal/front/6/f/6f9f814b-8249-4e48-a05e-4c84060fe6fb.jpg?1789470776"],
      ["Loyal Tutor", "FRA", "rare", "main", "{W}", ["W"], 1.0, false, "https://cards.scryfall.io/normal/front/4/9/490dae91-94ce-42a9-a11f-6c5e77c4e486.jpg?1788878096"],
      ["Memory Trap", "FRA", "common", "main", "{2}{W}", ["W"], 3.0, false, "https://cards.scryfall.io/normal/front/2/f/2f5345ae-4489-4d05-b2d5-c71285254f05.jpg?1788866058"],
      ["Predictive Preparations", "FRA", "common", "main", "{1}{W}", ["W"], 2.0, false, "https://cards.scryfall.io/normal/front/5/0/50a0e5f0-3c39-4f16-9a73-eec8ef71f12e.jpg?1789556696"],
      ["Prophesied End", "FRA", "uncommon", "main", "{1}{W}", ["W"], 2.0, false, "https://cards.scryfall.io/normal/front/1/f/1f95399a-9766-4f3d-aa6a-ece55e0530d9.jpg?1788951920"],
      ["Refute Destiny", "FRA", "uncommon", "main", "{1}{W}", ["W"], 2.0, false, "https://cards.scryfall.io/normal/front/2/c/2c588954-c6eb-4aae-a2fa-0651ccf2d90a.jpg?1789470778"],
      ["Repurposed Enforcer", "FRA", "rare", "main", "{1}{W}", ["W"], 2.0, false, "https://cards.scryfall.io/normal/front/3/5/35000e93-85d3-44f8-976a-5918ee4c71e0.jpg?1788878108"],
      ["Return to the Light Realms", "FRA", "mythic", "main", "{7}{W}{W}", ["W"], 9.0, false, "https://cards.scryfall.io/normal/front/9/e/9e72f397-2384-40f1-882b-f627664d97df.jpg?1788878107"],
      ["Shatterwing Pegasus", "FRA", "common", "main", "{2}{W}", ["W"], 3.0, false, "https://cards.scryfall.io/normal/front/e/2/e29095de-59ec-4562-ba8e-73f952e457ae.jpg?1789385580"],
      ["Surgical Precision", "FRA", "common", "main", "{1}{W}", ["W"], 2.0, false, "https://cards.scryfall.io/normal/front/d/3/d3acf176-ef02-4729-88c4-0f0dfbfdada4.jpg?1789385570"],
      ["Unflinching Hortimancer", "FRA", "common", "main", "{1}{W}", ["W"], 2.0, false, "https://cards.scryfall.io/normal/front/6/3/63f82985-c9c2-4d0a-ac4f-560166bebd9f.jpg?1789556741"],
      ["Your Fate Ends Here", "FRA", "uncommon", "main", "{2}{W}", ["W"], 3.0, false, "https://cards.scryfall.io/normal/front/2/5/25000a17-b701-4d69-b2ef-2c74029199d3.jpg?1789729751"],
      ["Countersculpt", "FRA", "uncommon", "main", "{U}{U}", ["U"], 2.0, false, "https://cards.scryfall.io/normal/front/1/4/145b928d-a7ff-4fe5-ae4d-bbae7b1d955b.jpg?1788878107"],
      ["Cruel Calculations", "FRA", "rare", "main", "{2}{U}", ["U"], 3.0, false, "https://cards.scryfall.io/normal/front/f/7/f76c4d8e-3e1f-4264-99af-1b8adb9a06be.jpg?1789127482"],
      ["Cryotheory Adept", "FRA", "common", "main", "{1}{U}", ["U"], 2.0, false, "https://cards.scryfall.io/normal/front/9/b/9ba1f7ce-3404-4932-9795-22967707f762.jpg?1789556701"],
      ["Diviner of Victory", "FRA", "rare", "main", "{U}", ["U"], 1.0, false, "https://cards.scryfall.io/normal/front/0/8/0853bb80-8664-432a-8457-600139fd96d5.jpg?1788878145"],
      ["Divining Duelist", "FRA", "common", "main", "{2}{U}", ["U"], 3.0, false, "https://cards.scryfall.io/normal/front/9/6/960c7335-331d-488b-be68-2ad1c1c695dc.jpg?1789556709"],
      ["Icy Reception", "FRA", "common", "main", "{1}{U}", ["U"], 2.0, false, "https://cards.scryfall.io/normal/front/8/d/8d754b96-5e44-45af-9c7a-b0da59fbe4c3.jpg?1788779540"],
      ["Infinite Coursework", "FRA", "common", "main", "{2}{U}", ["U"], 3.0, false, "https://cards.scryfall.io/normal/front/a/5/a5988272-faaa-463d-a0a1-a8e96b946bad.jpg?1789385916"],
      ["Jace's Machinations", "FRA", "rare", "main", "{2}{U}", ["U"], 3.0, false, "https://cards.scryfall.io/normal/front/2/8/282588b9-3656-453b-aa25-2419e078ddc1.jpg?1788878150"],
      ["Mindseeker Oculus", "FRA", "common", "main", "{2}{U}", ["U"], 3.0, false, "https://cards.scryfall.io/normal/front/f/5/f5324741-353a-4a70-adb2-b631b00806dd.jpg?1789556707"],
      ["Perfected Theory", "FRA", "uncommon", "main", "{U}", ["U"], 1.0, false, "https://cards.scryfall.io/normal/front/d/0/d0ecae06-bc5a-4886-84df-c2900816f226.jpg?1788329222"],
      ["Plan for All Outcomes", "FRA", "uncommon", "main", "{3}{U}", ["U"], 4.0, false, "https://cards.scryfall.io/normal/front/c/4/c4effc17-0d0e-423a-b5f2-597ea6c71f67.jpg?1790746542"],
      ["Precise Redaction", "FRA", "uncommon", "main", "{1}{U}", ["U"], 2.0, false, "https://cards.scryfall.io/normal/front/9/2/9244efad-35ab-45c0-b173-4bc68276cb67.jpg?1789470790"],
      ["Protege's Awakening", "FRA", "common", "main", "{3}{U}", ["U"], 4.0, false, "https://cards.scryfall.io/normal/front/a/0/a08c7ec2-4c6a-4db2-85a7-41afe8731523.jpg?1790558750"],
      ["Seasoned Cryomancer", "FRA", "mythic", "main", "{1}{U}{U}", ["U"], 3.0, false, "https://cards.scryfall.io/normal/front/5/1/51d86875-420d-4e82-b69c-4feeb99c9428.jpg?1789470781"],
      ["Semester Foreseer", "FRA", "common", "main", "{3}{U}", ["U"], 4.0, false, "https://cards.scryfall.io/normal/front/7/e/7e5a640b-fd88-4b5a-9dfc-1d8f5a5cef41.jpg?1789127516"],
      ["Sphinx of False Conclusions", "FRA", "rare", "main", "{2}{U}{U}", ["U"], 4.0, false, "https://cards.scryfall.io/normal/front/0/8/08ffbd51-2bd3-4262-8809-09576ce2b6f5.jpg?1789385594"],
      ["Sphinx's Approach", "FRA", "common", "main", "{1}{U}{U}", ["U"], 3.0, false, "https://cards.scryfall.io/normal/front/f/4/f49be090-c745-40e5-bc1c-605b8d98acdf.jpg?1789644816"],
      ["Surveillance Phantasm", "FRA", "common", "main", "{1}{U}", ["U"], 2.0, false, "https://cards.scryfall.io/normal/front/9/d/9df8a06d-c7de-49af-8c01-06dca3dfef4b.jpg?1789385597"],
      ["The Theorist, Jace Beleren", "FRA", "mythic", "main", "{2}{U}{U}", ["U"], 4.0, false, "https://cards.scryfall.io/normal/front/2/0/20bb8c55-4b0b-425f-8201-b54fa2fdde86.jpg?1788329228"],
      ["Theorist's Proxy", "FRA", "rare", "main", "{1}{U}", ["U"], 2.0, false, "https://cards.scryfall.io/normal/front/7/1/710302ca-c4be-4069-8ce1-f531414c74e9.jpg?1788878151"],
      ["Undulating Witness", "FRA", "common", "main", "{4}{U}", ["U"], 5.0, false, "https://cards.scryfall.io/normal/front/0/a/0adbb4b2-a142-48da-8f4b-fa91529dbac4.jpg?1789556706"],
      ["Unsummon", "FRA", "common", "main", "{U}", ["U"], 1.0, false, "https://cards.scryfall.io/normal/front/d/d/ddad9f16-52d5-49de-82b0-b1a5294a9c44.jpg?1789556722"],
      ["Variable Chaser", "FRA", "rare", "main", "{2}{U}", ["U"], 3.0, false, "https://cards.scryfall.io/normal/front/e/3/e3afedb1-bf9d-4e31-9700-433514cc29b1.jpg?1789470807"],
      ["Apex Witchstalker", "FRA", "common", "main", "{4}{B}{B}", ["B"], 6.0, false, "https://cards.scryfall.io/normal/front/c/d/cd56f047-6bdc-4e83-8a7c-923ebad26302.jpg?1789556710"],
      ["Bloodline Recollector", "FRA", "mythic", "main", "{1}{B}", ["B"], 2.0, false, "https://cards.scryfall.io/normal/front/4/f/4fcc913e-f736-460a-b24b-022fa2e861b9.jpg?1788329264"],
      ["Break Under Pressure", "FRA", "uncommon", "main", "{2}{B}", ["B"], 3.0, false, "https://cards.scryfall.io/normal/front/4/6/46974d94-e900-43e4-92b5-4fb9b9f7cf46.jpg?1789385622"],
      ["Cast Away Doubt", "FRA", "common", "main", "{2}{B}", ["B"], 3.0, false, "https://cards.scryfall.io/normal/front/3/b/3b5b28a4-0abd-4dc2-9856-c9a8d27f6a2d.jpg?1788353191"],
      ["Dark Matter Manipulator", "FRA", "rare", "main", "{B}", ["B"], 1.0, false, "https://cards.scryfall.io/normal/front/4/e/4ec912d5-cbe7-4d07-9ece-b03ac02d3055.jpg?1789385959"],
      ["Darklight Phoenix", "FRA", "mythic", "main", "{3}{B}", ["B"], 4.0, false, "https://cards.scryfall.io/normal/front/e/c/ec454979-3839-4be3-a34a-9d25482948ba.jpg?1789470810"],
      ["Extended Absence", "FRA", "common", "main", "{3}{B}", ["B"], 4.0, false, "https://cards.scryfall.io/normal/front/e/b/eb4b6ed8-782e-4473-abc9-d50bf2275c6a.jpg?1789556713"],
      ["Extrapolate the Impossible", "FRA", "rare", "main", "{1}{B}", ["B"], 2.0, false, "https://cards.scryfall.io/normal/front/1/7/17fb6538-493c-41aa-ad13-3e63d3ad3317.jpg?1789729624"],
      ["Last Gasp", "FRA", "common", "main", "{1}{B}", ["B"], 2.0, false, "https://cards.scryfall.io/normal/front/2/3/2381d123-d8c7-4822-98fe-b1c365beb5ed.jpg?1789127524"],
      ["Lich's Relic", "FRA", "rare", "main", "{B}", ["B"], 1.0, false, "https://cards.scryfall.io/normal/front/b/1/b105511d-5022-4a84-b6ce-4bb433e93a62.jpg?1789644819"],
      ["Multiply by Zero", "FRA", "uncommon", "main", "{1}{B}", ["B"], 2.0, false, "https://cards.scryfall.io/normal/front/9/0/90d684a4-9639-4792-8760-2011a7a85370.jpg?1789644823"],
      ["Overwrite the Multiverse", "FRA", "mythic", "main", "{4}{B}{B}", ["B"], 6.0, false, "https://cards.scryfall.io/normal/front/c/4/c4554f5b-791b-48f6-bf54-ad28699e1beb.jpg?1788952080"],
      ["Rampart Hunter", "FRA", "common", "main", "{3}{B}", ["B"], 4.0, false, "https://cards.scryfall.io/normal/front/f/4/f4a80225-7459-4151-86bb-8fdea31c39a6.jpg?1789127211"],
      ["Rank Rat", "FRA", "common", "main", "{1}{B}", ["B"], 2.0, false, "https://cards.scryfall.io/normal/front/4/f/4ff6da82-d7dd-4b59-b7e6-30670cea7169.jpg?1789556727"],
      ["Rewrite Regrets", "FRA", "uncommon", "main", "{3}{B}", ["B"], 4.0, false, "https://cards.scryfall.io/normal/front/4/5/453cfde7-c460-4b55-9472-b714e16f24bb.jpg?1788952087"],
      ["Rise of the Deathbringer", "FRA", "rare", "main", "{4}{B}", ["B"], 5.0, false, "https://cards.scryfall.io/normal/front/8/1/811719ad-b5a3-4d31-8c6f-5dbdfccf7c1f.jpg?1789470807"],
      ["Sanctum Lurker", "FRA", "rare", "main", "{2}{B}", ["B"], 3.0, false, "https://cards.scryfall.io/normal/front/2/1/2185c08f-bb4d-49d5-8b6c-c629a48bb61c.jpg?1789556729"],
      ["Screeching Soulbreaker", "FRA", "common", "main", "{2}{B}", ["B"], 3.0, false, "https://cards.scryfall.io/normal/front/7/3/738667a1-c184-43ea-829f-49fbb69b6fc0.jpg?1789385960"],
      ["Silence the Echo", "FRA", "common", "main", "{1}{B}", ["B"], 2.0, false, "https://cards.scryfall.io/normal/front/f/1/f1d274db-751b-4414-a38d-762198168e91.jpg?1789385640"],
      ["Solve for Disappointment", "FRA", "common", "main", "{1}{B}", ["B"], 2.0, false, "https://cards.scryfall.io/normal/front/7/b/7beaa8c9-1a2c-4c88-b579-91e371d8d9e3.jpg?1788878155"],
      ["Terminal Criticism", "FRA", "uncommon", "main", "{1}{B}", ["B"], 2.0, false, "https://cards.scryfall.io/normal/front/7/e/7ebd7e38-b27c-4c6e-aaea-e8ee5ba5e5df.jpg?1789470810"],
      ["Theoretical Necromancer", "FRA", "common", "main", "{2}{B}", ["B"], 3.0, false, "https://cards.scryfall.io/normal/front/e/3/e36a7908-1e22-494b-adb4-e72ac0974d62.jpg?1789556734"],
      ["Void Extrapolator", "FRA", "common", "main", "{1}{B}", ["B"], 2.0, false, "https://cards.scryfall.io/normal/front/0/e/0eae2efb-bf25-48ee-9c07-9098008110ad.jpg?1789556787"],
      ["Vraska's Final Mercy", "FRA", "rare", "main", "{B}{B}", ["B"], 2.0, false, "https://cards.scryfall.io/normal/front/9/9/992bd991-7cfb-459f-bafd-9a44f3c925c5.jpg?1789699369"],
      ["Ajani's Anguish", "FRA", "rare", "main", "{X}{R}", ["R"], 1.0, false, "https://cards.scryfall.io/normal/front/d/9/d9039a58-2f17-4b8a-b714-3a2f0b46f057.jpg?1789470674"],
      ["Artifist Acumen", "FRA", "common", "main", "{R}", ["R"], 1.0, false, "https://cards.scryfall.io/normal/front/7/d/7d3b720d-f27c-462a-8f80-15748e5086e1.jpg?1789729762"],
      ["Awaken the Inferno", "FRA", "common", "main", "{4}{R}", ["R"], 5.0, false, "https://cards.scryfall.io/normal/front/c/5/c596c4ec-8480-4be9-a45d-700398a126f6.jpg?1789556812"],
      ["Blazing Crescendo", "FRA", "common", "main", "{1}{R}", ["R"], 2.0, false, "https://cards.scryfall.io/normal/front/8/4/8414a98c-0c79-4884-bc9b-061a6456b392.jpg?1789060147"],
      ["Chandra's Emberling", "FRA", "common", "main", "{2}{R}", ["R"], 3.0, false, "https://cards.scryfall.io/normal/front/3/a/3a64c5f4-9cfc-4d19-bd99-13d619b1aa9d.jpg?1789385708"],
      ["Command the Stage", "FRA", "uncommon", "main", "{2}{R}", ["R"], 3.0, false, "https://cards.scryfall.io/normal/front/f/3/f3307da2-6dad-4ef2-9614-a7d34f38088e.jpg?1789644825"],
      ["Craterclaw Colossus", "FRA", "mythic", "main", "{4}{R}{R}{R}", ["R"], 7.0, false, "https://cards.scryfall.io/normal/front/4/7/47793a51-08c6-4ad2-a7e5-a4484d83a5cd.jpg?1788329298"],
      ["Curse-Marred Demon", "FRA", "rare", "main", "{2}{R}{R}", ["R"], 4.0, false, "https://cards.scryfall.io/normal/front/8/f/8f827e50-0a08-4bc8-98b1-b26c9af15ef2.jpg?1789470818"],
      ["Draconic Visitor", "FRA", "rare", "main", "{3}{R}{R}", ["R"], 5.0, false, "https://cards.scryfall.io/normal/front/1/1/112f8478-bd89-4a14-9721-8ab750613129.jpg?1789470842"],
      ["Eardrum Rattler", "FRA", "common", "main", "{1}{R}", ["R"], 2.0, false, "https://cards.scryfall.io/normal/front/5/f/5f8771f9-8128-4818-a11d-41ea368cf697.jpg?1789127173"],
      ["Essence Burn", "FRA", "uncommon", "main", "{1}{R}", ["R"], 2.0, false, "https://cards.scryfall.io/normal/front/d/2/d2e958de-70de-4156-8f9b-b2c0c1ba704a.jpg?1789470825"],
      ["Face Yourself", "FRA", "rare", "main", "{5}{R}{R}", ["R"], 7.0, false, "https://cards.scryfall.io/normal/front/3/c/3ccf8f64-19bd-4fdf-b70a-30a042bacf2f.jpg?1789127528"],
      ["Fulminous Forte", "FRA", "uncommon", "main", "{2}{R}", ["R"], 3.0, false, "https://cards.scryfall.io/normal/front/1/9/19acb2b5-3b3e-43f0-bd81-8426ed3d9c55.jpg?1789614832"],
      ["Hallway Heckler", "FRA", "common", "main", "{2}{R}", ["R"], 3.0, false, "https://cards.scryfall.io/normal/front/7/e/7e324816-552f-455d-97c4-5ea6b26d2e6e.jpg?1789127576"],
      ["Heartstring Puller", "FRA", "common", "main", "{3}{R}", ["R"], 4.0, false, "https://cards.scryfall.io/normal/front/c/b/cbfe3354-7ced-4773-9a4e-a937ae9f94f8.jpg?1789556808"],
      ["Identity Echo", "FRA", "rare", "main", "{2}{R}", ["R"], 3.0, false, "https://cards.scryfall.io/normal/front/e/6/e600b33b-8916-43dd-95d3-d7cbf874933d.jpg?1789385968"],
      ["Master of Barbs", "FRA", "rare", "main", "{1}{R}", ["R"], 2.0, false, "https://cards.scryfall.io/normal/front/4/4/4404d9d4-9cdd-4dad-a4f6-574d90db5052.jpg?1789127596"],
      ["No Admittance", "FRA", "common", "main", "{1}{R}", ["R"], 2.0, false, "https://cards.scryfall.io/normal/front/1/1/11ba4fdd-cc03-4bb6-a493-91a9785771d0.jpg?1788878170"],
      ["Pompous Battlemage", "FRA", "rare", "main", "{R}", ["R"], 1.0, false, "https://cards.scryfall.io/normal/front/a/a/aa0f77ac-741a-444a-8bf0-a42c644726bf.jpg?1788878186"],
      ["Pyre Rhymer", "FRA", "rare", "main", "{1}{R}{R}", ["R"], 3.0, false, "https://cards.scryfall.io/normal/front/2/b/2b0ebea0-86de-4da4-9fe8-dacc1e75c161.jpg?1789470850"],
      ["Skilled Battlecarver", "FRA", "common", "main", "{1}{R}", ["R"], 2.0, false, "https://cards.scryfall.io/normal/front/0/e/0e44f959-1322-4abd-b6eb-dea992307c0c.jpg?1789556811"],
      ["Stingcaster Mage", "FRA", "mythic", "main", "{1}{R}", ["R"], 2.0, false, "https://cards.scryfall.io/normal/front/2/d/2d8e8e5f-3bf5-490d-aa9c-9df2b26f1460.jpg?1788329303"],
      ["Tether Technician", "FRA", "common", "main", "{4}{R}", ["R"], 5.0, false, "https://cards.scryfall.io/normal/front/b/7/b75bbf46-a421-467a-9433-6cf22398a3a5.jpg?1789556839"],
      ["Violent Echoes", "FRA", "uncommon", "main", "{2}{R}{R}", ["R"], 4.0, false, "https://cards.scryfall.io/normal/front/a/d/ad03ba90-2442-4a71-94df-2088b5b63662.jpg?1789127599"],
      ["Wrath of the Bloodmane", "FRA", "common", "main", "{2}{R}", ["R"], 3.0, false, "https://cards.scryfall.io/normal/front/b/5/b5b55617-684a-4036-be9b-a3b24fc9cd5a.jpg?1789385820"],
      ["Arcane Amphisbaena", "FRA", "common", "main", "{1}{G}", ["G"], 2.0, false, "https://cards.scryfall.io/normal/front/1/b/1bf923c4-f0b7-4271-978c-fd2e79fe1cc8.jpg?1788878190"],
      ["Bestial Incursion", "FRA", "common", "main", "{3}{G}", ["G"], 4.0, false, "https://cards.scryfall.io/normal/front/e/0/e0de5f66-f0df-4866-9f73-104ce50411b4.jpg?1789127248"],
      ["Budding Insurgent", "FRA", "common", "main", "{2}{G}", ["G"], 3.0, false, "https://cards.scryfall.io/normal/front/1/8/18c59d60-2640-4576-9375-3ba38aa3ecb7.jpg?1789127120"],
      ["Carnivorous Cultivator", "FRA", "rare", "main", "{1}{G}", ["G"], 2.0, false, "https://cards.scryfall.io/normal/front/7/9/79dd5c54-5ea5-47b5-8f9b-50ed57a5ea45.jpg?1789385967"],
      ["Compel Brutality", "FRA", "common", "main", "{1}{G}", ["G"], 2.0, false, "https://cards.scryfall.io/normal/front/b/d/bd32d736-7a58-46b9-90b4-2cac3c3e80a1.jpg?1788521235"],
      ["Flourishing Grapple", "FRA", "uncommon", "main", "{G}", ["G"], 1.0, false, "https://cards.scryfall.io/normal/front/f/7/f71958e9-6d6d-4393-8b49-567103b50877.jpg?1789470852"],
      ["Gardenize", "FRA", "rare", "main", "{1}{G}{G}", ["G"], 3.0, false, "https://cards.scryfall.io/normal/front/9/3/930b89c3-4433-48de-829f-20fc3dbfced9.jpg?1789644837"],
      ["Greenhouse Propagator", "FRA", "common", "main", "{2}{G}", ["G"], 3.0, false, "https://cards.scryfall.io/normal/front/a/5/a56e0f91-b128-4693-a949-53cb403f4fbf.jpg?1789127136"],
      ["Heartwood Crafter", "FRA", "uncommon", "main", "{G}", ["G"], 1.0, false, "https://cards.scryfall.io/normal/front/9/1/910a1f41-17fd-4ab0-9597-7151e79dc760.jpg?1789127630"],
      ["Hexhaven Invigorator", "FRA", "mythic", "main", "{G}{G}{G}{G}", ["G"], 4.0, false, "https://cards.scryfall.io/normal/front/9/a/9a446cae-e93c-4574-8ffd-7688f9729a8a.jpg?1788878191"],
      ["Hungering Puppetbeast", "FRA", "rare", "main", "{3}{G}{G}", ["G"], 5.0, false, "https://cards.scryfall.io/normal/front/3/d/3db2da7a-8088-4117-916b-f9c905d1b45b.jpg?1789127646"],
      ["Hunter's Axe", "FRA", "uncommon", "main", "{G}", ["G"], 1.0, false, "https://cards.scryfall.io/normal/front/a/2/a2cc5d0e-9643-4ee2-81de-fa2c3bd1ab09.jpg?1789556822"],
      ["Inspired Tethermage", "FRA", "common", "main", "{2}{G}", ["G"], 3.0, false, "https://cards.scryfall.io/normal/front/0/7/073f4998-a204-447b-93d5-746ae87fd6a1.jpg?1788878192"],
      ["Omnipresence", "FRA", "mythic", "main", "{5}{G}{G}{G}", ["G"], 8.0, false, "https://cards.scryfall.io/normal/front/e/a/eaf9dc77-c83b-49cf-84be-6bd791cb925e.jpg?1790558797"],
      ["Puppet Crafting", "FRA", "rare", "main", "{1}{G}", ["G"], 2.0, false, "https://cards.scryfall.io/normal/front/6/b/6b8789a6-3b63-4198-af5f-c2f2f49fafd9.jpg?1789470736"],
      ["Restore with Empathy", "FRA", "uncommon", "main", "{2}{G}", ["G"], 3.0, false, "https://cards.scryfall.io/normal/front/3/5/3546b93b-a7d1-451d-a369-22cc8ddcd00d.jpg?1788865848"],
      ["Simulacrum Shaper", "FRA", "rare", "main", "{1}{G}{G}", ["G"], 3.0, false, "https://cards.scryfall.io/normal/front/7/c/7c725702-8696-4e5a-8318-62f5e2616d52.jpg?1789470857"],
      ["Something Worth Saving", "FRA", "common", "main", "{1}{G}", ["G"], 2.0, false, "https://cards.scryfall.io/normal/front/0/2/02ee7817-40af-4fcf-a2df-eb218b669281.jpg?1788878199"],
      ["Sureshot Sower", "FRA", "common", "main", "{1}{G}", ["G"], 2.0, false, "https://cards.scryfall.io/normal/front/b/6/b635389c-e286-4edb-80d1-23dbe4a18857.jpg?1789614751"],
      ["Tarmogoyf", "FRA", "mythic", "main", "{1}{G}", ["G"], 2.0, false, "https://cards.scryfall.io/normal/front/8/b/8be5ee47-8f8a-4e3c-b1a1-9ca0e1fdec7f.jpg?1789127270"],
      ["Tethermage's Advantage", "FRA", "common", "main", "{G}", ["G"], 1.0, false, "https://cards.scryfall.io/normal/front/3/8/38589a7c-9cfb-4bcc-845e-9dc205095853.jpg?1789129937"],
      ["Verdant Kraken", "FRA", "rare", "main", "{4}{G}{G}{G}", ["G"], 7.0, false, "https://cards.scryfall.io/normal/front/2/b/2bb7a8eb-227f-410b-859f-750ef0aea2f0.jpg?1789644841"],
      ["Vinelasher Adept", "FRA", "common", "main", "{4}{G}{G}", ["G"], 6.0, false, "https://cards.scryfall.io/normal/front/e/5/e5ed142b-2b61-4ef5-8b23-2db2a0a0319d.jpg?1789556814"],
      ["Wrecking Gecko", "FRA", "common", "main", "{4}{G}", ["G"], 5.0, false, "https://cards.scryfall.io/normal/front/3/d/3d693cb0-681e-480a-8f70-07e94c39225c.jpg?1789385843"],
      ["Aerid Konstrari", "FRA", "mythic", "main", "{1}{R}{G}{G}", ["G", "R"], 4.0, false, "https://cards.scryfall.io/normal/front/f/1/f17d2792-b075-4c47-ad38-e7a7eaee5f8c.jpg?1788878199"],
      ["Avatar of Burgeoning Echoes", "FRA", "mythic", "main", "{G}{U}", ["G", "U"], 2.0, false, "https://cards.scryfall.io/normal/front/5/9/5905995b-7a20-4602-a7cc-90aa5089a082.jpg?1788878208"],
      ["Blessed Ghoul", "FRA", "common", "main", "{W/B}", ["B", "W"], 1.0, false, "https://cards.scryfall.io/normal/front/b/b/bb975803-9bf2-401e-9414-d272df314398.jpg?1789556847"],
      ["Bloombrute", "FRA", "uncommon", "main", "{2}{G}{W}", ["G", "W"], 4.0, false, "https://cards.scryfall.io/normal/front/6/b/6b804503-9c70-4b1f-bb13-a65fb6dd3ef8.jpg?1789644843"],
      ["Charge the Sanctum", "FRA", "common", "main", "{2}{R/W}", ["R", "W"], 3.0, false, "https://cards.scryfall.io/normal/front/8/7/87b40df5-5c0a-41f5-a09c-a04f17066a91.jpg?1788521570"],
      ["Clash of Elements", "FRA", "uncommon", "main", "{1}{U}{R}", ["R", "U"], 3.0, false, "https://cards.scryfall.io/normal/front/b/6/b61bcef7-5832-45e6-a2bc-26d4f23707fc.jpg?1788878210"],
      ["Craftwork Crusher", "FRA", "uncommon", "main", "{3}{R}{R}{G}{G}", ["G", "R"], 7.0, false, "https://cards.scryfall.io/normal/front/0/3/03f9839c-aa07-4ee7-847b-091e47ab80c4.jpg?1789470711"],
      ["Denzilore Fatehold", "FRA", "mythic", "main", "{1}{W}{U}{U}", ["U", "W"], 4.0, false, "https://cards.scryfall.io/normal/front/9/8/986f9e98-9d8d-428b-9187-860745cf3269.jpg?1788878215"],
      ["Desperate Futurescribe", "FRA", "uncommon", "main", "{2}{W}{U}", ["U", "W"], 4.0, false, "https://cards.scryfall.io/normal/front/c/f/cfaa3ebd-5c21-4e99-a0dd-8426d19b53a5.jpg?1789644852"],
      ["Emergency Phytomedic", "FRA", "common", "main", "{G/W}", ["G", "W"], 1.0, false, "https://cards.scryfall.io/normal/front/d/e/de94d388-919d-44ff-baef-8c90a417ac6d.jpg?1789637792"],
      ["Entrust the Spark", "FRA", "rare", "main", "{3}{G}{U}", ["G", "U"], 5.0, false, "https://cards.scryfall.io/normal/front/c/a/ca894d25-b9fc-4cd6-8746-70d8c2868721.jpg?1789614779"],
      ["Fatehold Charm", "FRA", "uncommon", "main", "{W}{U}", ["U", "W"], 2.0, false, "https://cards.scryfall.io/normal/front/c/f/cfc54011-647e-4428-bcdb-59400e1da49d.jpg?1789127637"],
      ["Fatehold Chronologist", "FRA", "common", "main", "{1}{W/U}", ["U", "W"], 2.0, false, "https://cards.scryfall.io/normal/front/2/9/29e7ec16-0c16-48aa-8e09-ce6e0d5bd40b.jpg?1789060173"],
      ["Ferocity of the Hunt", "FRA", "common", "main", "{1}{B/G}", ["B", "G"], 2.0, false, "https://cards.scryfall.io/normal/front/a/9/a9793ce9-5a0b-41fe-b9ad-02f6f7da2481.jpg?1789644856"],
      ["Frostbite Pyromental", "FRA", "rare", "main", "{U}{R}{R}", ["R", "U"], 3.0, false, "https://cards.scryfall.io/normal/front/7/a/7a44581f-8fc4-457d-888a-1e211090ee7e.jpg?1789470870"],
      ["Grim Repriser", "FRA", "uncommon", "main", "{B}{R}", ["B", "R"], 2.0, false, "https://cards.scryfall.io/normal/front/8/2/8295c48c-b4dd-4bc1-a206-04cf12b79bbd.jpg?1789470746"],
      ["Ingris Stingerquill", "FRA", "mythic", "main", "{B}{R}{R}", ["B", "R"], 3.0, false, "https://cards.scryfall.io/normal/front/6/4/6471b135-33a8-4005-9a07-ebb74e0bf145.jpg?1788878212"],
      ["Konstrari Charm", "FRA", "uncommon", "main", "{R}{G}", ["G", "R"], 2.0, false, "https://cards.scryfall.io/normal/front/7/d/7d29dfa1-9582-47bc-8f42-62b611bdcc4e.jpg?1789127645"],
      ["Konstrari Improviser", "FRA", "common", "main", "{1}{R/G}", ["G", "R"], 2.0, false, "https://cards.scryfall.io/normal/front/4/2/42e28bd2-486b-45d4-8840-6e33c19c2d57.jpg?1789556881"],
      ["Kwia Vigorbloom", "FRA", "mythic", "main", "{3}{G}{W}{W}", ["G", "W"], 6.0, false, "https://cards.scryfall.io/normal/front/2/d/2d6ff182-a853-4898-895b-072c89324ca7.jpg?1788878236"],
      ["Mind Meanderer", "FRA", "uncommon", "main", "{3}{G}{U}{U}", ["G", "U"], 6.0, false, "https://cards.scryfall.io/normal/front/9/4/94c290ce-252c-42b3-bcb0-c1ef621df566.jpg?1789470861"],
      ["Null Summoner", "FRA", "rare", "main", "{2}{U}{B}", ["B", "U"], 4.0, false, "https://cards.scryfall.io/normal/front/3/a/3afdc75a-1bf5-4f2f-84eb-d82f77a095cd.jpg?1789127648"],
      ["Paradox Shaper", "FRA", "uncommon", "main", "{1}{U/B}", ["B", "U"], 2.0, false, "https://cards.scryfall.io/normal/front/e/6/e61b9d48-0ace-4453-afe0-a1024444bac0.jpg?1788329390"],
      ["Primal Witchstalker", "FRA", "uncommon", "main", "{1}{B}{G}", ["B", "G"], 3.0, false, "https://cards.scryfall.io/normal/front/0/4/04e64af7-cca1-499e-8951-f386e84c8b5b.jpg?1789644850"],
      ["Proctor of Potential", "FRA", "rare", "main", "{W}{U}", ["U", "W"], 2.0, false, "https://cards.scryfall.io/normal/front/c/f/cf0eec8c-0475-4050-8144-481a9bb13a0f.jpg?1789127661"],
      ["Prudent Fateseer", "FRA", "uncommon", "main", "{1}{W/U}{W/U}", ["U", "W"], 3.0, false, "https://cards.scryfall.io/normal/front/6/c/6c1c790b-9e0e-4964-9ea3-554843907f06.jpg?1788329412"],
      ["Recursive Recruitment", "FRA", "uncommon", "main", "{2}{U}{B}", ["B", "U"], 4.0, false, "https://cards.scryfall.io/normal/front/6/8/68fddb6a-86d4-4ebb-907d-fdcaadebc4b3.jpg?1789556898"],
      ["Solarium Sentry", "FRA", "rare", "main", "{G}{W}", ["G", "W"], 2.0, false, "https://cards.scryfall.io/normal/front/1/e/1ef12dcf-df50-4da6-8c4c-e2937ba9698e.jpg?1789127651"],
      ["Solitary Cell", "FRA", "rare", "main", "{R}{W}", ["R", "W"], 2.0, false, "https://cards.scryfall.io/normal/front/5/1/5142bbb6-194c-4b12-b11a-1a21c9fe81a6.jpg?1790558834"],
      ["Stingerquill Charm", "FRA", "uncommon", "main", "{B}{R}", ["B", "R"], 2.0, false, "https://cards.scryfall.io/normal/front/8/1/81733ff7-e611-43ee-bf38-6bb700676017.jpg?1789127652"],
      ["Stingerquill Voxmancer", "FRA", "uncommon", "main", "{B/R}", ["B", "R"], 1.0, false, "https://cards.scryfall.io/normal/front/8/4/84b1c268-3b8a-41b6-92e3-a2ce0cc3d738.jpg?1788329418"],
      ["Stinging Vitriol", "FRA", "rare", "main", "{B}{R}", ["B", "R"], 2.0, false, "https://cards.scryfall.io/normal/front/a/7/a7d78297-7411-4ec5-8931-a25146869d5b.jpg?1789385971"],
      ["Tam's Resistance", "FRA", "common", "main", "{1}{G/U}", ["G", "U"], 2.0, false, "https://cards.scryfall.io/normal/front/b/3/b3d33df2-a77b-4c2e-ba7f-2cc9c1505f9b.jpg?1788878215"],
      ["Tenured Tethermage", "FRA", "rare", "main", "{1}{R}{G}", ["G", "R"], 3.0, false, "https://cards.scryfall.io/normal/front/1/7/1703306d-6a3d-4ab8-bf58-a9992236ef0f.jpg?1789385792"],
      ["Theorix Charm", "FRA", "uncommon", "main", "{U}{B}", ["B", "U"], 2.0, false, "https://cards.scryfall.io/normal/front/2/8/2835c9aa-0904-44db-8da2-e8c4e04201aa.jpg?1789127659"],
      ["Theorix Metamage", "FRA", "common", "main", "{2}{U/B}", ["B", "U"], 3.0, false, "https://cards.scryfall.io/normal/front/f/b/fb6bad96-841d-4738-8e62-92f346f914fd.jpg?1789556930"],
      ["Twinned Vision", "FRA", "common", "main", "{1}{U/R}", ["R", "U"], 2.0, false, "https://cards.scryfall.io/normal/front/5/5/55f85984-0137-4899-8993-bbc8c4794d33.jpg?1789556940"],
      ["Twisted Fates", "FRA", "uncommon", "main", "{2}{W}{W}{B}", ["B", "W"], 5.0, false, "https://cards.scryfall.io/normal/front/c/7/c7c0765d-38fd-4d7b-bfb4-49b10ff5939b.jpg?1789614785"],
      ["Uldaros Theorix", "FRA", "mythic", "main", "{3}{U}{B}{B}", ["B", "U"], 6.0, false, "https://cards.scryfall.io/normal/front/a/7/a7ad622a-42ff-48fa-ae95-12e0a5bd9387.jpg?1788878220"],
      ["Vigorbloom Charm", "FRA", "uncommon", "main", "{G}{W}", ["G", "W"], 2.0, false, "https://cards.scryfall.io/normal/front/2/b/2b198e10-b507-4314-a29c-a219f06e48b7.jpg?1789127656"],
      ["Vigorbloom Vanguard", "FRA", "uncommon", "main", "{1}{G/W}", ["G", "W"], 2.0, false, "https://cards.scryfall.io/normal/front/a/c/acefc515-bf97-4dc0-b0f7-ae8ae5a61671.jpg?1788329423"],
      ["Vindictive Triumph", "FRA", "rare", "main", "{W}{B}{B}", ["B", "W"], 3.0, false, "https://cards.scryfall.io/normal/front/a/8/a803dbe7-153a-4e92-ad4d-c2babebe003d.jpg?1790558815"],
      ["Warrior's Blades", "FRA", "uncommon", "main", "{2}{R}{W}", ["R", "W"], 4.0, false, "https://cards.scryfall.io/normal/front/c/6/c63d5b0e-ee72-42ed-aa7e-484ba84507cd.jpg?1789007648"],
      ["Whiplash Wordsmith", "FRA", "common", "main", "{3}{B/R}", ["B", "R"], 4.0, false, "https://cards.scryfall.io/normal/front/8/0/8096bc9a-a610-448f-bef2-7230e17e9777.jpg?1789127692"],
      ["Woodwork Prodigy", "FRA", "uncommon", "main", "{2}{R/G}", ["G", "R"], 3.0, false, "https://cards.scryfall.io/normal/front/7/d/7d17f7e3-7b63-4674-9024-4fd1827f40ec.jpg?1788329429"],
      ["Afterthought Sentry", "FRA", "common", "main", "{2}", [], 2.0, false, "https://cards.scryfall.io/normal/front/4/d/4d4b3bf7-a149-4099-b97d-4e36a87dfa60.jpg?1789385875"],
      ["Archive Arbiter", "FRA", "uncommon", "main", "{6}", [], 6.0, false, "https://cards.scryfall.io/normal/front/0/2/024bce1e-a5f3-4292-bc17-d0355a5d65e1.jpg?1789614867"],
      ["Codie, Ravenous Codex", "FRA", "rare", "main", "{3}", [], 3.0, false, "https://cards.scryfall.io/normal/front/c/3/c3192390-1518-49fc-8716-f2c7a0384f39.jpg?1789646811"],
      ["The Echoverse Fulcrum", "FRA", "mythic", "main", "{2}", [], 2.0, false, "https://cards.scryfall.io/normal/front/d/7/d71d250f-c0e0-44b2-877c-76f3bcab4f34.jpg?1789385887"],
      ["Eye of Jace", "FRA", "uncommon", "main", "{1}", [], 1.0, false, "https://cards.scryfall.io/normal/front/0/e/0edba64a-39cf-4a8d-ba20-4f7da10b6c3d.jpg?1789614864"],
      ["Keeper of the Quiet Hour", "FRA", "common", "main", "{3}", [], 3.0, false, "https://cards.scryfall.io/normal/front/b/6/b6331218-dbb8-44a9-8ba5-5fb1ab41c5c0.jpg?1788878239"],
      ["Living Library", "FRA", "common", "main", "{2}", [], 2.0, false, "https://cards.scryfall.io/normal/front/5/d/5d4a8e5f-0024-4da3-a2f5-edb48b12e733.jpg?1789556949"],
      ["Medic's Kitesail", "FRA", "common", "main", "{2}", [], 2.0, false, "https://cards.scryfall.io/normal/front/8/b/8b07409a-1dce-461d-95e4-1130521ff4c4.jpg?1789556945"],
      ["Murmuring Volume", "FRA", "common", "main", "{3}", [], 3.0, false, "https://cards.scryfall.io/normal/front/d/6/d68eab2e-89dd-4377-b7af-01512b1804a0.jpg?1789385977"],
      ["Dedicated Commons", "FRA", "common", "dual", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/3/2/3223e5db-5cc4-42f9-ae9e-ff58abc7c390.jpg?1789556950"],
      ["Deserted Beach", "FRA", "rare", "main", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/5/6/56dae4c4-3e71-4a32-979b-4e26d9c9e96c.jpg?1788878239"],
      ["Fatehold Annex", "FRA", "common", "dual", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/5/1/5140f962-62f3-40fd-a322-44896c7e2613.jpg?1789556955"],
      ["Formidable Commons", "FRA", "common", "dual", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/e/6/e6ca6c3e-f145-42d6-8a17-90770c15afaf.jpg?1789556960"],
      ["Hall of Echoes", "FRA", "rare", "main", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/4/a/4a771010-b397-4849-ac9b-08e4dd5d6a72.jpg?1789644859"],
      ["Haunted Ridge", "FRA", "rare", "main", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/a/4/a4e4966b-8963-4fac-a8bf-e778e063c7dd.jpg?1788878241"],
      ["Hexhaven Dueling Arena", "FRA", "uncommon", "main", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/9/1/9128ce00-6744-4d36-bfbe-ef75d78110b0.jpg?1789556985"],
      ["Innovative Commons", "FRA", "common", "dual", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/8/4/84ea799a-faa2-4ff1-a933-432d4ee31a3b.jpg?1789556991"],
      ["Konstrari Annex", "FRA", "common", "dual", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/3/9/39c805e3-82cd-42a9-80fe-8d81712a94ea.jpg?1789556993"],
      ["Meticulous Commons", "FRA", "common", "dual", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/9/3/93ac525e-1919-43dd-aba4-073b7e4c1768.jpg?1789557002"],
      ["Overgrown Farmland", "FRA", "rare", "main", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/1/7/178e61e4-472f-42cd-9d3b-4880c2acc527.jpg?1788878246"],
      ["Rockfall Vale", "FRA", "rare", "main", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/e/3/e3c8a8b6-23ba-45ad-80d1-8e2dc79897f7.jpg?1788878243"],
      ["Roiling Canopy", "FRA", "rare", "main", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/d/b/db61361b-bd12-453e-abc2-bbe09b66e3d9.jpg?1789514074"],
      ["Room of Refuge", "FRA", "common", "main", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/9/a/9a467560-6676-4fc2-9400-768a79650aa4.jpg?1789557010"],
      ["Shipwreck Marsh", "FRA", "rare", "main", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/9/e/9e944c5b-68ac-4a30-bbd4-09a4288319ce.jpg?1788878245"],
      ["Stingerquill Annex", "FRA", "common", "dual", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/6/e/6ede3143-69ac-4cbe-922a-d25b07c26da7.jpg?1789557046"],
      ["Theorist's Sanctum", "FRA", "rare", "main", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/2/2/22db5bba-46c9-4a26-821d-303ddb386ea4.jpg?1788878256"],
      ["Theorix Annex", "FRA", "common", "dual", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/9/7/97bbbd23-ecb1-4407-ac14-dede08532a1e.jpg?1789557008"],
      ["Transformative Commons", "FRA", "common", "dual", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/b/5/b57d5be7-3157-4b49-aeb8-d7368ca7e9dd.jpg?1789557014"],
      ["Vigorbloom Annex", "FRA", "common", "dual", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/d/b/db8c7bdd-76cd-4be0-ae0d-d430e9a5fe7a.jpg?1789557019"],
      ["Ajani Resolute", "FRA", "mythic", "echo", "{1}{W}", ["W"], 2.0, false, "https://cards.scryfall.io/normal/front/a/5/a5e1a7dd-8c49-4435-935c-bcc78704082b.jpg?1788329189"],
      ["Danitha, Sword of Hope", "FRA", "uncommon", "echo", "{2}{W}", ["W"], 3.0, false, "https://cards.scryfall.io/normal/front/d/5/d5cb9810-3c2d-4ae4-b8b6-0155ca3f47ad.jpg?1789127178"],
      ["Ghalta the Immovable", "FRA", "uncommon", "echo", "{8}{W}", ["W"], 9.0, false, "https://cards.scryfall.io/normal/front/a/9/a9f3aa55-908f-42db-8135-4201433df850.jpg?1789014423"],
      ["Gideon's Memorial", "FRA", "rare", "echo", "{1}{W}", ["W"], 2.0, false, "https://cards.scryfall.io/normal/front/7/6/768c0e64-9907-417a-a763-c836fdf36883.jpg?1789127685"],
      ["Koth of the Homestead", "FRA", "uncommon", "echo", "{2}{W}", ["W"], 3.0, false, "https://cards.scryfall.io/normal/front/9/2/920703fd-2a2f-454b-8829-af8f2afda4f4.jpg?1789568532"],
      ["Liliana the Faultless", "FRA", "rare", "echo", "{W}", ["W"], 1.0, false, "https://cards.scryfall.io/normal/front/7/0/70d8c400-87dc-4f15-808f-e54a95d779fc.jpg?1788329194"],
      ["Lyra, Archangel of Dawn", "FRA", "rare", "echo", "{2}{W}", ["W"], 3.0, false, "https://cards.scryfall.io/normal/front/8/6/86a3866e-68a8-402c-baf0-1908e98e3995.jpg?1789127693"],
      ["Rescue Girl, First Responder", "FRA", "uncommon", "echo", "{2}{W}", ["W"], 3.0, false, "https://cards.scryfall.io/normal/front/6/9/699874e3-1ccf-4a6c-8371-61040de82d08.jpg?1789645598"],
      ["Saheeli, Consul of Oversight", "FRA", "uncommon", "echo", "{3}{W}{W}", ["W"], 5.0, false, "https://cards.scryfall.io/normal/front/0/7/07572be0-6610-493c-a21e-14b78e9805c9.jpg?1789645608"],
      ["Teyo, Lightshield Expert", "FRA", "uncommon", "echo", "{1}{W}", ["W"], 2.0, false, "https://cards.scryfall.io/normal/front/5/f/5f7521d7-9f1f-4f03-b2ea-dd2a1b1e4e5b.jpg?1789471515"],
      ["Thalia, the Survivor", "FRA", "uncommon", "echo", "{3}{W}", ["W"], 4.0, false, "https://cards.scryfall.io/normal/front/8/0/80226231-9e70-430e-aabc-f262f70b9226.jpg?1789127700"],
      ["Tomik, Orzhov Lawmage", "FRA", "uncommon", "echo", "{1}{W}", ["W"], 2.0, false, "https://cards.scryfall.io/normal/front/7/c/7ca95235-6e54-4ff8-bc2e-6a3d483ff007.jpg?1789729766"],
      ["Way of the Healer", "FRA", "uncommon", "echo", "{3}{W}", ["W"], 4.0, false, "https://cards.scryfall.io/normal/front/5/0/50326a2a-7e10-464b-a97e-e880bda0558c.jpg?1789729503"],
      ["Way of the Mentor", "FRA", "uncommon", "echo", "{2}{W}", ["W"], 3.0, false, "https://cards.scryfall.io/normal/front/1/a/1a59d5b1-12d6-486b-bd29-ca371359addd.jpg?1789729554"],
      ["Yoshimaru, Beloved Companion", "FRA", "uncommon", "echo", "{2}{W}", ["W"], 3.0, false, "https://cards.scryfall.io/normal/front/3/8/384f3b7d-8d7f-41bf-bebd-64e8babe7fca.jpg?1789470881"],
      ["Yuriko, Blade of the Mighty", "FRA", "uncommon", "echo", "{3}{W}", ["W"], 4.0, false, "https://cards.scryfall.io/normal/front/c/c/ccbe92a5-42bc-4228-9d5a-212df2f5dc15.jpg?1789128047"],
      ["Arni, Humble Scribe", "FRA", "uncommon", "echo", "{2}{U}", ["U"], 3.0, false, "https://cards.scryfall.io/normal/front/8/e/8e3a2239-9348-4639-9318-e9e35b2cf86b.jpg?1789568409"],
      ["Chandra, Chill of Compliance", "FRA", "mythic", "echo", "{1}{U}{U}", ["U"], 3.0, false, "https://cards.scryfall.io/normal/front/2/4/240f58ab-944c-4f4c-9df9-5f40b132bf3e.jpg?1788329242"],
      ["Fblthp, Impossibly Lost", "FRA", "uncommon", "echo", "{1}{U}", ["U"], 2.0, false, "https://cards.scryfall.io/normal/front/a/3/a3a2edbb-d144-4670-acad-17316cea98d2.jpg?1789127697"],
      ["Geist of Saint Thalia", "FRA", "uncommon", "echo", "{1}{U}", ["U"], 2.0, false, "https://cards.scryfall.io/normal/front/9/c/9c334530-0880-46b5-a358-9603eee3cecf.jpg?1789128026"],
      ["Hapatra, the Desert Frost", "FRA", "uncommon", "echo", "{3}{U}", ["U"], 4.0, false, "https://cards.scryfall.io/normal/front/8/5/85faaa9d-4656-4365-871d-7cba53ed0996.jpg?1789387113"],
      ["Jace, Reality Sculptor", "FRA", "rare", "echo", "{3}{U}{U}", ["U"], 5.0, false, "https://cards.scryfall.io/normal/front/7/4/74087795-0b38-4fd2-9841-147583baca41.jpg?1790075861"],
      ["Lyra, Tolarian Archangel", "FRA", "rare", "echo", "{1}{U}{U}", ["U"], 3.0, false, "https://cards.scryfall.io/normal/front/a/5/a5183681-447b-4023-91f7-00e9338f4417.jpg?1789128032"],
      ["Proft, Consulting Detective", "FRA", "uncommon", "echo", "{1}{U}", ["U"], 2.0, false, "https://cards.scryfall.io/normal/front/b/8/b8466593-40fe-4557-89b2-760c1c92087b.jpg?1789127178"],
      ["Ruric Thar, Biomagus", "FRA", "uncommon", "echo", "{4}{U}{U}", ["U"], 6.0, false, "https://cards.scryfall.io/normal/front/0/0/00af4e87-5576-4a43-9422-4c35b2b66775.jpg?1789127229"],
      ["Samut, Tyrant of Naktamun", "FRA", "rare", "echo", "{1}{U}", ["U"], 2.0, false, "https://cards.scryfall.io/normal/front/6/d/6d7d8fa7-ce69-4a8c-9af0-55571393a244.jpg?1789729644"],
      ["Tetsuko Umezawa, Fugitive", "FRA", "uncommon", "echo", "{1}{U}", ["U"], 2.0, false, "https://cards.scryfall.io/normal/front/3/9/3983d71e-3c23-4b36-b331-08e0707d8245.jpg?1789127702"],
      ["Traxos, Academy Guardian", "FRA", "uncommon", "echo", "{3}{U}", ["U"], 4.0, false, "https://cards.scryfall.io/normal/front/a/3/a349800f-b634-4e74-a9d9-185df37ad909.jpg?1789568451"],
      ["Way of the Cryomancer", "FRA", "uncommon", "echo", "{2}{U}", ["U"], 3.0, false, "https://cards.scryfall.io/normal/front/8/3/838b0efb-7398-4df9-8fdf-b8af43b47938.jpg?1789014637"],
      ["Way of the Mind Sculptor", "FRA", "uncommon", "echo", "{4}{U}", ["U"], 5.0, false, "https://cards.scryfall.io/normal/front/5/8/5838af68-66c3-4fe8-ab89-0a1721b0cfeb.jpg?1789729565"],
      ["Yargle, Goliath of Otaria", "FRA", "uncommon", "echo", "{4}{U}", ["U"], 5.0, false, "https://cards.scryfall.io/normal/front/f/4/f45ba926-6496-4bd4-96eb-663946d56bbf.jpg?1789128043"],
      ["Yuriko, Hope from the Shadows", "FRA", "uncommon", "echo", "{U}", ["U"], 1.0, false, "https://cards.scryfall.io/normal/front/4/5/45e81487-8b8c-480b-922a-eaa9edc7201d.jpg?1789127717"],
      ["Danitha, Spear of Agony", "FRA", "uncommon", "echo", "{2}{B}", ["B"], 3.0, false, "https://cards.scryfall.io/normal/front/6/4/6489814b-3d10-423e-988c-324740d36748.jpg?1789127194"],
      ["Gallia, Tragic Host", "FRA", "uncommon", "echo", "{1}{B}", ["B"], 2.0, false, "https://cards.scryfall.io/normal/front/4/9/498fa810-8522-4020-b773-52ad404c9f65.jpg?1789385697"],
      ["Garruk, Veiled Butcher", "FRA", "mythic", "echo", "{3}{B}{B}", ["B"], 5.0, false, "https://cards.scryfall.io/normal/front/d/4/d48bfb8a-d135-45f3-be99-4694b4b9ab93.jpg?1788329269"],
      ["Gideon the Oathless", "FRA", "rare", "echo", "{2}{B}", ["B"], 3.0, false, "https://cards.scryfall.io/normal/front/c/9/c985b0d1-25bd-4069-aab7-a566ff27a8f6.jpg?1789127990"],
      ["Liliana the Repentant", "FRA", "rare", "echo", "{1}{B}", ["B"], 2.0, false, "https://cards.scryfall.io/normal/front/1/e/1eb25a6c-d6b4-465d-990e-f1ab86b26b69.jpg?1788329273"],
      ["Loot, the Anomaly", "FRA", "uncommon", "echo", "{2}{B}", ["B"], 3.0, false, "https://cards.scryfall.io/normal/front/4/f/4f6fd2fa-8bc8-4743-bbc8-b56475d64eff.jpg?1789568430"],
      ["Mabel, Bitter Recluse", "FRA", "uncommon", "echo", "{B}", ["B"], 1.0, false, "https://cards.scryfall.io/normal/front/b/2/b2a412b0-2ae4-4552-bc5e-70654b6b9b4e.jpg?1789385677"],
      ["Massacre Girl, Most Wanted", "FRA", "uncommon", "echo", "{4}{B}", ["B"], 5.0, false, "https://cards.scryfall.io/normal/front/9/0/9028d31f-9c41-47e3-885b-6a869bca8178.jpg?1789644882"],
      ["Proft, Sinister Mastermind", "FRA", "uncommon", "echo", "{2}{B}", ["B"], 3.0, false, "https://cards.scryfall.io/normal/front/d/3/d36b0e06-cb82-4c48-bf35-e76f109116f6.jpg?1789127196"],
      ["Teyo, Diamondblade Mage", "FRA", "uncommon", "echo", "{3}{B}", ["B"], 4.0, false, "https://cards.scryfall.io/normal/front/1/0/100c3b67-0c92-4224-b5ed-67789c612df7.jpg?1789470892"],
      ["Tinybones, Pocket Nuisance", "FRA", "uncommon", "echo", "{2}{B}", ["B"], 3.0, false, "https://cards.scryfall.io/normal/front/2/f/2f47ddf7-35b6-4205-8045-f057914c5f64.jpg?1788329294"],
      ["Way of the Deathbringer", "FRA", "uncommon", "echo", "{2}{B}", ["B"], 3.0, false, "https://cards.scryfall.io/normal/front/1/2/12dd46b2-e892-4660-b120-55766fd4d878.jpg?1789729576"],
      ["Way of the Necromancer", "FRA", "uncommon", "echo", "{1}{B}", ["B"], 2.0, false, "https://cards.scryfall.io/normal/front/a/0/a0ff9689-ea49-4fff-b37c-4abbaeb0f73d.jpg?1789729526"],
      ["Winter, Tormented Loner", "FRA", "uncommon", "echo", "{2}{B}", ["B"], 3.0, false, "https://cards.scryfall.io/normal/front/9/6/9670f754-f41f-45ac-8e8b-025ad2c0f66b.jpg?1789127724"],
      ["Yargle, Glutton of Urborg", "FRA", "uncommon", "echo", "{4}{B}", ["B"], 5.0, false, "https://cards.scryfall.io/normal/front/0/4/04c816fb-5951-4db1-8834-ed3f0b36bfe1.jpg?1789127722"],
      ["Ajani Unrelenting", "FRA", "mythic", "echo", "{4}{R}{R}", ["R"], 6.0, false, "https://cards.scryfall.io/normal/front/b/c/bc3c096f-7f6c-474c-a2c8-75d3e6ddd6f5.jpg?1788329317"],
      ["Arni, Renowned Champion", "FRA", "uncommon", "echo", "{3}{R}", ["R"], 4.0, false, "https://cards.scryfall.io/normal/front/b/d/bd8db649-1dba-457d-8327-e1f1da1aab36.jpg?1789557035"],
      ["Chandra, Torch of Defiance", "FRA", "mythic", "echo", "{2}{R}{R}", ["R"], 4.0, false, "https://cards.scryfall.io/normal/front/4/0/40cb22c8-cb03-45c9-bb0e-b8cabdcc43cd.jpg?1788329325"],
      ["Gallia, the Merrymaker", "FRA", "uncommon", "echo", "{1}{R}", ["R"], 2.0, false, "https://cards.scryfall.io/normal/front/f/2/f27d50f0-d76e-4ce1-a8d9-d997af6a5b41.jpg?1789385716"],
      ["Jiang Yanggu, Alone", "FRA", "uncommon", "echo", "{4}{R}", ["R"], 5.0, false, "https://cards.scryfall.io/normal/front/e/8/e8c1ce21-b77d-40bf-9ed1-478604e71f5f.jpg?1789014416"],
      ["Kiora of Fire and Ashes", "FRA", "uncommon", "echo", "{4}{R}{R}", ["R"], 6.0, false, "https://cards.scryfall.io/normal/front/0/8/08657053-86f9-4c52-abf0-d9cdd443ae3b.jpg?1789127995"],
      ["Koth, the Geomancer", "FRA", "uncommon", "echo", "{2}{R}", ["R"], 3.0, false, "https://cards.scryfall.io/normal/front/5/4/54f64e95-5a97-4d7c-9939-7f33a3165562.jpg?1789470892"],
      ["Marwyn, the Clearcutter", "FRA", "uncommon", "echo", "{R}", ["R"], 1.0, false, "https://cards.scryfall.io/normal/front/f/9/f93da73c-ca8b-438e-8387-6109dac3fc1a.jpg?1789644549"],
      ["Pia, Determined Rebuilder", "FRA", "uncommon", "echo", "{2}{R}", ["R"], 3.0, false, "https://cards.scryfall.io/normal/front/d/d/dd3faaf4-45ca-4714-8dbe-37102ec131cf.jpg?1789385851"],
      ["Samut, Hazoret's Champion", "FRA", "rare", "echo", "{1}{R}", ["R"], 2.0, false, "https://cards.scryfall.io/normal/front/b/a/ba920f23-f05c-410e-8516-c93abedf1d4d.jpg?1789729662"],
      ["Tetsuko Umezawa, Pursuer", "FRA", "uncommon", "echo", "{3}{R}", ["R"], 4.0, false, "https://cards.scryfall.io/normal/front/d/f/df818900-ce5e-4b0d-a927-c975cbef7eda.jpg?1789128002"],
      ["Tomik, Izzet Sparkmage", "FRA", "uncommon", "echo", "{1}{R}", ["R"], 2.0, false, "https://cards.scryfall.io/normal/front/5/c/5c5afd5f-6f37-4c3e-83f0-68fdcea98810.jpg?1789729773"],
      ["Way of the Pyromancer", "FRA", "uncommon", "echo", "{1}{R}", ["R"], 2.0, false, "https://cards.scryfall.io/normal/front/c/1/c1a00020-7c14-4503-a057-5763704bb83e.jpg?1788878311"],
      ["Way of the Warlord", "FRA", "uncommon", "echo", "{2}{R}", ["R"], 3.0, false, "https://cards.scryfall.io/normal/front/6/d/6d86e410-20c4-4248-96bf-5780ece6274a.jpg?1789729585"],
      ["Winter, Team Player", "FRA", "uncommon", "echo", "{4}{R}", ["R"], 5.0, false, "https://cards.scryfall.io/normal/front/d/f/df8713cd-3f4b-43ef-adbd-e37c2617c617.jpg?1789128020"],
      ["Edgar, Moonlit Sovereign", "FRA", "uncommon", "echo", "{3}{G}{G}", ["G"], 5.0, false, "https://cards.scryfall.io/normal/front/d/a/dad6afc9-8505-4cdd-bf79-e9ba4670f2bb.jpg?1789127966"],
      ["Fblthp, Knows the Way", "FRA", "uncommon", "echo", "{X}{G}{G}", ["G"], 2.0, false, "https://cards.scryfall.io/normal/front/2/8/28fbb55a-5c9d-45ee-bf42-a84b1048f5d2.jpg?1789127976"],
      ["Garruk, Curse Breaker", "FRA", "mythic", "echo", "{3}{G}{G}", ["G"], 5.0, false, "https://cards.scryfall.io/normal/front/9/0/90ca5812-ceb5-46bd-b049-aed7ff10e6af.jpg?1788329370"],
      ["Ghalta the Unstoppable", "FRA", "uncommon", "echo", "{8}{G}", ["G"], 9.0, false, "https://cards.scryfall.io/normal/front/1/d/1d535b5f-c916-4f16-89a7-9477578826d2.jpg?1788878290"],
      ["Jiang Yanggu, Never Alone", "FRA", "uncommon", "echo", "{3}{G}", ["G"], 4.0, false, "https://cards.scryfall.io/normal/front/f/5/f5a0bb3e-8119-4739-8684-e61d1d607dcb.jpg?1789014406"],
      ["Loot, the Nexus", "FRA", "uncommon", "echo", "{2}{G}", ["G"], 3.0, false, "https://cards.scryfall.io/normal/front/3/c/3cfa4fc6-4d90-4576-a83f-6496c7f21104.jpg?1789614764"],
      ["Marwyn, the Preserver", "FRA", "uncommon", "echo", "{1}{G}", ["G"], 2.0, false, "https://cards.scryfall.io/normal/front/9/0/90f33f99-7bc5-42e1-815e-bfb4c2b74107.jpg?1789644564"],
      ["Pia, Aether Ascetic", "FRA", "uncommon", "echo", "{2}{G}", ["G"], 3.0, false, "https://cards.scryfall.io/normal/front/f/f/ff0bc30f-9d20-458e-808f-bdc2825905a5.jpg?1789387120"],
      ["Ruric Thar, Magecrusher", "FRA", "uncommon", "echo", "{5}{G}{G}", ["G"], 7.0, false, "https://cards.scryfall.io/normal/front/e/e/eed83302-dc2c-45f4-a4bd-af9da51edef5.jpg?1789358701"],
      ["Titanbones, Towering Heart", "FRA", "uncommon", "echo", "{3}{G}", ["G"], 4.0, false, "https://cards.scryfall.io/normal/front/e/d/edea6f70-a5a7-475d-b7f2-97933d0f32cf.jpg?1788329375"],
      ["Way of the Paradox", "FRA", "uncommon", "echo", "{2}{G}", ["G"], 3.0, false, "https://cards.scryfall.io/normal/front/9/8/98dc5470-507a-4364-8480-42607255e56c.jpg?1789729606"],
      ["Way of the Wildspeaker", "FRA", "uncommon", "echo", "{4}{G}", ["G"], 5.0, false, "https://cards.scryfall.io/normal/front/a/2/a252cb01-537b-4afe-9abc-81a98c4a1439.jpg?1789729602"],
      ["Yoshimaru, Scrappy Stray", "FRA", "uncommon", "echo", "{1}{G}", ["G"], 2.0, false, "https://cards.scryfall.io/normal/front/b/8/b8dfd087-2434-42c6-ac4c-1decbcdde2db.jpg?1789470909"],
      ["Edgar, Ancient Bloodlord", "FRA", "uncommon", "echo", "{W}{B}", ["B", "W"], 2.0, false, "https://cards.scryfall.io/normal/front/7/c/7c619fed-2394-4efc-8cdc-6df5f51c1f57.jpg?1789127743"],
      ["Hapatra, the Desert Fang", "FRA", "uncommon", "echo", "{2}{B}{B}{G}", ["B", "G"], 5.0, false, "https://cards.scryfall.io/normal/front/c/f/cf7c1534-af41-4991-b3c3-f0a34ae330b5.jpg?1789385991"],
      ["Karn, Gilded Guardian", "FRA", "rare", "echo", "{2/W}{2/U}{2/B}{2/R}{2/G}", ["B", "G", "R", "U", "W"], 10.0, false, "https://cards.scryfall.io/normal/front/3/a/3abcae65-5b21-4c98-adad-34b8bc76ea3a.jpg?1789014541"],
      ["Kiora of Salt and Sand", "FRA", "uncommon", "echo", "{1}{G}{U}", ["G", "U"], 3.0, false, "https://cards.scryfall.io/normal/front/8/1/8151f5f5-e9f6-4fbe-b543-f456ebf22aa5.jpg?1789127745"],
      ["Mabel, Valley Hero", "FRA", "uncommon", "echo", "{1}{R}{W}", ["R", "W"], 3.0, false, "https://cards.scryfall.io/normal/front/4/7/47abea4b-9848-48aa-bc1b-f04f4799e920.jpg?1790135467"],
      ["Saheeli, Jewel of Avishkar", "FRA", "uncommon", "echo", "{2}{U}{R}", ["R", "U"], 4.0, false, "https://cards.scryfall.io/normal/front/2/8/28d84ef6-e190-46d4-882d-1cea5e111e2a.jpg?1789644883"],
      ["Tam, the Possibility", "FRA", "rare", "echo", "{1}{G}{U}", ["G", "U"], 3.0, false, "https://cards.scryfall.io/normal/front/6/5/6529d399-677e-45a6-ac3e-12a0b10f6c37.jpg?1789644886"],
      ["Vraska, Soul of Stone", "FRA", "rare", "echo", "{U}{R}{W}", ["R", "U", "W"], 3.0, false, "https://cards.scryfall.io/normal/front/f/3/f3869752-eade-4e7a-8dd1-68cafb9e10be.jpg?1789128008"],
      ["Vraska, the Cutting Glare", "FRA", "rare", "echo", "{B}{B}{G}", ["B", "G"], 3.0, false, "https://cards.scryfall.io/normal/front/5/c/5c28b012-5efb-488f-a1c1-09e2dddfd6ee.jpg?1789127776"],
      ["Karn, Argent Defender", "FRA", "rare", "echo", "{2}", [], 2.0, false, "https://cards.scryfall.io/normal/front/1/e/1ebbbddb-2dc3-4194-b72b-13bcebe2ab89.jpg?1788878301"],
      ["Traxos, Scourge Eternal", "FRA", "uncommon", "echo", "{4}", [], 4.0, false, "https://cards.scryfall.io/normal/front/0/5/05102c46-96f8-44a0-a1e6-e388fa5e0841.jpg?1789557046"],
      ["Plains", "FRA", "common", "basic", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/a/4/a4eaecb8-066a-4c72-aa5d-5ed0614ba537.jpg?1789599702"],
      ["Island", "FRA", "common", "basic", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/d/8/d8184e92-54e6-4ddc-86e8-67f5c5eb079d.jpg?1789599732"],
      ["Swamp", "FRA", "common", "basic", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/3/0/30693b85-550d-4c98-8c5b-4fd4e91c9f28.jpg?1789599699"],
      ["Mountain", "FRA", "common", "basic", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/1/6/16671d98-6f00-477b-a010-d2905c94eb65.jpg?1789599693"],
      ["Forest", "FRA", "common", "basic", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/6/1/613bc075-2fe4-421f-bfec-3786a5e37797.jpg?1789729776"],
      ["Austere Command", "SPG", "mythic", "guest", "{4}{W}{W}", ["W"], 6.0, false, "https://cards.scryfall.io/normal/front/6/6/66ddce56-3d5c-4a9d-af27-56cc01b30c25.jpg?1788922537"],
      ["Consider", "SPG", "mythic", "guest", "{U}", ["U"], 1.0, false, "https://cards.scryfall.io/normal/front/8/f/8fcce60c-6baa-4f55-907a-4acc2a597030.jpg?1788922586"],
      ["Consign to Memory", "SPG", "mythic", "guest", "{U}", ["U"], 1.0, false, "https://cards.scryfall.io/normal/front/e/c/ec9ffeac-ae49-465e-9dc5-976db8252fe6.jpg?1788922549"],
      ["Eye of Ugin", "SPG", "mythic", "guest", "", [], 0.0, true, "https://cards.scryfall.io/normal/front/c/9/c9c6977d-0e14-47c1-89c0-be376f2675f3.jpg?1788922526"],
      ["Flesh Duplicate", "SPG", "mythic", "guest", "{U}{U}", ["U"], 2.0, false, "https://cards.scryfall.io/normal/front/c/1/c12dd88f-ce9a-445c-882a-62e7695e39df.jpg?1788922543"],
      ["Mind Twist", "SPG", "mythic", "guest", "{X}{B}", ["B"], 1.0, false, "https://cards.scryfall.io/normal/front/0/a/0ab1e081-47b1-4d53-a820-98c451e6440d.jpg?1788922604"],
      ["Necrodominance", "SPG", "mythic", "guest", "{B}{B}{B}", ["B"], 3.0, false, "https://cards.scryfall.io/normal/front/4/f/4f981c28-9134-45e8-8687-94b3c81ba582.jpg?1788922592"],
      ["Root Maze", "SPG", "mythic", "guest", "{G}", ["G"], 1.0, false, "https://cards.scryfall.io/normal/front/0/7/07bf6e66-b146-4db3-b2ab-f7b199acbe27.jpg?1788922621"],
      ["Splinter Twin", "SPG", "mythic", "guest", "{2}{R}{R}", ["R"], 4.0, false, "https://cards.scryfall.io/normal/front/a/0/a0c1323f-d468-4d8a-beed-5077d91b86d9.jpg?1788922613"],
      ["Sublime Epiphany", "SPG", "mythic", "guest", "{4}{U}{U}", ["U"], 6.0, false, "https://cards.scryfall.io/normal/front/1/b/1bf992ff-b7a1-48d9-a7e1-89a48d743fc2.jpg?1788922580"]
    ]
  };
  if (typeof module !== "undefined" && module.exports) module.exports = catalog;
  else root.FRA_CATALOG = catalog;
})(globalThis);
