define(function (require, exports, module) {
    require('jquery.easing.1.3');

    const CommandManager = brackets.getModule("command/CommandManager");
    const Menus = brackets.getModule("command/Menus");
    const WorkspaceManager = brackets.getModule("view/WorkspaceManager");
    const ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    const infocusExtPath = ExtensionUtils.getModulePath(module);
    const AppInit = brackets.getModule("utils/AppInit");
    const FileSystem = brackets.getModule('filesystem/FileSystem');
    const ProjectManager = brackets.getModule('project/ProjectManager');

    const CurrentDat = 'current.dat';

    const panelHtml = require("text!panel.html");
    var panel;

    const CODEISMONEY_SHOW = "codeismoney.show";
    const COMMAND_ID = "CodeIsMoney";

    const ignoreKeyList = [8, 37, 38, 39, 40, 46];
    const seFileName = 'coin00.ogg';
    const imageFileName = 'coin.gif';
    const fileSet = 20;

    var currentGold = 0;

    var seCount = 0;
    var se = [];
    for (var i = 0; i < fileSet; i++) {
        se.push(new Audio(infocusExtPath + seFileName));
    }


    var coinNum = 0;

    function setCoinObj() {
        var objId = 'coin' + coinNum;
        coinNum++;
        var imagePath = infocusExtPath + imageFileName;
        $('#panel-current-your-money')
            .append(
                '<img src="' +
                imagePath +
                '" alt="" id="' + objId + '" width="' + 24 + '" height="' + 24 + '">');

        var tempLeft = Math.floor(Math.random() * 201) - 24;
        var tempTop = (-1) * Math.floor(Math.random() * 101) - 50;
        $('#' + objId).css({
            width: 24 + 'px',
            height: 24 + 'px',
            overflow: 'hidden',
            position: 'absolute',
            display: 'inline',
            top: tempTop + 'px',
            left: tempLeft + 'px',
        });

        $('#' + objId).animate({
            top: 0,
            left: 200 - 24
        }, {
            duration: 700,
            specialEasing: {
                top: 'easeInQuad',
                left: 'easeInQuad'
            },
            done: function (animation, goToEnd) {
                playSound();
                currentGold++;
                document.getElementById("text-current-your-money").innerHTML = currentGold.toLocaleString();

                $('#' + objId).remove();
            },
            fail: function (animation, goToEnd) {

            },
            always: function (animation, goToEnd) {}
        });
    }

    /**
     * キー入力時のイベント
     */
    function KeyDownFunc(e) {
        if (!panel.isVisible()) {
            return;
        }

        var keyCode = e.keyCode;

        //特定のキーが入力された場合は無視
        if (ignoreKeyList.indexOf(keyCode) >= 0) {
            return;
        }


        setCoinObj();
    }

    function playSound() {
        se[seCount].play();
        seCount++;
        if (seCount >= se.length) {
            seCount = 0;
        }
    }


    //キー入力時イベントリスナの設定
    document.addEventListener("keydown", KeyDownFunc);
    //終了時イベントリスナの設定
    window.addEventListener('beforeunload', function (e) {
        writeCurrent();
    }, false);

    function writeCurrent() {
        var targetFile = FileSystem.getFileForPath(ProjectManager.getProjectRoot().fullPath + CurrentDat);
        targetFile.write(String(currentGold));
    }

    var unload = function () {
        writeCurrent();
    };
    exports.unload = unload;


    function handle() {
        if (panel.isVisible()) {
            writeCurrent();
            panel.hide();
            CommandManager.get(CODEISMONEY_SHOW).setChecked(false);
        } else {
            //ここでcurrent.datから現在の金額を読み込む
            var targetFile = FileSystem.getFileForPath(ProjectManager.getProjectRoot().fullPath + CurrentDat);
            targetFile.read(function (err, content) {
                currentGold = content;
                if (isNaN(currentGold)) {
                    currentGold = 0;
                } else {
                    currentGold = Number(currentGold);
                }

                //読み込んだらパネル表示
                document.getElementById("text-current-your-money").innerHTML = currentGold.toLocaleString();
                panel.show();
                CommandManager.get(CODEISMONEY_SHOW).setChecked(true);
            });

        }
    }



    AppInit.appReady(function () {
        ExtensionUtils.loadStyleSheet(module, "style.css");
        CommandManager.register(COMMAND_ID, CODEISMONEY_SHOW, handle);
        var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        menu.addMenuItem(CODEISMONEY_SHOW, "Ctrl-Alt-?");
        panel = WorkspaceManager.createBottomPanel(CODEISMONEY_SHOW, $(panelHtml), 48);

        // Close the panel by clicking on X
        /*
        $('#infocus-panel .close').click(function () {
            handle();
        });
        */
    });


});

//----------
