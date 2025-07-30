const tg = window.Telegram.WebApp;
tg.expand();  // Раскрывает Mini App на весь экран

const prizes = {
    "Обычный": ["Обычный приз 1", "Обычный приз 2", "Редкий приз"],
    "Редкий": ["Редкий приз 1", "Эпический приз", "Легендарный приз"]
};

function openCase(type) {
    const roulette = document.getElementById("roulette");
    roulette.style.display = "block";
    roulette.innerHTML = "";

    // Анимация прокрутки
    let counter = 0;
    const interval = setInterval(() => {
        const item = document.createElement("div");
        item.className = "roulette-item";
        item.textContent = prizes[type][counter % prizes[type].length];
        roulette.appendChild(item);
        
        counter++;
        if (counter > 15) {
            clearInterval(interval);
            showResult(type);
        }
    }, 100);
}

function showResult(type) {
    const prize = prizes[type][Math.floor(Math.random() * prizes[type].length)];
    alert(`🎉 Вы выиграли: ${prize}!`);
}