const tg = window.Telegram.WebApp;
tg.expand();

// Инициализация данных пользователя
let userData = {
    stars: localStorage.getItem('stars') ? parseInt(localStorage.getItem('stars')) : 1000,
    inventory: JSON.parse(localStorage.getItem('inventory')) || []
};

// Обновление отображения баланса
function updateBalance() {
    document.getElementById('stars').textContent = userData.stars;
}

// Данные кейсов
const cases = {
    "Обычный": {
        price: 100,
        items: [
            { name: "Обычный подарок 1", image: "https://i.yapx.ru/aGMLa.png", probability: 0.5 },
            { name: "Обычный подарок 2", image: "https://i.yapx.ru/aGMei.png", probability: 0.3 },
            { name: "Редкий подарок", image: "https://i.yapx.ru/aGMe1.png", probability: 0.15 },
            { name: "Эпический подарок", image: "https://i.yapx.ru/aGMe8.png", probability: 0.05 }
        ]
    },
    "Редкий": {
        price: 250,
        items: [
            { name: "Редкий подарок 1", image: "https://i.yapx.ru/aGMfO.png", probability: 0.6 },
            { name: "Редкий подарок 2", image: "https://i.yapx.ru/aGMfS.png", probability: 0.25 },
            { name: "Эпический подарок", image: "https://i.yapx.ru/aGMff.png", probability: 0.1 },
            { name: "Легендарный подарок", image: "https://i.yapx.ru/aGMgI.png", probability: 0.05 }
        ]
    },
    "Эпический": {
        price: 500,
        items: [
            { name: "Эпический подарок 1", image: "https://i.yapx.ru/aGMaI.png", probability: 0.55 },
            { name: "Эпический подарок 2", image: "https://i.yapx.ru/aGMcn.png", probability: 0.3 },
            { name: "Легендарный подарок", image: "https://i.yapx.ru/aGMfO.png", probability: 0.1 },
            { name: "Мифический подарок", image: "https://i.yapx.ru/aGMe8.png", probability: 0.05 }
        ]
    },
    "Легендарный": {
        price: 1000,
        items: [
            { name: "Легендарный подарок 1", image: "https://i.yapx.ru/aGMfO.png", probability: 0.6 },
            { name: "Легендарный подарок 2", image: "https://i.yapx.ru/aGMe8.png", probability: 0.25 },
            { name: "Мифический подарок", image: "https://i.yapx.ru/aGMgI.png", probability: 0.1 },
            { name: "Уникальный подарок", image: "https://i.yapx.ru/aGMLa.png", probability: 0.05 }
        ]
    },
    "Мифический": {
        price: 2500,
        items: [
            { name: "Мифический подарок 1", image: "https://i.yapx.ru/aGMe8.png", probability: 0.5 },
            { name: "Мифический подарок 2", image: "https://i.yapx.ru/aGMfO.png", probability: 0.3 },
            { name: "Уникальный подарок", image: "https://i.yapx.ru/aGMLa.png", probability: 0.15 },
            { name: "Божественный подарок", image: "https://i.yapx.ru/aGMe1.png", probability: 0.05 }
        ]
    }
};

let currentCaseType = null;
let isSpinning = false;

// Инициализация кнопок
document.addEventListener('DOMContentLoaded', function() {
    // Обработчики для кнопок открытия кейсов
    document.querySelectorAll('.open-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const caseElement = this.closest('.case');
            currentCaseType = caseElement.getAttribute('data-type');
            openCaseView(currentCaseType);
        });
    });
    
    // Обработчик для кнопки "Крутить"
    document.getElementById('spin-btn').addEventListener('click', spinRoulette);
    
    // Обработчики для кнопок назад
    document.getElementById('back-btn').addEventListener('click', backToCases);
    document.getElementById('back-inventory-btn').addEventListener('click', backToCases);
    
    // Обработчик для кнопки инвентаря
    document.getElementById('inventory-btn').addEventListener('click', showInventory);
});

// Открытие просмотра кейса
function openCaseView(type) {
    document.querySelector('.cases-container').style.display = 'none';
    document.getElementById('case-view').style.display = 'block';
    document.getElementById('inventory-btn').style.display = 'none';
    
    const caseData = cases[type];
    document.getElementById('case-title').textContent = type + ' кейс';
    
    // Показываем предметы кейса в превью
    const caseItemsPreview = document.getElementById('case-items-preview');
    caseItemsPreview.innerHTML = '';
    
    caseData.items.forEach(item => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <p>${item.name}</p>
        `;
        caseItemsPreview.appendChild(previewItem);
    });
    
    // Подготавливаем рулетку
    prepareRoulette(type);
}

// Подготовка рулетки
function prepareRoulette(type) {
    const roulette = document.getElementById('roulette');
    const resultDiv = document.getElementById('result');
    const spinBtn = document.getElementById('spin-btn');
    
    roulette.innerHTML = '';
    resultDiv.innerHTML = '';
    spinBtn.disabled = false;
    
    const caseData = cases[type];
    
    // Создаем взвешенный список предметов для рулетки
    const weightedItems = [];
    caseData.items.forEach(item => {
        const count = Math.floor(item.probability * 100);
        for (let i = 0; i < count; i++) {
            weightedItems.push(item);
        }
    });
    
    // Заполняем рулетку
    weightedItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'roulette-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <p>${item.name}</p>
        `;
        roulette.appendChild(itemElement);
    });
    
    // Устанавливаем ширину рулетки
    const itemWidth = 100;
    const rouletteWidth = weightedItems.length * itemWidth;
    roulette.style.width = `${rouletteWidth}px`;
}

// Запуск рулетки
function spinRoulette() {
    if (isSpinning) return;
    
    const caseData = cases[currentCaseType];
    
    if (userData.stars < caseData.price) {
        alert(`❌ Недостаточно Stars! Нужно ${caseData.price}, у вас ${userData.stars}`);
        return;
    }
    
    const roulette = document.getElementById('roulette');
    const spinBtn = document.getElementById('spin-btn');
    const itemWidth = 100;
    
    isSpinning = true;
    spinBtn.disabled = true;
    
    let startPosition = 0;
    const spinDuration = 8000; // 8 секунд
    const startTime = Date.now();
    const rouletteWidth = roulette.children.length * itemWidth;
    const targetDistance = 3000 + 5000 * Math.random();
    
    function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // Плавное замедление
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const currentPosition = targetDistance * easeOut;
        
        roulette.style.transform = `translateX(-${currentPosition}px)`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Определяем выигранный предмет
            const finalPosition = currentPosition % rouletteWidth;
            const itemIndex = Math.floor(finalPosition / itemWidth);
            const weightedItems = getWeightedItems(currentCaseType);
            const prize = weightedItems[itemIndex % weightedItems.length];
            
            finishSpin(prize);
            isSpinning = false;
        }
    }
    
    animate();
}

// Получение взвешенных предметов
function getWeightedItems(type) {
    const caseData = cases[type];
    const weightedItems = [];
    
    caseData.items.forEach(item => {
        const count = Math.floor(item.probability * 100);
        for (let i = 0; i < count; i++) {
            weightedItems.push(item);
        }
    });
    
    return weightedItems;
}

// Завершение анимации
function finishSpin(prize) {
    const caseData = cases[currentCaseType];
    
    // Вычитаем стоимость
    userData.stars -= caseData.price;
    localStorage.setItem('stars', userData.stars);
    updateBalance();
    
    // Добавляем в инвентарь
    userData.inventory.push(prize);
    localStorage.setItem('inventory', JSON.stringify(userData.inventory));
    
    // Показываем результат
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <div class="prize-result">
            <h3>🎉 Вы выиграли!</h3>
            <img src="${prize.image}" alt="${prize.name}">
            <p>${prize.name}</p>
        </div>
    `;
    
    // Прокручиваем к результату
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// Возврат к списку кейсов
function backToCases() {
    document.querySelector('.cases-container').style.display = 'grid';
    document.getElementById('case-view').style.display = 'none';
    document.getElementById('inventory-view').style.display = 'none';
    document.getElementById('inventory-btn').style.display = 'block';
}

// Показ инвентаря
function showInventory() {
    document.querySelector('.cases-container').style.display = 'none';
    document.getElementById('case-view').style.display = 'none';
    document.getElementById('inventory-view').style.display = 'block';
    document.getElementById('inventory-btn').style.display = 'none';
    
    const inventoryContent = document.getElementById('inventory-content');
    
    if (userData.inventory.length === 0) {
        inventoryContent.innerHTML = '<p class="empty-inventory">Ваш инвентарь пуст</p>';
        return;
    }
    
    let inventoryHTML = "<div class='inventory-grid'>";
    
    // Группируем одинаковые предметы
    const itemsCount = {};
    userData.inventory.forEach(item => {
        itemsCount[item.name] = (itemsCount[item.name] || 0) + 1;
    });
    
    // Отображаем
    for (const [name, count] of Object.entries(itemsCount)) {
        const item = userData.inventory.find(i => i.name === name);
        inventoryHTML += `
            <div class="inventory-item">
                <img src="${item.image}" alt="${name}">
                <p>${name} ×${count}</p>
            </div>
        `;
    }
    
    inventoryHTML += "</div>";
    inventoryContent.innerHTML = inventoryHTML;
}

// Инициализация
updateBalance();