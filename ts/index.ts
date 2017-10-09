let log = console.log.bind(console)

interface Music {
  id: number,
  name: string,
  url: string,
  artists: string[],
  album: string,
}

enum PlayMode {
  List,
  ListLoop,
  Random,
  Loop,
}

type SwitchMode = 'prev' | 'next'

class PlayList {
  private list: Music[] = []
  private index: number = 0
  private playMode: PlayMode = PlayMode.ListLoop
  private switchSong = {
    [PlayMode.List]: (switchMode: SwitchMode) => {
      switch (switchMode) {
        case 'prev':
            --this.index    
          break
        case 'next': 
            ++this.index
          break
      }
      return this.index
    },
    [PlayMode.ListLoop]: (switchMode: SwitchMode) => {
      let l = this.list.length
      switch (switchMode) {
        case 'prev':
          --this.index
          break
        case 'next': 
          ++this.index
          break
      }
      return this.index = (this.index + l) % l
    },
    [PlayMode.Random]: (switchMode: SwitchMode) => {
      let i
      do {
        i = Math.floor(Math.random() * this.list.length)
      } while (i == this.index)
      return this.index = i
    }
  }
  add(m: Music) {
    this.list.push(m)
  }
  prev() {
    return this.switchSong[this.playMode]('prev')
  }
  next() {
    return this.switchSong[this.playMode]('next')
  }
  getUrl() {
    return this.list[this.index].url
  }
  setPlayMode(playMode: PlayMode) {
    this.playMode = playMode
  }
  get length() {
    return this.list.length
  }
  setIndex(n: number) {
    this.index = n
  }
  getList() {
    return this.list
  }
}

class Media {
  private media: HTMLMediaElement
  private playList: PlayList = new PlayList()
  private canPlay = false
  constructor(media: HTMLMediaElement) {
    this.media = media
  }
  setUrl(url: string) {
    this.media.src = url
  }
  add(m: Music) {
    this.playList.add(m)
  }
  prev() {
    let l = this.playList,
        x = l.prev()
    if (x == -1) {
      l.setIndex(0)
      return -1
    }
    this.setUrl(l.getUrl())
    this.canPlay = false
    $(this.media).one('canplaythrough', () => {
      this.play()
    })
    return x
  }
  next() {
    let l = this.playList, 
    x = l.next()
    if (x == l.length) {
      l.setIndex(l.length - 1)
      return -2
    }
    this.setUrl(l.getUrl())
    this.canPlay = false
    $(this.media).one('canplaythrough', () => {
      this.play()
    })
    return x
  }
  playIndex(index: number) {
    let l = this.playList
    l.setIndex(index)
    this.setUrl(l.getUrl())
    this.canPlay = false
    $(this.media).one('canplaythrough', () => {
      this.play()
    })
  }
  play() {
    this.media.play()
  }
  pause() {
    this.media.pause()
  }
  togglePlay() {
    this.media.paused
    ? this.play()
    : this.pause()
    return this.media.paused
  }
  toggleMute() {
    return this.media.muted = !this.media.muted
  }
  timeToStr(time: string) {
    let n = parseInt(time)
    let m = Math.floor(n / 60),
        s = Math.floor(n % 60),
        x1, x2
    if (m / 10 < 1) {
      x1 = '0' + m
    } else {
      x1 = m
    }
    if (s / 10 < 1) {
      x2 = '0' + s
    }
    else {
      x2 = s
    }
    return x1 + ':' + x2
  }
  get totalTime() {
    return this.media.duration.toString()
  }
  get currentTime() {
    return this.media.currentTime.toString()
  }
  set currentTime(s: string) {
    this.media.currentTime = parseInt(s)
  }
  get volume() {
    return (this.media.volume * 100).toString()
  }
  set volume(s: string) {
    this.media.volume = parseInt(s) / 100
  }
  readyForPlay(cb: (media: Media) => void) {
    let m = this.media
    $(m).on('canplaythrough', () => {
      this.canPlay = true
      cb(this)
    })
  }
  update(cb: (media: Media) => void, endcb?: Function) {
    let m = this.media
    $(m).on('timeupdate', () => {
      if (this.canPlay) {
        cb(this)
      }
      if (m.ended && !m.loop) {
        let x = this.next()
        if (endcb) {
          endcb(x)
        }
      }
    })
  }
  getMusicList() {
    return this.playList.getList()
  }
  setPlayMode(playMode: PlayMode) {
    let m = this.media
    if (playMode == PlayMode.Loop) {
      m.loop = true
      this.playList.setPlayMode(PlayMode.ListLoop)
    } else {
      m.loop = false
      this.playList.setPlayMode(playMode)
    }
  }
}

let togglePlayBtn = $('#togglePlay'),
  muteBtn = $('#mute'),
  loopBtn = $('#loop'),
  prevBtn = $('#prev'),
  nextBtn = $('#next'),
  musicName = $('#music-name'),
  musicArtist = $('#music-artist'),
  totalTime = $('#total-time'),
  currentTime = $('#current-time'),
  musicList = $('#music-list'),
  isDrag = false,
  a = new Media(new Audio())
  
a.setUrl('../mp3/三月のパンタシア - ルビコン.mp3')

let m: Music[] = [
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
]

m.forEach(x => a.add(x))
setMusicInfo(0)

function setMusicInfo(index: number) {
  let l = a.getMusicList()
  let x1 = l[index].name
  let x2 = l[index].artists.join('/')
  musicName.text(x1).attr('title', x1)
  musicArtist.text(x2).attr('title', x2)
}

togglePlayBtn.click(() => {
  if (a.togglePlay()) {
    togglePlayBtn.css('background-position-y', -204) // 播放
  } else {
    togglePlayBtn.css('background-position-y', -165) // 暂停
  }
})

prevBtn.click(() => {
  let x = a.prev()
  if (x == -1) {
    log('到头了')
  } else {
    setMusicInfo(x)
    musicList.children().css('color', '#aaa')
    $(musicList.children()[x]).css('color', 'red')
    togglePlayBtn.css('background-position-y', -165) // 暂停
    
  }
})

nextBtn.click(() => {
  let x = a.next()
  if (x == -2) {
    log('到尾了')
  } else {
    setMusicInfo(x)
    musicList.children().css('color', '#aaa')
    $(musicList.children()[x]).css('color', 'red')
    togglePlayBtn.css('background-position-y', -165) // 暂停
  }
})

a.update((m) => {
  // totalTime.text(m.timeToStr(m.totalTime))
  if (!isDrag) {
    currentTime.text(m.timeToStr(m.currentTime))
    let ratio = +m.currentTime / +m.totalTime * 100
    setPbarPos(ratio)
  }
}, (index: number) => {
  musicList.children().css('color', 'black')
  $(musicList.children()[index]).css('color', 'red')
  togglePlayBtn.css('background-position-y', -165) // 暂停
  setMusicInfo(index)
})

a.readyForPlay((m) => {
  totalTime.text(m.timeToStr(m.totalTime))
  currentTime.text(m.timeToStr(m.currentTime))
})

// 进度条
let pcur = $('.pbar .bar-cur'),
    pbtn = $('.pbar .bar-btn'),
    pbar = $('.pbar')

function setPbarPos(ratio: number) {
  pbtn.css('left', ratio + '%')
  pcur.css('width', ratio + '%')
}

function handlePbar(eMove: JQueryEventObject) {
  let pos = eMove.clientX - pbar.offset().left
  let x = Math.max(0, Math.min(pos, pbar.width()))
  let ratio = x / pbar.width() * 100
  currentTime.text(a.timeToStr((+a.totalTime * ratio / 100).toString()))
  setPbarPos(ratio)
}

pbtn.on('mousedown', (eDown) => {
  isDrag = true
  $(window).on('mousemove', handlePbar)
  $(window).one('mouseup', (e) => {
    $(window).off('mousemove', handlePbar)
    let pos = e.clientX - pbar.offset().left
    let ratio = pos / pbar.width() * 100
    setPbarPos(ratio)
    a.currentTime = (+a.totalTime / 100 * ratio).toString()
    isDrag = false
  })
})

pbar.on('mouseup', (e) => {
  let pos = e.clientX - pbar.offset().left
  let ratio = pos / pbar.width() * 100
  setPbarPos(ratio)
  a.currentTime = (+a.totalTime / 100 * ratio).toString()
})

// 音量
muteBtn.click(() => {
  function s(ratio: number) {
    sbtn.css('top', 100 - ratio + '%')
    scur.css('height', ratio + '%')
  }
  if (a.toggleMute()) {
    muteBtn
    .css('background-position-x', -104)
    .css('background-position-y', -69)
    .attr('title', '取消静音')
    s(0)
  } else {
    muteBtn
    .css('background-position-x', -2)
    .css('background-position-y', -248)
    .attr('title', '静音')
    s(+a.volume)
  }
})

let scur = $('.sbar .bar-cur'),
    sbtn = $('.sbar .bar-btn'),
    sbar = $('.sbar')

function setSbarPos(ratio: number) {
  sbtn.css('top', 100 - ratio + '%')
  scur.css('height', ratio + '%')
  a.volume = ratio.toString()
  if (ratio == 0) {
    muteBtn
    .css('background-position-x', -104)
    .css('background-position-y', -69)
  } else {
    muteBtn
    .css('background-position-x', -2)
    .css('background-position-y', -248)
  }
}

function handleSbar(eMove: JQueryEventObject) {
  let pos = sbar.height() - eMove.clientY + sbar.offset().top - $(window).scrollTop()
  let x = Math.max(0, Math.min(pos, sbar.height()))
  let ratio = x / sbar.height() * 100
  setSbarPos(ratio)
}

sbtn.on('mousedown', (eDown) => {
  $(document).on('mousemove', handleSbar)
  $(document).one('mouseup', (e) => {
    $(document).off('mousemove', handleSbar)
  })
})

sbar.on('mouseup', (e) => {
  let pos = sbar.height() - e.clientY + sbar.offset().top - $(window).scrollTop()
  let ratio = pos / sbar.height() * 100
  setSbarPos(ratio)
})

function playModeHandler() {
  let l = [PlayMode.ListLoop, PlayMode.Random, PlayMode.Loop]
  let len = l.length
  let i = 0
  return function() {
    i = (++i + len) % len
    switch (i) {
      case 0: {
        playModeBtn.css('background-position', '-3px -344px')
        playModeBtn.attr('title', '循环播放')
        break
      }
      case 1: {
        playModeBtn.css('background-position', '-66px -248px')
        playModeBtn.attr('title', '随机播放')
        break
      }
      case 2: {
        playModeBtn.css('background-position', '-66px -344px')
        playModeBtn.attr('title', '单曲循环')
        break
      }
    }
    a.setPlayMode(l[i])
  }
}

let playModeBtn = $('#play-mode')
playModeBtn.click(playModeHandler())

let playListBtn = $('#play-list')
playListBtn.text(a.getMusicList().length)

let s = a.getMusicList().map((v, i) => `
<li>${i + 1} ${v.name} - ${v.artists.join('/')}</li>
`)
musicList.append(s)
$(musicList.children()[0])
.css('color', 'red')

musicList.children().each((i, el) => {
  $(el).dblclick(() => {
    a.playIndex(i)
    setMusicInfo(i)
    musicList.children().css('color', '#aaa')
    $(musicList.children()[i]).css('color', 'red')
    togglePlayBtn.css('background-position-y', -165) // 暂停
  })
})