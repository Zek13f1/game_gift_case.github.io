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
            { name: "Обычный подарок 2", image: "https://i.yapx.ru/aGMLa.png", probability: 0.3 },
            { name: "Редкий подарок", image: "https://i.yapx.ru/aGMLa.png", probability: 0.15 },
            { name: "Эпический подарок", image: "https://i.yapx.ru/aGMLa.png", probability: 0.05 }
        ]
    },
    "Редкий": {
        price: 250,
        items: [
            { name: "Редкий подарок 1", image: "https://i.yapx.ru/aGMLa.png", probability: 0.6 },
            { name: "Редкий подарок 2", image: "https://i.yapx.ru/aGMLa.png", probability: 0.25 },
            { name: "Эпический подарок", image: "https://i.yapx.ru/aGMLa.png", probability: 0.1 },
            { name: "Легендарный подарок", image: "https://i.yapx.ru/aGMLa.png", probability: 0.05 }
        ]
    },
    "Эпический": {
        price: 500,
        items: [
            { name: "Эпический подарок 1", image: "https://i.yapx.ru/aGMLa.png", probability: 0.55 },
            { name: "Эпический подарок 2", image: "https://i.yapx.ru/aGMLa.png", probability: 0.3 },
            { name: "Легендарный подарок", image: "https://i.yapx.ru/aGMLa.png", probability: 0.1 },
            { name: "Мифический подарок", image: "https://i.yapx.ru/aGMLa.png", probability: 0.05 }
        ]
    },
    "Легендарный": {
        price: 1000,
        items: [
            { name: "Легендарный подарок 1", image: "https://i.yapx.ru/aGMLa.png", probability: 0.6 },
            { name: "Легендарный подарок 2", image: "https://i.yapx.ru/aGMLa.png", probability: 0.25 },
            { name: "Мифический подарок", image: "https://i.yapx.ru/aGMLa.png", probability: 0.1 },
            { name: "Уникальный подарок", image: "https://i.yapx.ru/aGMLa.png", probability: 0.05 }
        ]
    },
    "Мифический": {
        price: 2500,
        items: [
            { name: "Мифический подарок 1", image: "https://i.yapx.ru/aGMLa.png", probability: 0.5 },
            { name: "Мифический подарок 2", image: "https://i.yapx.ru/aGMLa.png", probability: 0.3 },
            { name: "Уникальный подарок", image: "https://i.yapx.ru/aGMLa.png", probability: 0.15 },
            { name: "Божественный подарок", image: "https://i.yapx.ru/aGMLa.png", probability: 0.05 }
        ]
    }
};

// Функция открытия кейса
function openCase(type) {
    const caseData = cases[type];
    
    if (userData.stars < caseData.price) {
        alert(`❌ Недостаточно Stars! Нужно ${caseData.price}, у вас ${userData.stars}`);
        return;
    }

    const roulette = document.getElementById("roulette");
    const resultDiv = document.getElementById("result");
    const rouletteContainer = document.getElementById("roulette-container");
    
    roulette.innerHTML = "";
    resultDiv.innerHTML = "";
    rouletteContainer.style.display = "block";

    // Создаем взвешенный список предметов
    const weightedItems = [];
    caseData.items.forEach(item => {
        const count = Math.floor(item.probability * 100);
        for (let i = 0; i < count; i++) {
            weightedItems.push(item);
        }
    });

    // Анимация рулетки
    let counter = 0;
    const spinDuration = 10000; // 10 секунд
    const startTime = Date.now();
    let lastFrameTime = 0;
    
    function spin() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // Замедление со временем
        const speed = 1 - progress * 0.9;
        
        if (currentTime - lastFrameTime > 100 * speed) {
            roulette.innerHTML = "";
            
            // Показываем 3 предмета одновременно
            for (let i = 0; i < 3; i++) {
                const idx = (counter + i) % weightedItems.length;
                const item = document.createElement("div");
                item.className = "roulette-item";
                item.innerHTML = `
                    <img src="${weightedItems[idx].image}" alt="${weightedItems[idx].name}">
                    <p>${weightedItems[idx].name}</p>
                `;
                roulette.appendChild(item);
            }
            
            counter++;
            lastFrameTime = currentTime;
        }
        
        if (progress < 1) {
            requestAnimationFrame(spin);
        } else {
            finishSpin(type, weightedItems);
        }
    }
    
    spin();
}

// Завершение анимации
function finishSpin(type, weightedItems) {
    const caseData = cases[type];
    
    // Вычитаем стоимость
    userData.stars -= caseData.price;
    localStorage.setItem('stars', userData.stars);
    updateBalance();
    
    // Выбираем случайный приз
    const randomIndex = Math.floor(Math.random() * weightedItems.length);
    const prize = weightedItems[randomIndex];
    
    // Добавляем в инвентарь
    userData.inventory.push(prize);
    localStorage.setItem('inventory', JSON.stringify(userData.inventory));
    
    // Показываем результат
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `
        <div class="prize-result">
            <h3>🎉 Вы выиграли!</h3>
            <img src="${prize.image}" alt="${prize.name}">
            <p>${prize.name}</p>
            <button onclick="showInventory()">Мои подарки (${userData.inventory.length})</button>
        </div>
    `;
    
    // Прокручиваем к результату
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// Показ инвентаря
function showInventory() {
    const resultDiv = document.getElementById("result");
    const rouletteContainer = document.getElementById("roulette-container");
    
    rouletteContainer.style.display = "none";
    
    if (userData.inventory.length === 0) {
        resultDiv.innerHTML = "<p>Ваш инвентарь пуст</p>";
        return;
    }
    
    let inventoryHTML = "<h3>📦 Ваши подарки:</h3><div class='inventory-grid'>";
    
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
    resultDiv.innerHTML = inventoryHTML;
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// Инициализация
updateBalance();