// mode=1 pipan, 2=servoblaster
var mode = 0;

var pan = 150;
var tilt = 150;
var cmd = "";
var pan_bak = 150;
var tilt_bak = 150;
var pan_start;
var tilt_start;
var touch = false;
var moved = false;
var led_stat = false;
var ajax_pipan;
var pipan_mouse_x;
var pipan_mouse_y;
var move_threshold = 1;

document.onkeydown = pipan_onkeydown;
document.onkeypress = pipan_onkeypress;
 
if(window.XMLHttpRequest) {
  ajax_pipan = new XMLHttpRequest();
}
else {
  ajax_pipan = new ActiveXObject("Microsoft.XMLHTTP");
}
ajax_pipan.onreadystatechange = ajax_pipan_done;
 
function ajax_pipan_done() {
  if(ajax_pipan.readyState == 4) {
    if(touch) {
      if((pan_bak != pan) || (tilt_bak != tilt)) {
        ajax_pipan_start();
      }
      else {
        setTimeout("ajax_pipan_done()", 100);
      }
    }
  }
}
 
function ajax_pipan_start () {
  if (mode == 1)
     ajax_pipan.open("GET","pipan.php?pan=" + pan + "&tilt=" + tilt, true);
  else if (mode == 2)
     ajax_pipan.open("GET","pipan.php" + cmd, true);
     
	console.log(cmd);
	//document.getElementById("marker").style.left = ((250 - pan) * document.getElementById("mjpeg_dest").clientWidth / 200 + document.getElementById("mjpeg_dest").offsetLeft) + "px";
	//document.getElementById("marker").style.top = ((tilt - 50) * document.getElementById("mjpeg_dest").clientHeight / 200 + document.getElementById("mjpeg_dest").offsetTop) + "px";

  if (mode != 0)
     ajax_pipan.send();
  
  pan_bak = pan;
  tilt_bak = tilt;
}
 
function servo_left () {
  pan = Math.min(250, pan + 3);
  cmd = "?x=" + pan;
  ajax_pipan_start();
  //document.getElementById("arrowLeft").style.borderRight="40px solid red";
  //window.setTimeout(clear_arrow_left, 100)
}
function clear_arrow_left() {
	 document.getElementById("arrowLeft").style.borderRight="40px solid #428bca";
}
function servo_right () {
  pan = Math.max(50, pan - 3);
  cmd = "?x=" + pan;
  ajax_pipan_start();
  //document.getElementById("arrowRight").style.borderLeft="40px solid red";
  //window.setTimeout(clear_arrow_right,100);
}
function clear_arrow_right() {
	document.getElementById("arrowRight").style.borderLeft="40px solid #428bca";
}

function servo_up () {
  tilt = Math.max(50, tilt - 5);
  cmd = "?y=" + tilt;
  ajax_pipan_start();
  //document.getElementById("arrowUp").style.borderBottom="40px solid red";
  //window.setTimeout(clear_arrow_up,100);
}
function clear_arrow_up() {
	 document.getElementById("arrowUp").style.borderBottom="40px solid #428bca";
}
 
function servo_down () {
  tilt = Math.min(250, tilt + 5);
  cmd = "?y=" + tilt;
  ajax_pipan_start();
  //document.getElementById("arrowDown").style.borderTop="40px solid red";
  //window.setTimeout(clear_arrow_down,100);
}
function clear_arrow_down() {
	 document.getElementById("arrowDown").style.borderTop="40px solid #428bca";
}
 
function led_switch () {
 
  if(!led_stat) {
    led_stat = true;
    ajax_pipan.open("GET","pipan.php?red=" + document.getElementById("pilight_r").value + "&green=" + document.getElementById("pilight_g").value + "&blue=" + document.getElementById("pilight_b").value, true);
    ajax_pipan.send();
  }
  else {
    led_stat = false;
    ajax_pipan.open("GET","pipan.php?red=0&green=0&blue=0", true);
    ajax_pipan.send();
  }
 
}
 
function pipan_onkeydown (e) {
 
  if(e.keyCode == 37) servo_left();
  else if(e.keyCode == 38) servo_up();
  else if(e.keyCode == 39) servo_right();
  else if(e.keyCode == 40) servo_down();
  //else if(e.keyCode == 102) led_switch();
}
 
function pipan_onkeypress (e) {
  if(e.keyCode == 97) servo_left();
  else if(e.keyCode == 119) servo_up();
  else if(e.keyCode == 100) servo_right();
  else if(e.keyCode == 115) servo_down();
}
 
function pipan_start () {
 
  pipan_mouse_x = null;
  pipan_mouse_y = null;
  pan_start = pan;
  tilt_start = tilt;
  document.body.addEventListener('mousemove', pipan_move, false)
  document.body.addEventListener('mouseup', pipan_stop, false)
  touch = true;
  moved = false;
  ajax_pipan_start();
  console.log("mouse down");
}
 
function pipan_move (e) {
 
  var ev = e || window.event;
 
  if(pipan_mouse_x == null) {
    pipan_mouse_x = e.clientX;
    pipan_mouse_y = e.clientY;
  }
  mouse_x = e.clientX;
  mouse_y = e.clientY;
 
  if (Math.abs(mouse_x - pipan_mouse_x) > move_threshold ||
	  Math.abs(mouse_y - pipan_mouse_y) > move_threshold) {
    moved = true;
  }
  moved = true;

  var pan_temp = pan_start + Math.round((mouse_x-pipan_mouse_x)/5);
  var tilt_temp = tilt_start + Math.round((pipan_mouse_y-mouse_y)/5);
  if(pan_temp > 250) pan_temp = 250;
  if(pan_temp < 50) pan_temp = 50;
  if(tilt_temp > 250) tilt_temp = 250;
  if(tilt_temp < 50) tilt_temp = 50;
 
  pan = pan_temp;
  tilt = tilt_temp;
 
  cmd = "?x=" + pan + "&y=" + tilt;
  console.log("mouse move " + cmd + "(" + moved + ")");
}
 
 
function pipan_stop (e) {
  document.body.removeEventListener('mousemove', pipan_move, false)
  document.body.removeEventListener('mouseup', pipan_stop, false)
  touch = false;
  if(pipan_mouse_x == null) {
    console.log("mouse up, no move");
    pipan_mouse_x = e.offsetX;
    pipan_mouse_y = e.offsetY;
  }
  else {
    console.log("mouse up, with move");
  }
}

var click_cnt = 0;
var click_timeout;

function pipan_click(e) {

  console.log("click " + click_cnt);

  click_cnt++;

  if (click_cnt == 1) {
      click_timeout = setTimeout(function () {
	      console.log("timedout");
        if (moved == false) {
          console.log("toggle");
          //pipan_toggle_fullscreen(e);
        }
        click_cnt = 0;
      }, 250);
    } else {
      console.log("double-click");
      clearTimeout(click_timeout);
      pipan_doubleclick(e);
      click_cnt = 0;
    }
}

function pipan_doubleclick(e) {

  var img = document.getElementById("mjpeg_dest");
  var x = 250 - Math.round(200 * pipan_mouse_x / img.clientWidth);
  var y = 50 + Math.round(200 * pipan_mouse_y / img.clientHeight);

  pan = x;
  tilt = y;

  console.log("Going to " + x + "," + y);

  cmd = "?x=" + pan + "&y=" + tilt;
  ajax_pipan_start();
}


function pipan_toggle_fullscreen(e) {
  var background = document.getElementById("background");

  if(!background) {
    background = document.createElement("div");
    background.id = "background";
    document.body.appendChild(background);
  }
  
  if(e.className == "fullscreen") {
    e.className = "";
    background.style.display = "none";
  }
  else {
    e.className = "fullscreen";
    background.style.display = "block";
  }
}

function init_pt(p,t) {
  console.log("init_pt(" + p + "," + t + ")");
  pan = p;
  tilt = t;
}

function set_panmode(m) {
  mode = m;
}

