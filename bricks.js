/*
	Code by Gaetano Bonofiglio
	https://github.com/Kidel/
	MIT License
*/

var canvas = document.getElementById("bricksCanvas");
var ctx = canvas.getContext("2d");

var BALL_COLOR = "#FFFFFF";
var PADDLE_COLOR = "#d8d8d8";
var BRICK_COLORS = ["#c84848", "#c66c3a", "#a2a22a", "#48a048", "#4248c8"];
//мяч
var ball = {
    // Текущее положение мяча
    position: { x: 0, y: 0 },

    // Текущая скорость мяча
    velocity: { x: 0, y: 0 },

    // Радиус мяча
    radius: 10,

    // Цвет мяча, установленный равным BALL_COLOR
    color: BALL_COLOR,

    // Разница между радиусом мяча и его столкновением, используемая в проверках
    colliderDifference: 5,

    // Массив объектов, с которыми мяч может взаимодействовать (начиная с ракетки и блоков)
    physics: [],

    // Отрисовка мяча на canvas
    draw: function (canvasContext) {
        canvasContext.beginPath();
        canvasContext.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        canvasContext.fillStyle = this.color;
        canvasContext.fill();
        canvasContext.closePath();
    },

    // Применение текущей скорости для обновления положения мяча
    applyVelocity: function () {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    },

    // Обработка отскока мяча от объектов, стенок canvas и управление звуковыми эффектами
    bounce: function (canvas) {
        var i = 0;
        var hitX = false;

        // Проверка столкновений по оси X
        for (i = 0; i < this.physics.length; i++) {
            hitX = hitX || this.collisionX(this.physics[i]);
            if (hitX) {
                if (this.physics[i].canBeDestroyed) {
                    this.physics[i].destroy(); // Разрушение объекта, если он может быть разрушен
                    this.physics.splice(i, 1); // Удаление объекта из массива physics
                }
                break;
            }
        }

        // Проверка выхода за границы canvas по оси X
        var oocX = this.isOutOfCanvasX(canvas);
        if (oocX || hitX)
            this.velocity.x = -this.velocity.x; // Изменение направления скорости мяча

        var hitY = false;
        var j = 0;

        // Проверка столкновений по оси Y
        for (j = 0; j < this.physics.length; j++) {
            hitY = hitY || this.collisionY(this.physics[j]);
            if (hitY) {
                if (this.physics[j].canBeDestroyed) {
                    this.physics[j].destroy(); // Разрушение объекта, если он может быть разрушен
                    this.physics.splice(j, 1); // Удаление объекта из массива physics
                }
                break;
            }
        }

        // Проверка выхода за границы canvas по оси Y
        var oocY = this.isOutOfCanvasY(canvas);
        if (oocY || hitY)
            this.velocity.y = -this.velocity.y; // Изменение направления скорости мяча

        // Воспроизведение звуковых эффектов в зависимости от столкновения или выхода за границы canvas
        if (hitX || hitY) j == 0 || i == 0 ? playSound('soft_hit') : playSound('hit');
        if (oocX || oocY) playSound('soft_hit');
    },

    // Проверка выхода за границы canvas по оси X
    isOutOfCanvasX: function (canvas) {
        return this.position.x + this.velocity.x > canvas.width - this.radius + this.colliderDifference ||
            this.position.x + this.velocity.x < this.radius - this.colliderDifference;
    },

    // Проверка выхода за границы canvas по оси Y
    isOutOfCanvasY: function (canvas) {
        return this.position.y + this.velocity.y < this.radius - this.colliderDifference ||
            this.position.y + this.velocity.y > canvas.height - this.radius + this.colliderDifference;
    },

    // Проверка столкновения по оси X с переданным объектом
    collisionX: function (something) {
        return this.position.y + this.radius > something.position.y &&
            this.position.y - this.radius < something.position.y + something.height &&
            ((this.position.x - this.radius + this.colliderDifference == something.position.x + something.width && this.velocity.x < 0) ||
                (this.position.x + this.radius - this.colliderDifference == something.position.x && this.velocity.x >= 0));
    },

    // Проверка столкновения по оси Y с переданным объектом
    collisionY: function (something) {
        return this.position.x + this.radius > something.position.x &&
            this.position.x - this.radius < something.position.x + something.width &&
            ((this.position.y - this.radius + this.colliderDifference == something.position.y + something.height && this.velocity.y < 0) ||
                (this.position.y + this.radius - this.colliderDifference == something.position.y && this.velocity.y >= 0));
    },

    // Установка начального положения и скорости мяча
    start: function (position, velocity) {
        this.position = position;
        this.velocity = velocity;
    },

    // Обновление состояния мяча
    update: function (canvas, canvasContext, paddle) {
        this.draw(canvasContext); // Отрисовка мяча
        this.bounce(canvas); // Обработка отскока мяча
        this.applyVelocity(); // Применение текущей скорости для обновления положения мяча
    }
};
//ракетка
var paddle = {
    // Высота ракетки
    height: 20,

    // Ширина ракетки
    width: 80,

    // Текущее положение ракетки на экране (x, y)
    position: { x: 0, y: 0 },

    // Цвет ракетки, установленный равным PADDLE_COLOR
    color: PADDLE_COLOR,

    // Флаг, который в данном случае не используется (всегда false)
    canBeDestroyed: false,
    // Текст, который будет отображаться на ракетке
    text: "I am",

    // Отрисовка текста на ракетке
    drawText: function (canvasContext) {
        canvasContext.font = "18px Arial"; // Установка шрифта и размера текста
        canvasContext.fillStyle = "#10112e"; // Цвет текста
        canvasContext.fillText(this.text, this.position.x + this.width / 2 - canvasContext.measureText(this.text).width / 2, this.position.y + this.height / 2 + 4);
    },
    // Отрисовка ракетки на canvas
    draw: function (canvasContext) {
        canvasContext.beginPath();
        canvasContext.rect(this.position.x, this.position.y, this.width, this.height);
        canvasContext.fillStyle = this.color;
        canvasContext.fill();
        canvasContext.closePath();
    },
    
    

    // Управление движением ракетки в зависимости от нажатия клавиш (вправо или влево)
    control: function (canvas) {
        if (controls.rightPressed && !this.isOutOfCanvasLeft(canvas)) {
            this.position.x += 3; // Перемещение вправо
        } else if (controls.leftPressed && !this.isOutOfCanvasRight(canvas)) {
            this.position.x -= 3; // Перемещение влево
        }
    },

    // Проверка выхода ракетки за границу canvas слева
    isOutOfCanvasLeft: function (canvas) {
        return this.position.x > canvas.width - this.width;
    },

    // Проверка выхода ракетки за границу canvas справа
    isOutOfCanvasRight: function (canvas) {
        return this.position.x < 0;
    },

    // Установка начального положения ракетки
    start: function (position) {
        this.position = position;
    },

    // Обновление состояния ракетки// Обновление состояния ракетки
    update: function (canvas, canvasContext) {
        this.control(canvas); // Управление движением ракетки
        this.draw(canvasContext); // Отрисовка ракетки
        this.drawText(canvasContext); // Отрисовка текста на ракетке
    }
    
};

//кирпичи
var bricks = [];

// Создание 40 блоков с различными цветами
for (var i = 0; i < 40; i++) {
	bricks.push({
		height: 12,
		width: 50,
		position: { x: 0, y: 0 },
		color: BRICK_COLORS[0], // Цвет блока изначально устанавливается в первый цвет массива BRICK_COLORS
		status: true, // Флаг, показывающий, активен ли блок
		canBeDestroyed: true, // Флаг, показывающий, может ли блок быть разрушен
		destroy: function () {
			this.status = false; // Метод для разрушения блока, устанавливает флаг status в false
		},
		draw: function (canvasContext) {
			if (this.status) {
				canvasContext.beginPath();
				canvasContext.rect(this.position.x, this.position.y, this.width, this.height);
				canvasContext.fillStyle = this.color;
				canvasContext.fill();
				canvasContext.closePath();
			}
		},
		start: function (position) {
			this.position = position; // Устанавливает начальное положение блока
		},
		update: function (canvasContext) {
			this.draw(canvasContext); // Вызывает метод отрисовки блока
		}
	});
}

var game = {
	stop: false,
	alertShown: false,

	// Проверка, закончена ли игра из-за столкновения мяча с нижней границей canvas
	isGameOver: function (ball, canvas) {
		return ball.position.y + ball.velocity.y > canvas.height - ball.radius + ball.colliderDifference;
	},

	// Проверка, выиграна ли игра (все блоки разрушены)
	isGameWon: function (bricks) {
		var status = false;
		for (var i = 0; i < bricks.length; i++) {
			status = status || bricks[i].status;
			if (status) return false;
		}
		return !status;
	},

	gameOver: function () {
        if (!this.alertShown) {
            writeText("СТАРТ ИГРЫ"); // Выводит сообщение "GAME OVER"
            writeSubText("▶️"); // Выводит подсказку "click to reload"
            playSound('gameover'); // Воспроизводит звук 'gameover'
        }
        this.alertShown = true;
    },

    gameWon: function () {
        if (!this.alertShown) {
            writeText("ТЫ ВЫИГРАЛ"); // Выводит сообщение "YOU WON"
            writeSubText("🔃"); // Выводит подсказку "click to reload"
            playSound('win'); // Воспроизводит звук 'win'
        }
        this.alertShown = true;
    },

	// Обновление состояния игры
	update: function (canvas, ball, bricks) {
		if (this.isGameOver(ball, canvas)) {
			this.gameOver(); // Завершение игры, если условия проигрыша выполнены
			this.stop = true;
		}
		else if (this.isGameWon(bricks)) {
			this.gameWon(); // Завершение игры, если условия победы выполнены
			this.stop = true;
		}
	}
};

//
// Функция, инициализирующая начальное состояние игры
function start() {
	ball.physics.push(paddle);

	// Инициализация блоков и добавление их в массив physics мяча
    for (var i = 0; i < bricks.length; i++) {
        bricks[i].color = BRICK_COLORS[Math.floor(i / 8) % BRICK_COLORS.length];
        bricks[i].start({ x: 5 + (10 + bricks[i].width) * (i - 8 * Math.floor(i / 8)), y: bricks[i].height + 20 * (1 + Math.floor(i / 8)) });
		ball.physics.push(bricks[i]);
	}

	// Начальные установки для мяча и ракетки
	ball.start({ x: canvas.width / 2, y: canvas.height - 30 }, { x: 1, y: -1 });
	paddle.start({ x: (canvas.width - paddle.width) / 2, y: canvas.height - paddle.height - 10 });
}

// Функция обновления игры
function update() {
	if (!game.stop) {
		clearCanvas(canvas, ctx); // Очистка canvas
		game.update(canvas, ball, bricks); // Обновление состояния игры
		paddle.update(canvas, ctx); // Обновление ракетки
		ball.update(canvas, ctx, paddle); // Обновление мяча
		for (var i = 0; i < bricks.length; i++) {
			bricks[i].update(ctx); // Обновление блоков
		}
	}
}

start(); // Инициализация начального состояния игры
setInterval(update, 5); // Установка интервала для обновления игры каждые 5 миллисекунд

// Функция перезагрузки игры
function reloadGame() {
    if (game.stop) location.reload(); // Перезагрузка страницы при завершении игры для начала новой игры
}
// Добавление событий для сенсорного тач-управления
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);

// Переменные для отслеживания начального положения и изменения координат при сенсорном взаимодействии
var touchStartX = 0;

// Обработчик начала сенсорного касания
function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX; // Запись начальной координаты X
}

// Обработчик перемещения при сенсорном взаимодействии
function handleTouchMove(event) {
    var touchX = event.touches[0].clientX; // Текущая координата X
    var deltaX = touchX - touchStartX; // Разница между текущей и начальной координатой X

    // Определение направления движения пальца и обновление положения ракетки
    if (deltaX > 0 && !paddle.isOutOfCanvasLeft(canvas)) {
        paddle.position.x += 3; // Перемещение вправо
    } else if (deltaX < 0 && !paddle.isOutOfCanvasRight(canvas)) {
        paddle.position.x -= 3; // Перемещение влево
    }

    touchStartX = touchX; // Обновление начальной координаты для следующего события
}