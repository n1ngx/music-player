"use strict";
var log = console.log.bind(console);
var PlayMode;
(function (PlayMode) {
    PlayMode[PlayMode["List"] = 0] = "List";
    PlayMode[PlayMode["ListLoop"] = 1] = "ListLoop";
    PlayMode[PlayMode["Random"] = 2] = "Random";
    PlayMode[PlayMode["Loop"] = 3] = "Loop";
})(PlayMode || (PlayMode = {}));
var PlayList = /** @class */ (function () {
    function PlayList() {
        var _this = this;
        this.list = [];
        this.index = 0;
        this.playMode = PlayMode.ListLoop;
        this.switchSong = (_a = {},
            _a[PlayMode.List] = function (switchMode) {
                switch (switchMode) {
                    case 'prev':
                        --_this.index;
                        break;
                    case 'next':
                        ++_this.index;
                        break;
                }
                return _this.index;
            },
            _a[PlayMode.ListLoop] = function (switchMode) {
                var l = _this.list.length;
                switch (switchMode) {
                    case 'prev':
                        --_this.index;
                        break;
                    case 'next':
                        ++_this.index;
                        break;
                }
                return _this.index = (_this.index + l) % l;
            },
            _a[PlayMode.Random] = function (switchMode) {
                var i;
                do {
                    i = Math.floor(Math.random() * _this.list.length);
                } while (i == _this.index);
                return _this.index = i;
            },
            _a);
        var _a;
    }
    PlayList.prototype.add = function (m) {
        this.list.push(m);
    };
    PlayList.prototype.prev = function () {
        return this.switchSong[this.playMode]('prev');
    };
    PlayList.prototype.next = function () {
        return this.switchSong[this.playMode]('next');
    };
    PlayList.prototype.getUrl = function () {
        return this.list[this.index].url;
    };
    PlayList.prototype.setPlayMode = function (playMode) {
        this.playMode = playMode;
    };
    Object.defineProperty(PlayList.prototype, "length", {
        get: function () {
            return this.list.length;
        },
        enumerable: true,
        configurable: true
    });
    PlayList.prototype.setIndex = function (n) {
        this.index = n;
    };
    PlayList.prototype.getList = function () {
        return this.list;
    };
    return PlayList;
}());
var Media = /** @class */ (function () {
    function Media(media) {
        this.playList = new PlayList();
        this.canPlay = false;
        this.media = media;
    }
    Media.prototype.setUrl = function (url) {
        this.media.src = url;
    };
    Media.prototype.add = function (m) {
        this.playList.add(m);
    };
    Media.prototype.prev = function () {
        var _this = this;
        var l = this.playList, x = l.prev();
        if (x == -1) {
            l.setIndex(0);
            return -1;
        }
        this.setUrl(l.getUrl());
        this.canPlay = false;
        $(this.media).one('canplaythrough', function () {
            _this.play();
        });
        return x;
    };
    Media.prototype.next = function () {
        var _this = this;
        var l = this.playList, x = l.next();
        if (x == l.length) {
            l.setIndex(l.length - 1);
            return -2;
        }
        this.setUrl(l.getUrl());
        this.canPlay = false;
        $(this.media).one('canplaythrough', function () {
            _this.play();
        });
        return x;
    };
    Media.prototype.playIndex = function (index) {
        var _this = this;
        var l = this.playList;
        l.setIndex(index);
        this.setUrl(l.getUrl());
        this.canPlay = false;
        $(this.media).one('canplaythrough', function () {
            _this.play();
        });
    };
    Media.prototype.play = function () {
        this.media.play();
    };
    Media.prototype.pause = function () {
        this.media.pause();
    };
    Media.prototype.togglePlay = function () {
        this.media.paused
            ? this.play()
            : this.pause();
        return this.media.paused;
    };
    Media.prototype.toggleMute = function () {
        return this.media.muted = !this.media.muted;
    };
    Media.prototype.timeToStr = function (time) {
        var n = parseInt(time);
        var m = Math.floor(n / 60), s = Math.floor(n % 60), x1, x2;
        if (m / 10 < 1) {
            x1 = '0' + m;
        }
        else {
            x1 = m;
        }
        if (s / 10 < 1) {
            x2 = '0' + s;
        }
        else {
            x2 = s;
        }
        return x1 + ':' + x2;
    };
    Object.defineProperty(Media.prototype, "totalTime", {
        get: function () {
            return this.media.duration.toString();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Media.prototype, "currentTime", {
        get: function () {
            return this.media.currentTime.toString();
        },
        set: function (s) {
            this.media.currentTime = parseInt(s);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Media.prototype, "volume", {
        get: function () {
            return (this.media.volume * 100).toString();
        },
        set: function (s) {
            this.media.volume = parseInt(s) / 100;
        },
        enumerable: true,
        configurable: true
    });
    Media.prototype.readyForPlay = function (cb) {
        var _this = this;
        var m = this.media;
        $(m).on('canplaythrough', function () {
            _this.canPlay = true;
            cb(_this);
        });
    };
    Media.prototype.update = function (cb, endcb) {
        var _this = this;
        var m = this.media;
        $(m).on('timeupdate', function () {
            if (_this.canPlay) {
                cb(_this);
            }
            if (m.ended && !m.loop) {
                var x = _this.next();
                if (endcb) {
                    endcb(x);
                }
            }
        });
    };
    Media.prototype.getMusicList = function () {
        return this.playList.getList();
    };
    Media.prototype.setPlayMode = function (playMode) {
        var m = this.media;
        if (playMode == PlayMode.Loop) {
            m.loop = true;
            this.playList.setPlayMode(PlayMode.ListLoop);
        }
        else {
            m.loop = false;
            this.playList.setPlayMode(playMode);
        }
    };
    return Media;
}());
var togglePlayBtn = $('#togglePlay'), muteBtn = $('#mute'), loopBtn = $('#loop'), prevBtn = $('#prev'), nextBtn = $('#next'), musicName = $('#music-name'), musicArtist = $('#music-artist'), totalTime = $('#total-time'), currentTime = $('#current-time'), musicList = $('#music-list'), isDrag = false, a = new Media(new Audio());
a.setUrl('../mp3/三月のパンタシア - ルビコン.mp3');
var m = [
    {
        id: 1,
        name: 'ルビコン',
        url: '../mp3/三月のパンタシア - ルビコン.mp3',
        artists: [
            '三月のパンタシア'
        ],
        album: 'ルビコン (初回生産限定盤)'
    },
    {
        id: 2,
        name: 'Ever be my love',
        url: '../mp3/山田タマル - Ever be my love.mp3',
        artists: [
            '山田タマル'
        ],
        album: '青い記憶'
    },
    {
        id: 3,
        name: 'オラはにんきもの',
        url: '../mp3/矢島晶子 - オラはにんきもの.mp3',
        artists: [
            '矢島晶子'
        ],
        album: 'クレヨンしんちゃんスーパーベスト 30曲入りだゾ'
    },
    {
        id: 4,
        name: '世界が终るまでは…',
        url: '../mp3/世界が终わるまでは….mp3',
        artists: [
            'WANDS'
        ],
        album: 'THE BEST OF TV ANIMATION SLAM DUNK ～Single Collection～'
    },
    {
        id: 5,
        name: '砂のこども',
        url: '../mp3/水瀬ましろ - 砂のこども.mp3',
        artists: [
            '水瀬ましろ'
        ],
        album: 'Lucky 7'
    },
    {
        id: 6,
        name: 'アイロニ',
        url: '../mp3/天月-あまつき- - アイロニ.mp3',
        artists: [
            '天月-あまつき-'
        ],
        album: 'StarT Line'
    },
    {
        id: 7,
        name: 'DEAREST DROP',
        url: '../mp3/田所あずさ - DEAREST DROP.mp3',
        artists: [
            '田所あずさ'
        ],
        album: 'DEAREST DROP (アニメ盤)'
    },
    {
        id: 8,
        name: 'Edelweiss',
        url: '../mp3/亜咲花 - Edelweiss.mp3',
        artists: [
            '亜咲花'
        ],
        album: 'Edelweiss'
    },
    {
        id: 9,
        name: 'いつも何度でも',
        url: '../mp3/伊藤サチコ - いつも何度でも.mp3',
        artists: [
            '伊藤サチコ'
        ],
        album: 'ジブリを聴きながら、上を向いて歩こう'
    },
    {
        id: 10,
        name: 'Beautiful World',
        url: '../mp3/宇多田ヒカル - Beautiful World.mp3',
        artists: [
            '宇多田ヒカル'
        ],
        album: 'Evangelion: 1.01 You are (not) alone[Movie OST]'
    },
    {
        id: 11,
        name: 'To You.',
        url: '../mp3/雨宮天 - To You.mp3',
        artists: [
            '雨宮天'
        ],
        album: 'Ring of Fortune'
    },
    {
        id: 12,
        name: 'わたし音頭',
        url: '../mp3/雨宮天 - わたし音頭.mp3',
        artists: [
            '雨宮天'
        ],
        album: '十八番尽くしの歌宴に祝杯を!'
    },
    {
        id: 13,
        name: 'おうちに帰りたい (TV-size)',
        url: '../mp3/雨宮天,高橋李依,茅野愛衣 - おうちに帰りたい (TV-size).mp3',
        artists: [
            '雨宮天',
            '高橋李依',
            '茅野愛衣'
        ],
        album: 'TVアニメ『この素晴らしい世界に祝福を! 2』サントラ&ドラマCD Vol.3「受難の日々に福音を! 」'
    },
];
m.forEach(function (x) { return a.add(x); });
setMusicInfo(0);
function setMusicInfo(index) {
    var l = a.getMusicList();
    var x1 = l[index].name;
    var x2 = l[index].artists.join('/');
    musicName.text(x1).attr('title', x1);
    musicArtist.text(x2).attr('title', x2);
}
togglePlayBtn.click(function () {
    if (a.togglePlay()) {
        togglePlayBtn.css('background-position-y', -204); // 播放
    }
    else {
        togglePlayBtn.css('background-position-y', -165); // 暂停
    }
});
prevBtn.click(function () {
    var x = a.prev();
    if (x == -1) {
        log('到头了');
    }
    else {
        setMusicInfo(x);
        musicList.children().css('color', '#aaa');
        $(musicList.children()[x]).css('color', 'red');
        togglePlayBtn.css('background-position-y', -165); // 暂停
    }
});
nextBtn.click(function () {
    var x = a.next();
    if (x == -2) {
        log('到尾了');
    }
    else {
        setMusicInfo(x);
        musicList.children().css('color', '#aaa');
        $(musicList.children()[x]).css('color', 'red');
        togglePlayBtn.css('background-position-y', -165); // 暂停
    }
});
a.update(function (m) {
    // totalTime.text(m.timeToStr(m.totalTime))
    if (!isDrag) {
        currentTime.text(m.timeToStr(m.currentTime));
        var ratio = +m.currentTime / +m.totalTime * 100;
        setPbarPos(ratio);
    }
}, function (index) {
    musicList.children().css('color', 'black');
    $(musicList.children()[index]).css('color', 'red');
    togglePlayBtn.css('background-position-y', -165); // 暂停
    setMusicInfo(index);
});
a.readyForPlay(function (m) {
    totalTime.text(m.timeToStr(m.totalTime));
    currentTime.text(m.timeToStr(m.currentTime));
});
// 进度条
var pcur = $('.pbar .bar-cur'), pbtn = $('.pbar .bar-btn'), pbar = $('.pbar');
function setPbarPos(ratio) {
    pbtn.css('left', ratio + '%');
    pcur.css('width', ratio + '%');
}
function handlePbar(eMove) {
    var pos = eMove.clientX - pbar.offset().left;
    var x = Math.max(0, Math.min(pos, pbar.width()));
    var ratio = x / pbar.width() * 100;
    currentTime.text(a.timeToStr((+a.totalTime * ratio / 100).toString()));
    setPbarPos(ratio);
}
pbtn.on('mousedown', function (eDown) {
    isDrag = true;
    $(window).on('mousemove', handlePbar);
    $(window).one('mouseup', function (e) {
        $(window).off('mousemove', handlePbar);
        var pos = e.clientX - pbar.offset().left;
        var ratio = pos / pbar.width() * 100;
        setPbarPos(ratio);
        a.currentTime = (+a.totalTime / 100 * ratio).toString();
        isDrag = false;
    });
});
pbar.on('mouseup', function (e) {
    var pos = e.clientX - pbar.offset().left;
    var ratio = pos / pbar.width() * 100;
    setPbarPos(ratio);
    a.currentTime = (+a.totalTime / 100 * ratio).toString();
});
// 音量
muteBtn.click(function () {
    function s(ratio) {
        sbtn.css('top', 100 - ratio + '%');
        scur.css('height', ratio + '%');
    }
    if (a.toggleMute()) {
        muteBtn
            .css('background-position-x', -104)
            .css('background-position-y', -69)
            .attr('title', '取消静音');
        s(0);
    }
    else {
        muteBtn
            .css('background-position-x', -2)
            .css('background-position-y', -248)
            .attr('title', '静音');
        s(+a.volume);
    }
});
var scur = $('.sbar .bar-cur'), sbtn = $('.sbar .bar-btn'), sbar = $('.sbar');
function setSbarPos(ratio) {
    sbtn.css('top', 100 - ratio + '%');
    scur.css('height', ratio + '%');
    a.volume = ratio.toString();
    if (ratio == 0) {
        muteBtn
            .css('background-position-x', -104)
            .css('background-position-y', -69);
    }
    else {
        muteBtn
            .css('background-position-x', -2)
            .css('background-position-y', -248);
    }
}
function handleSbar(eMove) {
    var pos = sbar.height() - eMove.clientY + sbar.offset().top - $(window).scrollTop();
    var x = Math.max(0, Math.min(pos, sbar.height()));
    var ratio = x / sbar.height() * 100;
    setSbarPos(ratio);
}
sbtn.on('mousedown', function (eDown) {
    $(document).on('mousemove', handleSbar);
    $(document).one('mouseup', function (e) {
        $(document).off('mousemove', handleSbar);
    });
});
sbar.on('mouseup', function (e) {
    var pos = sbar.height() - e.clientY + sbar.offset().top - $(window).scrollTop();
    var ratio = pos / sbar.height() * 100;
    setSbarPos(ratio);
});
function playModeHandler() {
    var l = [PlayMode.ListLoop, PlayMode.Random, PlayMode.Loop];
    var len = l.length;
    var i = 0;
    return function () {
        i = (++i + len) % len;
        switch (i) {
            case 0: {
                playModeBtn.css('background-position', '-3px -344px');
                playModeBtn.attr('title', '循环播放');
                break;
            }
            case 1: {
                playModeBtn.css('background-position', '-66px -248px');
                playModeBtn.attr('title', '随机播放');
                break;
            }
            case 2: {
                playModeBtn.css('background-position', '-66px -344px');
                playModeBtn.attr('title', '单曲循环');
                break;
            }
        }
        a.setPlayMode(l[i]);
    };
}
var playModeBtn = $('#play-mode');
playModeBtn.click(playModeHandler());
var playListBtn = $('#play-list');
playListBtn.text(a.getMusicList().length);
var s = a.getMusicList().map(function (v, i) { return "\n<li>" + (i + 1) + " " + v.name + " - " + v.artists.join('/') + "</li>\n"; });
musicList.append(s);
$(musicList.children()[0])
    .css('color', 'red');
musicList.children().each(function (i, el) {
    $(el).dblclick(function () {
        a.playIndex(i);
        setMusicInfo(i);
        musicList.children().css('color', '#aaa');
        $(musicList.children()[i]).css('color', 'red');
        togglePlayBtn.css('background-position-y', -165); // 暂停
    });
});
