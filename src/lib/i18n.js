const mapping = {
    "DUMBBELL_SHOULDER_PRESS": "哑铃推肩",
    "DUMBBELL_LATERAL_RAISE": "哑铃侧平举",
    "CHEST_PRESS": "推胸",
    "FACE_PULL": "面拉",
    "BARBELL_ROW": "杠铃划船",
    "BARBELL_BACK_SQUAT": "杠铃深蹲",
    "BARBELL_BENCH_PRESS": "杠铃卧推",
    "INCLINE_BARBELL_BENCH_PRESS": "杠铃上斜卧推",
    "DUMBBELL_BENCH_PRESS": "哑铃卧推",
    "INCLINE_DUMBBELL_BENCH_PRESS": "哑铃上斜卧推",
    "CABLE_KICKBACK": "绳索三头臂屈伸",
    "CABLE_CROSSOVER": "绳索交叉",
    "LAT_PULLDOWN": "高位下拉",
    "LATERAL_RAISE": "侧平举",
}

export const translate = (key) => mapping[key] || key