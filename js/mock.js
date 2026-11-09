/* 星图校园统一模拟数据：后续可由服务端同构数据替换 */
const novaData = {
  user: {
    id: "u-nova",
    name: "林小星",
    initial: "星",
    grade: "2026 级",
    major: "数字媒体技术",
    verified: true,
    title: "新星探索者"
  },

  categories: [
    { id: "all", label: "全部地点" },
    { id: "study", label: "学习成长" },
    { id: "sports", label: "运动活力" },
    { id: "life", label: "校园生活" },
    { id: "social", label: "社交活动" }
  ],

  forumCategories: ["吃瓜", "吐槽", "树洞", "求助", "闲置"],

  zones: [
    {
      id: "academic", name: "教学科研区", en: "ACADEMIC CORE", color: "#6E93B8",
      summary: "西侧教学楼群与南侧 8A–8D、教一至教四连成教学主环，通识课、专业课与实训都集中在这一带。",
      focus: { x: 450, y: 400 }, zoom: 1.4,
      paths: [
        "M 54 338 Q 140 312 252 322 L 344 340 Q 358 372 350 412 L 318 462 Q 306 500 282 542 L 250 584 Q 214 622 156 630 L 92 630 Q 50 610 46 544 L 42 430 Q 44 372 54 338 Z",
        "M 378 470 Q 464 452 574 452 Q 686 452 728 474 L 744 552 Q 732 616 664 632 L 544 640 Q 456 636 414 610 L 384 542 Z",
        "M 544 166 Q 600 152 630 160 L 638 250 Q 630 274 596 278 L 560 274 Q 540 258 542 210 Z"
      ],
      spots: [
        { id: "bld-6b", name: "6B 教学楼", note: "公共基础课", x: 150, y: 355 },
        { id: "bld-6c", name: "6C 教学楼", note: "专业课程", x: 205, y: 410 },
        { id: "bld-6a", name: "6A 教学楼", note: "实训教室", x: 145, y: 468 },
        { id: "bld-train", name: "培训楼", note: "职业技能培训", x: 258, y: 382 },
        { id: "bld-8a", name: "8A 信息技术", note: "现代信息技术大楼", x: 493, y: 425 },
        { id: "bld-8b", name: "8B 设计智造", note: "设计与智造大楼", x: 493, y: 492 },
        { id: "bld-8c", name: "8C 现代服务", note: "现代服务大楼", x: 604, y: 437 },
        { id: "bld-8d", name: "8D 数字化教学", note: "数字化教学大楼", x: 610, y: 505 },
        { id: "bld-duxing", name: "笃行楼 · 教二", note: "智慧教室", x: 588, y: 216, placeId: "teaching" },
        { id: "bld-chongde", name: "崇德楼 · 教一", note: "通识课程", x: 652, y: 562 },
        { id: "bld-jingji", name: "精技楼 · 教四", note: "实训中心", x: 795, y: 520 },
        { id: "bld-chuangxin", name: "创新楼 · 教三", note: "创新创业", x: 515, y: 580 },
        { id: "bld-19", name: "19栋 人文艺术", note: "人文艺术大楼", x: 150, y: 548 }
      ]
    },
    {
      id: "dorm", name: "宿舍生活区", en: "RESIDENTIAL QUARTER", color: "#CE8B6B",
      summary: "生活区收录学生宿舍、教师公寓和周边服务点。",
      focus: { x: 560, y: 240 }, zoom: 1.32,
      paths: [
        "M 690 60 Q 790 42 900 46 Q 942 54 944 112 L 934 188 Q 926 222 860 228 L 716 232 Q 690 212 688 158 Z",
        "M 72 234 Q 140 224 212 230 L 234 264 Q 238 296 210 312 L 130 318 Q 78 314 66 284 Z"
      ],
      spots: [
        { id: "dor-community", name: "学生宿舍区", note: "学生住宿", x: 800, y: 135, placeId: "dormitory" },
        { id: "dor-cainiao", name: "菜鸟驿站", note: "快递代收 · 3栋旁", x: 712, y: 212, accent: true },
        { id: "dor-young", name: "青年教师公寓", note: "单身教工宿舍", x: 150, y: 262 },
        { id: "dor-teacher", name: "教师公寓", note: "教职工生活区", x: 100, y: 295 },
        { id: "dor-court1", name: "1号篮球场", note: "运动场地", x: 900, y: 200 },
        { id: "dor-court2", name: "2号羽毛球场", note: "运动场地", x: 928, y: 158 }
      ]
    },
    {
      id: "sports", name: "运动健康区", en: "SPORTS & FITNESS", color: "#76A97C",
      summary: "运动区收录田径场、体育馆、游泳池和各类球场，使用安排以现场指引为准。",
      focus: { x: 1040, y: 440 }, zoom: 1.7,
      paths: [
        "M 850 230 Q 918 218 984 228 L 1000 300 Q 994 328 938 332 L 862 328 Q 840 300 844 262 Z",
        "M 1006 352 Q 1082 342 1142 362 L 1184 400 Q 1202 460 1178 522 L 1128 598 Q 1088 628 1010 626 L 952 600 Q 932 554 938 498 L 946 412 Z"
      ],
      spots: [
        { id: "spt-track", name: "田径场", note: "400 米跑道", x: 1095, y: 420, placeId: "stadium" },
        { id: "spt-gym", name: "体育馆", note: "室内综合馆", x: 915, y: 205 },
        { id: "spt-pool", name: "游泳池", note: "开放安排见现场指引", x: 862, y: 258 },
        { id: "spt-basket5", name: "5号篮球场", note: "灯光球场", x: 1024, y: 330 },
        { id: "spt-tennis1", name: "1号网球场", note: "运动场地", x: 890, y: 510 },
        { id: "spt-volley", name: "排球场", note: "沙地排球场", x: 960, y: 545 }
      ]
    },
    {
      id: "lake", name: "湖景文化区", en: "LAKESIDE CULTURE", color: "#4FA79B",
      summary: "以映月湖为核心的休闲文化带，图书馆、九曲廊桥与亲水平台环湖展开。",
      focus: { x: 450, y: 350 }, zoom: 1.6,
      paths: [
        "M 620 240 Q 690 226 754 242 L 762 292 L 750 332 L 744 382 Q 748 402 730 426 Q 720 448 688 454 L 610 462 L 500 466 Q 430 462 366 450 L 262 450 Q 204 438 196 384 L 198 316 Q 206 268 262 256 Q 340 240 430 236 Z"
      ],
      spots: [
        { id: "lak-library", name: "图书馆", note: "藏书与自习", x: 700, y: 265, placeId: "library" },
        { id: "lak-water", name: "映月湖", note: "环湖栈道", x: 350, y: 355, placeId: "lake" },
        { id: "lak-bridge", name: "九曲廊桥", note: "湖上步道", x: 400, y: 352 },
        { id: "lak-pavilion", name: "湖心亭", note: "晨读集合点", x: 300, y: 312 },
        { id: "lak-deck", name: "亲水平台", note: "观景平台", x: 715, y: 408 }
      ]
    },
    {
      id: "dining", name: "餐饮社交区", en: "DINING & SOCIAL", color: "#C69A52",
      summary: "滋兰餐厅、修远楼学生活动中心与超市医务室，构成日常吃喝与社交的一站式动线。",
      focus: { x: 820, y: 320 }, zoom: 1.9,
      paths: [
        "M 754 292 Q 812 282 872 294 L 884 344 Q 880 386 826 396 L 766 396 Q 746 366 750 328 Z",
        "M 928 292 Q 976 284 1014 294 L 1020 340 Q 1014 370 972 374 L 934 364 Q 918 330 926 308 Z",
        "M 636 238 Q 672 230 706 238 L 710 264 Q 704 282 672 284 L 642 276 Q 630 256 636 246 Z"
      ],
      spots: [
        { id: "din-canteen", name: "滋兰餐厅 · 一饭", note: "营业安排见现场公示", x: 815, y: 340, placeId: "cafeteria" },
        { id: "din-hub", name: "修远楼 · 学生活动中心", note: "社团与演出", x: 975, y: 335, placeId: "student-center" },
        { id: "din-market", name: "超市 · 医务室", note: "生活补给", x: 672, y: 258 }
      ]
    }
  ],

  buildings: [
    { id: "NW-01", file: "B-NW-01.svg", name: "教师公寓 1 栋", region: "nw", floors: 5, note: "教师公寓群左前塔楼，白墙竖向长条窗，约5层", x: 19.78, y: 18.55 },
    { id: "NW-02", file: "B-NW-02.svg", name: "教师公寓 2 栋", region: "nw", floors: 7, note: "公寓群中部较高塔楼，屋顶灰色烟囱小盒，前右低层门廊", x: 22.89, y: 17.9 },
    { id: "NW-03", file: "B-NW-03.svg", name: "教师公寓 3 栋", region: "nw", floors: 4, note: "顶带蓝色方形水池的公寓楼，米白墙两行窗带", x: 26.01, y: 16.11 },
    { id: "NW-04", file: "B-NW-04.svg", name: "教师公寓 4 栋", region: "nw", floors: 5, note: "公寓群烟囱塔楼一，受光面2x2方格窗，灰烟囱盒", x: 27.29, y: 17.58 },
    { id: "NW-05", file: "B-NW-05.svg", name: "教师公寓 5 栋", region: "nw", floors: 4, note: "公寓群烟囱塔楼二，白墙两行窗带，灰烟囱盒", x: 29.3, y: 16.93 },
    { id: "NW-06", file: "B-NW-06.svg", name: "教师公寓 6 栋", region: "nw", floors: 2, note: "公寓群右前低层长楼，白平顶带天窗条", x: 32.23, y: 20.18 },
    { id: "NW-07", file: "B-NW-07.svg", name: "西北实训长楼", region: "nw", floors: 3, note: "西北大白楼，长条白楼带两个蓝灰屋顶天窗，两行长窗", x: 24.18, y: 26.04 },
    { id: "NW-08", file: "B-NW-08.svg", name: "黄顶艺术楼", region: "nw", floors: 2, note: "黄顶白楼，黄色屋顶装饰边+浅蓝玻璃带+绿色小门，右侧白翼楼", x: 22.71, y: 32.71 },
    { id: "NW-09", file: "B-NW-09.svg", name: "湖边圆形图书馆", region: "nw", floors: 2, note: "湖边圆形图书馆，白色扁椭圆圆形基座广场+白色方盒主楼+浅蓝半圆入口+右侧灰色长翼", x: 47.25, y: 38.41, placeId: "library" },
    { id: "NW-10", file: "B-NW-10.svg", name: "红门长条教学楼", region: "nw", floors: 3, note: "带红门长条教学楼，白长楼两行窗带，左端红色入口门+左后白色附属小楼", x: 49.08, y: 26.37 },
    { id: "NW-11a", file: "B-NW-11a.svg", name: "蓝顶教学塔楼", region: "nw", floors: 8, note: "蓝顶群白色高竖塔楼，竖向小窗列+橙色小方块", x: 14.65, y: 45.57 },
    { id: "NW-11b", file: "B-NW-11b.svg", name: "蓝顶教学主楼", region: "nw", floors: 3, note: "蓝顶教学楼主楼（上），浅蓝屋顶+深蓝分隔线，白墙三行长窗带", x: 19.05, y: 39.71 },
    { id: "NW-11c", file: "B-NW-11c.svg", name: "蓝顶教学楼 · 中", region: "nw", floors: 2, note: "蓝顶教学楼中楼（中），浅蓝屋顶白檐边，白墙两行窗带", x: 23.15, y: 45.57 },
    { id: "NW-11d", file: "B-NW-11d.svg", name: "蓝顶教学楼 · 南", region: "nw", floors: 2, note: "蓝顶教学楼下部长楼，浅蓝屋顶白檐边，白墙两行窗带", x: 23.44, y: 51.3 },
    { id: "NW-11e", file: "B-NW-11e.svg", name: "白顶教学小楼", region: "nw", floors: 2, note: "白平屋顶教学小楼，屋顶2x2四小窗，白墙一行窗带", x: 22.89, y: 48.83 },
    { id: "NE-01", file: "B-NE-01.svg", name: "宿舍楼 1 栋", region: "ne", floors: 3, note: "第一排长条宿舍楼，米白墙、浅灰顶、两条窗带", x: 60.81, y: 13.67 },
    { id: "NE-02", file: "B-NE-02.svg", name: "宿舍楼 2 栋", region: "ne", floors: 3, note: "第一排长条宿舍楼，米白墙、浅灰顶", x: 68.32, y: 14.0 },
    { id: "NE-03", file: "B-NE-03.svg", name: "宿舍楼 3 栋", region: "ne", floors: 3, note: "第一排长条宿舍楼，米白墙、浅灰顶", x: 75.64, y: 14.81 },
    { id: "NE-04", file: "B-NE-04.svg", name: "宿舍楼 4 栋", region: "ne", floors: 3, note: "第一排长条宿舍楼，米白墙、浅灰顶", x: 81.5, y: 15.62 },
    { id: "NE-05", file: "B-NE-05.svg", name: "高层学生公寓", region: "ne", floors: 6, note: "右上角高层白色方盒楼，4条水平窗带", x: 86.81, y: 15.95 },
    { id: "NE-06", file: "B-NE-06.svg", name: "宿舍楼 5 栋", region: "ne", floors: 3, note: "第二排长条宿舍楼，米白墙、浅灰顶", x: 60.62, y: 19.86 },
    { id: "NE-07", file: "B-NE-07.svg", name: "宿舍楼 6 栋", region: "ne", floors: 3, note: "第二排长条宿舍楼，米白墙、浅灰顶", x: 67.95, y: 21.32 },
    { id: "NE-08", file: "B-NE-08.svg", name: "宿舍楼 7 栋", region: "ne", floors: 3, note: "第二排长条宿舍楼，米白墙、浅灰顶", x: 75.27, y: 21.65 },
    { id: "NE-09", file: "B-NE-09.svg", name: "宿舍楼 8 栋", region: "ne", floors: 3, note: "第二排长条宿舍楼，米白墙、浅灰顶", x: 81.14, y: 22.79 },
    { id: "NE-10", file: "B-NE-10.svg", name: "宿舍楼 9 栋", region: "ne", floors: 3, note: "第三排长条宿舍楼，米白墙、浅灰顶", x: 75.46, y: 28.32 },
    { id: "NE-11", file: "B-NE-11.svg", name: "宿舍楼 10 栋", region: "ne", floors: 3, note: "第三排长条宿舍楼，米白墙、浅灰顶", x: 83.52, y: 28.97 },
    { id: "NE-12", file: "B-NE-12.svg", name: "珊瑚橙屋顶办公楼", region: "ne", floors: 2, note: "珊瑚橙屋顶方形办公楼，米白墙", x: 56.96, y: 28.32 },
    { id: "NE-13", file: "B-NE-13.svg", name: "浅灰屋顶综合楼", region: "ne", floors: 3, note: "浅灰屋顶/墙面方形大楼，屋顶小天窗", x: 67.58, y: 29.95 },
    { id: "NE-14", file: "B-NE-14.svg", name: "珊瑚橙小楼", region: "ne", floors: 2, note: "珊瑚橙屋顶小楼，米白墙", x: 74.73, y: 36.46 },
    { id: "NE-15", file: "B-NE-15.svg", name: "蓝顶大教学楼", region: "ne", floors: 3, note: "大长浅蓝顶教学楼，多层长窗带，两条深蓝屋顶分隔线", x: 60.26, y: 43.29 },
    { id: "NE-16", file: "B-NE-16.svg", name: "宿舍楼 11 栋", region: "ne", floors: 3, note: "第二排最左侧长条宿舍楼，贴篮球场西缘，米白墙浅灰顶", x: 52.38, y: 20.83 },
    { id: "NE-17", file: "B-NE-17.svg", name: "宿舍楼 12 栋", region: "ne", floors: 3, note: "高白楼NE-05正下方偏右长条宿舍，米白墙浅灰顶", x: 86.63, y: 23.76 },
    { id: "NE-18", file: "B-NE-18.svg", name: "宿舍楼 13 栋", region: "ne", floors: 3, note: "右排中下部长条宿舍，米白墙浅灰顶", x: 84.25, y: 34.51 },
    { id: "SW-01", file: "B-SW-01.svg", name: "橙顶教学大楼", region: "sw", floors: 4, note: "橙顶大教学楼，珊瑚橙屋顶、米白墙、4层长窗带", x: 32.05, y: 60.55 },
    { id: "SW-02", file: "B-SW-02.svg", name: "U 型围合教学楼", region: "sw", floors: 3, note: "U型围合教学楼群，三翼方盒围合、浅灰顶米白墙、中央深阴影内院、左侧开口", x: 45.79, y: 67.71 },
    { id: "SW-03", file: "B-SW-03.svg", name: "蓝顶长条教学楼", region: "sw", floors: 3, note: "左下蓝顶长条低楼，浅蓝屋顶、米白墙、3层", x: 13.92, y: 57.94 },
    { id: "SW-04", file: "B-SW-04.svg", name: "浅灰顶长条教学楼", region: "sw", floors: 3, note: "左下浅色顶长条低楼，白/浅灰屋顶带天窗、米白墙、3层", x: 20.33, y: 59.9 },
    { id: "SE-01", file: "B-SE-01.svg", name: "湖畔 L 形长楼", region: "se", floors: 3, note: "湖边L形双翼浅蓝屋顶长楼（架在水上），多层长窗带，左端小白平顶附盒", x: 65.02, y: 50.78 },
    { id: "SE-02", file: "B-SE-02.svg", name: "白色斜顶楼", region: "se", floors: 2, note: "白色斜顶楼，后角珊瑚橙屋顶段+4条浅蓝斜条天窗", x: 76.92, y: 46.55 },
    { id: "SE-03", file: "B-SE-03.svg", name: "三翼围合教学楼", region: "se", floors: 3, note: "三翼围合U形教学楼：东翼蓝顶4层、西翼浅灰屋顶天窗、南翼蓝顶条带、米色附楼、内院阴影", x: 54.03, y: 71.61 },
    { id: "SE-04", file: "B-SE-04.svg", name: "纯白大屋顶综合楼", region: "se", floors: 2, note: "长条形纯白大屋顶楼，屋顶分三段接缝，受光面长窗带+前端内凹入口", x: 62.27, y: 76.5 },
    { id: "SE-05", file: "B-SE-05.svg", name: "体育馆", region: "se", floors: 2, note: "体育馆：方形白基座+蓝色四坡玻璃屋顶，白色交叉分格梁", x: 71.43, y: 76.82 },
    { id: "SE-06", file: "B-SE-06.svg", name: "球场旁白色方楼", region: "se", floors: 2, note: "球场旁纯白立方体方盒，平顶", x: 86.08, y: 54.69 },
  ],

  /* 地图点位分类：teach 教学楼 / dorm 宿舍 / life 生活服务 / other 其他 */
  campusPois: [
    { id: "library", name: "图书馆", x: 42, y: 35, type: "life", zone: "湖景文化区", placeId: "library" },
    { id: "lake", name: "映月湖", x: 41.5, y: 47.5, type: "other", zone: "湖景文化区", placeId: "lake" },
    { id: "bridge", name: "湖心栈桥", x: 54.5, y: 61.5, type: "other", zone: "湖景文化区" },
    { id: "waterside", name: "亲水平台", x: 68, y: 58, type: "life", zone: "湖景文化区" },
    { id: "art", name: "艺术大楼", x: 22.43, y: 27.37, type: "teach", zone: "教学科研区" },
    { id: "building-19", name: "19栋", x: 15, y: 28.7, type: "dorm", zone: "教学科研区" },
    { id: "kindergarten", name: "幼儿园", x: 17.07, y: 35.84, type: "other", zone: "教学科研区" },
    { id: "teach-2", name: "教二", x: 61.86, y: 37.75, type: "teach", zone: "教学科研区", placeId: "teaching" },
    { id: "teach-1", name: "教一", x: 64.21, y: 44.63, type: "teach", zone: "教学科研区" },
    { id: "teach-4", name: "教四", x: 72, y: 52, type: "teach", zone: "教学科研区" },
    { id: "teach-3", name: "教三", x: 72, y: 58, type: "teach", zone: "教学科研区" },
    { id: "building-6b", name: "6B", x: 12.5, y: 53.68, type: "teach", zone: "教学科研区" },
    { id: "building-6c", name: "6C", x: 21, y: 59.21, type: "teach", zone: "教学科研区" },
    { id: "building-6a", name: "6A", x: 20.14, y: 68.06, type: "teach", zone: "教学科研区" },
    { id: "training", name: "培训楼", x: 33.07, y: 69.71, type: "teach", zone: "教学科研区" },
    { id: "building-8a", name: "8A", x: 46.64, y: 64.86, type: "teach", zone: "教学科研区" },
    { id: "building-8b", name: "8B", x: 45.79, y: 73.46, type: "teach", zone: "教学科研区" },
    { id: "building-8c", name: "8C", x: 45.57, y: 80.45, type: "teach", zone: "教学科研区" },
    { id: "building-8d", name: "8D", x: 51.86, y: 75.97, type: "teach", zone: "教学科研区" },
    { id: "admin", name: "行政楼", x: 61.64, y: 79.52, type: "other", zone: "教学科研区" },
    { id: "pool-classroom", name: "附属楼", x: 83.21, y: 53.21, type: "teach", zone: "教学科研区" },
    { id: "cainiao", name: "菜鸟驿站", x: 47.8, y: 83.8, type: "life", zone: "教学科研区" },
    { id: "teacher", name: "教师公寓", x: 20.43, y: 18.76, type: "other", zone: "宿舍生活区" },
    { id: "young-teacher", name: "青年教师公寓", x: 39.93, y: 22.83, type: "other", zone: "宿舍生活区" },
    { id: "supermarket", name: "大学生超市", x: 44.14, y: 26.38, type: "life", zone: "宿舍生活区" },
    { id: "clinic", name: "医务室", x: 47.86, y: 29.89, type: "life", zone: "宿舍生活区" },
    { id: "dorm-17", name: "17栋", x: 61.14, y: 8.86, type: "dorm", zone: "宿舍生活区" },
    { id: "dorm-14", name: "14栋", x: 66.86, y: 7.6, type: "dorm", zone: "宿舍生活区" },
    { id: "dorm-13", name: "13栋", x: 73.21, y: 7.35, type: "dorm", zone: "宿舍生活区" },
    { id: "dorm-9", name: "9栋", x: 79.86, y: 7.35, type: "dorm", zone: "宿舍生活区" },
    { id: "dorm-18", name: "18栋", x: 87.21, y: 7.86, type: "dorm", zone: "宿舍生活区" },
    { id: "dorm-15", name: "15栋", x: 58.86, y: 15.87, type: "dorm", zone: "宿舍生活区" },
    { id: "dorm-12", name: "12栋", x: 65.14, y: 14.48, type: "dorm", zone: "宿舍生活区" },
    { id: "dorm-11", name: "11栋", x: 71.64, y: 14.35, type: "dorm", zone: "宿舍生活区" },
    { id: "dorm-7", name: "7栋", x: 78.64, y: 13.86, type: "dorm", zone: "宿舍生活区" },
    { id: "dorm-10", name: "10栋", x: 85.5, y: 15.62, type: "dorm", zone: "宿舍生活区" },
    { id: "dorm-16", name: "16栋", x: 51, y: 18.37, type: "dorm", zone: "宿舍生活区" },
    { id: "dorm-5", name: "5栋", x: 77.86, y: 21.51, type: "dorm", zone: "宿舍生活区" },
    { id: "dorm-8", name: "8栋", x: 85.5, y: 21.89, type: "dorm", zone: "宿舍生活区" },
    { id: "dorm-3", name: "3栋", x: 77, y: 27.65, type: "dorm", zone: "宿舍生活区" },
    { id: "dorm-6", name: "6栋", x: 85.36, y: 28.16, type: "dorm", zone: "宿舍生活区" },
    { id: "dorm-1", name: "1栋", x: 76.14, y: 34.03, type: "dorm", zone: "宿舍生活区" },
    { id: "dorm-4", name: "4栋", x: 85, y: 33.9, type: "dorm", zone: "宿舍生活区" },
    { id: "dorm-2", name: "2栋", x: 84.93, y: 39.52, type: "dorm", zone: "宿舍生活区" },
    { id: "canteen-2", name: "二饭", x: 58, y: 25, type: "life", zone: "餐饮社交区" },
    { id: "tea", name: "茶餐厅", x: 55, y: 29, type: "life", zone: "餐饮社交区" },
    { id: "activity-center", name: "大学生活动中心", x: 66, y: 25, type: "life", zone: "餐饮社交区", placeId: "student-center" },
    { id: "canteen-1", name: "一饭", x: 81.71, y: 46.22, type: "life", zone: "餐饮社交区", placeId: "cafeteria" },
    { id: "basketball", name: "篮球场", x: 47.21, y: 22.27, type: "life", zone: "运动活力区" },
    { id: "tennis-west", name: "网球场", x: 28.07, y: 63.13, type: "life", zone: "运动活力区" },
    { id: "track", name: "操场", x: 89.57, y: 72.38, type: "life", zone: "运动活力区", placeId: "stadium" },
    { id: "tennis", name: "网球场", x: 71.29, y: 80.7, type: "life", zone: "运动活力区" },
    { id: "volleyball", name: "排球场", x: 74.5, y: 90.38, type: "life", zone: "运动活力区" },
    { id: "gym", name: "体育馆", x: 78.86, y: 81.08, type: "life", zone: "运动活力区" },
    { id: "pool", name: "游泳池", x: 89.29, y: 57.14, type: "life", zone: "运动活力区" },
    { id: "west-gate", name: "西门", x: 8.57, y: 45, type: "other", zone: "校门入口区" },
    { id: "east-gate", name: "东门", x: 93, y: 48, type: "other", zone: "校门入口区", placeId: "east-gate" },
    { id: "southwest-gate", name: "西南门", x: 55, y: 92, type: "other", zone: "校门入口区" },
  ],

  places: [
    {
      id: "library", name: "图书馆", shortName: "图书馆", en: "DGPT LIBRARY", category: "study", categoryLabel: "学习成长",
      icon: "book-open", x: 55.9, y: 39.1, isoX: 42, isoY: 35, hours: null,
      description: "图书馆是校园阅读与学习空间。",
      images: ["assets/library.jpg", "assets/reading-room.jpg"], imageLabels: ["图书馆示意", "自习区示意"],
      tips: [],
      menu: []
    },
    {
      id: "cafeteria", name: "滋兰餐厅（一饭）", shortName: "滋兰餐厅", en: "ZHILAN CANTEEN", category: "life", categoryLabel: "校园生活",
      icon: "utensils", x: 65.1, y: 50.2, isoX: 81.71, isoY: 46.22, hours: null,
      description: "滋兰餐厅也叫一饭。各窗口的营业安排、菜品和价格以现场公示为准。",
      images: ["assets/cafeteria.jpg"], imageLabels: ["餐厅示意"],
      tips: [],
      menu: []
    },
    {
      id: "stadium", name: "田径场", shortName: "田径场", en: "ATHLETIC FIELD", category: "sports", categoryLabel: "运动活力",
      icon: "trophy", x: 87.5, y: 62, isoX: 89.57, isoY: 72.38, hours: null,
      description: "田径场可用于跑步等运动。场地开放和活动安排请查看现场指引。",
      images: ["assets/stadium.jpg"], imageLabels: ["田径场示意"],
      tips: [],
      menu: []
    },
    {
      id: "student-center", name: "修远楼 · 学生活动中心", shortName: "修远楼", en: "XIUYUAN STUDENT HUB", category: "social", categoryLabel: "社交活动",
      icon: "users", x: 77.9, y: 49.5, isoX: 66, isoY: 25, hours: null,
      description: "修远楼是校园活动地点之一。参加活动时，请按主办方通知确认楼层和房间。",
      images: ["assets/club-fair.jpg"], imageLabels: ["校园活动示意"],
      tips: [],
      menu: []
    },
    {
      id: "teaching", name: "笃行楼 · 教二", shortName: "笃行楼", en: "DUXING HALL", category: "study", categoryLabel: "学习成长",
      icon: "school", x: 47, y: 31.9, isoX: 61.86, isoY: 37.75, hours: null,
      description: "笃行楼也叫教二。上课或参加活动时，请按课表或活动通知确认教室。",
      images: ["assets/teaching.jpg"], imageLabels: ["教学楼示意"],
      tips: [],
      menu: []
    },
    {
      id: "dormitory", name: "学生宿舍区", shortName: "学生宿舍", en: "STUDENT RESIDENCE", category: "life", categoryLabel: "校园生活",
      icon: "bed", x: 63.9, y: 19.9, isoX: 70, isoY: 20, hours: null,
      description: "学生宿舍区供在校学生住宿。访客通行、设施和报修流程请咨询宿舍管理人员。",
      images: ["assets/dormitory.jpg"], imageLabels: ["宿舍区示意"],
      tips: [],
      menu: []
    },
    {
      id: "lake", name: "映月湖", shortName: "映月湖", en: "YINGYUE LAKE", category: "social", categoryLabel: "社交活动",
      icon: "waves", x: 28, y: 52.4, isoX: 41.5, isoY: 47.5, hours: null,
      description: "映月湖是校园地标。沿湖活动请留意现场安全提示。",
      images: ["assets/lake.jpg"], imageLabels: ["湖景示意"],
      tips: [],
      menu: []
    },
    {
      id: "east-gate", name: "东门", shortName: "东门", en: "EAST GATE", category: "life", categoryLabel: "校园生活",
      icon: "store", x: 93.5, y: 70.9, isoX: 93, isoY: 48, hours: null,
      description: "东门是校本部的出入口之一。进出校园请遵守现场门岗指引。",
      images: ["assets/campus-bg.webp"], imageLabels: ["校园地图示意"],
      tips: [],
      menu: []
    }
  ],

  groups: [
    { id: "g-frisbee", placeId: "stadium", title: "校园飞盘新手局", category: "飞盘", host: "阿澈", hostMajor: "体育教育 · 大二", hostInitial: "澈", time: "11月05日 20:00", day: "05", month: "11月", joined: 4, total: 6, description: "有学长带规则教学，零基础也欢迎。穿舒适运动鞋即可，飞盘已经准备好。", duration: "约 1.5 小时" },
    { id: "g-football", placeId: "stadium", title: "快乐足球，不卷比分", category: "足球", host: "周队", hostMajor: "机械工程 · 大三", hostInitial: "周", time: "11月06日 18:30", day: "06", month: "11月", joined: 5, total: 8, description: "八人制友谊局，足球社同学现场分队，以熟悉新朋友为主。", duration: "约 2 小时" },
    { id: "g-english", placeId: "library", title: "英语听力安静共学", category: "自习", host: "许言", hostMajor: "英语 · 大一", hostInitial: "言", time: "11月05日 19:00", day: "05", month: "11月", joined: 2, total: 4, description: "三楼东侧集合，各自完成 40 分钟精听后互相分享一篇材料。", duration: "约 1 小时" },
    { id: "g-math", placeId: "library", title: "高数第三章互助小组", category: "互助", host: "宋知", hostMajor: "数学与应用数学 · 大二", hostInitial: "宋", time: "11月07日 14:00", day: "07", month: "11月", joined: 3, total: 5, description: "一起梳理导数应用典型题，欢迎带着错题来，不讲课只互助。", duration: "约 2 小时" },
    { id: "g-board", placeId: "student-center", title: "桌游社新手教学桌", category: "桌游", host: "阿洛", hostMajor: "心理学 · 大二", hostInitial: "洛", time: "11月06日 19:00", day: "06", month: "11月", joined: 5, total: 8, description: "从合作类轻策桌游开始，现场有社长教学，不需要自带任何道具。", duration: "约 2 小时" },
    { id: "g-script", placeId: "student-center", title: "校园推理桌游", category: "剧本杀", host: "江禾", hostMajor: "汉语言文学 · 大三", hostInitial: "江", time: "11月07日 18:00", day: "07", month: "11月", joined: 4, total: 6, description: "欢乐还原向剧本，预计三小时。", duration: "约 3 小时" },
    { id: "g-food", placeId: "cafeteria", title: "找位饭搭子尝新窗口", category: "饭搭子", host: "可可", hostMajor: "新闻传播 · 大一", hostInitial: "可", time: "11月05日 17:40", day: "05", month: "11月", joined: 2, total: 4, description: "想打卡二楼川湘窗口，边吃边聊专业和社团，结束后可以一起逛校园。", duration: "约 45 分钟" },
    { id: "g-run", placeId: "lake", title: "湖畔轻松晨跑 3 公里", category: "晨跑", host: "向北", hostMajor: "计算机科学 · 大二", hostInitial: "北", time: "11月06日 07:00", day: "06", month: "11月", joined: 3, total: 6, description: "七分半配速，以看日出和轻松聊天为主，结束后在东门买早餐。", duration: "约 40 分钟" },
    { id: "g-speaking", placeId: "teaching", title: "雅思口语互练一小时", category: "口语", host: "Mia", hostMajor: "国际经济与贸易 · 大二", hostInitial: "M", time: "11月08日 16:00", day: "08", month: "11月", joined: 2, total: 4, description: "围绕本季 Part 2 题库两两互练，互相记录一处亮点和一处建议。", duration: "约 1 小时" },
    { id: "g-movie", placeId: "dormitory", title: "公共客厅治愈系观影", category: "观影", host: "小满", hostMajor: "动画 · 大一", hostInitial: "满", time: "11月06日 20:00", day: "06", month: "11月", joined: 4, total: 6, description: "二栋一层公共客厅，影片现场投票，欢迎带自己的靠垫和无气味零食。", duration: "约 2 小时" }
  ],

  forumPosts: [
    {
      id: "post-library-night",
      category: "吃瓜",
      title: "如果图书馆延长开放，你最希望增加什么？",
      body: "想聊聊你理想中的晚间自习空间。安静、座位和插座，你会先选哪一个？",
      anonymous: true,
      author: "匿名 · 夜航星",
      authorInitial: "匿",
      comments: [
        { id: "c-library-1", author: "匿名 · 纸飞机", authorInitial: "匿", anonymous: true, body: "我会优先选安静的座位，容易专注。" },
        { id: "c-library-2", author: "阿澈", authorInitial: "澈", anonymous: false, body: "希望插座能多几个，现在带插排的座位根本抢不到。" }
      ]
    },
    {
      id: "post-canteen-hand",
      category: "吐槽",
      title: "食堂二楼新窗口，阿姨的手抖是一门艺术",
      body: "点了份小炒肉，肉在勺子里犹豫了三秒，最后只落下两片。不过味道是真的不错，就是打饭的过程像抽盲盒。有没有同款体验的同学？",
      anonymous: true,
      author: "匿名 · 半糖去冰",
      authorInitial: "匿",
      comments: [
        { id: "c-canteen-1", author: "可可", authorInitial: "可", anonymous: false, body: "我上次鼓起勇气说“阿姨多一点”，她真的多给了！" },
        { id: "c-canteen-2", author: "匿名 · 北门路灯", authorInitial: "匿", anonymous: true, body: "建议错峰去，十一点半之前阿姨的手最稳。" },
        { id: "c-canteen-3", author: "匿名 · 云层观察员", authorInitial: "匿", anonymous: true, body: "笑死，这不比开盲盒刺激。" }
      ]
    },
    {
      id: "post-dorm-talk",
      category: "树洞",
      title: "来学校第三周，还是不太敢主动和室友说话",
      body: "大家人都很好，但每次她们聊得很开心，我插不上话，回宿舍就戴上耳机。想问问过来人，这种状态正常吗？要怎么自然地融入？",
      anonymous: true,
      author: "匿名 · 晚风信箱",
      authorInitial: "匿",
      comments: [
        { id: "c-dorm-1", author: "小满", authorInitial: "满", anonymous: false, body: "特别正常，我大一时也这样。从一起点外卖、借个充电线开始就好，不用急着变得很外向。" },
        { id: "c-dorm-2", author: "匿名 · 橘子汽水", authorInitial: "匿", anonymous: true, body: "可以先在宿舍群里分享一个好笑的视频，真的很有用。" },
        { id: "c-dorm-3", author: "匿名 · 无名小熊", authorInitial: "匿", anonymous: true, body: "抱抱你，慢热不是缺点，别有压力。" }
      ]
    },
    {
      id: "post-math-help",
      category: "求助",
      title: "高数第三章怎么自学？求一条不劝退的路线",
      body: "上课能听懂，作业一做就废。想问问学长学姐，是先把教材例题刷完，还是直接跟着网课？有没有适合基础一般同学的节奏建议。",
      anonymous: false,
      author: "许言",
      authorInitial: "言",
      comments: [
        { id: "c-math-1", author: "宋知", authorInitial: "宋", anonymous: false, body: "先例题后习题，每道题写清楚用了哪个定理。" },
        { id: "c-math-2", author: "匿名 · 夜航星", authorInitial: "匿", anonymous: true, body: "强烈建议整理错题，比反复看网课有用。" }
      ]
    },
    {
      id: "post-lamp-sale",
      category: "闲置",
      title: "出一盏九成新护眼台灯和一个收纳箱",
      body: "宿舍换布局，台灯和收纳箱都用不上了。台灯三档调光，收纳箱带轮子，打包 45 元，可在二栋楼下自提。",
      anonymous: false,
      author: "向北",
      authorInitial: "北",
      comments: [
        { id: "c-lamp-1", author: "匿名 · 纸飞机", authorInitial: "匿", anonymous: true, body: "台灯单出吗？我室友正好缺一个。" }
      ]
    },
    {
      id: "post-drone",
      category: "吃瓜",
      title: "如果能设计一场无人机表演，你会选什么图案？",
      body: "我想看一张从星星变成校园轮廓的动画。大家还有什么点子？",
      anonymous: true,
      author: "匿名 · 云层观察员",
      authorInitial: "匿",
      comments: [
        { id: "c-drone-1", author: "阿洛", authorInitial: "洛", anonymous: false, body: "可以从一本打开的书变成一只鸟。" },
        { id: "c-drone-2", author: "匿名 · 夜航星", authorInitial: "匿", anonymous: true, body: "我想看映月湖倒影的图案。" }
      ]
    },
    {
      id: "post-rollcall",
      category: "吐槽",
      title: "早八点名，代答到底算不算帮忙？",
      body: "室友这周生病，让我帮忙答到。我理解他难受，但又觉得哪里不太对。想听听大家怎么看，如果是你们会怎么处理？",
      anonymous: true,
      author: "匿名 · 北门路灯",
      authorInitial: "匿",
      comments: [
        { id: "c-rollcall-1", author: "周队", authorInitial: "周", anonymous: false, body: "可以帮，但最好还是提醒他跟老师请假，长期代答对他没好处。" },
        { id: "c-rollcall-2", author: "匿名 · 半糖去冰", authorInitial: "匿", anonymous: true, body: "我更愿意帮他带份早餐，点名这事还是别冒险。" }
      ]
    }
  ],

  clubs: [
    {
      id: "club-1", name: "《学在东职》编辑部", short: "学", category: "思想政治类", status: "年审通过", unit: "学生处", advisor: "王燕君", leader: "苏子蓝 · 学生处", recruit: "注册在册", image: "assets/teaching.jpg", locationId: "student-center",
      slogan: "思想政治类 · 学生处指导",
      description: "《学在东职》编辑部是学生处指导的思想政治类学生社团，指导教师王燕君，学生负责人苏子蓝。",
      detail: "《学在东职》编辑部为学生处指导的思想政治类学生社团，2026-2027 学年年审通过。指导教师为王燕君，学生负责人为苏子蓝。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-2", name: "国旗护卫队", short: "国", category: "思想政治类", status: "年审通过", unit: "保卫处", advisor: "刘攀峰", leader: "陈曦瑶 · 保卫处", recruit: "注册在册", image: "assets/teaching.jpg", locationId: "student-center",
      slogan: "思想政治类 · 保卫处指导",
      description: "国旗护卫队是保卫处指导的思想政治类学生社团，指导教师刘攀峰，学生负责人陈曦瑶。",
      detail: "国旗护卫队为保卫处指导的思想政治类学生社团，2026-2027 学年年审通过。指导教师为刘攀峰，学生负责人为陈曦瑶。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-3", name: "向阳而“升”社", short: "向", category: "思想政治类", status: "年审通过", unit: "卫生健康学院", advisor: "叶子明", leader: "谢钰琳 · 卫生健康学院", recruit: "注册在册", image: "assets/teaching.jpg", locationId: "teaching",
      slogan: "思想政治类 · 卫生健康学院指导",
      description: "向阳而“升”社是卫生健康学院指导的思想政治类学生社团，指导教师叶子明，学生负责人谢钰琳。",
      detail: "向阳而“升”社为卫生健康学院指导的思想政治类学生社团，2026-2027 学年年审通过。指导教师为叶子明，学生负责人为谢钰琳。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-4", name: "你我他绿色环保志愿服务协会", short: "你", category: "志愿公益类", status: "年审通过", unit: "校团委", advisor: "杨泽坤", leader: "林启迪 · 校团委", recruit: "注册在册", image: "assets/dormitory.jpg", locationId: "student-center",
      slogan: "志愿公益类 · 校团委指导",
      description: "你我他绿色环保志愿服务协会是校团委指导的志愿公益类学生社团，指导教师杨泽坤，学生负责人林启迪。",
      detail: "你我他绿色环保志愿服务协会为校团委指导的志愿公益类学生社团，2026-2027 学年年审通过。指导教师为杨泽坤，学生负责人为林启迪。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-5", name: "聆近志愿服务协会", short: "聆", category: "志愿公益类", status: "年审通过", unit: "校团委", advisor: "杨泽坤", leader: "温雪莹 · 校团委", recruit: "注册在册", image: "assets/dormitory.jpg", locationId: "student-center",
      slogan: "志愿公益类 · 校团委指导",
      description: "聆近志愿服务协会是校团委指导的志愿公益类学生社团，指导教师杨泽坤，学生负责人温雪莹。",
      detail: "聆近志愿服务协会为校团委指导的志愿公益类学生社团，2026-2027 学年年审通过。指导教师为杨泽坤，学生负责人为温雪莹。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-6", name: "启创科学志愿服务协会", short: "启", category: "志愿公益类", status: "年审通过", unit: "电子信息学院", advisor: "麦强、殷凯晴", leader: "彭梦烨 · 电子信息学院", recruit: "注册在册", image: "assets/dormitory.jpg", locationId: "teaching",
      slogan: "志愿公益类 · 电子信息学院指导",
      description: "启创科学志愿服务协会是电子信息学院指导的志愿公益类学生社团，指导教师麦强、殷凯晴，学生负责人彭梦烨。",
      detail: "启创科学志愿服务协会为电子信息学院指导的志愿公益类学生社团，2026-2027 学年年审通过。指导教师为麦强、殷凯晴，学生负责人为彭梦烨。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-7", name: "笃行社", short: "笃", category: "志愿公益类", status: "年审通过", unit: "商学院（筹）", advisor: "脱俗", leader: "郑荔雯 · 商学院（筹）", recruit: "注册在册", image: "assets/dormitory.jpg", locationId: "teaching",
      slogan: "志愿公益类 · 商学院（筹）指导",
      description: "笃行社是商学院（筹）指导的志愿公益类学生社团，指导教师脱俗，学生负责人郑荔雯。",
      detail: "笃行社为商学院（筹）指导的志愿公益类学生社团，2026-2027 学年年审通过。指导教师为脱俗，学生负责人为郑荔雯。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-8", name: "东莞市红十字会东莞职业技术学院卫生健康学院志愿服务队", short: "东", category: "志愿公益类", status: "年审通过", unit: "卫生健康学院", advisor: "姜林辉", leader: "蔡淋敏 · 卫生健康学院", recruit: "注册在册", image: "assets/dormitory.jpg", locationId: "teaching",
      slogan: "志愿公益类 · 卫生健康学院指导",
      description: "东莞市红十字会东莞职业技术学院卫生健康学院志愿服务队是卫生健康学院指导的志愿公益类学生社团，指导教师姜林辉，学生负责人蔡淋敏。",
      detail: "东莞市红十字会东莞职业技术学院卫生健康学院志愿服务队为卫生健康学院指导的志愿公益类学生社团，2026-2027 学年年审通过。指导教师为姜林辉，学生负责人为蔡淋敏。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-9", name: "青春健康同伴社", short: "青", category: "志愿公益类", status: "年审通过", unit: "卫生健康学院", advisor: "黄媛媛、黄丽萍", leader: "李婉晶 · 卫生健康学院", recruit: "注册在册", image: "assets/dormitory.jpg", locationId: "teaching",
      slogan: "志愿公益类 · 卫生健康学院指导",
      description: "青春健康同伴社是卫生健康学院指导的志愿公益类学生社团，指导教师黄媛媛、黄丽萍，学生负责人李婉晶。",
      detail: "青春健康同伴社为卫生健康学院指导的志愿公益类学生社团，2026-2027 学年年审通过。指导教师为黄媛媛、黄丽萍，学生负责人为李婉晶。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-10", name: "“东风窗”社会创新服务社", short: "东", category: "志愿公益类", status: "新成立", unit: "教育与体育学院（筹）", advisor: "洪明心", leader: "邓晓霞 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/dormitory.jpg", locationId: "stadium",
      slogan: "志愿公益类 · 教育与体育学院（筹）指导",
      description: "“东风窗”社会创新服务社是教育与体育学院（筹）指导的志愿公益类学生社团，指导教师洪明心，学生负责人邓晓霞。",
      detail: "“东风窗”社会创新服务社为教育与体育学院（筹）指导的志愿公益类学生社团，2026-2027 学年新成立。指导教师为洪明心，学生负责人为邓晓霞。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-11", name: "汽车好医生志愿者协会", short: "汽", category: "志愿公益类", status: "新成立", unit: "智能制造学院", advisor: "陈先亮", leader: "曾小娉 · 智能制造学院", recruit: "注册在册", image: "assets/dormitory.jpg", locationId: "teaching",
      slogan: "志愿公益类 · 智能制造学院指导",
      description: "汽车好医生志愿者协会是智能制造学院指导的志愿公益类学生社团，指导教师陈先亮，学生负责人曾小娉。",
      detail: "汽车好医生志愿者协会为智能制造学院指导的志愿公益类学生社团，2026-2027 学年新成立。指导教师为陈先亮，学生负责人为曾小娉。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-12", name: "朋辈心理互助协会", short: "朋", category: "自律互助类", status: "年审通过", unit: "学生处", advisor: "吴尔诺、王洁、王燕君", leader: "黎佩俊 · 学生处", recruit: "注册在册", image: "assets/reading-room.jpg", locationId: "student-center",
      slogan: "自律互助类 · 学生处指导",
      description: "朋辈心理互助协会是学生处指导的自律互助类学生社团，指导教师吴尔诺、王洁、王燕君，学生负责人黎佩俊。",
      detail: "朋辈心理互助协会为学生处指导的自律互助类学生社团，2026-2027 学年年审通过。指导教师为吴尔诺、王洁、王燕君，学生负责人为黎佩俊。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-13", name: "心港湾心理社", short: "心", category: "自律互助类", status: "年审通过", unit: "卫生健康学院", advisor: "李珍", leader: "黄伟轩 · 卫生健康学院", recruit: "注册在册", image: "assets/reading-room.jpg", locationId: "teaching",
      slogan: "自律互助类 · 卫生健康学院指导",
      description: "心港湾心理社是卫生健康学院指导的自律互助类学生社团，指导教师李珍，学生负责人黄伟轩。",
      detail: "心港湾心理社为卫生健康学院指导的自律互助类学生社团，2026-2027 学年年审通过。指导教师为李珍，学生负责人为黄伟轩。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-14", name: "药学同行", short: "药", category: "自律互助类", status: "新成立", unit: "卫生健康学院", advisor: "聂素然，林竹贞", leader: "曾晓萍 · 卫生健康学院", recruit: "注册在册", image: "assets/reading-room.jpg", locationId: "teaching",
      slogan: "自律互助类 · 卫生健康学院指导",
      description: "药学同行是卫生健康学院指导的自律互助类学生社团，指导教师聂素然，林竹贞，学生负责人曾晓萍。",
      detail: "药学同行为卫生健康学院指导的自律互助类学生社团，2026-2027 学年新成立。指导教师为聂素然，林竹贞，学生负责人为曾晓萍。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-15", name: "工业互联网协会", short: "工", category: "学术科技类", status: "年审通过", unit: "电子信息学院", advisor: "刘玉佼", leader: "戴安迪 · 电子信息学院", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 电子信息学院指导",
      description: "工业互联网协会是电子信息学院指导的学术科技类学生社团，指导教师刘玉佼，学生负责人戴安迪。",
      detail: "工业互联网协会为电子信息学院指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为刘玉佼，学生负责人为戴安迪。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-16", name: "机器人协会", short: "机", category: "学术科技类", status: "年审通过", unit: "电子信息学院", advisor: "徐淑琼", leader: "苏晓玲 · 电子信息学院", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 电子信息学院指导",
      description: "机器人协会是电子信息学院指导的学术科技类学生社团，指导教师徐淑琼，学生负责人苏晓玲。",
      detail: "机器人协会为电子信息学院指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为徐淑琼，学生负责人为苏晓玲。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-17", name: "电子协会", short: "电", category: "学术科技类", status: "年审通过", unit: "电子信息学院", advisor: "麦强、黄晓宇", leader: "林怡静 · 电子信息学院", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 电子信息学院指导",
      description: "电子协会是电子信息学院指导的学术科技类学生社团，指导教师麦强、黄晓宇，学生负责人林怡静。",
      detail: "电子协会为电子信息学院指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为麦强、黄晓宇，学生负责人为林怡静。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-18", name: "计算机协会", short: "计", category: "学术科技类", status: "年审通过", unit: "电子信息学院", advisor: "黄凌峰、高翔", leader: "黄晓娟 · 电子信息学院", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 电子信息学院指导",
      description: "计算机协会是电子信息学院指导的学术科技类学生社团，指导教师黄凌峰、高翔，学生负责人黄晓娟。",
      detail: "计算机协会为电子信息学院指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为黄凌峰、高翔，学生负责人为黄晓娟。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-19", name: "人工智能物联网协会", short: "人", category: "学术科技类", status: "年审通过", unit: "人工智能学院", advisor: "杨恺", leader: "林立彬 · 人工智能学院", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 人工智能学院指导",
      description: "人工智能物联网协会是人工智能学院指导的学术科技类学生社团，指导教师杨恺，学生负责人林立彬。",
      detail: "人工智能物联网协会为人工智能学院指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为杨恺，学生负责人为林立彬。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-20", name: "法思社", short: "法", category: "学术科技类", status: "年审通过", unit: "商学院（筹）", advisor: "原秋华", leader: "叶诗怡 · 商学院（筹）", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 商学院（筹）指导",
      description: "法思社是商学院（筹）指导的学术科技类学生社团，指导教师原秋华，学生负责人叶诗怡。",
      detail: "法思社为商学院（筹）指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为原秋华，学生负责人为叶诗怡。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-21", name: "金鹰协会", short: "金", category: "学术科技类", status: "年审通过", unit: "商学院（筹）", advisor: "赖昊莹", leader: "陈嘉颖 · 商学院（筹）", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 商学院（筹）指导",
      description: "金鹰协会是商学院（筹）指导的学术科技类学生社团，指导教师赖昊莹，学生负责人陈嘉颖。",
      detail: "金鹰协会为商学院（筹）指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为赖昊莹，学生负责人为陈嘉颖。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-22", name: "电商协会", short: "电", category: "学术科技类", status: "年审通过", unit: "商学院（筹）", advisor: "韩红宇、刘小慧", leader: "蔡晓樱 · 商学院（筹）", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 商学院（筹）指导",
      description: "电商协会是商学院（筹）指导的学术科技类学生社团，指导教师韩红宇、刘小慧，学生负责人蔡晓樱。",
      detail: "电商协会为商学院（筹）指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为韩红宇、刘小慧，学生负责人为蔡晓樱。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-23", name: "本草溯原社", short: "本", category: "学术科技类", status: "年审通过", unit: "卫生健康学院", advisor: "李名深", leader: "蔡洁莹 · 卫生健康学院", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 卫生健康学院指导",
      description: "本草溯原社是卫生健康学院指导的学术科技类学生社团，指导教师李名深，学生负责人蔡洁莹。",
      detail: "本草溯原社为卫生健康学院指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为李名深，学生负责人为蔡洁莹。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-24", name: "承古社（原适宜技社）", short: "承", category: "学术科技类", status: "年审通过", unit: "卫生健康学院", advisor: "谢龙", leader: "黄乐琴 · 卫生健康学院", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 卫生健康学院指导",
      description: "承古社（原适宜技社）是卫生健康学院指导的学术科技类学生社团，指导教师谢龙，学生负责人黄乐琴。",
      detail: "承古社（原适宜技社）为卫生健康学院指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为谢龙，学生负责人为黄乐琴。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-25", name: "康复协会", short: "康", category: "学术科技类", status: "年审通过", unit: "卫生健康学院", advisor: "刘洪秀", leader: "刘宝怡 · 卫生健康学院", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 卫生健康学院指导",
      description: "康复协会是卫生健康学院指导的学术科技类学生社团，指导教师刘洪秀，学生负责人刘宝怡。",
      detail: "康复协会为卫生健康学院指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为刘洪秀，学生负责人为刘宝怡。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-26", name: "明辨社", short: "明", category: "学术科技类", status: "年审通过", unit: "卫生健康学院", advisor: "梁萍", leader: "李悠然 · 卫生健康学院", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 卫生健康学院指导",
      description: "明辨社是卫生健康学院指导的学术科技类学生社团，指导教师梁萍，学生负责人李悠然。",
      detail: "明辨社为卫生健康学院指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为梁萍，学生负责人为李悠然。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-27", name: "人体结构协会", short: "人", category: "学术科技类", status: "年审通过", unit: "卫生健康学院", advisor: "杜静文", leader: "苏小蝶 · 卫生健康学院", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 卫生健康学院指导",
      description: "人体结构协会是卫生健康学院指导的学术科技类学生社团，指导教师杜静文，学生负责人苏小蝶。",
      detail: "人体结构协会为卫生健康学院指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为杜静文，学生负责人为苏小蝶。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-28", name: "天使急救社", short: "天", category: "学术科技类", status: "年审通过", unit: "卫生健康学院", advisor: "黄媛媛", leader: "梁辉怡 · 卫生健康学院", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 卫生健康学院指导",
      description: "天使急救社是卫生健康学院指导的学术科技类学生社团，指导教师黄媛媛，学生负责人梁辉怡。",
      detail: "天使急救社为卫生健康学院指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为黄媛媛，学生负责人为梁辉怡。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-29", name: "读者协会", short: "读", category: "学术科技类", status: "年审通过", unit: "图书馆", advisor: "侯君洁", leader: "黄幸敏 · 图书馆", recruit: "注册在册", image: "assets/library.jpg", locationId: "library",
      slogan: "学术科技类 · 图书馆指导",
      description: "读者协会是图书馆指导的学术科技类学生社团，指导教师侯君洁，学生负责人黄幸敏。",
      detail: "读者协会为图书馆指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为侯君洁，学生负责人为黄幸敏。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-30", name: "A2S无人机协会", short: "A", category: "学术科技类", status: "年审通过", unit: "未来技术学院(筹)", advisor: "王晓斌", leader: "张甜甜 · 未来技术学院(筹)", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 未来技术学院(筹)指导",
      description: "A2S无人机协会是未来技术学院(筹)指导的学术科技类学生社团，指导教师王晓斌，学生负责人张甜甜。",
      detail: "A2S无人机协会为未来技术学院(筹)指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为王晓斌，学生负责人为张甜甜。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-31", name: "数学建模协会", short: "数", category: "学术科技类", status: "年审通过", unit: "通识学院（筹）", advisor: "黄开情", leader: "梁玉莹 · 通识学院（筹）", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 通识学院（筹）指导",
      description: "数学建模协会是通识学院（筹）指导的学术科技类学生社团，指导教师黄开情，学生负责人梁玉莹。",
      detail: "数学建模协会为通识学院（筹）指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为黄开情，学生负责人为梁玉莹。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-32", name: "英语沙龙协会", short: "英", category: "学术科技类", status: "年审通过", unit: "通识学院（筹）", advisor: "陈培珊、钟善奇", leader: "王钰滋 · 通识学院（筹）", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 通识学院（筹）指导",
      description: "英语沙龙协会是通识学院（筹）指导的学术科技类学生社团，指导教师陈培珊、钟善奇，学生负责人王钰滋。",
      detail: "英语沙龙协会为通识学院（筹）指导的学术科技类学生社团，2026-2027 学年年审通过。指导教师为陈培珊、钟善奇，学生负责人为王钰滋。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-33", name: "智能产品开发协会", short: "智", category: "学术科技类", status: "新成立", unit: "电子信息学院", advisor: "王志兵、熊丽萍、郑晓东", leader: "张诗淇 · 电子信息学院", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 电子信息学院指导",
      description: "智能产品开发协会是电子信息学院指导的学术科技类学生社团，指导教师王志兵、熊丽萍、郑晓东，学生负责人张诗淇。",
      detail: "智能产品开发协会为电子信息学院指导的学术科技类学生社团，2026-2027 学年新成立。指导教师为王志兵、熊丽萍、郑晓东，学生负责人为张诗淇。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-34", name: "智汇科创协会", short: "智", category: "学术科技类", status: "新成立", unit: "智能制造学院", advisor: "胡耿军、虞晓琼、周晶", leader: "林钦坤 · 智能制造学院", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 智能制造学院指导",
      description: "智汇科创协会是智能制造学院指导的学术科技类学生社团，指导教师胡耿军、虞晓琼、周晶，学生负责人林钦坤。",
      detail: "智汇科创协会为智能制造学院指导的学术科技类学生社团，2026-2027 学年新成立。指导教师为胡耿军、虞晓琼、周晶，学生负责人为林钦坤。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-35", name: "智创未来", short: "智", category: "学术科技类", status: "新成立", unit: "智能制造学院", advisor: "曹会元", leader: "吴齐禹 · 智能制造学院", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 智能制造学院指导",
      description: "智创未来是智能制造学院指导的学术科技类学生社团，指导教师曹会元，学生负责人吴齐禹。",
      detail: "智创未来为智能制造学院指导的学术科技类学生社团，2026-2027 学年新成立。指导教师为曹会元，学生负责人为吴齐禹。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-36", name: "数字化制造协会", short: "数", category: "学术科技类", status: "新成立", unit: "智能制造学院", advisor: "张燕琴、李笑勉、梅阳寒", leader: "刘名洋 · 智能制造学院", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 智能制造学院指导",
      description: "数字化制造协会是智能制造学院指导的学术科技类学生社团，指导教师张燕琴、李笑勉、梅阳寒，学生负责人刘名洋。",
      detail: "数字化制造协会为智能制造学院指导的学术科技类学生社团，2026-2027 学年新成立。指导教师为张燕琴、李笑勉、梅阳寒，学生负责人为刘名洋。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-37", name: "智能制造研习社", short: "智", category: "学术科技类", status: "新成立", unit: "智能制造学院", advisor: "李霖、李积迁、杨丹", leader: "黄会媚 · 智能制造学院", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 智能制造学院指导",
      description: "智能制造研习社是智能制造学院指导的学术科技类学生社团，指导教师李霖、李积迁、杨丹，学生负责人黄会媚。",
      detail: "智能制造研习社为智能制造学院指导的学术科技类学生社团，2026-2027 学年新成立。指导教师为李霖、李积迁、杨丹，学生负责人为黄会媚。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-38", name: "量化金融研习社", short: "量", category: "学术科技类", status: "新成立", unit: "商学院（筹）", advisor: "李俊霖、彭至然", leader: "陈小敏 · 商学院（筹）", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 商学院（筹）指导",
      description: "量化金融研习社是商学院（筹）指导的学术科技类学生社团，指导教师李俊霖、彭至然，学生负责人陈小敏。",
      detail: "量化金融研习社为商学院（筹）指导的学术科技类学生社团，2026-2027 学年新成立。指导教师为李俊霖、彭至然，学生负责人为陈小敏。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-39", name: "元启AI社", short: "元", category: "学术科技类", status: "新成立", unit: "商学院（筹）", advisor: "何瀚玮", leader: "陈曦瑶 · 商学院（筹）", recruit: "注册在册", image: "assets/library.jpg", locationId: "teaching",
      slogan: "学术科技类 · 商学院（筹）指导",
      description: "元启AI社是商学院（筹）指导的学术科技类学生社团，指导教师何瀚玮，学生负责人陈曦瑶。",
      detail: "元启AI社为商学院（筹）指导的学术科技类学生社团，2026-2027 学年新成立。指导教师为何瀚玮，学生负责人为陈曦瑶。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-40", name: "职业规划与发展协会", short: "职", category: "创新创业类", status: "年审通过", unit: "学生处", advisor: "周蜜", leader: "王雪 · 学生处", recruit: "注册在册", image: "assets/club-fair.jpg", locationId: "student-center",
      slogan: "创新创业类 · 学生处指导",
      description: "职业规划与发展协会是学生处指导的创新创业类学生社团，指导教师周蜜，学生负责人王雪。",
      detail: "职业规划与发展协会为学生处指导的创新创业类学生社团，2026-2027 学年年审通过。指导教师为周蜜，学生负责人为王雪。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-41", name: "咖啡协会", short: "咖", category: "创新创业类", status: "年审通过", unit: "商学院（筹）", advisor: "严心雨", leader: "梁钰琪 · 商学院（筹）", recruit: "注册在册", image: "assets/club-fair.jpg", locationId: "teaching",
      slogan: "创新创业类 · 商学院（筹）指导",
      description: "咖啡协会是商学院（筹）指导的创新创业类学生社团，指导教师严心雨，学生负责人梁钰琪。",
      detail: "咖啡协会为商学院（筹）指导的创新创业类学生社团，2026-2027 学年年审通过。指导教师为严心雨，学生负责人为梁钰琪。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-42", name: "青年创新创业协会（原火星众创社）", short: "青", category: "创新创业类", status: "年审通过", unit: "未来技术学院(筹)", advisor: "邓韵雅", leader: "张茵茵 · 未来技术学院(筹)", recruit: "注册在册", image: "assets/club-fair.jpg", locationId: "teaching",
      slogan: "创新创业类 · 未来技术学院(筹)指导",
      description: "青年创新创业协会（原火星众创社）是未来技术学院(筹)指导的创新创业类学生社团，指导教师邓韵雅，学生负责人张茵茵。",
      detail: "青年创新创业协会（原火星众创社）为未来技术学院(筹)指导的创新创业类学生社团，2026-2027 学年年审通过。指导教师为邓韵雅，学生负责人为张茵茵。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-43", name: "集模二创研究协会", short: "集", category: "创新创业类", status: "年审通过", unit: "创意设计与传媒学院（筹）", advisor: "刘震寰、张智燕", leader: "倪惊语 · 创意设计与传媒学院（筹）", recruit: "注册在册", image: "assets/club-fair.jpg", locationId: "teaching",
      slogan: "创新创业类 · 创意设计与传媒学院（筹）指导",
      description: "集模二创研究协会是创意设计与传媒学院（筹）指导的创新创业类学生社团，指导教师刘震寰、张智燕，学生负责人倪惊语。",
      detail: "集模二创研究协会为创意设计与传媒学院（筹）指导的创新创业类学生社团，2026-2027 学年年审通过。指导教师为刘震寰、张智燕，学生负责人为倪惊语。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-44", name: "廉洁文化宣讲团", short: "廉", category: "文化体育类", status: "年审通过", unit: "通识学院（筹）", advisor: "陈柏林、孙悦、马东宁", leader: "何宝妤 · 通识学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 通识学院（筹）指导",
      description: "廉洁文化宣讲团是通识学院（筹）指导的文化体育类学生社团，指导教师陈柏林、孙悦、马东宁，学生负责人何宝妤。",
      detail: "廉洁文化宣讲团为通识学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为陈柏林、孙悦、马东宁，学生负责人为何宝妤。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-45", name: "拾光乐集社", short: "拾", category: "文化体育类", status: "年审通过", unit: "卫生健康学院", advisor: "林冰", leader: "袁玮 · 卫生健康学院", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 卫生健康学院指导",
      description: "拾光乐集社是卫生健康学院指导的文化体育类学生社团，指导教师林冰，学生负责人袁玮。",
      detail: "拾光乐集社为卫生健康学院指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为林冰，学生负责人为袁玮。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-46", name: "未来社彩文化团", short: "未", category: "文化体育类", status: "年审通过", unit: "机关党总支", advisor: "刘明", leader: "胡卓灵 · 机关党总支", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "student-center",
      slogan: "文化体育类 · 机关党总支指导",
      description: "未来社彩文化团是机关党总支指导的文化体育类学生社团，指导教师刘明，学生负责人胡卓灵。",
      detail: "未来社彩文化团为机关党总支指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为刘明，学生负责人为胡卓灵。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-47", name: "辩论队", short: "辩", category: "文化体育类", status: "年审通过", unit: "马克思主义学院、校团委", advisor: "罗美琪、赵韵姬、方韵诗", leader: "李嘉源 · 马克思主义学院、校团委", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "student-center",
      slogan: "文化体育类 · 马克思主义学院、校团委指导",
      description: "辩论队是马克思主义学院、校团委指导的文化体育类学生社团，指导教师罗美琪、赵韵姬、方韵诗，学生负责人李嘉源。",
      detail: "辩论队为马克思主义学院、校团委指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为罗美琪、赵韵姬、方韵诗，学生负责人为李嘉源。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-48", name: "花艺社", short: "花", category: "文化体育类", status: "年审通过", unit: "人工智能学院", advisor: "谭聪丽", leader: "周航羽 · 人工智能学院", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 人工智能学院指导",
      description: "花艺社是人工智能学院指导的文化体育类学生社团，指导教师谭聪丽，学生负责人周航羽。",
      detail: "花艺社为人工智能学院指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为谭聪丽，学生负责人为周航羽。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-49", name: "Liberty Crew街舞社", short: "L", category: "文化体育类", status: "年审通过", unit: "商学院（筹）", advisor: "王洁", leader: "李星语 · 商学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 商学院（筹）指导",
      description: "Liberty Crew街舞社是商学院（筹）指导的文化体育类学生社团，指导教师王洁，学生负责人李星语。",
      detail: "Liberty Crew街舞社为商学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为王洁，学生负责人为李星语。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-50", name: "莞香协会", short: "莞", category: "文化体育类", status: "年审通过", unit: "商学院（筹）", advisor: "凡丹", leader: "白诗佩 · 商学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 商学院（筹）指导",
      description: "莞香协会是商学院（筹）指导的文化体育类学生社团，指导教师凡丹，学生负责人白诗佩。",
      detail: "莞香协会为商学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为凡丹，学生负责人为白诗佩。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-51", name: "69轮滑协会", short: "6", category: "文化体育类", status: "年审通过", unit: "商学院（筹）", advisor: "刘小慧", leader: "林佳琪 · 商学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 商学院（筹）指导",
      description: "69轮滑协会是商学院（筹）指导的文化体育类学生社团，指导教师刘小慧，学生负责人林佳琪。",
      detail: "69轮滑协会为商学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为刘小慧，学生负责人为林佳琪。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-52", name: "飞扬音乐社", short: "飞", category: "文化体育类", status: "年审通过", unit: "商学院（筹）", advisor: "雷亚林", leader: "卓雨淳 · 商学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 商学院（筹）指导",
      description: "飞扬音乐社是商学院（筹）指导的文化体育类学生社团，指导教师雷亚林，学生负责人卓雨淳。",
      detail: "飞扬音乐社为商学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为雷亚林，学生负责人为卓雨淳。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-53", name: "茶艺协会", short: "茶", category: "文化体育类", status: "年审通过", unit: "商学院（筹）", advisor: "郑秋婵", leader: "纪锦潮 · 商学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 商学院（筹）指导",
      description: "茶艺协会是商学院（筹）指导的文化体育类学生社团，指导教师郑秋婵，学生负责人纪锦潮。",
      detail: "茶艺协会为商学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为郑秋婵，学生负责人为纪锦潮。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-54", name: "毽球协会", short: "毽", category: "文化体育类", status: "年审通过", unit: "商学院（筹）", advisor: "唐雷", leader: "李佩佩 · 商学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 商学院（筹）指导",
      description: "毽球协会是商学院（筹）指导的文化体育类学生社团，指导教师唐雷，学生负责人李佩佩。",
      detail: "毽球协会为商学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为唐雷，学生负责人为李佩佩。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-55", name: "青梧汉服社", short: "青", category: "文化体育类", status: "年审通过", unit: "商学院（筹）", advisor: "遇娜、周涵", leader: "宋静舒 · 商学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 商学院（筹）指导",
      description: "青梧汉服社是商学院（筹）指导的文化体育类学生社团，指导教师遇娜、周涵，学生负责人宋静舒。",
      detail: "青梧汉服社为商学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为遇娜、周涵，学生负责人为宋静舒。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-56", name: "篮球协会", short: "篮", category: "文化体育类", status: "年审通过", unit: "教育与体育学院（筹）", advisor: "林小静", leader: "邓显和 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "stadium",
      slogan: "文化体育类 · 教育与体育学院（筹）指导",
      description: "篮球协会是教育与体育学院（筹）指导的文化体育类学生社团，指导教师林小静，学生负责人邓显和。",
      detail: "篮球协会为教育与体育学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为林小静，学生负责人为邓显和。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-57", name: "足球协会", short: "足", category: "文化体育类", status: "年审通过", unit: "教育与体育学院（筹）", advisor: "梁四海", leader: "胡磊 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "stadium",
      slogan: "文化体育类 · 教育与体育学院（筹）指导",
      description: "足球协会是教育与体育学院（筹）指导的文化体育类学生社团，指导教师梁四海，学生负责人胡磊。",
      detail: "足球协会为教育与体育学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为梁四海，学生负责人为胡磊。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-58", name: "国粹社", short: "国", category: "文化体育类", status: "年审通过", unit: "教育与体育学院（筹）", advisor: "徐俊", leader: "李佳琪 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "stadium",
      slogan: "文化体育类 · 教育与体育学院（筹）指导",
      description: "国粹社是教育与体育学院（筹）指导的文化体育类学生社团，指导教师徐俊，学生负责人李佳琪。",
      detail: "国粹社为教育与体育学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为徐俊，学生负责人为李佳琪。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-59", name: "BAB啦啦操社团", short: "B", category: "文化体育类", status: "年审通过", unit: "教育与体育学院（筹）", advisor: "曹丹丹", leader: "陈婉盈 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "stadium",
      slogan: "文化体育类 · 教育与体育学院（筹）指导",
      description: "BAB啦啦操社团是教育与体育学院（筹）指导的文化体育类学生社团，指导教师曹丹丹，学生负责人陈婉盈。",
      detail: "BAB啦啦操社团为教育与体育学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为曹丹丹，学生负责人为陈婉盈。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-60", name: "户外运动协会", short: "户", category: "文化体育类", status: "年审通过", unit: "教育与体育学院（筹）", advisor: "黄正，张继娜", leader: "王钰琳 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "stadium",
      slogan: "文化体育类 · 教育与体育学院（筹）指导",
      description: "户外运动协会是教育与体育学院（筹）指导的文化体育类学生社团，指导教师黄正，张继娜，学生负责人王钰琳。",
      detail: "户外运动协会为教育与体育学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为黄正，张继娜，学生负责人为王钰琳。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-61", name: "醒狮社", short: "醒", category: "文化体育类", status: "年审通过", unit: "教育与体育学院（筹）", advisor: "张继娜", leader: "杨幸锐 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "stadium",
      slogan: "文化体育类 · 教育与体育学院（筹）指导",
      description: "醒狮社是教育与体育学院（筹）指导的文化体育类学生社团，指导教师张继娜，学生负责人杨幸锐。",
      detail: "醒狮社为教育与体育学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为张继娜，学生负责人为杨幸锐。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-62", name: "运动防护协会", short: "运", category: "文化体育类", status: "年审通过", unit: "教育与体育学院（筹）", advisor: "刘军", leader: "蓝海 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "stadium",
      slogan: "文化体育类 · 教育与体育学院（筹）指导",
      description: "运动防护协会是教育与体育学院（筹）指导的文化体育类学生社团，指导教师刘军，学生负责人蓝海。",
      detail: "运动防护协会为教育与体育学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为刘军，学生负责人为蓝海。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-63", name: "Street Life滑板社", short: "S", category: "文化体育类", status: "年审通过", unit: "教育与体育学院（筹）", advisor: "杨慧娟", leader: "马燕红 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "stadium",
      slogan: "文化体育类 · 教育与体育学院（筹）指导",
      description: "Street Life滑板社是教育与体育学院（筹）指导的文化体育类学生社团，指导教师杨慧娟，学生负责人马燕红。",
      detail: "Street Life滑板社为教育与体育学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为杨慧娟，学生负责人为马燕红。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-64", name: "排球协会", short: "排", category: "文化体育类", status: "年审通过", unit: "教育与体育学院（筹）", advisor: "廖志凡，曹兴武", leader: "王怡静 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "stadium",
      slogan: "文化体育类 · 教育与体育学院（筹）指导",
      description: "排球协会是教育与体育学院（筹）指导的文化体育类学生社团，指导教师廖志凡，曹兴武，学生负责人王怡静。",
      detail: "排球协会为教育与体育学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为廖志凡，曹兴武，学生负责人为王怡静。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-65", name: "网球社", short: "网", category: "文化体育类", status: "年审通过", unit: "教育与体育学院（筹）", advisor: "杨汇哲、曹兴武", leader: "黄维浩 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "stadium",
      slogan: "文化体育类 · 教育与体育学院（筹）指导",
      description: "网球社是教育与体育学院（筹）指导的文化体育类学生社团，指导教师杨汇哲、曹兴武，学生负责人黄维浩。",
      detail: "网球社为教育与体育学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为杨汇哲、曹兴武，学生负责人为黄维浩。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-66", name: "夏羽社", short: "夏", category: "文化体育类", status: "年审通过", unit: "教育与体育学院（筹）", advisor: "郭锡尧", leader: "冯鑫仪 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "stadium",
      slogan: "文化体育类 · 教育与体育学院（筹）指导",
      description: "夏羽社是教育与体育学院（筹）指导的文化体育类学生社团，指导教师郭锡尧，学生负责人冯鑫仪。",
      detail: "夏羽社为教育与体育学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为郭锡尧，学生负责人为冯鑫仪。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-67", name: "乒乓球协会", short: "乒", category: "文化体育类", status: "年审通过", unit: "教育与体育学院（筹）", advisor: "宋浩", leader: "林子恒 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "stadium",
      slogan: "文化体育类 · 教育与体育学院（筹）指导",
      description: "乒乓球协会是教育与体育学院（筹）指导的文化体育类学生社团，指导教师宋浩，学生负责人林子恒。",
      detail: "乒乓球协会为教育与体育学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为宋浩，学生负责人为林子恒。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-68", name: "跆拳道协会", short: "跆", category: "文化体育类", status: "年审通过", unit: "教育与体育学院（筹）", advisor: "梁四海", leader: "杨雨婷 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "stadium",
      slogan: "文化体育类 · 教育与体育学院（筹）指导",
      description: "跆拳道协会是教育与体育学院（筹）指导的文化体育类学生社团，指导教师梁四海，学生负责人杨雨婷。",
      detail: "跆拳道协会为教育与体育学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为梁四海，学生负责人为杨雨婷。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-69", name: "双黄蛋ACG文化交流协会", short: "双", category: "文化体育类", status: "年审通过", unit: "创意设计与传媒学院（筹）", advisor: "方映萍", leader: "华雨虹 · 创意设计与传媒学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 创意设计与传媒学院（筹）指导",
      description: "双黄蛋ACG文化交流协会是创意设计与传媒学院（筹）指导的文化体育类学生社团，指导教师方映萍，学生负责人华雨虹。",
      detail: "双黄蛋ACG文化交流协会为创意设计与传媒学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为方映萍，学生负责人为华雨虹。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-70", name: "C3动漫社", short: "C", category: "文化体育类", status: "年审通过", unit: "创意设计与传媒学院（筹）", advisor: "刘震寰、张智燕", leader: "陈学颖 · 创意设计与传媒学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 创意设计与传媒学院（筹）指导",
      description: "C3动漫社是创意设计与传媒学院（筹）指导的文化体育类学生社团，指导教师刘震寰、张智燕，学生负责人陈学颖。",
      detail: "C3动漫社为创意设计与传媒学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为刘震寰、张智燕，学生负责人为陈学颖。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-71", name: "美丽乡村彩绘团", short: "美", category: "文化体育类", status: "年审通过", unit: "创意设计与传媒学院（筹）", advisor: "唐香莲、于露、陈桃莉", leader: "谭吉芸 · 创意设计与传媒学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 创意设计与传媒学院（筹）指导",
      description: "美丽乡村彩绘团是创意设计与传媒学院（筹）指导的文化体育类学生社团，指导教师唐香莲、于露、陈桃莉，学生负责人谭吉芸。",
      detail: "美丽乡村彩绘团为创意设计与传媒学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为唐香莲、于露、陈桃莉，学生负责人为谭吉芸。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-72", name: "DDPA摄影协会", short: "D", category: "文化体育类", status: "年审通过", unit: "创意设计与传媒学院（筹）", advisor: "袁震宇", leader: "曾海容 · 创意设计与传媒学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 创意设计与传媒学院（筹）指导",
      description: "DDPA摄影协会是创意设计与传媒学院（筹）指导的文化体育类学生社团，指导教师袁震宇，学生负责人曾海容。",
      detail: "DDPA摄影协会为创意设计与传媒学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为袁震宇，学生负责人为曾海容。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-73", name: "国潮手作社", short: "国", category: "文化体育类", status: "年审通过", unit: "创意设计与传媒学院（筹）", advisor: "黄文萍", leader: "秦紫心 · 创意设计与传媒学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 创意设计与传媒学院（筹）指导",
      description: "国潮手作社是创意设计与传媒学院（筹）指导的文化体育类学生社团，指导教师黄文萍，学生负责人秦紫心。",
      detail: "国潮手作社为创意设计与传媒学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为黄文萍，学生负责人为秦紫心。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-74", name: "非遗文化社", short: "非", category: "文化体育类", status: "年审通过", unit: "创意设计与传媒学院（筹）", advisor: "吕珊", leader: "黎清 · 创意设计与传媒学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 创意设计与传媒学院（筹）指导",
      description: "非遗文化社是创意设计与传媒学院（筹）指导的文化体育类学生社团，指导教师吕珊，学生负责人黎清。",
      detail: "非遗文化社为创意设计与传媒学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为吕珊，学生负责人为黎清。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-75", name: "UDF未定义舞社", short: "U", category: "文化体育类", status: "年审通过", unit: "卫生健康学院", advisor: "卢俏茵", leader: "胡诗莹 · 卫生健康学院", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 卫生健康学院指导",
      description: "UDF未定义舞社是卫生健康学院指导的文化体育类学生社团，指导教师卢俏茵，学生负责人胡诗莹。",
      detail: "UDF未定义舞社为卫生健康学院指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为卢俏茵，学生负责人为胡诗莹。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-76", name: "飞羽社", short: "飞", category: "文化体育类", status: "年审通过", unit: "卫生健康学院", advisor: "姜林辉", leader: "叶家恒 · 卫生健康学院", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 卫生健康学院指导",
      description: "飞羽社是卫生健康学院指导的文化体育类学生社团，指导教师姜林辉，学生负责人叶家恒。",
      detail: "飞羽社为卫生健康学院指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为姜林辉，学生负责人为叶家恒。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-77", name: "逐风篮球社", short: "逐", category: "文化体育类", status: "年审通过", unit: "卫生健康学院", advisor: "陈娟娟", leader: "余祉乐 · 卫生健康学院", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 卫生健康学院指导",
      description: "逐风篮球社是卫生健康学院指导的文化体育类学生社团，指导教师陈娟娟，学生负责人余祉乐。",
      detail: "逐风篮球社为卫生健康学院指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为陈娟娟，学生负责人为余祉乐。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-78", name: "乒博协会", short: "乒", category: "文化体育类", status: "年审通过", unit: "卫生健康学院", advisor: "程芷琰", leader: "黄心谊 · 卫生健康学院", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 卫生健康学院指导",
      description: "乒博协会是卫生健康学院指导的文化体育类学生社团，指导教师程芷琰，学生负责人黄心谊。",
      detail: "乒博协会为卫生健康学院指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为程芷琰，学生负责人为黄心谊。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-79", name: "声形司仪队", short: "声", category: "文化体育类", status: "年审通过", unit: "卫生健康学院", advisor: "卢俏茵，郑婷", leader: "贺桢 · 卫生健康学院", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 卫生健康学院指导",
      description: "声形司仪队是卫生健康学院指导的文化体育类学生社团，指导教师卢俏茵，郑婷，学生负责人贺桢。",
      detail: "声形司仪队为卫生健康学院指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为卢俏茵，郑婷，学生负责人为贺桢。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-80", name: "聆心手语社", short: "聆", category: "文化体育类", status: "年审通过", unit: "卫生健康学院", advisor: "占小多", leader: "李随缘 · 卫生健康学院", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 卫生健康学院指导",
      description: "聆心手语社是卫生健康学院指导的文化体育类学生社团，指导教师占小多，学生负责人李随缘。",
      detail: "聆心手语社为卫生健康学院指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为占小多，学生负责人为李随缘。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-81", name: "心扉手语社", short: "心", category: "文化体育类", status: "年审通过", unit: "图书馆", advisor: "赵丹妮", leader: "冯舒然 · 图书馆", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "library",
      slogan: "文化体育类 · 图书馆指导",
      description: "心扉手语社是图书馆指导的文化体育类学生社团，指导教师赵丹妮，学生负责人冯舒然。",
      detail: "心扉手语社为图书馆指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为赵丹妮，学生负责人为冯舒然。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-82", name: "书画协会", short: "书", category: "文化体育类", status: "年审通过", unit: "图书馆", advisor: "陈韵", leader: "朱思楚 · 图书馆", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "library",
      slogan: "文化体育类 · 图书馆指导",
      description: "书画协会是图书馆指导的文化体育类学生社团，指导教师陈韵，学生负责人朱思楚。",
      detail: "书画协会为图书馆指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为陈韵，学生负责人为朱思楚。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-83", name: "融媒体协会", short: "融", category: "文化体育类", status: "年审通过", unit: "终身教育学院（筹）", advisor: "袁少锋", leader: "黄洢桐 · 终身教育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 终身教育学院（筹）指导",
      description: "融媒体协会是终身教育学院（筹）指导的文化体育类学生社团，指导教师袁少锋，学生负责人黄洢桐。",
      detail: "融媒体协会为终身教育学院（筹）指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为袁少锋，学生负责人为黄洢桐。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-84", name: "非遗手作社", short: "非", category: "文化体育类", status: "年审通过", unit: "未来技术学院(筹)", advisor: "刘梦", leader: "涂美玲 · 未来技术学院(筹)", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "teaching",
      slogan: "文化体育类 · 未来技术学院(筹)指导",
      description: "非遗手作社是未来技术学院(筹)指导的文化体育类学生社团，指导教师刘梦，学生负责人涂美玲。",
      detail: "非遗手作社为未来技术学院(筹)指导的文化体育类学生社团，2026-2027 学年年审通过。指导教师为刘梦，学生负责人为涂美玲。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-85", name: "松风古琴社", short: "松", category: "文化体育类", status: "新成立", unit: "图书馆", advisor: "钟穗珊", leader: "郭芬 · 图书馆", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "library",
      slogan: "文化体育类 · 图书馆指导",
      description: "松风古琴社是图书馆指导的文化体育类学生社团，指导教师钟穗珊，学生负责人郭芬。",
      detail: "松风古琴社为图书馆指导的文化体育类学生社团，2026-2027 学年新成立。指导教师为钟穗珊，学生负责人为郭芬。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-86", name: "东职匹克球协会", short: "东", category: "文化体育类", status: "新成立", unit: "教育与体育学院（筹）", advisor: "蔡观胜", leader: "潘俪丹 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "stadium",
      slogan: "文化体育类 · 教育与体育学院（筹）指导",
      description: "东职匹克球协会是教育与体育学院（筹）指导的文化体育类学生社团，指导教师蔡观胜，学生负责人潘俪丹。",
      detail: "东职匹克球协会为教育与体育学院（筹）指导的文化体育类学生社团，2026-2027 学年新成立。指导教师为蔡观胜，学生负责人为潘俪丹。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-87", name: "粤舞拾光", short: "粤", category: "文化体育类", status: "新成立", unit: "教育与体育学院（筹）", advisor: "周卉钰", leader: "曾彩欣 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "stadium",
      slogan: "文化体育类 · 教育与体育学院（筹）指导",
      description: "粤舞拾光是教育与体育学院（筹）指导的文化体育类学生社团，指导教师周卉钰，学生负责人曾彩欣。",
      detail: "粤舞拾光为教育与体育学院（筹）指导的文化体育类学生社团，2026-2027 学年新成立。指导教师为周卉钰，学生负责人为曾彩欣。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-88", name: "新手村次元桌游社", short: "新", category: "文化体育类", status: "新成立", unit: "教育与体育学院（筹）", advisor: "周赞", leader: "卓嘉熒 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "stadium",
      slogan: "文化体育类 · 教育与体育学院（筹）指导",
      description: "新手村次元桌游社是教育与体育学院（筹）指导的文化体育类学生社团，指导教师周赞，学生负责人卓嘉熒。",
      detail: "新手村次元桌游社为教育与体育学院（筹）指导的文化体育类学生社团，2026-2027 学年新成立。指导教师为周赞，学生负责人为卓嘉熒。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    },
    {
      id: "club-89", name: "腰旗橄榄球协会", short: "腰", category: "文化体育类", status: "新成立", unit: "教育与体育学院（筹）", advisor: "周赞", leader: "罗乔蔓 · 教育与体育学院（筹）", recruit: "注册在册", image: "assets/stadium.jpg", locationId: "stadium",
      slogan: "文化体育类 · 教育与体育学院（筹）指导",
      description: "腰旗橄榄球协会是教育与体育学院（筹）指导的文化体育类学生社团，指导教师周赞，学生负责人罗乔蔓。",
      detail: "腰旗橄榄球协会为教育与体育学院（筹）指导的文化体育类学生社团，2026-2027 学年新成立。指导教师为周赞，学生负责人为罗乔蔓。社团活动与招新安排以学校社团管理部门及社团发布的通知为准。",
      activities: []
    }
  ],

  badges: [
    { id: "first-light", name: "初次点亮", icon: "sparkles", type: "lit", target: 1 },
    { id: "checkin-three", name: "足迹收藏家", icon: "map-pin", type: "lit", target: 3 },
    { id: "explorer", name: "校园漫游者", icon: "compass", type: "lit", target: 4 },
    { id: "nova-master", name: "星图收藏家", icon: "crown", type: "lit" },
    { id: "connector", name: "搭子联络员", description: "本机组局中有 1 场已加入或已发起的活动", icon: "handshake", type: "groups", target: 1 },
    { id: "first-post", name: "校园分享者", description: "在本机论坛发布并保留 1 条话题", icon: "message-square", type: "posts", target: 1 }
  ],

  clubEvents: [
    { id: "event-1", category: "文艺娱乐", clubId: "club-52", kind: "回顾", title: "第十六届校园十大歌手大赛初赛", date: "10月25日", time: "19:00", place: "修远楼报告厅", signup: "往期资料", image: "assets/activities/singer-live.webp", desc: "校园十大歌手大赛初赛资料。" },
    { id: "event-2", category: "运动赛事", clubId: "club-57", kind: "赛况", title: "第二届“东超杯”足球赛运动防护保障纪实", date: "11月02日", time: "16:30", place: "田径场", signup: "往期资料", image: "assets/stadium.jpg", desc: "足球赛事的运动防护与志愿服务资料。" },
    { id: "event-3", category: "社团交流", clubId: "club-49", kind: "招新回顾", title: "2026 社团招新 · 松山湖主会场", date: "10月21–22日", weekday: "周三/周四", time: "11:30–13:30 / 17:30–19:00", place: "修远楼校道 · 一栋宿舍门口校道", signup: "往期资料", image: "assets/activities/recruit-1.webp", cta: { label: "查看社团目录", directory: true }, desc: "松山湖主会场往期招新资料。各社团当前报名方式见社团通知。" },
    { id: "event-6", category: "文艺娱乐", clubId: "club-61", kind: "回顾", title: "醒狮夜场 · 社团文化节现场", date: "4月16日", weekday: "周四", time: "19:30", place: "道滘校区中心广场", signup: "往期资料", image: "assets/activities/lion.webp", desc: "社团文化节醒狮表演资料。" },
    { id: "event-7", category: "技能实战", clubId: "club-39", kind: "讲座", title: "元启・AI Talk Workshop", date: "11月04日", weekday: "周三", time: "15:00–17:00", place: "教二 303", signup: "技能特长 · 已结束", image: "assets/activities/ai-talk.jpg", desc: "元启AI社在到梦空间发布的技能特长类活动，围绕 AI 工具的实际用法展开，两小时工作坊形式。" },
    { id: "event-8", category: "文艺娱乐", clubId: "club-30", kind: "放映", title: "“魅力电影，精彩故事”主题电影放映", date: "06月17日", weekday: "周三", time: "14:30–17:00", place: "崇德楼（教一）107", signup: "思想成长 · 已结束", image: "assets/activities/movie-night.jpg", desc: "东职院无人机协会在到梦空间发布的往期放映活动。" },
    { id: "event-9", category: "技能实战", clubId: "club-16", kind: "系列", title: "工业软件赋能未来工程师 · 校园系列活动", date: "06月18日", weekday: "周四", time: "08:00–12:00", place: "8B206", signup: "往期资料", image: "assets/activities/industry-software.jpg", desc: "智能制造学院团学组织连开多场，6月18日至22日覆盖 8B206 与培训楼一楼，内容围绕工业软件实操。" }
  ]
};

novaData.clubEvents.forEach(event => {
  const club = novaData.clubs.find(item => item.id === event.clubId);
  if (club) club.activities.push({ date: [event.date, event.weekday].filter(Boolean).join(" "), title: event.title, desc: `${event.time} · ${event.place}｜${event.desc}` });
});

if (typeof module === "object" && module.exports) module.exports = novaData;
if (typeof window !== "undefined") window.NovaDB = novaData;
