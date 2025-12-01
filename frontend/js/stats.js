document.addEventListener("DOMContentLoaded", async () => {

  // 1. Anzahl Sets
  const s1 = await fetch(`${API_URL}/stats/totalsets`);
  const totalSets = await s1.json();
  document.getElementById("totalSets").innerHTML =
    `📦 Gesamtzahl Lernsets: <b>${totalSets.totalSets}</b>`;

  // 2. Anzahl Karten
  const s2 = await fetch(`${API_URL}/stats/totalcards`);
  const totalCards = await s2.json();
  document.getElementById("totalCards").innerHTML =
    `🃏 Gesamtzahl Karten: <b>${totalCards.totalCards}</b>`;

  // 3. Top Sets
  const s3 = await fetch(`${API_URL}/stats/topsets`);
  const topSets = await s3.json();

  const topSetsDiv = document.getElementById("topSets");
  topSetsDiv.innerHTML = topSets.map(s => `
    <div class="border-b py-3 flex justify-between">
      <span>${s.name} <span class="text-indigo-500">(${s.category})</span></span>
      <span class="font-bold text-pink-500">❤️ ${s.likes}</span>
    </div>
  `).join("");

  // 4. Kategorien
  const s4 = await fetch(`${API_URL}/stats/categories`);
  const categoryStats = await s4.json();

  const categoriesDiv = document.getElementById("topCategories");
  categoriesDiv.innerHTML = Object.keys(categoryStats).map(cat => `
    <div class="border-b py-3 flex justify-between">
      <span>${cat}</span>
      <span class="text-gray-700">${categoryStats[cat].sets} Sets — ❤️ ${categoryStats[cat].likes}</span>
    </div>
  `).join("");

});

