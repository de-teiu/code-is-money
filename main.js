/** コードを書くと金が増えるBrackets拡張機能です。 */
define(function (require, exports, module) {
    'use strict';

    //Bracketsのモジュール読み込み
    var PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    var CommandManager = brackets.getModule("command/CommandManager");
    var Menus = brackets.getModule("command/Menus");
    var WorkspaceManager = brackets.getModule("view/WorkspaceManager");
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    var AppInit = brackets.getModule("utils/AppInit");
    var FileSystem = brackets.getModule('filesystem/FileSystem');
    var ProjectManager = brackets.getModule('project/ProjectManager');
    var DocumentManager = brackets.getModule("document/DocumentManager");
    var prefs = PreferencesManager.getExtensionPrefs("brackets-code-is-money");

    //この拡張機能のフルパスを取得
    var infocusExtPath = ExtensionUtils.getModulePath(module);

    //モーション描画用のライブラリ読み込み
    require('jquery.easing.1.3');

    var SAVE_PARAM = 'currentGold';
    var ENABLED_PARAM = 'enabled';
    var CODEISMONEY_SHOW = "codeismoney.show";
    var COMMAND_ID = "CodeIsMoney";

    var SOUND_FILE_NAME = 'coin00.ogg';
    var SOUND_FILE_COUNT = 30;

    var IMAGE_FILE_NAME = 'coin.gif';


    var panel; //拡張機能のDOMを保持

    var seCount = 0;
    var se = [];
    for (var i = 0; i < SOUND_FILE_COUNT; i++) {
        var soundObj = new Audio(infocusExtPath + SOUND_FILE_NAME);
        se.push(soundObj);
    }

    var enabled = true;

    //所持金
    var currentGold = 0;

    //表示中のコインの識別番号生成用
    var coinNum = 0;

    /** コインを描画して金額を加算する */
    function setCoinObj() {
        var objId = 'coin' + coinNum;
        coinNum++;
        var imagePath = infocusExtPath + IMAGE_FILE_NAME;
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

    /** キー入力時のイベント */
    function KeyDownFunc(e) {
        if (!panel.isVisible()) {
            return;
        }

        var keyCode = e.keyCode;

        //特定のキー以外が入力された場合のみ実行
        //半角英数といくつかの記号キーのみ許可している
        if ((keyCode >= '48' && keyCode <= '90') || (keyCode >= '96' && keyCode <= '111') ||
            keyCode == '9' || keyCode == '13' || keyCode == '32' ||
            (keyCode >= '186' && keyCode <= '192') || (keyCode >= '219' && keyCode <= '222') || keyCode == '226') {
            setCoinObj();
        }

    }

    /** 効果音再生 */
    function playSound() {
        se[seCount].play();
        seCount++;
        if (seCount >= se.length) {
            seCount = 0;
        }
    }

    /** 所持金をファイルに書き込み */
    function writeCurrent() {
        prefs.set(SAVE_PARAM, currentGold);
        prefs.save();
    }


    /** 拡張機能の表示/非表示切り替え */
    function handle() {

        enabled = !enabled;
        //現在の表示設定を保存
        prefs.set(ENABLED_PARAM, enabled);
        prefs.save();

        if (panel.isVisible()) {
            writeCurrent();
            panel.hide();
            CommandManager.get(CODEISMONEY_SHOW).setChecked(false);
        } else {
            //設定情報から現在の金額を読み込み
            currentGold = prefs.get(SAVE_PARAM);

            //読み込んだらパネル表示
            document.getElementById("text-current-your-money").innerHTML = currentGold.toLocaleString();
            panel.show();
            CommandManager.get(CODEISMONEY_SHOW).setChecked(true);

        }

    }


    /** 初期化処理 */
    AppInit.appReady(function () {
        ExtensionUtils.loadStyleSheet(module, "style.css");
        CommandManager.register(COMMAND_ID, CODEISMONEY_SHOW, handle);
        var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        menu.addMenuItem(CODEISMONEY_SHOW, '');
        var panelHtml = require("text!panel.html");
        panel = WorkspaceManager.createBottomPanel(CODEISMONEY_SHOW, $(panelHtml), 48);

        if (prefs.get(SAVE_PARAM) == null) {
            prefs.definePreference(SAVE_PARAM, "number", 0);
            currentGold = 0;
        }

        //編集したファイルを保存したタイミングで所持金も保存する
        DocumentManager.on('documentSaved', writeCurrent);

        //キー入力時イベントリスナの設定
        document.addEventListener('keyup', KeyDownFunc);


        //表示・非表示の設定情報を読み込む
        if (prefs.get(ENABLED_PARAM) == null) {
            prefs.definePreference(ENABLED_PARAM, "boolean", true);
        } else {
            enabled = prefs.get(ENABLED_PARAM);
        }

        if (!enabled) {
            return;
        }

        //ONになっていたら拡張機能のパネル表示
        enabled = false;
        handle();
    });
});
//
