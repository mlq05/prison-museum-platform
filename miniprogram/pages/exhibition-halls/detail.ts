/**
 * 展区详情页面
 */
Page({
  data: {
    hallId: '',
    hallName: '',
    hall: null as any,
    loading: true,
    scrollHeight: '550px',
    isCollected: false, // 是否已收藏
    collectionCount: 0, // 收藏数
  },

  onLoad(options: { id?: string; name?: string }) {
    if (options.id) {
      this.setData({
        hallId: options.id,
        hallName: options.name ? decodeURIComponent(options.name) : '',
      });
      this.loadHallDetail();
    } else {
      wx.showToast({
        title: '展区ID无效',
        icon: 'none',
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }

    // 设置滚动高度
    const systemInfo = wx.getSystemInfoSync();
    const windowHeight = systemInfo.windowHeight;
    const statusBarHeight = systemInfo.statusBarHeight || 0;
    const navBarBaseHeight = systemInfo.platform === 'android' ? 48 : 44;
    const navBarHeight = navBarBaseHeight + statusBarHeight;
    const scrollHeight = windowHeight - navBarHeight;
    
    this.setData({
      scrollHeight: scrollHeight + 'px',
    });
  },

  /**
   * 加载展区详情
   */
  async loadHallDetail() {
    this.setData({ loading: true });
    
    try {
      // 从本地数据中查找展区信息
      // 这里可以从exhibition-halls页面的数据中获取，或者从API加载
      const halls = [
        {
          id: '1',
          name: '古代监狱',
          description: '探索中国古代监狱制度的起源与发展，了解监狱名称沿革、治理思想、管理制度等',
          coverImage: '/assets/images/halls/ancient-prison.jpg',
          detail: `此处展现的是监狱出现，有四个具有代表性的雏形，分别是丛棘，圜土，夏台，羑里城。这个羑里城，不只是一座普通的古代监狱，它还是"文王拘而演《周易》"的地方，可见它是中华传统文化经典的诞生地。

监狱名称沿革：我们可以看到，早期名字多和监狱的形态有关，比如丛棘是植物、圜土是圆形的土墙；后来慢慢变成更明确的"场所"称谓，这也说明古代监狱的功能越来越专业化，设施更加完备。

古代的监狱设置随朝代更迭会有相应变化，且中央与地方尚有一定区别。秦汉时中央监狱被称为廷尉狱，隋唐称大理寺狱、御史台狱。清朝时在地方也会设置大大小小的监狱、班房，以供羁押犯人。

古代监狱的治理思想——恤刑慎杀。"恤刑慎杀"源头可溯至《尚书》《周礼》。《尚书·周书·吕刑》中，周王告诫官员要公正判决。《康诰》则要求处决犯人需深思熟虑，慎用刑罚。

在监狱管理制度方面，从《唐律疏议》到《大清律例》律条逐渐细化完善，监狱律法趋向成熟。赵舒翘是"陕派律学"的代表，和沈家本并称"西曹之英"，《提牢备考》为研究古代狱政提供了最直接的史料支撑。

悯囚制度的功能主要是济粮和济药。录囚制度的功能是平反冤案，梳理积压案件。悯囚、录囚制度均体现了古代监狱人性化的一方面，是古代监狱发展的一大进步。

古代狱神，狱神庙。狱神在古代监狱文化里有着特殊地位，皋陶作为"上古四圣"之一，相传他"划地为牢"，开启了早期的监狱管理形式，被后世尊为狱神。还有像亚孻、萧何等都被尊称为狱神。

古代监狱的发展过程既取得了一些成就，但它的本质是黑暗残酷。治狱的黑暗残酷比比皆是，随处可见，真实反映了古代监狱的本质。文天祥在他的《正气歌序》中描绘了监狱环境的恶劣，点出狱中有"水、土、日、火、米、人、秽"七气。`,
          floor: 1,
          order: 1,
          arEnabled: true,
          bgColor: '#8B4513',
        },
        {
          id: '2',
          name: '近代狱制改良',
          description: '了解清末至民国时期监狱制度的系统性变革，从传统狱制向现代狱制的转型',
          coverImage: '/assets/images/halls/modern-reform.jpg',
          detail: `中国古代监狱制度虽历经发展，却始终未能摆脱封建王朝统治下的固有弊端。直至清末，监狱的建设与管理才逐渐出现系统性变革。

当时中国处于甲午惨败与瓜分危机。当西方监狱推行人道改革时，清政府的牢房仍然是阴暗的刑讯之地。列强以中国狱制野蛮为借口，拒不放弃领事裁判权。上海英美租界设立会审公廨，名义上由中外官员共同审理案件，实则由外国领事操控司法权。

与此同时，一场轰轰烈烈的国际监狱改良运动在欧美兴起，以英国"碧福德"监狱为代表的新式监狱，采用"屋舍洁净、食物精美"的管理模式，注重罪犯的感化教育、人道待遇。

1905年，五大臣出洋考察带回的西方狱政见闻，直接推动了《大清监狱律草案》的制定。

在近代监狱改良的道路上，一批有识之士对传统狱制进行了深刻反思，为狱政转型提供了重要的思想指引。沈家本与张之洞是其中的杰出代表。沈家本，被称为"中国监狱改良之父"。他提出震撼时代的理念："监狱非苦人辱人之处，乃教人向善之所"。张之洞则主张"惩戒与教化并重"，推动兴建新式监狱，提倡中体西用，借鉴西方狱政技术。

《大清监狱律草案》是没有颁布实行的中国第一部独立的监狱法典草案，日本监狱学家小河滋次郎参与了草案制定，并为其作出重大贡献。

保定习艺所平面图，记录了清末新型矫正机构的雏形，以"教工艺、促自新"为宗旨，组织罪犯学习纺织、木工等技能，这种"工读结合"的模式，打破了传统监狱单纯监禁的模式。

在中体西用的思潮下，清政府开始新建一批新式监狱，如京师模范监狱、湖北省城模范监狱、济南模范监狱。这些监狱普遍采用"放射状（轮辐式）"或"十字形"布局，便于看守监控；内部设施相对完善，区分监房、工场、教诲室、医务所、运动场等区域，体现了人道化、规范化的理念。

新式监狱的兴起体现出中国司法文明从惩报走向矫治的历史性转型。

民国建立后，继承了清末改良的衣钵，在立法上更为系统和细致。1928年，南京国民政府颁行《中华民国监狱规则》，成为民国监狱管理的基本法。`,
          floor: 1,
          order: 2,
          arEnabled: true,
          bgColor: '#4169E1',
        },
        {
          id: '3',
          name: '革命根据地时期的监狱',
          description: '了解中国共产党领导下的革命根据地民主政权及其新型司法体制的创立',
          coverImage: '/assets/images/halls/revolutionary-base.jpg',
          detail: `新民主主义革命时期，中国共产党领导下的各革命根据地民主政权及其新型的司法体制相继创立。革命根据地时期的监所工作为新中国监狱工作奠定了坚实的实践基础，也是社会主义监狱制度的萌芽时期。

革命根据地建立了多种监所形式，包括看守所、劳动感化院和苦工队等，其中，劳动感化院是最具代表性的创新。其着重于文化教育、政治教育和劳动教育三大教育改造。

1934年，毛泽东同志在苏维埃第二次全国代表大会上明确赞扬，用共产主义精神与劳动纪律去感化教育犯人，改变犯人犯罪的本质，这一思想成为根据地监狱工作的核心。

中央苏区共设立了五个劳动感化院，分布在瑞金、兴国等地。中央第一劳动感化院是中国共产党成立全国性政权后的首座大型监狱。

梁柏台同志被誉为"中国劳动改造教育感化制度创始人"，他起草的《中华苏维埃共和国劳动感化院暂行章程》，奠定了感化教育的法律基础。虽然他于1935年英勇就义，年仅36岁。

革命根据地的监狱工作不仅是一场司法变革，更是一次人性的救赎！

全面抗战时期的陕甘宁边区高等法院监狱，它进一步实践了感化主义这一理念。该监狱位于延安，其布局包括男监、女监和狱警区域，体现了对犯人分类管理的先进性。

这一时期还诞生了"党鸿魁经验"——陕甘宁边区典狱长党鸿魁倡导的"尊重犯人人格、教育与生产结合"方法，对新中国监狱制度影响深远。

1946年哈尔滨解放，邵天任单枪匹马接管伪满哈尔滨地方法院和监狱，而哈尔滨监狱也成为了中国共产党领导下的第一所城市监狱。`,
          floor: 1,
          order: 3,
          arEnabled: true,
          bgColor: '#DC143C',
        },
        {
          id: '4',
          name: '新中国劳改工作的开创与发展',
          description: '了解新中国成立后彻底废除旧监狱制度，形成具有中国特色的社会主义劳改制度',
          coverImage: '/assets/images/halls/new-china-labor.jpg',
          detail: `走进新中国，我们彻底废除了国民政府旧监狱制度，逐渐形成具有中国特色的社会主义劳改制度。

1949年《中国人民政治协商会议共同纲领》明确提出"强迫他们在劳动中改造自己，成为新人"，这奠定了劳改方针的基础。

这一时期大规模创建劳改场所是新中国监狱工作的亮点，此后，到1951年全国劳改单位达2452个。其中，北京清河农场是共和国第一座劳改农场，1950年，在盐碱地上开垦荒地9万余亩，实现自给自足，受到毛泽东主席的亲笔回信赞扬。

浙江乔司农场则从荒滩起步，开垦荒地，成为改造与生产的典范。

新中国劳改工作的成就体现在法制、思想、生产和文化四方面。就法制建设而言，我国颁布了《劳动改造条例》，这是新中国首部监狱法规。监狱通过集体教育、个别谈话和劳动生产，实现思想塑魂，彰显了"改造人、造就人"的伟力。

新中国劳改工作的指导思想由毛泽东同志提出，劳改工作的方针则从三个为了到两个结合再到改造生产相结合，改造第一生产第二不断发展。

新中国监狱不仅仅是惩戒之地，更是服刑人员重生的熔炉。

改造战犯的世界奇迹：在毛主席领导下，我们用多种举措改造战犯。人道主义方面，按国际规则分级管理，尊重战犯人格。改造教育方面，针对战犯合理安排作息时间，组织学习教育及讨论会。亲情感化上，管理所安排战犯与家属见面。文体活动也搞得有声有色，管理所购置乐器，定期举办音乐会。

在我们不懈的努力下，战犯在法庭上跪地忏悔，这是真心悔悟的表现。二战后，日本右翼美化侵略，一批曾被我国改造的战犯良知觉醒。他们回国成立"中归联"，1957年出版《三光》，以忏悔笔触，披露日军"三光"暴行。

新中国成立十周年时，毛主席提出，对真心悔过自新的战犯特赦。这一决策既鼓励战犯重新做人，又展现出长远政治智慧。末代皇帝溥仪的改造堪称经典。溥仪在抚顺战犯管理所接受改造后，溥仪学着摘菜、缝补袜子，已能融入普通生活。`,
          floor: 2,
          order: 4,
          arEnabled: true,
          bgColor: '#FF6347',
        },
        {
          id: '5',
          name: '改革开放与社会主义建设时期劳改工作的创新',
          description: '了解改革开放时期监狱系统的全面转型，包括"三分工作"、规范化管理等创新举措',
          coverImage: '/assets/images/halls/reform-opening.jpg',
          detail: `接下来，我们来到了改革开放时期，监狱系统响应十一届三中全会的精神指示，于1981年召开八劳会议，打开了劳改工作全面转型的大门。

"三分工作"：1989年全国监管改造工作会议召开，基于试点基础，司法部向全国推广"三分"工作模式，主要内容为：分押、分管、分教。

办特殊学校：潍坊劳改支队，作为全国第一所被命名的特殊学校，该监狱曾创全国监狱系统"四个第一"。

社会帮教和"三个延伸"：利用社会资源开展社会帮教，有效缓解刑释人员的社会疏离感。在教育改造方面，针对罪犯开展文化教育、道德教育、形势教育、法制教育等，进一步提升罪犯出监就业率。

规范化管理、改造生产双承包责任制：开展规范化管理，干警对"监管安全"与"生产任务"双承包，兼顾改造秩序与经济效能，为监狱法治化铺路。

监狱法治的里程碑：建国四十多年来，监狱管理和劳动教养工作遇到许多新情况、新问题，因此《中华人民共和国监狱法》的颁布标志着我国监狱工作进入了全面法制化、规范化的轨道。

监狱布局调整：过去，许多监狱都建立在偏远地区，罪犯刑满释放后难以顺利回归社会。因此将偏远监狱向大中城市和交通干线周边转移，为罪犯架起了一座通往回归社会的"桥梁"。

创建现代化文明监狱：《关于创建现代化文明监狱的标准和实施意见》这份文件的出台，针对监管设施、管理手段、改造方法、干警队伍进行现代化转变。

监狱体制改革：过去"监企合一"体制下"改造第一"方针难落实，还易引发执法和经济问题。为此进行监狱体制改革，为落实"改造人"宗旨提供体制保障。

服刑人员权利保障：20世纪80年代中期以后，开始进入监狱法律体系形成阶段。《中国改造罪犯的状况》白皮书，昭示了中国罪犯改造中的罪犯权利保障和法治文明。`,
          floor: 2,
          order: 5,
          arEnabled: true,
          bgColor: '#32CD32',
        },
        {
          id: '6',
          name: '新时期监狱工作的开拓与发展',
          description: '了解新时期监狱工作的规范化、科学化发展，以及教育改造的创新实践',
          coverImage: '/assets/images/halls/new-era-transformation.jpg',
          detail: `新时期监狱工作持续推进规范化和科学化，展板上所展示的这些画面全部都是全程留痕，公开公示，从根本上杜绝了暗箱操作，也让积极改造的人看到希望，让混刑度日的人无所遁形。

现代监狱设有网格化、全覆盖的纠纷化解机制，智能辅助办案系统、远程视频系统、心理健康指导中心等，可以全面且有针对性地对罪犯进行教育和改造。

为了强化改造宗旨，真正实现罪犯的社会化改造，监狱从教育教化、心理矫治、劳动改造到非遗技能培训多方面入手，让罪犯知法懂法，矫正犯罪心理，培养劳动技能，最终重新找回人生的价值所在。

针对未成年犯和女犯的改造，现代监狱会根据他们的特殊身份对症下药。未成年犯的身心发育尚不健全，因此监狱充分保障其受教育权和发展权；对女犯主要采取心理矫治，艺术矫治和手工艺培训的方法，促使他们舒缓情绪，表达内心。

外籍犯监狱则在尊重差异的基础上，向他们普及中国的法律与文化，惩教结合，也为各项事宜提供必要的帮助。

我们坚信，每一颗迷失的心都有回归的可能，我们的工作就是铺就那条回家的路，点燃那盏回家的灯。`,
          floor: 2,
          order: 6,
          arEnabled: false,
          bgColor: '#9370DB',
        },
        {
          id: '7',
          name: '新时代中国监狱的历史性变革',
          description: '了解新时代中国监狱在总体国家安全观和治本安全观指导下的历史性变革',
          coverImage: '/assets/images/halls/new-era-development.jpg',
          detail: `进入新时代，中国监狱发生了历史性变革。变革的起点是2014年4月15日，习总书记在中央国家安全委员会第一次会议上首次提出了总体国家安全观。围绕着这一理念，我国监狱管理实现了规范化基础上的新发展。

2017年，时任司法部部长张军提出要树立治本安全观，针对监狱工作提出了具体实践指导。在治本安全观的贯彻下，2018年春节，900多名罪犯离监探亲全部按时返回，充分凸显出安全观落实的成效和人性化管理的温度。

现代的刑罚执行持续推进规范化和科学化，展板上所展示的这些画面全部都是全程留痕，公开公示，从根本上杜绝了暗箱操作，也让积极改造的人看到希望，让混刑度日的人无所遁形。

现代监狱设有网格化、全覆盖的纠纷化解机制，智能辅助办案系统、远程视频系统、心理健康指导中心等，可以全面且有针对性地对罪犯进行教育和改造。

为了强化改造宗旨，真正实现罪犯的社会化改造，监狱从教育教化、心理矫治、劳动改造到非遗技能培训多方面入手，让罪犯知法懂法，矫正犯罪心理，培养劳动技能，最终重新找回人生的价值所在。

针对未成年犯和女犯的改造，现代监狱会根据他们的特殊身份对症下药。未成年犯的身心发育尚不健全，因此监狱充分保障其受教育权和发展权；对女犯主要采取心理矫治，艺术矫治和手工艺培训的方法，促使他们舒缓情绪，表达内心。

外籍犯监狱则在尊重差异的基础上，向他们普及中国的法律与文化，惩教结合，也为各项事宜提供必要的帮助。`,
          floor: 3,
          order: 7,
          arEnabled: true,
          bgColor: '#FFD700',
        },
        {
          id: '8',
          name: '铸就忠诚警魂',
          description: '了解新中国监狱人民警察的发展历程，感受监狱人民警察百炼成钢的精神丰碑',
          coverImage: '/assets/images/halls/loyalty-spirit.jpg',
          detail: `各位来宾，接下来请跟随我进入新中国监狱人民警察的发展历程。首先警魂是贯穿其中，铸造铁军的精神支柱。监狱警察队伍的历史发展分为三部分，从白手起家到规范化建设再到现代化转型。

在八劳会议后，我们在人才培养方面进一步现代化规范化，从干部培训班到司法警校，建立起完整的干警培训制度。中央劳改劳教管理干部学院即现在的中央司法警官学院，持续发挥着培育司法行政系统人才的摇篮作用。

同时对于公务员制和警衔制度的改进和完善，使得新时代的政法队伍进一步正规化，增强了人民警察的身份认同感。警衔制度于1992年诞生，现行的警衔制度共分为5等13级，总警监、副总警监、警监、警督、警司和警员。

从严治警是打造政法铁军进程中的关键环节，2020年7月到2021年12月，全国政法队伍教育整顿依次铺开。紧接着司法部在2024年至2026，以"铸警魂、砺精兵、强作风、担使命"为主题，展开全系统监狱戒毒人民警察实战大练兵。

【大山精神——青山埋忠骨，精神永不息】1952年，遵照邓小平同志指示，千余名战士徒步押解万余罪犯逆金沙江而上，于川西南建立雷马屏监狱。1956年川西平叛中，劳改干部浴血奋战，牺牲数十人，歼敌千余人，用血肉筑起共和国安宁的铜墙铁壁。诠释了"献了青春献终身，献了终身献子孙"的崇高精神。

【"红烛"精神——上海监狱的灵魂之光】自2002年起，上海监狱系统全面开展弘扬"红烛"精神宣传教育活动，这一精神萌发于基层一线，是上海监狱的"传家宝"，更是几代民警共同的精神家园。

【塘格木精神——地震中的忠诚与重生】1990年4月26日，青海塘格木发生6.9级强震，民警带领罪犯在黑夜中奋力救援，解救出118人。115名罪犯依法获减刑假释。这便是永不褪色的"塘格木精神"。

【千里大转移——汶川地震中的生命奇迹】2008年汶川特大地震中，阿坝监狱紧急转移1900余名罪犯，行程13000公里，创造了世界监狱史上罕见的救灾奇迹。

【抗疫逆行——高墙内的无声战场】2019年末新冠疫情暴发，全国监狱民警主动请缨、封闭执勤。吴秋瑾同志是安徽省女子监狱三级高级警长，全国司法行政系统一级英雄模范。2020年带队驰援武汉抗疫，英勇奋战53天。罹患"渐冻症"后，仍以"心中有阳光，就不怕被冻住"的信念抗争病魔，展现了对党忠诚、恪尽职守、无私奉献的崇高品格。

【绽放的白玉兰——浙江省女子监狱40年坚守】浙江省女子监狱，40年来实现监管安全"零事故"，荣获全国三八红旗集体、全国五一巾帼标兵岗等称号。2006年，习近平同志亲临调研，寄予殷切期望。女子监狱民警始终牢记嘱托，坚持"以人为本"的监狱工作方针。展现司法温度与巾帼担当。

这里记载的，是一些我们永远不应忘记的名字。他们中有的人，在凶险的突发时刻，与罪犯殊死搏斗，不幸牺牲。有的人在岗位上默默坚守最终积劳成疾。兰建国同志，2009年10月17日，时任内蒙古自治区呼和浩特第二监狱民警的兰建国同志，为制止四名罪犯暴力脱逃，与之展开了殊死搏斗。最终，他身中五十六刀，壮烈牺牲。

英模们的精神，如同永不熄灭的火炬，照耀着一代代警院学子从保定这座校园出发，将青春和热血奉献给国家的司法行政事业。`,
          floor: 3,
          order: 8,
          arEnabled: false,
          bgColor: '#B22222',
        },
      ];

      const hall = halls.find(h => h.id === this.data.hallId);
      
      if (hall) {
        this.setData({
          hall: hall,
          hallName: hall.name,
          loading: false,
        });
      } else {
        // 尝试从API加载
        try {
          // 注意：微信小程序不支持动态import，改为静态导入
          const { getHallDetail } = require('../../utils/api');
          const res = await getHallDetail(this.data.hallId);
          if (res.success && res.data) {
            this.setData({
              hall: res.data,
              hallName: res.data.name,
              loading: false,
            });
            // 检查收藏状态和收藏数（异步执行，不阻塞页面显示）
            this.checkCollectionStatus().catch(() => {});
          } else {
            throw new Error('展区不存在');
          }
        } catch (error) {
          wx.showToast({
            title: '展区不存在',
            icon: 'none',
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      }
    } catch (error) {
      console.error('加载展区详情失败', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none',
      });
      this.setData({ loading: false });
    }
  },

  /**
   * 开始AR体验
   */
  async onStartAR() {
    console.log('点击AR体验按钮', {
      hall: this.data.hall,
      hallId: this.data.hallId,
    });
    
    if (!this.data.hall) {
      wx.showToast({
        title: '展区信息未加载',
        icon: 'none',
      });
      return;
    }

    if (!this.data.hall.arEnabled) {
      wx.showToast({
        title: '该展区暂不支持AR体验',
        icon: 'none',
      });
      return;
    }

    const hallId = this.data.hall.id || this.data.hallId;
    if (!hallId) {
      wx.showToast({
        title: '展区ID无效',
        icon: 'none',
      });
      return;
    }

    // 记录AR点击统计
    try {
      const { recordARClick } = await import('../../utils/api');
      await recordARClick(hallId);
    } catch (e) {
      console.error('记录AR点击统计失败:', e);
      // 不影响AR跳转
    }

    // 直接跳转到AR页面，优先使用xr-frame方案
    // 如果xr-frame不可用，会自动降级到原生AR
    const url = `/pages/ar-xr/ar-xr?hallId=${hallId}`;
    console.log('准备跳转到AR体验页面', url);

    wx.navigateTo({
      url: url,
      success: () => {
        console.log('成功跳转到AR体验页面');
      },
      fail: (err) => {
        console.error('跳转到AR体验页面失败，尝试使用原生AR方案', err);
        // 如果xr-frame页面跳转失败，降级到原生AR
        wx.navigateTo({
          url: `/pages/ar-native/ar-native?hallId=${hallId}`,
          fail: (fallbackErr) => {
            console.error('原生AR页面跳转也失败', fallbackErr);
            wx.showToast({
              title: 'AR页面跳转失败，请检查页面配置',
              icon: 'none',
              duration: 2000,
            });
          },
        });
      },
    });
  },

  /**
   * 检查收藏状态
   */
  async checkCollectionStatus() {
    try {
      const app = getApp<IAppOption>();
      const userInfo = await app.getUserInfo();
      if (!userInfo) return;

      const { checkCollectionExists } = await import('../../utils/api');
      // 这里需要实现checkCollectionExists API，暂时跳过
      
      // 统计收藏数（可以从后端获取）
    } catch (e) {
      console.error('检查收藏状态失败:', e);
    }
  },

  /**
   * 切换收藏状态
   */
  async onToggleCollection() {
    try {
      const app = getApp<IAppOption>();
      const userInfo = await app.getUserInfo();
      if (!userInfo) {
        wx.showToast({
          title: '请先登录',
          icon: 'none',
        });
        return;
      }

      const { addCollection, removeCollection, getCollectionList } = await import('../../utils/api');
      
      if (this.data.isCollected) {
        // 取消收藏 - 需要先获取收藏ID
        const collectionList = await getCollectionList();
        if (collectionList.success && collectionList.data) {
          const collection = collectionList.data.find(
            (c: any) => c.type === 'hall' && c.itemId === this.data.hallId
          );
          if (collection) {
            await removeCollection(collection._id || '');
            this.setData({
              isCollected: false,
              collectionCount: Math.max(0, this.data.collectionCount - 1),
            });
            wx.showToast({
              title: '已取消收藏',
              icon: 'success',
            });
          }
        }
      } else {
        // 添加收藏
        const res = await addCollection({
          type: 'hall',
          itemId: this.data.hallId,
          itemData: {
            id: this.data.hallId,
            name: this.data.hallName,
            description: this.data.hall?.description || '',
          },
        });
        
        if (res.success) {
          this.setData({
            isCollected: true,
            collectionCount: this.data.collectionCount + 1,
          });
          wx.showToast({
            title: '收藏成功',
            icon: 'success',
          });
        }
      }
    } catch (e: any) {
      console.error('切换收藏状态失败:', e);
      wx.showToast({
        title: e.message || '操作失败',
        icon: 'none',
      });
    }
  },

  /**
   * 图片加载错误处理
   */
  onImageError(e: WechatMiniprogram.ImageErrorEvent) {
    console.error('展区详情图片加载失败', e.detail);
    wx.showToast({
      title: '图片加载失败',
      icon: 'none',
      duration: 2000,
    });
  },
});

