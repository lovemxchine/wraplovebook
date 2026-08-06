// ponytail: all content here is placeholder. Fill in before sending the gift.
// No build step reads this — just edit the values directly.
const DATA = {
  names: "", // e.g. "เอิร์น & ต้นน้ำ"

  // Step 2: Mission — the date they first met, checked against these 3 selects.
  metDate: { day: 1, month: 4, year: 2569 }, // pin = 010469

  // Step 3a: Love Quiz — each question needs exactly one correctIndex.
  // ponytail: any answer advances (no fail state), so correctIndex is unused
  // by the UI — kept only in case a scored version is ever wanted.
  quiz: [
    { question: "เจอกันครั้งแรกที่ไหนน้า?", options: ["ที่ทำงาน", "ร้านกาแฟ", "ในเกม", "เพื่อนแนะนำ"], correctIndex: 0 },
    { question: "เดตแรกของเรากินอะไร?", options: ["ชาบู", "หมูกระทะ", "พิซซ่า", "ก๋วยเตี๋ยว"], correctIndex: 0 },
    { question: "คำแรกที่เราบอกรักกันคือ?", options: ["รักนะ", "ชอบเธอ", "เป็นแฟนกันไหม", "จำไม่ได้แล้ว"], correctIndex: 0 },
  ],

  // Step 4: Memory Gallery — add { src, caption } once photos exist.
  photos: [],
  relationshipLabel: "", // e.g. "3 ปี 1 เดือนของเรา"

  // Step 5: Our Song — paste any youtube.com/watch?v= or youtu.be/ link.
  // startSeconds: where playback begins. loop is always on (whole video, back to 0).
  song: { title: "I love you 3000", artist: "", youtubeUrl: "https://www.youtube.com/watch?v=cPkE0IbDVs4", startSeconds: 0 },

  // Step 6: Voice Message
  voiceMessage: { from: "", src: "" },

  // Step 6: The Letter
  letter: { to: "", body: "", from: "" },

  // Ending (shown together with the letter)
  ending: { message: "ขอบคุณที่เป็นคนพิเศษของเรานะ" },
};
