const textInput = document.querySelector('#text-input');
const clearButton = document.querySelector('#clear-input');
const characterCount = document.querySelector('#character-count');
const resultsGrid = document.querySelector('#results-grid');
const resultsCount = document.querySelector('#results-count');
const loadMoreButton = document.querySelector('#load-more');
const recentList = document.querySelector('#recent-list');
const recentEmpty = document.querySelector('#recent-empty');
const clearRecentButton = document.querySelector('#clear-recent');
const searchInput = document.querySelector('#style-search');
const filterButtons = document.querySelectorAll('.filter-button');
const toast = document.querySelector('#toast');
const feedbackForm = document.querySelector('#feedback-form');
const formStatus = document.querySelector('#form-status');
const feedbackSubmitButton = document.querySelector('#feedback-submit');

const smallCaps = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ',
  k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ',
  u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};

const superscript = { a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ', h: 'ʰ', i: 'ⁱ', j: 'ʲ', k: 'ᵏ', l: 'ˡ', m: 'ᵐ', n: 'ⁿ', o: 'ᵒ', p: 'ᵖ', r: 'ʳ', s: 'ˢ', t: 'ᵗ', u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };

let activeCategory = 'all';
let toastTimeout;
let visibleLimit = 12;
const recentCopiesKey = 'fontnexa-recent-copies';

function mapCharacters(text, map) {
  return [...text].map((character) => map[character.toLowerCase()] || character).join('');
}

function mathLetters(text, type) {
  const offsets = {
    bold: { upper: 0x1d400, lower: 0x1d41a, number: 0x1d7ce },
    italic: { upper: 0x1d434, lower: 0x1d44e },
    sans: { upper: 0x1d5a0, lower: 0x1d5ba, number: 0x1d7e2 },
    mono: { upper: 0x1d670, lower: 0x1d68a, number: 0x1d7f6 },
    double: { upper: 0x1d538, lower: 0x1d552, number: 0x1d7d8 }
  };
  const offset = offsets[type];
  const specialCharacters = {
    italic: { h: 'ℎ' },
    double: { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' }
  };

  return [...text].map((character) => {
    if (specialCharacters[type]?.[character]) return specialCharacters[type][character];
    const code = character.codePointAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(offset.upper + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(offset.lower + code - 97);
    if (offset.number && code >= 48 && code <= 57) return String.fromCodePoint(offset.number + code - 48);
    return character;
  }).join('');
}

function fullWidth(text) {
  return [...text].map((character) => {
    const code = character.codePointAt(0);
    return code >= 33 && code <= 126 ? String.fromCodePoint(code + 0xfee0) : character;
  }).join('');
}

function circled(text) {
  return [...text].map((character) => {
    const code = character.toUpperCase().codePointAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x24b6 + code - 65);
    if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + code - 49);
    if (code === 48) return '⓪';
    return character;
  }).join('');
}

const styles = [
  { name: 'Strong', category: 'general', make: (text) => mathLetters(text, 'bold') },
  { name: 'Italic mood', category: 'general', make: (text) => mathLetters(text, 'italic') },
  { name: 'Wide space', category: 'general', make: fullWidth },
  { name: 'Circle letters', category: 'general', make: circled },
  { name: 'Double line', category: 'general', make: (text) => mathLetters(text, 'double') },
  { name: 'Phantom', category: 'gaming', make: (text) => `꧁༺ ${mathLetters(text, 'bold')} ༻꧂` },
  { name: 'Victory tag', category: 'gaming', make: (text) => `亗 ${text.toUpperCase()} 亗` },
  { name: 'Ranked', category: 'gaming', make: (text) => `『${mapCharacters(text, smallCaps)}』` },
  { name: 'Terminal', category: 'gaming', make: (text) => `⌁ ${mathLetters(text, 'mono')} ⌁` },
  { name: 'Aesthetic', category: 'instagram', make: (text) => `✦ ${fullWidth(text)} ✦` },
  { name: 'Soft star', category: 'instagram', make: (text) => `⋆｡°✩ ${mathLetters(text, 'italic')} ✩°｡⋆` },
  { name: 'Clean creator', category: 'instagram', make: (text) => mathLetters(text, 'sans') },
  { name: 'Micro bio', category: 'instagram', make: (text) => mapCharacters(text, superscript) },
  { name: 'WhatsApp bold', category: 'whatsapp', make: (text) => mathLetters(text, 'bold') },
  { name: 'Tiny caps', category: 'whatsapp', make: (text) => mapCharacters(text, smallCaps) },
  { name: 'Message frame', category: 'whatsapp', make: (text) => `【 ${text} 】` },
  { name: 'Moonlight', category: 'religious', make: (text) => `☪ ${mapCharacters(text, smallCaps)} ☪` },
  { name: 'Sacred om', category: 'religious', make: (text) => `ॐ ${text} ॐ` },
  { name: 'Blessed', category: 'religious', make: (text) => `✝ ${mathLetters(text, 'italic')} ✝` },
  { name: 'Heartfelt', category: 'love', make: (text) => `♥ ${mathLetters(text, 'italic')} ♥` },
  { name: 'Cupid note', category: 'love', make: (text) => `꒰ა ${text} ໒꒱` },
  { name: 'Bloom', category: 'love', make: (text) => `❀ ${mapCharacters(text, smallCaps)} ❀` },
  { name: 'Forever', category: 'love', make: (text) => `♡ ${text} ♡` },
  { name: 'Dreamy', category: 'aesthetic', make: (text) => `ੈ✩‧₊˚ ${mathLetters(text, 'italic')} ˚₊‧✩ੈ` },
  { name: 'Cloud nine', category: 'aesthetic', make: (text) => `☁︎ ${fullWidth(text)} ☁︎` },
  { name: 'Delicate', category: 'aesthetic', make: (text) => `𓆩 ${text} 𓆪` },
  { name: 'Vintage', category: 'aesthetic', make: (text) => `⋆ ${mapCharacters(text, smallCaps)} ⋆` },
  { name: 'Minimal bio', category: 'bio', make: (text) => `• ${mapCharacters(text, smallCaps)} •` },
  { name: 'Profile line', category: 'bio', make: (text) => `⌇ ${text} ⌇` },
  { name: 'Status', category: 'bio', make: (text) => `⟡ ${mathLetters(text, 'sans')} ⟡` },
  { name: 'Star bio', category: 'bio', make: (text) => `★ ${text}` },
  { name: 'Classic tag', category: 'nickname', make: (text) => `『 ${text} 』` },
  { name: 'Crown name', category: 'nickname', make: (text) => `♛ ${mathLetters(text, 'bold')} ♛` },
  { name: 'Royal', category: 'nickname', make: (text) => `꧁ ${text} ꧂` },
  { name: 'Sleek alias', category: 'nickname', make: (text) => `×͜× ${text}` },
  { name: 'Arrow line', category: 'symbols', make: (text) => `➤ ${text} ◀` },
  { name: 'Spark line', category: 'symbols', make: (text) => `✦ ─ ${text} ─ ✦` },
  { name: 'Bracket art', category: 'symbols', make: (text) => `⟣ ${text} ⟢` },
  { name: 'Wave', category: 'symbols', make: (text) => `〰 ${text} 〰` },
  { name: 'Professional', category: 'business', make: (text) => mathLetters(text, 'sans') },
  { name: 'Founder', category: 'business', make: (text) => `⌁ ${text.toUpperCase()} ⌁` },
  { name: 'On a mission', category: 'business', make: (text) => `↗ ${text}` },
  { name: 'Premium', category: 'business', make: (text) => `◆ ${mathLetters(text, 'double')} ◆` },
  { name: 'Study note', category: 'study', make: (text) => `✎ ${text}` },
  { name: 'Smart line', category: 'study', make: (text) => `▸ ${mapCharacters(text, smallCaps)}` },
  { name: 'Focus mode', category: 'study', make: (text) => `⌁ ${text} ⌁` },
  { name: 'Graduate', category: 'study', make: (text) => `🎓 ${text}` },
  { name: 'Celebration', category: 'festive', make: (text) => `✦ ${text} ✦` },
  { name: 'Diya light', category: 'festive', make: (text) => `🪔 ${text} 🪔` },
  { name: 'Party time', category: 'festive', make: (text) => `🎉 ${mathLetters(text, 'bold')} 🎉` },
  { name: 'Golden wish', category: 'festive', make: (text) => `❈ ${text} ❈` }
];

const presentationTransforms = [
  (text) => text,
  (text) => mathLetters(text, 'bold'),
  (text) => mathLetters(text, 'italic'),
  (text) => mathLetters(text, 'sans'),
  (text) => mathLetters(text, 'mono'),
  (text) => mathLetters(text, 'double'),
  (text) => mapCharacters(text, smallCaps),
  fullWidth,
  circled,
  (text) => mapCharacters(text, superscript),
  (text) => [...text].join(' '),
  (text) => [...text].map((character) => `${character}\u0332`).join(''),
  (text) => [...text].map((character) => `${character}\u0336`).join('')
];

const styleNames = [
  'Bold edge', 'Soft italic', 'Modern sans', 'Royal frame', 'Minimal line', 'Classic badge',
  'Premium glow', 'Signature cut', 'Clean label', 'Sharp type', 'Night mark', 'Golden trim',
  'Simple spark', 'Fine print', 'Iconic tag', 'Fresh aura', 'Elite mode', 'Polished line',
  'Outline charm', 'Bright note', 'Core style', 'Statement', 'Highlight', 'Mirror mood',
  'Side accent', 'Space edit', 'Crown touch', 'Hero type', 'Final form', 'Spotlight',
  'Legendary', 'Power move', 'Infinite mark', 'Diamond finish', 'Prime style', 'Rare edition'
];

const categoryDecorators = {
  gaming: [
    (text) => `꧁༺ ${text} ༻꧂`, (text) => `⚔ ${text} ⚔`, (text) => `亗 ${text} 亗`,
    (text) => `༺۝ ${text} ۝༻`, (text) => `『${text}』`, (text) => `⫷ ${text} ⫸`,
    (text) => `♛ ${text} ♛`, (text) => `乂 ${text} 乂`, (text) => `⸸ ${text} ⸸`
  ],
  instagram: [
    (text) => `✦ ${text} ✦`, (text) => `⋆｡°✩ ${text} ✩°｡⋆`, (text) => `⌁ ${text} ⌁`,
    (text) => `✧ ${text} ✧`, (text) => `♡ ${text} ♡`, (text) => `• ${text} •`,
    (text) => `☁︎ ${text} ☁︎`, (text) => `⟡ ${text} ⟡`
  ],
  whatsapp: [
    (text) => `【 ${text} 】`, (text) => `➜ ${text}`, (text) => `⌇ ${text} ⌇`,
    (text) => `❯ ${text}`, (text) => `• ${text}`, (text) => `⟦ ${text} ⟧`,
    (text) => `▸ ${text}`, (text) => `— ${text} —`
  ],
  religious: [
    (text) => `☪ ${text} ☪`, (text) => `ॐ ${text} ॐ`, (text) => `✝ ${text} ✝`,
    (text) => `🕊 ${text} 🕊`, (text) => `☾ ${text} ☽`, (text) => `✧ ${text} ✧`,
    (text) => `❂ ${text} ❂`, (text) => `𐩕 ${text} 𐩕`
  ],
  love: [
    (text) => `♥ ${text} ♥`, (text) => `♡ ${text} ♡`, (text) => `꒰ა ${text} ໒꒱`,
    (text) => `❀ ${text} ❀`, (text) => `˗ˏˋ ${text} ˎˊ˗`, (text) => `૮꒰ ${text} ꒱ა`,
    (text) => `💌 ${text} 💌`, (text) => `∞ ${text} ∞`
  ],
  general: [
    (text) => `${text}`, (text) => `• ${text} •`, (text) => `【${text}】`,
    (text) => `⟡ ${text} ⟡`, (text) => `⌁ ${text} ⌁`, (text) => `『${text}』`,
    (text) => `◆ ${text} ◆`, (text) => `— ${text} —`
  ],
  aesthetic: [
    (text) => `ੈ✩‧₊˚ ${text} ˚₊‧✩ੈ`, (text) => `☁︎ ${text} ☁︎`, (text) => `𓆩 ${text} 𓆪`,
    (text) => `⋆ ${text} ⋆`, (text) => `𐙚 ${text} 𐙚`, (text) => `⭒ ${text} ⭒`,
    (text) => `༄ ${text} ༄`, (text) => `꒰ ${text} ꒱`
  ],
  bio: [
    (text) => `• ${text} •`, (text) => `⌇ ${text} ⌇`, (text) => `⟡ ${text} ⟡`,
    (text) => `★ ${text}`, (text) => `↳ ${text}`, (text) => `⌁ ${text}`, 
    (text) => `⤷ ${text}`, (text) => `◦ ${text} ◦`
  ],
  nickname: [
    (text) => `『 ${text} 』`, (text) => `♛ ${text} ♛`, (text) => `꧁ ${text} ꧂`,
    (text) => `×͜× ${text}`, (text) => `༒ ${text} ༒`, (text) => `☠ ${text} ☠`,
    (text) => `⟪ ${text} ⟫`, (text) => `۝ ${text} ۝`
  ],
  symbols: [
    (text) => `➤ ${text} ◀`, (text) => `✦ ─ ${text} ─ ✦`, (text) => `⟣ ${text} ⟢`,
    (text) => `〰 ${text} 〰`, (text) => `╰┈➤ ${text}`, (text) => `⫷ ${text} ⫸`,
    (text) => `❖ ${text} ❖`, (text) => `╭─ ${text} ─╮`
  ],
  business: [
    (text) => `◆ ${text} ◆`, (text) => `↗ ${text}`, (text) => `⌁ ${text} ⌁`,
    (text) => `▰ ${text}`, (text) => `• ${text}`, (text) => `— ${text} —`,
    (text) => `◇ ${text} ◇`, (text) => `| ${text} |`
  ],
  study: [
    (text) => `✎ ${text}`, (text) => `▸ ${text}`, (text) => `⌁ ${text} ⌁`,
    (text) => `🎓 ${text}`, (text) => `□ ${text}`, (text) => `✦ ${text}`, 
    (text) => `↳ ${text}`, (text) => `〔${text}〕`
  ],
  festive: [
    (text) => `✦ ${text} ✦`, (text) => `🪔 ${text} 🪔`, (text) => `🎉 ${text} 🎉`,
    (text) => `❈ ${text} ❈`, (text) => `✧ ${text} ✧`, (text) => `🎊 ${text} 🎊`,
    (text) => `✺ ${text} ✺`, (text) => `𖤓 ${text} 𖤓`
  ]
};

const categoryTargets = {
  gaming: 36,
  instagram: 30,
  whatsapp: 30,
  religious: 30,
  love: 30,
  general: 30,
  aesthetic: 30,
  bio: 30,
  nickname: 30,
  symbols: 30,
  business: 30,
  study: 30,
  festive: 30
};

function growStyleLibrary() {
  Object.entries(categoryTargets).forEach(([category, target]) => {
    const currentCount = styles.filter((style) => style.category === category).length;
    const requiredCount = target - currentCount;
    const decorators = categoryDecorators[category];

    for (let index = 0; index < requiredCount; index += 1) {
      const transform = presentationTransforms[(index + currentCount) % presentationTransforms.length];
      const decorate = decorators[(index * 3 + currentCount) % decorators.length];
      const label = styleNames[(index + currentCount) % styleNames.length];
      styles.push({
        name: `${category} · ${label}`,
        category,
        make: (text) => decorate(transform(text))
      });
    }
  });
}

growStyleLibrary();

function getRecentCopies() {
  try {
    const savedCopies = JSON.parse(localStorage.getItem(recentCopiesKey) || '[]');
    if (!Array.isArray(savedCopies)) return [];
    return savedCopies
      .filter((item) => typeof item?.text === 'string' && typeof item?.label === 'string')
      .slice(0, 8);
  } catch {
    return [];
  }
}

function renderRecentCopies() {
  const recentCopies = getRecentCopies();
  recentList.replaceChildren();
  recentEmpty.hidden = recentCopies.length > 0;
  clearRecentButton.hidden = recentCopies.length === 0;

  recentCopies.forEach((item) => {
    const button = document.createElement('button');
    button.className = 'recent-copy-item';
    button.type = 'button';
    button.dataset.copy = item.text;
    button.dataset.label = item.label;
    button.setAttribute('aria-label', `Copy recent style: ${item.label}`);

    const label = document.createElement('span');
    label.className = 'recent-copy-label';
    label.textContent = item.label;
    const output = document.createElement('span');
    output.className = 'recent-copy-output';
    output.textContent = item.text;
    const icon = document.createElement('span');
    icon.className = 'recent-copy-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '⧉';

    button.append(label, output, icon);
    recentList.append(button);
  });
}

function saveRecentCopy(text, label) {
  const recentCopies = getRecentCopies();
  const nextCopies = [{ text, label }, ...recentCopies.filter((item) => item.text !== text)].slice(0, 8);

  try {
    localStorage.setItem(recentCopiesKey, JSON.stringify(nextCopies));
  } catch {
    return;
  }

  renderRecentCopies();
}

function currentText() {
  return textInput.value.trim() || 'Fontnexa';
}

function setTheme() {
  document.body.classList.toggle('gaming-mode', activeCategory === 'gaming');
}

function renderResults() {
  const query = searchInput.value.trim().toLowerCase();
  const text = currentText();
  const visibleStyles = styles.filter((style) => {
    const output = style.make(text).toLowerCase();
    const matchesCategory = activeCategory === 'all' || style.category === activeCategory;
    const matchesQuery = !query || `${style.name} ${style.category} ${output}`.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  resultsCount.textContent = visibleStyles.length;
  resultsGrid.replaceChildren();
  const displayedStyles = visibleStyles.slice(0, visibleLimit);
  const remainingStyles = visibleStyles.length - displayedStyles.length;
  loadMoreButton.hidden = remainingStyles <= 0;
  loadMoreButton.innerHTML = `Show ${Math.min(12, remainingStyles)} more styles <span>↓</span>`;

  if (!visibleStyles.length) {
    const empty = document.createElement('p');
    empty.className = 'no-results';
    empty.textContent = 'No matching styles yet. Try another word or category.';
    resultsGrid.append(empty);
    return;
  }

  displayedStyles.forEach((style) => {
    const output = style.make(text);
    const button = document.createElement('button');
    button.className = 'result-card';
    button.type = 'button';
    button.dataset.copy = output;
    button.setAttribute('aria-label', `Copy ${style.name}: ${output}`);

    const content = document.createElement('span');
    content.className = 'card-content';
    const name = document.createElement('span');
    name.className = 'style-name';
    name.textContent = style.name;
    const styledOutput = document.createElement('span');
    styledOutput.className = 'styled-output';
    styledOutput.textContent = output;
    const copyIcon = document.createElement('span');
    copyIcon.className = 'copy-icon';
    copyIcon.setAttribute('aria-hidden', 'true');
    copyIcon.textContent = '⧉';

    content.append(name, styledOutput);
    button.append(content, copyIcon);
    resultsGrid.append(button);
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

function selectCategory(category) {
  activeCategory = category;
  visibleLimit = 12;
  filterButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.category === category));
  setTheme();
  renderResults();
}

async function copyText(text, label) {
  let copied = false;

  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    const temporaryInput = document.createElement('textarea');
    temporaryInput.value = text;
    temporaryInput.setAttribute('readonly', '');
    temporaryInput.style.position = 'fixed';
    temporaryInput.style.opacity = '0';
    document.body.append(temporaryInput);
    temporaryInput.select();
    copied = document.execCommand('copy');
    temporaryInput.remove();
  }

  if (copied) {
    saveRecentCopy(text, label || 'Fontnexa style');
    showToast('Copied to clipboard');
  } else {
    showToast('Copy failed — please try again');
  }
}

textInput.addEventListener('input', () => {
  characterCount.textContent = textInput.value.length;
  visibleLimit = 12;
  renderResults();
});

clearButton.addEventListener('click', () => {
  textInput.value = '';
  characterCount.textContent = '0';
  visibleLimit = 12;
  textInput.focus();
  renderResults();
});

searchInput.addEventListener('input', () => {
  visibleLimit = 12;
  renderResults();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => selectCategory(button.dataset.category));
});

resultsGrid.addEventListener('click', (event) => {
  const card = event.target.closest('.result-card');
  if (card) copyText(card.dataset.copy, card.querySelector('.style-name')?.textContent || 'Fontnexa style');
});

loadMoreButton.addEventListener('click', () => {
  visibleLimit += 12;
  renderResults();
});

recentList.addEventListener('click', (event) => {
  const card = event.target.closest('.recent-copy-item');
  if (card) copyText(card.dataset.copy, card.dataset.label);
});

clearRecentButton.addEventListener('click', () => {
  try {
    localStorage.removeItem(recentCopiesKey);
  } catch {
    return;
  }
  renderRecentCopies();
  showToast('Recent copies cleared');
});

feedbackForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formStatus.classList.remove('is-error');

  if (!feedbackForm.checkValidity()) {
    formStatus.textContent = 'Please fill in your name, email, topic and message first.';
    formStatus.classList.add('is-error');
    feedbackForm.reportValidity();
    return;
  }

  const visitorName = document.querySelector('#visitor-name').value.trim();
  const formData = new FormData(feedbackForm);
  feedbackSubmitButton.disabled = true;
  feedbackSubmitButton.textContent = 'Sending…';

  try {
    const response = await fetch(feedbackForm.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    });

    if (!response.ok) throw new Error('Submission failed');
    formStatus.textContent = `Thank you, ${visitorName}! Your feedback has been sent.`;
    feedbackForm.reset();
  } catch {
    formStatus.textContent = 'Your feedback could not be sent right now. Please check your connection and try again.';
    formStatus.classList.add('is-error');
  } finally {
    feedbackSubmitButton.disabled = false;
    feedbackSubmitButton.innerHTML = 'Send feedback <span>→</span>';
  }
});

document.querySelector('#current-year').textContent = new Date().getFullYear();
renderRecentCopies();
renderResults();
