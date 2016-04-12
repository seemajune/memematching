$(function() { 
  matchMeme = new Game();
  matchMeme.play();
  matchMeme.updateScore();
  $('.win').hide();
  $('.lost').hide();
  $('.play-again').hide();
  $('.meme-placeholder').hide();
});

function Game(){
  this.$outerImageDivs = $('.learn-section .col-xs-12.col-md-4');
  this.$memeNames = $('.meme-name');
  this.$points = $('.header-nav p').eq(1);
  this.$display = $('#counter');   
  this.points = 0;
  this.droppedCount = 0;
  this.timeCount = 120;
  this.hasWon;
}

Game.prototype.shuffle = function() {
  var _this = this;

    for (var i = 0; i < _this.memeData.length - 1; i++) {
        var j = i + Math.floor(Math.random() * (_this.memeData.length - i));
        var temp = _this.memeData[j];
        _this.memeData[j] = _this.memeData[i];
        _this.memeData[i] = temp;
    }

  return _this.memeData;
}

Game.prototype.play = function() {
  this.memeData;
  var _this = this;

  this.startTimer();

  $.getJSON('https://api.imgflip.com/get_memes', function (data) {
      _this.memeData = [];
      console.log(_this.memeData);

      for(var i=0; i<_this.$outerImageDivs.length; i++) {
        _this.memeData.push(data["data"]["memes"][i]);
      }

      _this.memeData = _this.shuffle(_this.memeData);

      for(var i=0; i<_this.$outerImageDivs.length; i++) {
        _this.$outerImageDivs.eq(i).append('<img class=' + "learn-info-img" + ' src=' + _this.memeData[i]["url"] + ' />');
      }

      _this.memeData = _this.shuffle(_this.memeData);

      for(var i=0; i<_this.$memeNames.length; i++) {
        _this.$memeNames.eq(i).attr('id',i);
        _this.$memeNames.eq(i).append('<p>' +  _this.memeData[i]["name"] + '</p>');
      }

      _this.$memeImages = $('img.learn-info-img');

  });

  this.$memeNames.on("dragstart", function(e) {
    e.originalEvent.dataTransfer.setData("text", e.currentTarget.id);
  });

  this.$outerImageDivs.on("drop", function(e) {
    e.preventDefault();

    var data = e.originalEvent.dataTransfer.getData("text");

    var $idStr = $("#" + data);
    var addPts;
    
    $('.holder.rec-basics-hldr .meme-placeholder').eq(data).show();

    if(!$(e.currentTarget).has('.meme-name').length){ 
      e.currentTarget.appendChild(document.getElementById(data)); 
      $(this).children().closest('.meme-name').css('margin-left', '0'); 

      for(var i = 0; i <_this.$outerImageDivs.length; i++ ){

        if($(e.currentTarget).children().closest('img').attr('src') == _this.memeData[i]["url"] && $idStr.find('p').text() == _this.memeData[i]["name"]){
          $(e.currentTarget).removeClass('x-overlay');
          $(e.currentTarget).addClass('check-overlay');
          e.currentTarget.style.border = "3px solid #fff";
          addPts = true;
          break;
        }

        else {
          $(e.currentTarget).removeClass('check-overlay');
          $(e.currentTarget).addClass('x-overlay');  
          addPts = false;
        }
      }
    }
    // e.originalEvent.dataTransfer.clearData();
    e.currentTarget.style.border = "3px solid #fff";

    if(addPts){
      _this.points = _this.points + 10;
    } 

    else {
      _this.points = _this.points - 5;
    }

    _this.updateScore();
    
  });
  
  this.$outerImageDivs.on("dragover", function(e) {
    e.preventDefault();
  });

  this.$outerImageDivs.on("dragleave", function(e) {
    e.preventDefault();
    e.currentTarget.style.border = "3px solid #fff";
  });

  this.$outerImageDivs.on("dragenter", function(e) {
    e.preventDefault();
    e.currentTarget.style.border = "3px solid #313567";
  });

  this.$outerImageDivs.on("dragend", function(e) {
    e.preventDefault();

    $(e.currentTarget).children().closest('.meme-name').attr('draggable', 'false');
    $(e.currentTarget).children().closest('.meme-name').css({position: 'absolute', bottom: '-10px', left: '5%'});
    
    _this.droppedCount++;
    _this.droppedCount === _this.$memeNames.length ? _this.checkForWin() : false; 

  });

  $('.play-again').on('click', function(e){
    e.preventDefault();
    _this.restartGame();
  });

};

Game.prototype.updateScore = function(){
  this.$points.text('Points: ' + this.points);
}

Game.prototype.checkForWin = function(){

  var _this = this;
  _this.hasWon  = true;

  for(var i = 0; i< _this.$memeImages.length; i++){
    if(!_this.$memeImages.eq(i).parent().hasClass("check-overlay")){
      _this.hasWon = false;
      $('.recipe-page-main').addClass('overlay');
      $('section.learn-section').addClass('overlay');
      $('.row').fadeOut(1000, "swing");
      $('.lost').fadeIn(1000);
      $('.lost').fadeOut(1000);
      $('.play-again').fadeIn(9000);
      break;
    }
  }

  if(_this.hasWon){
    $('.recipe-page-main').addClass('overlay');
    $('section.learn-section').addClass('overlay');
    $('.row').fadeOut(3000, "swing");
    $('.win').fadeIn(2000);
    $('.win').fadeOut(2000);
    $('.play-again').fadeIn(9000);
  }
  clearInterval(this.timer);
}

Game.prototype.restartGame = function() {
  location.reload(); 
 };

Game.prototype.startTimer = function() {
  
  this.timer = setInterval(function (context) { 
    return function(){
      context.timeCount--;

      var minutes = parseInt(context.timeCount / 60, 10),
        seconds = parseInt(context.timeCount % 60, 10);

      seconds = seconds < 10 ? "0" + seconds : seconds;
      context.$display.text("Time Remaining: " + minutes + ":" + seconds );
      
      if(context.timeCount === 0){
        context.checkForWin();
      }
    }
  }(this), 1000);
}


