// Audio elements
const runSound = new Audio("File/run.mp3");
runSound.loop = true;
const jumpSound = new Audio("File/jump.mp3");
const deadSound = new Audio("File/dead.mp3");

// Game state variables
let gameRunning = false;
let score = 0;
let backgroundPosition = 0;
let playerYPosition = 320;
let jumpFrame = 1;
let runFrame = 1;
let deadFrame = 1;
let gameSpeed = 1;
let flamesAvoided = 0;

// Intervals
let runInterval, jumpInterval, backgroundInterval, scoreInterval, obstacleInterval, deadInterval;

// Game elements
const gameArea = document.getElementById('b');
const player = document.getElementById('boy');
const scoreDisplay = document.getElementById('score');
const endScreen = document.getElementById('end');
const endScoreDisplay = document.getElementById('endScore');
const startScreen = document.createElement('div');

function createStartScreen() {
    startScreen.style.position = 'absolute';
    startScreen.style.width = '100%';
    startScreen.style.height = '100%';
    startScreen.style.backgroundColor = 'rgba(0,0,0,0.7)';
    startScreen.style.display = 'flex';
    startScreen.style.justifyContent = 'center';
    startScreen.style.alignItems = 'center';
    startScreen.style.top = '0';
    startScreen.style.color = 'white';
    startScreen.style.fontSize = '3vw';
    startScreen.style.fontFamily = 'cursive';
    startScreen.innerHTML = '<div><b><i>"Double-click"</i></b> or press <i><b>"Enter"</b></i> to start the game <br> <b><i>"Click"</i></b> or press <b><i>"Space"</i></b> to jump</div>';
    document.body.appendChild(startScreen);
}

function removeStartScreen() {
    startScreen.style.display = 'none';
}

function startGame() {
    if (gameRunning) {
		return;
	}
    gameRunning = true;
    removeStartScreen();
    createObstacles();
    runInterval = setInterval(updatePlayerRun, 100 / gameSpeed);
    runSound.play();
    backgroundInterval = setInterval(updateBackground, 100 / gameSpeed);
    scoreInterval = setInterval(updateScore, 100);
    obstacleInterval = setInterval(moveObstacles, 100 / gameSpeed);
}

function createObstacles() {
    let obstaclePosition = 700;
    for (let i = 0; i < 3; i++) {
        createObstacle(obstaclePosition);
        obstaclePosition += 500;
    }
}

function createObstacle(position) {
    let obstacle = document.createElement("img");
    obstacle.src = "File/flame.gif";
    obstacle.className = "f";
    obstacle.style.left = position + 'px';
    gameArea.appendChild(obstacle);
}

function updatePlayerRun() {
    runFrame = runFrame % 8 + 1;
    player.src = `File/Run (${runFrame}).png`;
}

function updateBackground() {
    backgroundPosition -= 20 * gameSpeed;
    gameArea.style.backgroundPositionX = backgroundPosition + "px";
}

function updateScore() {
    score += 5;
    scoreDisplay.innerHTML = score;
}

function moveObstacles() {
    let obstacles = document.querySelectorAll('.f');
    let playerRect = player.getBoundingClientRect();

    obstacles.forEach((obstacle) => {
        let obstacleLeft = parseFloat(obstacle.style.left || getComputedStyle(obstacle).left);
        obstacleLeft -= 20 * gameSpeed;
        obstacle.style.left = obstacleLeft + 'px';

        let obstacleRect = obstacle.getBoundingClientRect();

        if (obstacleLeft <= -obstacleRect.width) {
            obstacle.remove();
            flamesAvoided++;
            if (flamesAvoided % 5 === 0) {
                increaseGameSpeed();
            }
        }

        // Collision detection
        if (
            obstacleRect.left+50 < playerRect.right-75 &&
            obstacleRect.right-50 > playerRect.left+145 &&
            obstacleRect.top+50 < playerRect.bottom-20 &&
            obstacleRect.bottom > playerRect.top
        ) {
            gameOver();
        }
    });

    if (obstacles.length < 3) {
        let lastObstacleLeft = Math.max(...Array.from(obstacles).map(o => parseFloat(o.style.left || getComputedStyle(o).left)));
        createObstacle(lastObstacleLeft + window.innerWidth * 0.5); // 50% of viewport width apart
    }
}


function increaseGameSpeed() {
    gameSpeed *= 1.1;
	runSound.playbackRate = gameSpeed*1.2;
    clearInterval(runInterval);
    clearInterval(backgroundInterval);
    clearInterval(obstacleInterval);
    runInterval = setInterval(updatePlayerRun, 100 / gameSpeed);
    backgroundInterval = setInterval(updateBackground, 100 / gameSpeed);
    obstacleInterval = setInterval(moveObstacles, 100 / gameSpeed);
}

function jump() {
    if (!gameRunning || jumpInterval) {
		return;
	}
    clearInterval(runInterval);
    runSound.pause();
    jumpInterval = setInterval(updatePlayerJump, 100 / gameSpeed);
    jumpSound.play();
}

function updatePlayerJump() {
    let currentBottom = parseFloat(getComputedStyle(player).bottom);
    let viewportHeight = window.innerHeight;
    
    if (jumpFrame <= 6) {
        currentBottom += viewportHeight * 0.05; // Jump up by 5% of viewport height
    } else {
        currentBottom -= viewportHeight * 0.05; // Fall down by 5% of viewport height
    }
    
    player.style.bottom = currentBottom + 'px';
    jumpFrame++;
    player.src = `File/Jump (${jumpFrame}).png`;
    
    if (jumpFrame === 13) {
        jumpFrame = 1;
        clearInterval(jumpInterval);
        jumpInterval = null;
        player.style.bottom = ''; // Reset to default (controlled by CSS)
        runInterval = setInterval(updatePlayerRun, 100 / gameSpeed);
        runSound.play();
    }
}

function gameOver() {
    gameRunning = false;
    clearAllIntervals();
    runSound.pause();
    deadInterval = setInterval(updatePlayerDead, 100);
    deadSound.play();
}

function updatePlayerDead() {
    deadFrame++;
    if (deadFrame === 11) {
        deadFrame = 10;
        player.style.bottom = "15vh";
		endScreen.style.visibility = "visible";
        endScoreDisplay.innerHTML = score;
        clearInterval(deadInterval);
    }
    player.src = `File/Dead (${deadFrame}).png`;
}

function clearAllIntervals() {
    clearInterval(runInterval);
    clearInterval(jumpInterval);
    clearInterval(backgroundInterval);
    clearInterval(scoreInterval);
    clearInterval(obstacleInterval);
}

function restartGame() {
    location.reload();
}

// Event listeners
document.addEventListener('keydown', handleKeyPress);
gameArea.addEventListener('click', jump);
document.addEventListener('dblclick', startGame);
gameArea.addEventListener('mousemove', showCursor);
gameArea.addEventListener('mouseout', hideCursor);
end.addEventListener('keydown', handleKeyPress);


function handleKeyPress(event) {
    if (event.key === 'Enter' && !gameRunning) {
        startGame();
    } else if (event.key === ' ' && gameRunning) {
        jump();
    }
}

function showCursor() {
    gameArea.style.cursor = 'pointer';
}

function hideCursor() {
    gameArea.style.cursor = 'none';
}

// Expose functions to global scope for HTML onclick attributes
window.restartGame = restartGame;

// Initialize the game
createStartScreen();