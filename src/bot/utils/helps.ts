export function extractMessage(message: string) {
  const args = message.replace('\n', ' ').slice('*'.length).trim().split(/ +/);
  if (args.length > 0) {
    return [args.shift()?.toLowerCase(), args];
  } else return [false, []];
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRandomColor(): string {
  const colors: string[] = [
    '#1ABC9C', // Aqua
    '#11806A', // DarkAqua
    '#57F287', // Green
    '#1F8B4C', // DarkGreen
    '#3498DB', // Blue
    '#206694', // DarkBlue
    '#9B59B6', // Purple
    '#71368A', // DarkPurple
    '#E91E63', // LuminousVividPink
    '#AD1457', // DarkVividPink
    '#F1C40F', // Gold
    '#C27C0E', // DarkGold
    '#E67E22', // Orange
    '#A84300', // DarkOrange
    '#ED4245', // Red
    '#992D22', // DarkRed
    '#BCC0C0', // LightGrey
    '#FFFF00', // Yellow
  ];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex] || '#F1C40F';
}

export const WARN_MESSAGES = [
  '⏳ Ơ khoan khoan… bình tĩnh sống bạn ơi 😭. Chơi chậm lại một chút!!!',
  '🐌 Chậm lại chút nào, server còn đang thở đó. Chơi chậm lại một chút!!!',
  '😵‍💫 Từ từ thôi, đánh nhanh quá tôi hoảng á. Chơi chậm lại một chút!!!',
  '🧘 Hít thở đều… bình tĩnh… quay từ tốn…. Chơi chậm lại một chút!!!',
  '🔥 Bạn đánh tốc độ này là phải gọi PCCC rồi đó. Chơi chậm lại một chút!!!',
  '⚙️ Máy chủ đang quay như chong chóng, cho nó ngơi xíu 🙏. Chơi chậm lại một chút!!!',
  '😆 Từ từ thôi bạn ơi, slot nó không chạy trốn đâu. Chơi chậm lại một chút!!!',
  '🎰 Đánh như này là thần bài cũng mệt á. Chơi chậm lại một chút!!!',
  '🐢 Chậm mà chắc, nhanh quá dễ “toang” 🎯. Chơi chậm lại một chút!!!',
  '🤣 Trời đất ơi từ từ giùm cái, tay bạn có gắn turbo hả. Chơi chậm lại một chút!!!',
];
