import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// Supabase verbinden
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// -------------------------------
// 🔹 ALLE ÖFFENTLICHEN SETS
// -------------------------------
app.get("/sets", async (req, res) => {
  const { data, error } = await supabase
    .from("sets")
    .select("*")
    .eq("is_public", true)
    .order("id", { ascending: false });

  if (error) return res.status(500).json(error);
  res.json(data);
});

// -------------------------------
// 🔹 EIN SET ERSTELLEN
// -------------------------------
app.post("/set", async (req, res) => {
  const { name, category, cards } = req.body;

  // Neues Set anlegen
  const { data: insertedSet, error: setError } = await supabase
    .from("sets")
    .insert({
      name,
      category,
      is_public: true,
      likes: 0
    })
    .select()
    .single();

  if (setError) return res.status(500).json(setError);

  // Karten einfügen
  for (const c of cards) {
    await supabase.from("cards").insert({
      set_id: insertedSet.id,
      front: c.front,
      back: c.back
    });
  }

  res.json({ success: true });
});

// -------------------------------
// 🔹 ALLE KARTEN EINES SETS
// -------------------------------
app.get("/cards/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("set_id", req.params.id);

  if (error) return res.status(500).json(error);
  res.json(data);
});

// -------------------------------
// 🔹 LIKE SYSTEM (+1 LIKE)
// -------------------------------
app.post("/like/:id", async (req, res) => {
  const setId = req.params.id;

  const { data: set } = await supabase
    .from("sets")
    .select("likes")
    .eq("id", setId)
    .single();

  const newLikes = set.likes + 1;

  const { error: updateError } = await supabase
    .from("sets")
    .update({ likes: newLikes })
    .eq("id", setId);

  if (updateError) return res.status(500).json(updateError);

  res.json({ likes: newLikes });
});

// -------------------------------
// 🔹 STATISTIK: Anzahl der Sets
// -------------------------------
app.get("/stats/totalsets", async (req, res) => {
  const { count } = await supabase
    .from("sets")
    .select("*", { count: "exact", head: true })
    .eq("is_public", true);

  res.json({ totalSets: count });
});

// -------------------------------
// 🔹 STATISTIK: Anzahl der Karten
// -------------------------------
app.get("/stats/totalcards", async (req, res) => {
  const { count } = await supabase
    .from("cards")
    .select("*", { count: "exact", head: true });

  res.json({ totalCards: count });
});

// -------------------------------
// 🔹 STATISTIK: Top 10 Sets
// -------------------------------
app.get("/stats/topsets", async (req, res) => {
  const { data, error } = await supabase
    .from("sets")
    .select("*")
    .eq("is_public", true)
    .order("likes", { ascending: false })
    .limit(10);

  if (error) return res.status(500).json(error);
  res.json(data);
});

// -------------------------------
// 🔹 STATISTIK: Kategorien
// -------------------------------
app.get("/stats/categories", async (req, res) => {
  const { data } = await supabase
    .from("sets")
    .select("category, likes")
    .eq("is_public", true);

  const stats = {};

  data.forEach(s => {
    if (!stats[s.category]) {
      stats[s.category] = {
        sets: 0,
        likes: 0
      };
    }
    stats[s.category].sets++;
    stats[s.category].likes += s.likes;
  });

  res.json(stats);
});

// -------------------------------
// Server starten
// -------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("API läuft auf Port", PORT);
});
