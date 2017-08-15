define(function (require, exports, module) {

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
    const seFileName = 'coin01.ogg';
    const fileSet = 20;

    var currentGold = 0;

    var seCount = 0;
    var se = [];
    for (var i = 0; i < fileSet; i++) {
        se.push(new Audio(infocusExtPath + seFileName));
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

        playSound();
        currentGold++;
        document.getElementById("text-current-your-money").innerHTML = currentGold.toLocaleString();
    }

    function playSound() {
        se[seCount].play();
        seCount++;
        if (seCount >= se.length) {
            seCount = 0;
        }
    }


    if (document.addEventListener) {
        //イベントリスナの設定
        document.addEventListener("keydown", KeyDownFunc);

    }

    function writeCurrent() {
        var targetFile = FileSystem.getFileForPath(ProjectManager.getProjectRoot().fullPath + CurrentDat);
        targetFile.write(String(currentGold));
    }


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
