const skirtPatch = {
    Animals: './img/Skirt_1/',
    Pokemons: './img/Skirt_2/',
    Monsters: './img/Skirt_3/'
}

const gameSize = {
    Low: {x: 5, y: 2},
    Medium: {x: 6, y: 3},
    Hight: {x: 8, y: 3}
}

class Game{
    constructor(root, initRoot){
        this.skirt = '';
        this.size = {};
        this.root = root;
        this.initRoot = initRoot;
        this.countOpenCards = 0;
        this.time = 0;
        this.isWin = false;
    }
    clock(){
        this.time++;
    }
    showAllCards(){
        Array.from(this.root.querySelectorAll('.flipper')).forEach((item,index)=>{
            item.classList.remove('flipper-rotate');
        })
    }

    hideAllCards(){
        Array.from(this.root.querySelectorAll('.flipper')).forEach((item,index)=>{
            item.classList.add('flipper-rotate');
            this.countOpenCards = 0;
        })
    }

    deleteIfCardsEqual(){
        let sellectedSkirt = [];
        Array.from(this.root.querySelectorAll('.flipper')).forEach((item)=>{
            if (!item.classList.contains('flipper-rotate')){
                sellectedSkirt.push(item);
            }
        })

        if (sellectedSkirt[0].getAttribute('data-skirt')===sellectedSkirt[1].getAttribute('data-skirt')){
            sellectedSkirt[0].parentNode.classList.add('flip-container-disappear');
            sellectedSkirt[1].parentNode.classList.add('flip-container-disappear');
            return true;
        }
        return false;
    }
    winGame(){
        if ((Array.from(document.querySelectorAll('.flip-container-disappear'))).length === this.size.x*this.size.y){
            this.root.innerHTML = `<h2 class = "win_message">Congratulations! You win!<h2>
            <p class="game_results">Your results: ${this.timeFormat(this.time)}</p>
            <button class = 'btn-play-again'>Play again</button>`;
            document.querySelector('.btn-play-again').addEventListener('click', playAgain);
            this.isWin = true;

            function playAgain(e){
                e.preventDefault();
                window.location.reload();
            }
        }
    }
    timeFormat(time){
        let hours = (~~(time/3600)).toString();
        time = time - hours*3600;
        let min = (~~(time/60)).toString();
        if (min.length === 1){
            min = '0' + min;
        }
        let sec = (time - min*60).toString();
        if (sec.length ===1){
            sec = '0' + sec;
        }
        return `${hours}:${min}:${sec}`;
    }
    renderClock(time){
        if (!this.isWin){
            const clock = document.querySelector('#clockRoot');
            clock.innerHTML = this.timeFormat(time);
        }
    }
    render(){
        let clock = `<div class="main_clock">
            <p>Time: <span id="clockRoot">0:00:00</span></p>
        </div>`;
        const cardPosition = this.getCardsPosition();
        let gameTable = `<div class="table-wraper"><table class="gameTable">
            <tbody id="game_container">`;
        gameTable += cardPosition.map((item, indexRow)=>{
            return '<tr>'+(item.map((field, indexCol)=>{
                let card = new Card(this.skirt, this.size);
                return `<td>${card.render(field)}</td>`;
            })).join('')+'</tr>';
        }).join('');
        gameTable += `</tbody>
            </table></div>`;
        this.root.innerHTML =clock + gameTable;
        this.root.addEventListener('click', this.cardRotate.bind(this));
        document.querySelector('.gameTable').style.height = ((window.innerHeight-150))+'px';
    }

    cardRotate(e){
        if (this.countOpenCards<2){
            let target = e.target;
            if (target && target.tagName!=='BUTTON'){
                while (!target.classList.contains('flipper') && target.tagName!=='MAIN'){
                    target = target.parentNode;
                }
                if (target.classList.contains('flipper') && !target.parentNode.classList.contains('flip-container-disappear')){
                    target.classList.toggle('flipper-rotate');
                    this.countOpenCards ++;
                    if (this.countOpenCards>1){
                        setTimeout(()=>{
                            this.countOpenCards = 0;
                            if (!this.deleteIfCardsEqual()){
                                this.hideAllCards();
                            } else{
                                this.winGame();
                                this.hideAllCards();
                            }
                        }, 1000);
                    }
                }
            }
        }
    }

    getCardsPosition(){
        let numcards = this.size.y*this.size.x/2;
        let cardsArray = [];
        let cardPosition = [];
        for (let i=0; i<numcards; i++){
            cardsArray[2*i] = i+1;
            cardsArray[2*i+1] = i+1;
        }
        for(let i = 0; i<this.size.y; i++){
            cardPosition[i] = [];
            for(let j = 0; j<this.size.x; j++){
                let index = ~~(Math.random()*cardsArray.length);
                cardPosition[i][j] = cardsArray[index];
                cardsArray[index] = cardsArray[cardsArray.length - 1];
                cardsArray.pop();
            }
        }
        return cardPosition;
    }

    initGameRender(){
        let isFirst = true;
        let gameSkirtsList ='<div class = "main_game_skirts_list"><p class = "init-skirt">Skirt cards<p>'
        for (let gameSkirt in skirtPatch){
            if (isFirst){
                this.skirt = skirtPatch[gameSkirt];
            }
            gameSkirtsList += `<input type="radio" name = "gameSkirt" ${isFirst?"checked":""} id = ${gameSkirt} value = ${skirtPatch[gameSkirt]}>`
            gameSkirtsList += `<label for=${gameSkirt}> ${gameSkirt} </label>`;
            isFirst = false;
        }
        gameSkirtsList += '</div>';
        isFirst = true;
        let gameDifficulty = '<div class = "main_game_size_list"><p class = "init-difficulty">Game difficulty<p>';
        for (let size in gameSize){
            if (isFirst){
                this.size = gameSize[size];
            }
            gameDifficulty += `<input type="radio" name = "gameSize" ${isFirst?"checked":""} id= ${size} value=${JSON.stringify(gameSize[size])}>`
            gameDifficulty += `<label for=${size}> ${size} (${gameSize[size].x} x ${gameSize[size].y})</label>`;
            isFirst = false;
        }
        gameDifficulty +='</div>';
        this.initRoot.innerHTML = gameSkirtsList + gameDifficulty;
        const skirts_list = document.querySelector('.main_game_skirts_list');
        skirts_list.addEventListener('click', selectSkirt.bind(this));
        const size_list = document.querySelector('.main_game_size_list');
        size_list.addEventListener('click', selectSize.bind(this));

        function selectSkirt(e){
            if (e.target.type === 'radio'){
                this.skirt = e.target.value;
            }
        }

        function selectSize(e){
            if (e.target.type === 'radio'){
                this.size = JSON.parse(e.target.value);
            }
        }

    }

}


class Card{
    constructor(skirt, size){
        this.skirt = skirt;
        this.size = size;
    }

    render(item){
        let widthImg = ~~((window.innerWidth*0.9)/this.size.x);
        let heightImg = ~~((window.innerHeight-170)/this.size.y);
        let sizeImg = (widthImg/240>heightImg/340)?`height = "${heightImg}px"`:`width = "${widthImg}px"`;
        return(`<div class="flip-container" >
            <div class="flipper" data-skirt=${item}>
                <div class="front">
                    <img src=${this.skirt+item+'.png'} alt ="${item}" ${sizeImg}/>
                </div>
                <div class="back">
                    <img src=${this.skirt+'back.png'} alt ="back" ${sizeImg}/>
                </div>
            </div>
        </div>`);
    }
}


const root = document.getElementById('root');
const initalGameRoot = document.getElementById('initional-game');

const game = new Game(root, initalGameRoot);
game.initGameRender(initalGameRoot);

const btnStartGame = document.querySelector('.main_btn_start-game');
btnStartGame.addEventListener('click', startGame);

function startGame(e){
    e.preventDefault();
    game.render();
    game.showAllCards();
    setTimeout(game.hideAllCards, 2000);
    setInterval(()=>{
        game.clock();
        game.renderClock(game.time);
    },1000);
}
