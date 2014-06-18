# Responsive Snake  [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

A Responsive HTML5 Snake Game with a particle explosion on food impact!


## Requirements

  You must have `Zepto` or `jQuery` attached to the Window Global


## Usage

  Install through Bower

  `bower install responsive-snake`

  Customization:

    You may define a width (width="400px") / height (height="400px") on the canvas tag itself
    OR use the data attribute `data-full-screen="true"` for full-screen

  Game Options

    - snakePixels (int) default : 14
        - Snake piece width in pixels
    - snakeSize (int) default : 3
        - How many snake pieces to start with
    - foodColor (string) default : random color
        - Custom Food Color (#ff0000 || rgb(0,0,0))
    - bot (int) default : true
        - Do you want the bot to play when you start the game?
    - timeout (int) default : 1000
        - How long to wait in between game loses
    - explosion (bool) default : true
        - Do you want to particle explosion when food is consumed


## Sample Markup

```
<script src="path/to/snake.build.min.js"></script>

<canvas id="snake-canvas" autofocus="autofocus" data-full-screen="true"></canvas>

<div id="scoreboard">
    <div id="score">
        Score :
        <span>0</span>
    </div>

    <div id="hi-score">
        Hi Score :
        <span>0</span>
    </div>

    <div id="bot-hi-score">
        Bot Hi Score :
        <span>0</span>
    </div>
</div>

<script>
    //Start Snake Game
    $(document).ready(function() {
        ResponsiveSnake.start({
            snakePixels    : 14,
            snakeSize      : 4,
            bot            : true,
            explosion      : true
        });
    });
</script>
```

## To View The Example

  visit http://iamchrismiller.github.io/responsive-snake/example/

  OR

  `git clone https://github.com/iamchrismiller/responsive-snake.git`

  `npm install`

  `grunt dev`

  `open http://127.0.0.1:8000/example/`


## Release History

 * 2014-06-17   v0.1.2   Fixed bot enabled flag
 * 2014-06-17   v0.1.1   Added "play" options, exports for AMD/CommonJS
 * 2014-06-17   v0.1.0   Initial Release

---
