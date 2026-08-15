// Customer-editable content lives in user_data/*.json now (see
// user_data/README.md) — this file just fetches and merges them into the
// global DATA object. Nothing here should need touching per-customer.
//
// ponytail: plain fetch()+Promise.all, no build step. Requires being served
// over http(s) — file:// blocks fetch of local files, so local testing needs
// a tiny server (`python3 -m http.server`), same as production (Cloudflare
// Pages already serves over https).
let DATA = {
  // letter/voiceMessage: dead fields, kept only so any leftover reference
  // doesn't throw — see CONTEXT.md "Step 8 ending is a Closing Scrapbook,
  // not a Wish Jar". ending: used by Step 8, loaded from ending.json below.
  letter: { to: "", body: "", from: "" },
  ending: { message: "" },
  voiceMessage: { from: "", src: "" },
};

const DATA_SOURCES = [
  { file: 'basics.json', spread: true }, // -> names, relationshipLabel, song
  { file: 'mission.json', key: 'metDate' },
  { file: 'chat.json', key: 'chat' },
  { file: 'quiz.json', key: 'quiz' },
  { file: 'camera.json', key: 'photos' },
  { file: 'timeline.json', key: 'timeline' },
  { file: 'wishes.json', key: 'wishes' },
  { file: 'ending.json', key: 'ending' },
];

// ?lang=en tries user_data/en/<file> first and falls back to the default
// user_data/<file> (Thai) for anything that doesn't have a translated
// version yet — so a partial translation never breaks the site.
const LANG = new URLSearchParams(location.search).get('lang');

function loadUserData(file) {
  const defaultPath = `user_data/${file}`;
  if (!LANG) return fetch(defaultPath).then(r => r.json());
  return fetch(`user_data/${LANG}/${file}`)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .catch(() => fetch(defaultPath).then(r => r.json()));
}

const DATA_READY = Promise.all(
  DATA_SOURCES.map(({ file, key, spread }) =>
    loadUserData(file)
      .then(json => { if (spread) Object.assign(DATA, json); else DATA[key] = json; })
      .catch(err => console.error(`[data] failed to load ${file}`, err))
  )
);
