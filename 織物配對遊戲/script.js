const gameData = [
    {
        id: 'cotton',
        material: '棉 (Cotton)',
        feature: '吸水性好、透氣親膚、不易產生靜電；但容易起皺、洗久易縮水發霉。',
        clothes: 'T恤、內衣褲、牛仔褲、嬰兒服、毛巾'
    },
    {
        id: 'linen',
        material: '麻 (Linen)',
        feature: '導熱快（夏天最涼爽）、強度高、吸汗快乾；但極易起皺、觸感較粗糙。',
        clothes: '夏日涼爽襯衫、寬褲、防曬外衣、文青風帆布袋'
    },
    {
        id: 'wool',
        material: '毛 (Wool)',
        feature: '保暖性極佳、彈性好不易皺；但水洗加揉搓會「縮絨」變小變硬、怕蟲蛀。',
        clothes: '冬季毛衣、圍巾、西裝外套、大衣、保暖羊毛內衣'
    },
    {
        id: 'silk',
        material: '絲 (Silk)',
        feature: '光澤高雅、觸感非常滑順細緻、冬暖夏涼；但價格昂貴、日曬易變黃、需乾洗。',
        clothes: '高級禮服、旗袍、睡衣、絲巾、蠶絲被'
    },
    {
        id: 'polyester',
        material: '聚酯纖維 (Polyester)',
        feature: '強度高、非常不易皺、不易縮水、快乾；但吸汗性差、易生靜電與吸附異味。',
        clothes: '運動排汗衫、學生制服、百褶裙、風衣、刷毛保暖衣'
    },
    {
        id: 'nylon',
        material: '尼龍 / 耐綸 (Nylon)',
        feature: '非常耐磨、質地輕盈、強度與彈性極佳；但吸濕性差、不耐高溫（怕燙）。',
        clothes: '絲襪、防風外套、運動背包、雨衣、羽絨衣外層'
    }
];

let score = 0;
let time = 0;
let timerInterval;
let matchedSets = 0;
let selectedCards = {
    material: null,
    feature: null,
    clothes: null
};

// DOM elements
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const winModal = document.getElementById('winModal');
const finalScoreEl = document.getElementById('finalScore');
const finalTimeEl = document.getElementById('finalTime');
const restartBtn = document.getElementById('restartBtn');

const containerMaterial = document.getElementById('container-material');
const containerFeature = document.getElementById('container-feature');
const containerClothes = document.getElementById('container-clothes');

// Utility: Shuffle Array
function shuffleArray(array) {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

// Initialize Game
function initGame() {
    // Reset state
    score = 0;
    time = 0;
    matchedSets = 0;
    selectedCards = { material: null, feature: null, clothes: null };
    scoreEl.innerText = score;
    timeEl.innerText = time;
    winModal.style.display = 'none';
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        time++;
        timeEl.innerText = time;
    }, 1000);

    // Pick 4 random items from the 6 available
    const shuffledData = shuffleArray(gameData);
    const selectedData = shuffledData.slice(0, 4);

    // Prepare arrays for columns
    const materials = selectedData.map(d => ({ id: d.id, text: d.material, type: 'material' }));
    const features = selectedData.map(d => ({ id: d.id, text: d.feature, type: 'feature' }));
    const clothesArr = selectedData.map(d => ({ id: d.id, text: d.clothes, type: 'clothes' }));

    // Shuffle each column independently
    renderColumn(containerMaterial, shuffleArray(materials));
    renderColumn(containerFeature, shuffleArray(features));
    renderColumn(containerClothes, shuffleArray(clothesArr));
}

// Render cards into a container
function renderColumn(container, items) {
    container.innerHTML = '';
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = item.text;
        card.dataset.id = item.id;
        card.dataset.type = item.type;
        
        card.addEventListener('click', () => handleCardClick(card));
        container.appendChild(card);
    });
}

// Handle clicking a card
function handleCardClick(card) {
    // Ignore if already matched or hidden
    if (card.classList.contains('hidden') || card.classList.contains('correct')) return;

    const type = card.dataset.type;

    // Toggle off if clicking the already selected card
    if (selectedCards[type] === card) {
        card.classList.remove('selected');
        selectedCards[type] = null;
        return;
    }

    // If there's already a selected card in this column, deselect it
    if (selectedCards[type]) {
        selectedCards[type].classList.remove('selected');
    }

    // Select the new card
    card.classList.add('selected');
    selectedCards[type] = card;

    checkMatch();
}

// Check if all 3 columns have a selected card
function checkMatch() {
    if (selectedCards.material && selectedCards.feature && selectedCards.clothes) {
        const id1 = selectedCards.material.dataset.id;
        const id2 = selectedCards.feature.dataset.id;
        const id3 = selectedCards.clothes.dataset.id;

        const cardsToProcess = [selectedCards.material, selectedCards.feature, selectedCards.clothes];

        if (id1 === id2 && id2 === id3) {
            // Correct match
            score += 10;
            scoreEl.innerText = score;
            matchedSets++;

            cardsToProcess.forEach(c => {
                c.classList.remove('selected');
                c.classList.add('correct');
                // Wait for animation to finish then hide completely
                setTimeout(() => {
                    c.classList.add('hidden');
                }, 600);
            });

            // Check win condition
            if (matchedSets === 4) {
                clearInterval(timerInterval);
                setTimeout(showWinModal, 600); // Wait for last match animation
            }

        } else {
            // Wrong match
            cardsToProcess.forEach(c => {
                c.classList.remove('selected');
                c.classList.add('wrong');
                // Remove wrong class after animation so it can trigger again next time
                setTimeout(() => {
                    c.classList.remove('wrong');
                }, 500);
            });
        }

        // Reset selections
        selectedCards = { material: null, feature: null, clothes: null };
    }
}

function showWinModal() {
    finalScoreEl.innerText = score;
    finalTimeEl.innerText = time;
    localStorage.setItem('cert_dynasty', 'true');
    winModal.style.display = 'flex';
}

restartBtn.addEventListener('click', initGame);

// Start game on load
window.onload = initGame;
