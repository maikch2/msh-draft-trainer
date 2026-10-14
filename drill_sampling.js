/* Shared by the trainer and public drill API. No dependency on browser state. */
(function(root) {
  "use strict";
  const rarityWeights = Object.freeze({common:9, uncommon:3, rare:0.9, mythic:0.18, special:0.5});
  const cardWeight = c => c.set === "MAR" ? 0.35 : (rarityWeights[c.rarity] ?? 1);
  function missMultiplier(card, history = {}) {
    const entry = history[card.id];
    return entry ? Math.min(7, 0.5 + 1.6 * entry[0]) : 1.25;
  }
  function weightedPick(cards, previous, weight = cardWeight, random = Math.random) {
    if (!cards.length) return null;
    const weights = cards.map(c => c.id === previous?.id ? 0 : weight(c));
    const total = weights.reduce((a,b) => a+b, 0);
    if (total <= 0) return cards[Math.floor(random() * cards.length)];
    let roll = random() * total;
    for (let i = 0; i < cards.length; i++) {
      if (!weights[i]) continue;
      roll -= weights[i];
      if (roll < 0) return cards[i];
    }
    return cards[weights.findLastIndex(w => w > 0)];
  }
  function next(cards, previous = null, history = {}, random = Math.random) {
    return weightedPick(cards, previous, c => cardWeight(c) * missMultiplier(c, history), random);
  }
  function batch(cards, count, history = {}, previousId = null, random = Math.random) {
    const rated = cards.filter(c => c.score != null).slice().sort((a,b) => b.score-a.score);
    if (rated.length < 2) throw new Error("At least two rated cards are required.");
    let previous = rated.find(c => String(c.id) === String(previousId)) || null;
    return Array.from({length:count}, () => (previous = next(rated, previous, history, random)));
  }
  const api = { rarityWeights, cardWeight, missMultiplier, weightedPick, next, batch };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DRILL_SAMPLING = api;
})(globalThis);
