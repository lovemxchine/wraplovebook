// ponytail: all content here is placeholder. Fill in before sending the gift.
// No build step reads this — just edit the values directly.
const DATA = {
  names: "", // e.g. "เอิร์น & ต้นน้ำ"

  // Step 2: Mission — the date they first met, checked against these 3 selects.
  metDate: { day: 1, month: 1, year: 2021 },

  // Step 3a: Love Quiz — each question needs exactly one correctIndex.
  quiz: [
    { question: "ทดสอบคำถามที่ 1?", options: ["ก", "ข", "ค", "ง"], correctIndex: 0 },
    { question: "ทดสอบคำถามที่ 2?", options: ["ก", "ข", "ค", "ง"], correctIndex: 1 },
    { question: "ทดสอบคำถามที่ 3?", options: ["ก", "ข", "ค", "ง"], correctIndex: 2 },
  ],

  // Step 3b: Memory Match — 6 pairs, shown as hand-drawn colored shapes (no
  // emoji/photos needed). Each is [shapeClass, color]; shapeClass matches a
  // .match-<name> CSS rule in style.css.
  memoryIcons: [
    ['circle', '#e94d88'],
    ['square', '#9b6bea'],
    ['triangle', '#ff9fc2'],
    ['diamond', '#f7b267'],
    ['ring', '#6ec97f'],
    ['heart', '#e94d88'],
  ],

  // Step 4: Memory Gallery — add { src, caption } once photos exist.
  photos: [],
  relationshipLabel: "", // e.g. "3 ปี 1 เดือนของเรา"

  // Step 5: Our Song
  song: { title: "", artist: "", src: "" }, // src: path under assets/

  // Step 6: Voice Message
  voiceMessage: { from: "", src: "" },

  // Step 7: The Letter
  letter: { to: "", body: "", from: "" },

  // Ending (shown together with the letter)
  ending: { message: "Thank you for being my favorite person." },
};
