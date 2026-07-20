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

  // Step 4: Memory Gallery — add { src, caption } once photos exist.
  photos: [],
  relationshipLabel: "", // e.g. "3 ปี 1 เดือนของเรา"

  // Step 5: Our Song — paste any youtube.com/watch?v= or youtu.be/ link.
  // startSeconds: where playback begins. loop is always on (whole video, back to 0).
  song: { title: "I love you 3000", artist: "", youtubeUrl: "https://www.youtube.com/watch?v=cPkE0IbDVs4", startSeconds: 0 },

  // Step 6: Voice Message
  voiceMessage: { from: "", src: "" },

  // Step 6: Reasons I Love You — flip cards, front shows the number, back shows the reason.
  reasons: [
    "เหตุผลที่ 1 ใส่ทีหลัง",
    "เหตุผลที่ 2 ใส่ทีหลัง",
    "เหตุผลที่ 3 ใส่ทีหลัง",
    "เหตุผลที่ 4 ใส่ทีหลัง",
    "เหตุผลที่ 5 ใส่ทีหลัง",
    "เหตุผลที่ 6 ใส่ทีหลัง",
  ],

  // Step 7: The Letter
  letter: { to: "", body: "", from: "" },

  // Ending (shown together with the letter)
  ending: { message: "Thank you for being my favorite person." },
};
