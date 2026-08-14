// Customer-editable content lives in user_data/*.json now (see
// user_data/README.md) — this file just fetches and merges them into the
// global DATA object. Nothing here should need touching per-customer.
//
// ponytail: plain fetch()+Promise.all, no build step. Requires being served
// over http(s) — file:// blocks fetch of local files, so local testing needs
// a tiny server (`python3 -m http.server`), same as production (Cloudflare
// Pages already serves over https).
let DATA = {
  // dead fields, kept only so any leftover reference doesn't throw — see
  // CONTEXT.md "Step 8 ending is a Wish Jar, not a letter+note spread"
  letter: { to: "", body: "", from: "" },
  ending: { message: "" },
  voiceMessage: { from: "", src: "" },
};

const DATA_SOURCES = [
  { file: 'user_data/basics.json', spread: true }, // -> names, relationshipLabel, song
  { file: 'user_data/mission.json', key: 'metDate' },
  { file: 'user_data/chat.json', key: 'chat' },
  { file: 'user_data/quiz.json', key: 'quiz' },
  { file: 'user_data/camera.json', key: 'photos' },
  { file: 'user_data/timeline.json', key: 'timeline' },
  { file: 'user_data/wishes.json', key: 'wishes' },
];

const DATA_READY = Promise.all(
  DATA_SOURCES.map(({ file, key, spread }) =>
    fetch(file)
      .then(r => r.json())
      .then(json => { if (spread) Object.assign(DATA, json); else DATA[key] = json; })
      .catch(err => console.error(`[data] failed to load ${file}`, err))
  )
);
