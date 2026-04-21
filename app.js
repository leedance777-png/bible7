const chat = document.querySelector("#chat");
const chatForm = document.querySelector("#chatForm");
const userInput = document.querySelector("#userInput");
const sendButton = document.querySelector("#sendButton");

let bibleData = [];
let isResponding = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const scrollToLatest = () => {
  requestAnimationFrame(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth"
    });
  });
};

const resizeInput = () => {
  userInput.style.height = "auto";
  userInput.style.height = `${Math.min(userInput.scrollHeight, 150)}px`;
};

const createMessage = (text, sender) => {
  const row = document.createElement("section");
  row.className = `message-row ${sender}-row`;

  const message = document.createElement("div");
  message.className = `message ${sender}-message`;
  message.textContent = text;

  if (sender === "bot") {
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = "📖";
    row.append(avatar, message);
  } else {
    row.append(message);
  }

  chat.append(row);
  scrollToLatest();
  return message;
};

const createLoadingMessage = () => {
  const row = document.createElement("section");
  row.className = "message-row bot-row";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = "📖";

  const message = document.createElement("div");
  message.className = "message bot-message";
  message.innerHTML = `
    <span class="loading-dots" aria-label="응답을 준비 중입니다">
      <span></span>
      <span></span>
      <span></span>
    </span>
  `;

  row.append(avatar, message);
  chat.append(row);
  scrollToLatest();

  return row;
};

// User text is intentionally matched with simple keyword rules.
const extractKeyword = (text) => {
  const rules = ["사랑", "믿음", "용서"];
  return rules.find((keyword) => text.includes(keyword)) || "";
};

const findAnswer = (keyword) => {
  return bibleData.find((item) => item.keyword === keyword);
};

const formatResponse = (answer) => {
  if (!answer) {
    return "조금 더 구체적으로 질문해 주세요 🙏";
  }

  return `📖 ${answer.verse}

👉 해석:
${answer.explanation}

💡 쉽게 말하면:
${answer.simple}`;
};

const typeMessage = async (element, text) => {
  element.textContent = "";

  for (const char of text) {
    element.textContent += char;
    scrollToLatest();
    await sleep(20);
  }
};

const setResponding = (value) => {
  isResponding = value;
  sendButton.disabled = value;
  userInput.disabled = value;
};

const sendMessage = async () => {
  const text = userInput.value.trim();

  if (!text || isResponding) {
    return;
  }

  createMessage(text, "user");
  userInput.value = "";
  resizeInput();
  setResponding(true);

  const loadingRow = createLoadingMessage();
  const delay = 1000 + Math.random() * 500;
  await sleep(delay);

  const keyword = extractKeyword(text);
  const answer = findAnswer(keyword);
  const response = formatResponse(answer);

  loadingRow.remove();
  const botMessage = createMessage("", "bot");
  await typeMessage(botMessage, response);

  setResponding(false);
  userInput.focus();
};

const loadData = async () => {
  try {
    const response = await fetch("data.json");

    if (!response.ok) {
      throw new Error("data.json을 불러오지 못했습니다.");
    }

    bibleData = await response.json();
  } catch (error) {
    console.error(error);
    bibleData = [];
    createMessage("성경 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.", "bot");
  }
};

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});

userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

userInput.addEventListener("input", resizeInput);

loadData();
