var turn		 = 1;           // Кто начинает первый 0-копьютер, 1-клиент
var gameStatus   = 1;			// Состояние игры 1-активное, 0-ожидание следующей
var winsClient   = 0;			// Кол-во побед Клиента
var winsComputer = 0;			// Кол-во побед Компьютера
var winsDraw 	 = 0;			// Кол-во ничьих
var countMove	 = 0;			// Номер текущего хода
var countGame	 = 1;			// Номер текущей игры
var map  = [0,0,0,0,0,0,0,0,0]; // Игровое поле 3x3  0-пусто, 1-ход клиента, 2-ход компьютера

// 0 1 2
// 3 4 5  - индексы игрового поля
// 6 7 8
/* Массив выигрышных комбинаций */
var awin = [ [0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [6,4,2] ];

/* Main code */
$(document).ready(function(){
	$('#game').click(function(e){
		var id = e.target.id;   /* Получаем id дива на котором произошел клик */
		var key = id.substr(-1);/* Получаем индекс массива поля  */		
		if(gameStatus == 0 || map[key] > 0)	return false;// Если игра неактивна или клетка не пустая то отмена события
		map[key] = 1;
         $('#' + id).css('background-image','url(img/'+turn+'.png)'); // отображаем ход
		if(isWin(1)) return false; // Проверка на победу клиента
		countMove++;
		if(isDraw()) return false; // Проверка на ничью
		goComputer();			   // Ход компьютера		
		if(isWin(2)) return false; // Проверка на победу компьютера
		if(isDraw()) return false; // Проверка на ничью
	});
});

/* Ход компьютера */
function goComputer(){
	var moveHere = null;
	var find = false;
	
	/* (j=2 => ищем победный ход) (j=1 => ищем ход для препятствия победы клиента) */
	for(var j = 2; j > 0; j--){
		for(var i = 0; i < awin.length; i++){
			var a = awin[i]; // по массиву выигрышных комбинаций ищем подходящий ход
			if( map[a[0]] == j && map[a[1]] == j && map[a[2]] == 0) { moveHere = a[2]; find = true; break; }
			if( map[a[1]] == j && map[a[2]] == j && map[a[0]] == 0) { moveHere = a[0]; find = true; break; }
			if( map[a[0]] == j && map[a[2]] == j && map[a[1]] == 0) { moveHere = a[1]; find = true; break; }
		}
		if(find == true) break;
	}
	
	/* Если ход не найден => делаем случайный ход */
	if(moveHere == null){			 
		var a = [];
		for(var i = 0; i < map.length; i++)
			if( map[i] == 0 ) a.push(i);
		shuffle(a);
		moveHere = a[0];
	}
	
	map[moveHere] = 2;
	countMove++;
	if(turn==0) var img = 1; // Определяем чем ходит компьютер (крестиком или ноликом)
	else		var img = 0;
	
	$('#c' + moveHere).hide().css('background-image','url(img/'+img+'.png)').fadeIn(); // отображаем ход
}

/* Проверка на ничью */
function isDraw() {
	if( countMove < 9 ) return false;
	winsDraw++;
	$("#msg").text('Ничья').css('color','black').slideDown("slow");
	gameOver(-1, 0);
	return true;
}

/* Проверка на победу (Клиент who=1, компьютер who=2) */
function isWin(who) {
	for(var i = 0; i < awin.length; i++){
		var a = awin[i]; // проверяем в цикле по массиву выигрышных комбинаций
		if( map[a[0]]==map[a[1]] && map[a[1]]==map[a[2]] && map[a[2]] > 0 ) {
			if(who==1){
				winsClient++; 
				$("#msg").text('Вы выиграли. Поздравляю !').css('color','blue').slideDown("slow");
			}
			else{
				winsComputer++; 
				$("#msg").text('Вы проиграли').css('color','red').slideDown("slow");
			}			
			gameOver(i, who);
			return true;
		}
	}
	return false;
}

/**
 * Конец игры 
 * @param int w индекс выигрышной комбинации (если -1 то ничья)
 * @param int status статус завершения 0-ничья, 1-победа, 2-поражение
 */
function gameOver(w, status) {
	gameStatus = 0;
	/* Если победа => Подсветка выигрышной комбинации на поле */
	if(w != -1) {
		var a = awin[w]; //Получаем из глобального массива выигрышную комбинацию
		$(".cell").each(function(){
			var id = $(this).attr('id');
			if( id != 'c'+a[0] && id != 'c'+a[1] && id != 'c'+a[2] )
				$(this).fadeTo(300, 0.25);
		});
	}
	printScore();				// Вывод общего счета игры
	$("#archive_block").show(); // Если display:none , то показываем
	saveHistory(status);
	setTimeout(newGame, 2500);  // Через 3 сек запуск новой игры
}

/* Вывод общего счета */
function printScore() {
	var str = 'Общий счет: <span style="color:blue" title="Кол-во ваших побед">' + winsClient + '</span> - ';
	    str+= '<span style="color:#CCC" title="Кол-во ничьих">' + winsDraw + '</span> - ';
		str+= '<span style="color:red" title="Кол-во побед компьютера">' + winsComputer + '</span> ';
	if	    (winsClient > winsComputer) str += 'в вашу пользу';
	else if (winsClient < winsComputer) str += 'в пользу компьютера';
	else							    str += 'ничья';
	$('h2').html(str);
}

/* Запуск новой игры */
function newGame() {
	$(".cell").each(function(){
		$(this).css('background-image','none').fadeTo(0,1); // Очистка поля
	});
	/* визуальные эффекты  */
	$("#msg").slideUp("slow");
	$("#game").hide().fadeIn(800);
	
	map  = [0,0,0,0,0,0,0,0,0]; // Очистка массива поля
	gameStatus = 1;				// Активация состояния игры
	countMove  = 0;				// Сброс счетчика ходов
	countGame++;
	/* Если очередность хода компьютера, то даем ему 1й ход */
	if( turn++ > 0 ){
		turn =0;
		goComputer();
	}
}

/* Запись игры в архив */
function saveHistory(status){
	var game  = '<table class="history" align="center">';
  		game += '<tr><td colspan="3">Игра № '+countGame+'</td></tr><tr><td>';
  		game += '<div class="game_history">';
		for(var i = 0; i < 9; i++){
			/* Определение фона */
			var n = 0; // По умолчанию пусто
			if	   (map[i]==1) n = 1;
			else if(map[i]==2) n = 2;
			/* Если 1й ходил компьютер, то меняем  */			
			if(turn==0){
				if	   (n==1) n=2;
				else if(n==2) n=1;
			}			
			game += '<div class="scell bg'+ n +'"></div>';
		}
		game += '</div>';
		if     (status==0) game += '</td></tr><tr><td colspan="3">Ничья</td></tr></table>';
		else if(status==1) game += '</td></tr><tr><td colspan="3" style="color:blue">Победа</td></tr></table>';
		else			   game += '</td></tr><tr><td colspan="3" style="color:red">Проигрыш</td></tr></table>';
	$(".history").fadeTo(1000,0.4);
	$("#addgame").prepend(game);
}

/* Аналог PHP функции shuffle() */
function shuffle( array ) {
    for(var j, x, i = array.length; i; j = parseInt(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
        return true;
}