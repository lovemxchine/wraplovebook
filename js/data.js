// ponytail: all content here is placeholder. Fill in before sending the gift.
// No build step reads this — just edit the values directly.
const DATA = {
  names: "", // e.g. "เอิร์น & ต้นน้ำ"

  // Step 2: Mission — the date they first met, checked against these 3 selects.
  metDate: { day: 1, month: 4, year: 2569 }, // pin = 010469

  // Step 3: Chat — one fixed script, played top to bottom.
  //   { from: "me",  text: "..." }        a message that arrives on its own
  //   { from: "her", options: [...] }     her turn: she taps one, it becomes her bubble
  // Which option she taps never changes what comes next (see CONTEXT.md), so
  // write them as different ways of feeling the same moment, not as branches.
  // The LAST entry must be one of hers — tapping it is what advances the step.
  chat: [
    { from: "me", text: "อยู่ไหม" },
    { from: "me", text: "มีเรื่องอยากบอก รอมานานแล้วอะ" },
    { from: "her", options: ["เรื่องอะไรอะ", "บอกมาเลย", "ทำไมต้องรอด้วย"] },
    { from: "me", text: "คือวันนี้เราคิดถึงเธอมากเลย" },
    { from: "me", text: "คิดถึงตั้งแต่ตื่นมาแล้ว" },
    { from: "her", options: ["คิดถึงเหมือนกัน", "นิดเดียวเหรอ", "งั้นมาหาสิ"] },
    { from: "me", text: "เลยทำอะไรให้อย่างนึง" },
    { from: "me", text: "อยากให้ดูด้วยกันน้า" },
    // three replies here too — whichever she taps is the way out of the step
    { from: "her", options: ["ไปดูกันเลย", "อยากเห็นแล้ว", "ทำอะไรให้อะ"] },
  ],

  // Step 6: Love Quiz — each question needs exactly one correctIndex.
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

  // Step 6: The notebook — the milestones, oldest first. `note` is optional.
  // Entry i is paired with photos[i], so keep the two lists in the same order.
  timeline: [
    { date: "1 เม.ย. 2569", title: "วันที่เจอกันครั้งแรก", note: "ยังจำได้เลยว่าใส่เสื้ออะไร" },
    { date: "เดือนถัดมา", title: "เดตแรกของเรา", note: "กินกันจนอิ่มแล้วเดินเล่นต่อ" },
    { date: "วันนั้น", title: "วันที่เป็นแฟนกัน", note: "" },
    { date: "ทริปแรก", title: "ไปเที่ยวด้วยกันครั้งแรก", note: "หลงทางแต่ก็สนุกดี" },
    { date: "ปีที่ผ่านมา", title: "ผ่านมาด้วยกันทุกเรื่อง", note: "" },
    { date: "วันนี้", title: "ยังอยู่ด้วยกันนะ", note: "และจะอยู่ต่อไปเรื่อยๆ" },
  ],

  // Background music — paste any youtube.com/watch?v= or youtu.be/ link.
  // startSeconds: where playback begins. loop is always on (whole video, back to 0).
  // volume: 0-100, it's background music so it sits well under the shutter sound.
  song: { title: "I love you 3000", artist: "", youtubeUrl: "https://www.youtube.com/watch?v=cPkE0IbDVs4", startSeconds: 0, volume: 35 },

  // Step 6: Voice Message
  voiceMessage: { from: "", src: "" },

  // Step 6: The Letter — kept but unused; Step 8 is now the Wish Jar (see wishes below).
  letter: { to: "", body: "", from: "" },
  ending: { message: "ขอบคุณที่เป็นคนพิเศษของเรานะ" },

  // Step 8: Wish Jar — one message per paper crane. Tapping a crane reveals it.
  wishes: [
    "ขอบคุณที่อยู่ด้วยกันมาถึงวันนี้นะ",
    "ขอให้เราเป็นแบบนี้ไปเรื่อยๆ ไม่มีเปลี่ยน",
    "รักที่ผ่านมาทุกวัน และรักที่จะผ่านไปด้วยกัน",
    "ขอบคุณที่เลือกเดินทางนี้ร่วมกับเรานะ",
    "สุขสันต์วันครบรอบนะที่รัก ❤",
  ],
};
