define(function (require, exports, module) {

    const ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    const infocusExtPath = ExtensionUtils.getModulePath(module);

    const ignoreKeyList = [8, 37, 38, 39, 40, 46];
    const seFileName = 'coin01.ogg';
    const fileSet = 20;

    var seCount = 0;
    var se = [];
    for (var i = 0; i < fileSet; i++) {
        se.push(new Audio(infocusExtPath + seFileName));
    }

    /**
     * キー入力時のイベント
     */
    function KeyDownFunc(e) {
        var keyCode = e.keyCode;

        //特定のキーが入力された場合は無視
        if (ignoreKeyList.indexOf(keyCode) >= 0) {
            return;
        }
        playSound();
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
});

//--------
