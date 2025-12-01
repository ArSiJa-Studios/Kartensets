import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Alle öffentlichen Sets abrufen
app.get("/sets", async (req, res) => {
  const { data } = await supabase.from("sets").select("*").eq("is_public", true);
  res.json(data);
});

// Lernset erstellen
app.post("/set", async (req, res) => {
  const { name, category, cards } = req.body;

  const { data: set } = await supabase
    .from("sets")
    .insert({ name, category, is_public: true })
    .select()
    .single();

  for (const c of cards) {
    await supabase.from("cards").insert({
      set_id: set.id,
      front: c.front,
      back: c.back
    });
  }

  res.json({ success: true });
});

// Karten eines Sets abrufen
app.get("/cards/:id", async (req, res) => {
  const { data } = await supabase
    .from("cards")
    .select("*")
    .eq("set_id", req.params.id);
  res.json(data);
});

app.listen(3000, () => console.log("API läuft auf Port 3000"));

