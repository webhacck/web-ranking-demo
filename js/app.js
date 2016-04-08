/* global MilkCocoa, $ */

var mlkcca = new MilkCocoa("【アプリID】.mlkcca.com");
var ds = mlkcca.dataStore("score");
var scoreList = { id: null, data:[] }; // スコアデータの保持用

$('.game').blockrain({
    theme: "candy",
    autoBlockWidth: true,
    onGameOver: function(score) {

        var user = window.prompt('ユーザー名を入力してください', '名無し');
        rankSort(user, score);

    }
    
});

setup();


function setup() {
    ds.stream().next(function(err, message) {
        
        // データベースに「スコア」が存在するかを確認
        if(message[0] === undefined) {
            
            // スコアデータの初期設定
            scoreList.data.push([
                    {name: "----", score: 500},
                    {name: "----", score: 400},
                    {name: "----", score: 300},
                    {name: "----", score: 200},
                    {name: "----", score: 100}
            ]);
            ds.push(scoreList);
            rankUpdate();
        }
        else {
            // データベースからスコアを取得
            scoreList.data.push(message[0].value.data[0]);
            rankUpdate();
        }
    });
}



function rankUpdate() {
    // ランキング数の取得
    var maxRank = scoreList.data[0].length;
    
    // ランキング順にページへ表示させる
    for(var i=0; i<maxRank; i++) {
        $('.name' + (i+1)).text(scoreList.data[0][i].name);
        $('.score' + (i+1)).text(scoreList.data[0][i].score);
    }
}



function rankSort(user, score) {
    // 最新のスコアデータにするために初期化
    scoreList.data = [];
    
    ds.stream().next(function(err, message) {
        // 最新のデータを取得
        scoreList.data.push(message[0].value.data[0]);
        
        // データベースを更新するためにIDを取得
        scoreList.id = message[0].id;
        
        // ゲーム終了時のスコアを追加
        scoreList.data[0].push(
            { name: user, score: score }
        );
        
        // スコア順に並び替え
        scoreList.data[0].sort(function(a, b) { return b["score"] - a["score"] });
        scoreList.data[0].pop();
    
        rankUpdate();
        
        // データベースのスコアを更新する
        ds.set(scoreList.id, scoreList);
    });
    
}