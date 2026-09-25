"ui";

importClass(android.content.Intent);
importClass(android.content.Context);
importClass(android.app.Activity);
importClass(android.provider.MediaStore);
importClass(android.graphics.Paint);
importClass(android.graphics.Color);
importClass(android.graphics.RectF);
importClass(java.io.ByteArrayOutputStream);
importClass(android.view.View);
importClass(android.view.MotionEvent);
importClass(android.app.ActivityManager);
importClass(android.view.animation.DecelerateInterpolator);
importClass(android.graphics.drawable.GradientDrawable);
importClass(android.provider.Settings);
importClass(android.net.Uri);
importClass(android.content.ComponentName);
importClass(android.view.WindowManager);
importClass(android.graphics.drawable.ColorDrawable);
importClass(android.animation.LayoutTransition);

var CONFIG = {
    workDir:      "/sdcard/AutoFish",
    pollMs:       70,
    pollFastMs:   45,
    landscape:    "auto",
    waitLineMs:   25000,
    maxRecast:    3,
    floatGuard:   0.35,
    guardTickMs:  1000,
    blackFrames:  120,
    staticFrames: 110,
    nullFrames:   60,
    offGameFrames: 3
};

var THEME = {
    light: {
        bg: "#FEF7FF",
        surface: "#F3EDF7",
        floatBg: "#F3EDF7",
        primary: "#6750A4",
        onPrimary: "#FFFFFF",
        primaryContainer: "#E8DEF8",
        onPrimaryContainer: "#1D192B",
        surfaceVariant: "#E6E0E9",
        onSurfaceVariant: "#49454F",
        error: "#B3261E",
        onError: "#FFFFFF",
        warning: "#825500",
        onWarning: "#FFFFFF",
        alert: "#BA1A1A",
        onAlert: "#FFFFFF",
        solid: "#4A4458",
        onSolid: "#FFFFFF"
    },
    dark: {
        bg: "#141218",
        surface: "#2B2930",
        floatBg: "#000000",
        primary: "#D0BCFF",
        onPrimary: "#381E72",
        primaryContainer: "#4A4458",
        onPrimaryContainer: "#E8DEF8",
        surfaceVariant: "#49454F",
        onSurfaceVariant: "#CAC4D0",
        error: "#F2B8B5",
        onError: "#601410",
        warning: "#825500",
        onWarning: "#FFFFFF",
        alert: "#BA1A1A",
        onAlert: "#FFFFFF",
        solid: "#4A4458",
        onSolid: "#FFFFFF"
    }
};

var storage = storages.create("autofish");

function isDarkMode() {
    var mode = storage.get("uiTheme", "system");
    if (mode === "dark") return true;
    if (mode === "light") return false;
    var uiMode = context.getResources().getConfiguration().uiMode;
    return (uiMode & android.content.res.Configuration.UI_MODE_NIGHT_MASK) == android.content.res.Configuration.UI_MODE_NIGHT_YES;
}

var initIsDark = isDarkMode();
var initBg = initIsDark ? THEME.dark.bg : THEME.light.bg;

ui.statusBarColor(initBg);
activity.getWindow().setBackgroundDrawable(new ColorDrawable(Color.parseColor(initBg)));
activity.getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_NOTHING);

ui.layout(
    <frame id="rootFrame" w="*" h="*">

        <viewpager id="viewPager" w="*" h="*">
            <scroll w="*" h="*">
                <vertical id="mainPage" padding="24 24 24 100" w="*" h="wrap_content" clickable="true">
                    <text id="txtMainTitle" text="自动钓鱼" textSize="30sp" textStyle="bold" gravity="center" marginTop="16" />
                    <text id="txtMainSub" text="红线秒提 · 自定义延迟 · 智能防封" textSize="14sp" gravity="center" marginTop="8" marginBottom="32" />

                    <card id="cardFish" w="*" h="64dp" margin="8" cardCornerRadius="20dp" cardElevation="0dp" foreground="?selectableItemBackground">
                        <text id="btnPickFish" text="① 选定钓鱼键" textSize="18sp" textStyle="bold" gravity="center" w="*" h="*" />
                    </card>

                    <card id="cardMag" w="*" h="64dp" margin="8" cardCornerRadius="20dp" cardElevation="0dp" foreground="?selectableItemBackground">
                        <text id="btnPickMag" text="② 选定放大键" textSize="18sp" textStyle="bold" gravity="center" w="*" h="*" />
                    </card>

                    <card id="cardLine" w="*" h="64dp" margin="8" cardCornerRadius="20dp" cardElevation="0dp" foreground="?selectableItemBackground">
                        <text id="btnPickLine" text="③ 框选红线区域" textSize="18sp" textStyle="bold" gravity="center" w="*" h="*" />
                    </card>

                    <card id="cardStart" w="*" h="72dp" margin="8 32 8 8" cardCornerRadius="24dp" cardElevation="2dp" foreground="?selectableItemBackground">
                        <text id="btnStart" text="④ 开启悬浮窗" textSize="22sp" textStyle="bold" gravity="center" w="*" h="*" />
                    </card>

                    <text id="txtStatus" text="正在检查状态..." textSize="14sp" textStyle="bold" gravity="center" margin="16" />
                </vertical>
            </scroll>

            <scroll w="*" h="*">
                <vertical id="pageSettings" padding="24 24 24 100" w="*" h="wrap_content" clickable="true">
                    <text id="txtSettingsTitle" text="设置" textSize="30sp" textStyle="bold" marginTop="16" marginBottom="24" />

                    <card id="cardSens" w="*" h="wrap_content" margin="8 0 8 8" cardCornerRadius="16dp" cardElevation="0dp">
                        <vertical padding="16 20">
                            <text id="txtSensTitle" text="识别灵敏度" textSize="18sp" textStyle="bold" />
                            <text id="txtSensSub" text="深色海/暗红线选「高」，误触多则选「低」" textSize="12sp" marginTop="0" marginBottom="12" />

                            <card cardCornerRadius="16dp" cardElevation="0dp" cardBackgroundColor="#00000000">
                                <horizontal w="*" h="40dp">
                                    <card id="btnSensLow" layout_weight="1" h="*" cardCornerRadius="16dp" cardElevation="0dp" margin="0 0 4 0" foreground="?selectableItemBackground">
                                        <text id="txtSensLow" text="低" gravity="center" w="*" h="*" />
                                    </card>
                                    <card id="btnSensMid" layout_weight="1" h="*" cardCornerRadius="16dp" cardElevation="0dp" margin="4 0 4 0" foreground="?selectableItemBackground">
                                        <text id="txtSensMid" text="中" gravity="center" w="*" h="*" />
                                    </card>
                                    <card id="btnSensHigh" layout_weight="1" h="*" cardCornerRadius="16dp" cardElevation="0dp" margin="4 0 0 0" foreground="?selectableItemBackground">
                                        <text id="txtSensHigh" text="高" gravity="center" w="*" h="*" />
                                    </card>
                                </horizontal>
                            </card>
                        </vertical>
                    </card>

                    <card id="cardDelay" w="*" h="wrap_content" margin="8 0 8 8" cardCornerRadius="16dp" cardElevation="0dp">
                        <vertical padding="16 20">
                            <text id="txtDelayTitle" text="收杆后抛竿延迟" textSize="18sp" textStyle="bold" />
                            <text id="txtDelaySub" text="提竿后等待动画播放完毕再抛竿的时间 (毫秒)" textSize="12sp" marginTop="0" marginBottom="12" />
                            <card id="cardDelayInput" w="*" h="wrap_content" cardCornerRadius="12dp" cardElevation="0dp">
                                <input id="inputDelay" inputType="number" textSize="16sp" bg="#00000000" padding="16 12" />
                            </card>
                        </vertical>
                    </card>

                    <card id="cardThemeSet" w="*" h="wrap_content" margin="8 16 8 8" cardCornerRadius="16dp" cardElevation="0dp">
                        <vertical padding="16 20">
                            <text id="txtThemeTitle" text="主题配色" textSize="18sp" textStyle="bold" />
                            <text id="txtThemeSub" text="浅色 / 深色 / 跟随系统" textSize="12sp" marginTop="0" marginBottom="12" />

                            <card cardCornerRadius="16dp" cardElevation="0dp" cardBackgroundColor="#00000000">
                                <horizontal w="*" h="40dp">
                                    <card id="btnThemeLight" layout_weight="1" h="*" cardCornerRadius="16dp" cardElevation="0dp" margin="0 0 4 0" foreground="?selectableItemBackground">
                                        <text id="txtThemeLight" text="浅色" gravity="center" w="*" h="*" />
                                    </card>
                                    <card id="btnThemeDark" layout_weight="1" h="*" cardCornerRadius="16dp" cardElevation="0dp" margin="4 0 4 0" foreground="?selectableItemBackground">
                                        <text id="txtThemeDark" text="深色" gravity="center" w="*" h="*" />
                                    </card>
                                    <card id="btnThemeSystem" layout_weight="1" h="*" cardCornerRadius="16dp" cardElevation="0dp" margin="4 0 0 0" foreground="?selectableItemBackground">
                                        <text id="txtThemeSystem" text="跟随系统" gravity="center" w="*" h="*" />
                                    </card>
                                </horizontal>
                            </card>
                        </vertical>
                    </card>

                    <card id="cardHideTask" w="*" h="wrap_content" margin="8 16 8 8" cardCornerRadius="16dp" cardElevation="0dp">
                        <horizontal padding="16 20" gravity="center_vertical" w="*" h="wrap_content">
                            <vertical layout_weight="1">
                                <text id="txtHideTaskTitle" text="隐藏后台任务" textSize="18sp" textStyle="bold" />
                                <text id="txtHideTaskSub" text="开启后在最近任务列表中不显示本应用" textSize="12sp" marginTop="0" />
                            </vertical>

                            <frame id="customSwitch" w="52dp" h="32dp" clickable="true">
                                <card id="switchTrack" w="52dp" h="32dp" cardCornerRadius="16dp" cardElevation="0dp" />
                                <card id="switchThumb" w="24dp" h="24dp" cardCornerRadius="12dp" cardElevation="0dp" layout_gravity="center_vertical|left" marginLeft="4" />
                            </frame>
                        </horizontal>
                    </card>

                    <card id="cardBatteryOpt" w="*" h="wrap_content" margin="8 16 8 8" cardCornerRadius="16dp" cardElevation="0dp">
                        <horizontal padding="16 20" gravity="center_vertical" w="*" h="wrap_content">
                            <vertical layout_weight="1">
                                <text id="txtBatteryTitle" text="关闭电池优化" textSize="18sp" textStyle="bold" />
                                <text id="txtBatterySub" text="防止挂机时被系统杀后台" textSize="12sp" marginTop="0" />
                            </vertical>
                            <card id="btnBatteryGo" w="64dp" h="32dp" marginLeft="8" cardCornerRadius="16dp" cardElevation="0dp" foreground="?selectableItemBackground">
                                <text id="txtBatteryGo" text="去设置" textSize="13sp" textStyle="bold" gravity="center" w="*" h="*" />
                            </card>
                        </horizontal>
                    </card>

                    <card id="cardAutoStart" w="*" h="wrap_content" margin="8 16 8 8" cardCornerRadius="16dp" cardElevation="0dp">
                        <horizontal padding="16 20" gravity="center_vertical" w="*" h="wrap_content">
                            <vertical layout_weight="1">
                                <text id="txtAutoStartTitle" text="允许自启动" textSize="18sp" textStyle="bold" />
                                <text id="txtAutoStartSub" text="确保无障碍服务稳定运行" textSize="12sp" marginTop="0" />
                            </vertical>
                            <card id="btnAutoStartGo" w="64dp" h="32dp" marginLeft="8" cardCornerRadius="16dp" cardElevation="0dp" foreground="?selectableItemBackground">
                                <text id="txtAutoStartGo" text="去设置" textSize="13sp" textStyle="bold" gravity="center" w="*" h="*" />
                            </card>
                        </horizontal>
                    </card>

                    <card id="cardLog" w="*" h="wrap_content" margin="8 16 8 8" cardCornerRadius="16dp" cardElevation="0dp">
                        <horizontal padding="16 20" gravity="center_vertical" w="*" h="wrap_content">
                            <vertical layout_weight="1">
                                <text id="txtLogTitle" text="识别诊断" textSize="18sp" textStyle="bold" />
                                <text id="txtLogSub" text="悬浮窗实时显示红线判定值，并写入 detect_log.txt" textSize="12sp" marginTop="0" />
                            </vertical>

                            <frame id="logSwitch" w="52dp" h="32dp" clickable="true">
                                <card id="logSwitchTrack" w="52dp" h="32dp" cardCornerRadius="16dp" cardElevation="0dp" />
                                <card id="logSwitchThumb" w="24dp" h="24dp" cardCornerRadius="12dp" cardElevation="0dp" layout_gravity="center_vertical|left" marginLeft="4" />
                            </frame>
                        </horizontal>
                    </card>

                </vertical>
            </scroll>
        </viewpager>

        <card id="bottomNav" w="wrap_content" h="64dp" cardElevation="6dp" cardCornerRadius="32dp" layout_gravity="bottom|center_horizontal" marginBottom="24">
            <frame w="wrap_content" h="wrap_content" layout_gravity="center" padding="8 0">
                <frame id="navIndicator" w="100dp" h="48dp" layout_gravity="center_vertical|left" />

                <horizontal w="wrap_content" h="wrap_content" gravity="center">
                    <frame id="tabHomeWrap" w="100dp" h="48dp">
                        <text id="txtTabHome" text="主页" textSize="16sp" textStyle="bold" gravity="center" w="*" h="*" />
                    </frame>
                    <frame id="tabSettingsWrap" w="100dp" h="48dp" marginLeft="4">
                        <text id="txtTabSettings" text="设置" textSize="16sp" textStyle="normal" gravity="center" w="*" h="*" />
                    </frame>
                </horizontal>
            </frame>
        </card>

        <vertical id="cropPage" bg="#111111" w="*" h="*">
            <horizontal padding="8" gravity="center_vertical" bg="#1F1F1F" h="64dp">
                <card id="btnCancel" w="72dp" h="44dp" cardCornerRadius="12dp" cardBackgroundColor="#49454F" foreground="?selectableItemBackground" margin="8 0">
                    <text text="取消" textColor="#E6E0E9" textSize="16sp" textStyle="bold" gravity="center" w="*" h="*" />
                </card>
                <text id="cropTitle" text="请框选区域" textColor="#E6E0E9" textSize="18sp" textStyle="bold" gravity="center" layout_weight="1" w="0" />
                <card id="btnDone" w="72dp" h="44dp" cardCornerRadius="12dp" cardBackgroundColor="#6750A4" foreground="?selectableItemBackground" margin="8 0">
                    <text text="完成" textColor="#FFFFFF" textSize="16sp" textStyle="bold" gravity="center" w="*" h="*" />
                </card>
            </horizontal>
            <canvas id="cv" w="*" layout_weight="1" h="0" />
            <text text="拖动中心移动 · 拖动四角缩放" textColor="#CAC4D0" textSize="14sp" gravity="center" h="48dp" w="*" />
        </vertical>

    </frame>
);

var density = context.getResources().getDisplayMetrics().density;
var moveDistPx = 104 * density;
var switchMovePx = 20 * density;
var serviceAlive = false;
var isListening = false;
var screenCaptureReady = false;

function updateThemeUI() {
    var isDark = isDarkMode();
    var c = isDark ? THEME.dark : THEME.light;

    ui.run(function() {
        try {
            var window = activity.getWindow();
            window.setStatusBarColor(Color.parseColor(c.bg));
            window.setBackgroundDrawable(new ColorDrawable(Color.parseColor(c.bg)));
            var decor = window.getDecorView();
            if (isDark) {
                decor.setSystemUiVisibility(decor.getSystemUiVisibility() & ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
            } else {
                decor.setSystemUiVisibility(decor.getSystemUiVisibility() | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
            }
        } catch(e) {}

        ui.rootFrame.setBackgroundColor(Color.parseColor(c.bg));

        ui.txtMainTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtMainSub.setTextColor(Color.parseColor(c.onSurfaceVariant));
        ui.txtSettingsTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));

        ui.cardHideTask.setCardBackgroundColor(Color.parseColor(c.surface));
        ui.txtHideTaskTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtHideTaskSub.setTextColor(Color.parseColor(c.onSurfaceVariant));

        ui.cardDelay.setCardBackgroundColor(Color.parseColor(c.surface));
        ui.txtDelayTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtDelaySub.setTextColor(Color.parseColor(c.onSurfaceVariant));
        ui.cardDelayInput.setCardBackgroundColor(Color.parseColor(c.primaryContainer));
        ui.inputDelay.setTextColor(Color.parseColor(c.onPrimaryContainer));

        ui.cardThemeSet.setCardBackgroundColor(Color.parseColor(c.surface));
        ui.txtThemeTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtThemeSub.setTextColor(Color.parseColor(c.onSurfaceVariant));

        ui.cardBatteryOpt.setCardBackgroundColor(Color.parseColor(c.surface));
        ui.txtBatteryTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtBatterySub.setTextColor(Color.parseColor(c.onSurfaceVariant));
        ui.btnBatteryGo.setCardBackgroundColor(Color.parseColor(c.primaryContainer));
        ui.txtBatteryGo.setTextColor(Color.parseColor(c.onPrimaryContainer));

        ui.cardAutoStart.setCardBackgroundColor(Color.parseColor(c.surface));
        ui.txtAutoStartTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtAutoStartSub.setTextColor(Color.parseColor(c.onSurfaceVariant));
        ui.btnAutoStartGo.setCardBackgroundColor(Color.parseColor(c.primaryContainer));
        ui.txtAutoStartGo.setTextColor(Color.parseColor(c.onPrimaryContainer));

        ui.cardSens.setCardBackgroundColor(Color.parseColor(c.surface));
        ui.txtSensTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtSensSub.setTextColor(Color.parseColor(c.onSurfaceVariant));

        ui.cardLog.setCardBackgroundColor(Color.parseColor(c.surface));
        ui.txtLogTitle.setTextColor(Color.parseColor(c.onPrimaryContainer));
        ui.txtLogSub.setTextColor(Color.parseColor(c.onSurfaceVariant));

        ui.bottomNav.setCardBackgroundColor(Color.parseColor(c.surface));

        var indicatorBg = new GradientDrawable();
        indicatorBg.setShape(GradientDrawable.RECTANGLE);
        indicatorBg.setCornerRadius(24 * density);
        indicatorBg.setColor(Color.parseColor(c.primaryContainer));
        ui.navIndicator.setBackground(indicatorBg);

        var idx = ui.viewPager.getCurrentItem();
        if (idx == 0) {
            ui.txtTabHome.setTextColor(Color.parseColor(c.onPrimaryContainer));
            ui.txtTabSettings.setTextColor(Color.parseColor(c.onSurfaceVariant));
        } else {
            ui.txtTabHome.setTextColor(Color.parseColor(c.onSurfaceVariant));
            ui.txtTabSettings.setTextColor(Color.parseColor(c.onPrimaryContainer));
        }

        refreshMainUI();
        updateSwitchUI(storage.get("hideTask", false), false);
        updateLogSwitchUI(storage.get("debugLog", false), false);
        updateThemeSelectorUI();
        updateSensSelectorUI();
    });
}

function applySegment(btns, txts, states, value) {
    var c = isDarkMode() ? THEME.dark : THEME.light;
    ui.run(function() {
        for (var i = 0; i < states.length; i++) {
            if (states[i] === value) {
                btns[i].setCardBackgroundColor(Color.parseColor(c.primaryContainer));
                txts[i].setTextColor(Color.parseColor(c.onPrimaryContainer));
                txts[i].setTypeface(null, android.graphics.Typeface.BOLD);
            } else {
                btns[i].setCardBackgroundColor(Color.parseColor(c.bg));
                txts[i].setTextColor(Color.parseColor(c.onSurfaceVariant));
                txts[i].setTypeface(null, android.graphics.Typeface.NORMAL);
            }
        }
    });
}

function updateThemeSelectorUI() {
    applySegment([ui.btnThemeLight, ui.btnThemeDark, ui.btnThemeSystem],
                 [ui.txtThemeLight, ui.txtThemeDark, ui.txtThemeSystem],
                 ["light", "dark", "system"], storage.get("uiTheme", "system"));
}

function updateSensSelectorUI() {
    applySegment([ui.btnSensLow, ui.btnSensMid, ui.btnSensHigh],
                 [ui.txtSensLow, ui.txtSensMid, ui.txtSensHigh],
                 ["low", "mid", "high"], storage.get("sensLevel", "mid"));
}

function applySwitch(thumb, track, isOn, animate) {
    var isDark = isDarkMode();
    var c = isDark ? THEME.dark : THEME.light;

    var targetX = isOn ? switchMovePx : 0;
    var trackColor = isOn ? c.primary : c.surfaceVariant;
    var thumbColor = isOn ? c.onPrimary : c.onSurfaceVariant;

    ui.run(function(){
        if (animate) {
            thumb.animate().translationX(targetX).setDuration(200).setInterpolator(new DecelerateInterpolator()).start();
        } else {
            thumb.setTranslationX(targetX);
        }
        track.setCardBackgroundColor(Color.parseColor(trackColor));
        thumb.setCardBackgroundColor(Color.parseColor(thumbColor));
    });
}

function updateSwitchUI(isOn, animate) {
    applySwitch(ui.switchThumb, ui.switchTrack, isOn, animate);
}

function updateLogSwitchUI(isOn, animate) {
    applySwitch(ui.logSwitchThumb, ui.logSwitchTrack, isOn, animate);
}

var logFlushHook = null;
var targetPkg = null;

function detectTargetPkg() {
    try {
        var pkg = currentPackage();
        if (!pkg) return null;
        if (pkg === context.getPackageName()) return null;
        if (pkg.indexOf("autojs") >= 0 || pkg.indexOf("autox") >= 0) return null;
        return pkg;
    } catch (e) { return null; }
}

function isDebugOn() {
    try { return storage.get("debugLog", false) === true; } catch (e) { return false; }
}

ui.run(function(){
    try { if (activity.getActionBar()) activity.getActionBar().hide(); } catch(e) {}
    try { if (activity.getSupportActionBar && activity.getSupportActionBar()) activity.getSupportActionBar().hide(); } catch(e) {}
    try {
        var tbId = context.getResources().getIdentifier("toolbar", "id", context.getPackageName());
        if (tbId != 0) {
            var tb = activity.findViewById(tbId);
            if (tb) tb.setVisibility(View.GONE);
        }
        var abId = context.getResources().getIdentifier("appbar", "id", context.getPackageName());
        if (abId != 0) {
            var ab = activity.findViewById(abId);
            if (ab) ab.setVisibility(View.GONE);
        }
        var actionId = context.getResources().getIdentifier("action_bar", "id", context.getPackageName());
        if (actionId != 0) {
            var ac = activity.findViewById(actionId);
            if (ac) ac.setVisibility(View.GONE);
        }
    } catch(e) {}

    ui.cropPage.setVisibility(View.GONE);

    var delaySaved = storage.get("fishDelay", 10000);
    ui.inputDelay.setText(String(delaySaved));

    var hideSaved = storage.get("hideTask", false);
    try {
        var am = context.getSystemService(Context.ACTIVITY_SERVICE);
        var tasks = am.getAppTasks();
        if (tasks != null && tasks.size() > 0) {
            tasks.get(0).setExcludeFromRecents(hideSaved);
        }
    } catch(e) {}

    updateThemeUI();
});

ui.emitter.on("resume", function() {
    updateThemeUI();
});

ui.pageSettings.setOnTouchListener(function(view, event) {
    if (event.getAction() == MotionEvent.ACTION_DOWN) {
        if (ui.inputDelay.isFocused()) {
            ui.inputDelay.clearFocus();
            try {
                var imm = context.getSystemService(Context.INPUT_METHOD_SERVICE);
                imm.hideSoftInputFromWindow(ui.inputDelay.getWindowToken(), 0);
            } catch(e) {}
        }
    }
    return false;
});

ui.mainPage.setOnTouchListener(function(view, event) {
    if (event.getAction() == MotionEvent.ACTION_DOWN) {
        if (ui.inputDelay.isFocused()) {
            ui.inputDelay.clearFocus();
            try {
                var imm = context.getSystemService(Context.INPUT_METHOD_SERVICE);
                imm.hideSoftInputFromWindow(ui.inputDelay.getWindowToken(), 0);
            } catch(e) {}
        }
    }
    return false;
});

ui.btnThemeLight.click(function() { storage.put("uiTheme", "light"); updateThemeUI(); });
ui.btnThemeDark.click(function() { storage.put("uiTheme", "dark"); updateThemeUI(); });
ui.btnThemeSystem.click(function() { storage.put("uiTheme", "system"); updateThemeUI(); });

ui.customSwitch.click(function() {
    var current = storage.get("hideTask", false);
    var nextState = !current;
    storage.put("hideTask", nextState);
    updateSwitchUI(nextState, true);

    try {
        var am = context.getSystemService(Context.ACTIVITY_SERVICE);
        var tasks = am.getAppTasks();
        if (tasks != null && tasks.size() > 0) {
            tasks.get(0).setExcludeFromRecents(nextState);
        }
    } catch(e) {}
});

ui.logSwitch.click(function() {
    var next = !storage.get("debugLog", false);
    storage.put("debugLog", next);
    updateLogSwitchUI(next, true);
    if (!next && logFlushHook) { try { logFlushHook(); } catch (e) {} }
    if (next) toast("已开启识别诊断：悬浮窗将显示红线判定值");
});

function setSensLevel(level) {
    storage.put("sensLevel", level);
    detectOpts = getDetectOpts(level);
    updateSensSelectorUI();
    refreshMainUI();
}

ui.btnSensLow.click(function() { setSensLevel("low"); });
ui.btnSensMid.click(function() { setSensLevel("mid"); });
ui.btnSensHigh.click(function() { setSensLevel("high"); });

ui.btnBatteryGo.click(function() {
    try {
        var intent = new Intent();
        intent.setAction(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
        intent.setData(Uri.parse("package:" + context.getPackageName()));
        context.startActivity(intent);
    } catch(e) {
        try {
            app.startActivity({action: "android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS"});
        } catch(e2) {
            toast("自动跳转失败，请手动前往系统设置修改");
        }
    }
});

ui.btnAutoStartGo.click(function() {
    var intent = new Intent();
    var success = false;
    var pkg = context.getPackageName();
    var componentList = [
        new ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"),
        new ComponentName("com.coloros.safecenter", "com.coloros.safecenter.startupapp.StartupAppListActivity"),
        new ComponentName("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"),
        new ComponentName("com.oppo.safe", "com.oppo.safe.permission.startup.StartupAppListActivity"),
        new ComponentName("com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity"),
        new ComponentName("com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"),
        new ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"),
        new ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.optimize.process.ProtectActivity")
    ];
    for (var i = 0; i < componentList.length; i++) {
        try {
            intent.setComponent(componentList[i]);
            context.startActivity(intent);
            success = true;
            break;
        } catch(e) {}
    }
    if (!success) {
        try {
            app.startActivity({
                action: "android.settings.APPLICATION_DETAILS_SETTINGS",
                data: "package:" + pkg
            });
            toast("未匹配到系统捷径，请在此处手动寻找【自启动】并开启");
        } catch(e) {
            toast("自动跳转失败，请手动前往设置");
        }
    }
});

ui.inputDelay.addTextChangedListener({
    afterTextChanged: function(s) {
        try {
            var val = parseInt(s.toString());
            if (!isNaN(val) && val >= 0) {
                storage.put("fishDelay", val);
            }
        } catch(e) {}
    }
});

ui.tabHomeWrap.click(function() {
    ui.run(function(){
        ui.inputDelay.clearFocus();
        try {
            var imm = context.getSystemService(Context.INPUT_METHOD_SERVICE);
            imm.hideSoftInputFromWindow(ui.inputDelay.getWindowToken(), 0);
        } catch(e) {}
    });
    ui.viewPager.setCurrentItem(0, true);
});

ui.tabSettingsWrap.click(function() {
    ui.viewPager.setCurrentItem(1, true);
});

ui.viewPager.setOnPageChangeListener({
    onPageSelected: function(index) {
        ui.run(function(){
            ui.inputDelay.clearFocus();
            try {
                var imm = context.getSystemService(Context.INPUT_METHOD_SERVICE);
                imm.hideSoftInputFromWindow(ui.inputDelay.getWindowToken(), 0);
            } catch(e) {}
        });

        var targetX = (index == 0) ? 0 : moveDistPx;
        var isDark = isDarkMode();
        var c = isDark ? THEME.dark : THEME.light;

        ui.run(function() {
            ui.navIndicator.animate()
                .translationX(targetX)
                .setDuration(300)
                .setInterpolator(new DecelerateInterpolator(1.5))
                .start();

            if (index == 0) {
                ui.txtTabHome.setTextColor(Color.parseColor(c.onPrimaryContainer));
                ui.txtTabHome.setTypeface(null, android.graphics.Typeface.BOLD);
                ui.txtTabSettings.setTextColor(Color.parseColor(c.onSurfaceVariant));
                ui.txtTabSettings.setTypeface(null, android.graphics.Typeface.NORMAL);
            } else {
                ui.txtTabHome.setTextColor(Color.parseColor(c.onSurfaceVariant));
                ui.txtTabHome.setTypeface(null, android.graphics.Typeface.NORMAL);
                ui.txtTabSettings.setTextColor(Color.parseColor(c.onPrimaryContainer));
                ui.txtTabSettings.setTypeface(null, android.graphics.Typeface.BOLD);
            }
        });
    }
});

function refreshMainUI() {
    var fx = storage.get("fishX"), mx = storage.get("magX"), region = storage.get("lineRegion");
    var missing = [];
    if (fx == null) missing.push("① 钓鱼键未选定");
    if (mx == null) missing.push("② 放大键未选定");
    if (region == null) missing.push("③ 红线区域未选定");

    var isDark = isDarkMode();
    var c = isDark ? THEME.dark : THEME.light;

    ui.run(function () {
        ui.cardFish.setCardBackgroundColor(Color.parseColor(fx != null ? c.primaryContainer : c.surface));
        ui.btnPickFish.setText(fx != null ? "① 已选定钓鱼键" : "① 选定钓鱼键");
        ui.btnPickFish.setTextColor(Color.parseColor(fx != null ? c.onPrimaryContainer : c.onSurfaceVariant));

        ui.cardMag.setCardBackgroundColor(Color.parseColor(mx != null ? c.primaryContainer : c.surface));
        ui.btnPickMag.setText(mx != null ? "② 已选定放大键" : "② 选定放大键");
        ui.btnPickMag.setTextColor(Color.parseColor(mx != null ? c.onPrimaryContainer : c.onSurfaceVariant));

        ui.cardLine.setCardBackgroundColor(Color.parseColor(region != null ? c.primaryContainer : c.surface));
        ui.btnPickLine.setText(region != null ? "③ 已框选红线" : "③ 框选红线区域");
        ui.btnPickLine.setTextColor(Color.parseColor(region != null ? c.onPrimaryContainer : c.onSurfaceVariant));

        if (missing.length > 0) {
            ui.cardStart.setCardBackgroundColor(Color.parseColor(c.error));
            ui.txtStatus.setText("【尚有未完成步骤】\n" + missing.join(" , "));
            ui.txtStatus.setTextColor(Color.parseColor(c.error));
            ui.btnStart.setTextColor(Color.parseColor(c.onError));
        } else {
            ui.cardStart.setCardBackgroundColor(Color.parseColor(c.primary));
            ui.txtStatus.setText("准备就绪 · 识别引擎 v2 · 灵敏度：" + sensName(storage.get("sensLevel", "mid")));
            ui.txtStatus.setTextColor(Color.parseColor(c.primary));
            ui.btnStart.setTextColor(Color.parseColor(c.onPrimary));
        }
    });
}

ui.cardFish.click(function () { openSelectKey("fishX", "fishY", "fishSrc", "请框选【钓鱼按键】"); });
ui.cardMag.click(function () { openSelectKey("magX", "magY", "magSrc", "请框选【放大按键】"); });
ui.cardLine.click(function () { openSelectRegion(); });
ui.cardStart.click(function () {
    threads.start(startSystem);
});

function openSelectKey(storeX, storeY, srcKey, title) {
    toast("请从相册选择截图，随后完成框选");
    pickImage(function (imgPath) {
        if (!imgPath) return;
        var srcImg = loadCropImage(imgPath);
        if (srcImg == null) return;
        warnImageMismatch(srcImg);
        storage.put(srcKey, JSON.stringify([srcImg.getWidth(), srcImg.getHeight()]));

        launchCropPage(srcImg, title, function (rect) {
            var cx = Math.round(rect.x + rect.w / 2), cy = Math.round(rect.y + rect.h / 2);
            storage.put(storeX, cx); storage.put(storeY, cy);
            toast("坐标已保存"); refreshMainUI();
        });
    });
}

function openSelectRegion() {
    toast("请选择已放大的红线截图，紧贴框选红线");
    pickImage(function (imgPath) {
        if (!imgPath) return;
        var srcImg = loadCropImage(imgPath);
        if (srcImg == null) return;
        warnImageMismatch(srcImg);
        storage.put("lineRegionSrc", JSON.stringify([srcImg.getWidth(), srcImg.getHeight()]));

        launchCropPage(srcImg, "紧贴框选下沉【红线】", function (rect) {
            var region = [Math.round(rect.x), Math.round(rect.y), Math.round(rect.w), Math.round(rect.h)];
            storage.put("lineRegion", JSON.stringify(region));
            toast("红线区域已保存"); refreshMainUI();
        });
    });
}

var cropState = { srcImg: null, rect: { x:0, y:0, w:0, h:0 }, drag: null, onDone: null, handleSize: 30 };

function launchCropPage(img, title, onDone) {
    ui.run(function () {
        cropState.srcImg = img;
        cropState.rect = { x: img.getWidth() * 0.3, y: img.getHeight() * 0.3, w: img.getWidth() * 0.4, h: img.getHeight() * 0.4 };
        cropState.onDone = onDone; ui.cropTitle.setText(title);

        ui.viewPager.setVisibility(View.GONE);
        ui.bottomNav.setVisibility(View.GONE);
        ui.cropPage.setVisibility(View.VISIBLE);
        ui.cv.invalidate();
    });
}

function closeCropPage() {
    ui.run(function () {
        if (cropState.srcImg) cropState.srcImg.recycle();
        cropState.srcImg = null;
        if (lastTempFile) { try { files.remove(lastTempFile); } catch (e) {} lastTempFile = null; }

        ui.cropPage.setVisibility(View.GONE);
        ui.viewPager.setVisibility(View.VISIBLE);
        ui.bottomNav.setVisibility(View.VISIBLE);
    });
}

ui.btnCancel.click(function () { closeCropPage(); });
ui.btnDone.click(function () {
    var resultRect = { x: cropState.rect.x, y: cropState.rect.y, w: cropState.rect.w, h: cropState.rect.h };
    var callback = cropState.onDone; closeCropPage(); if (callback) callback(resultRect);
});

ui.cv.on("draw", function (canvas) {
    try {
        if (!cropState.srcImg) return;
        var bmp = cropState.srcImg.getBitmap(); if (!bmp) return;
        var vw = canvas.getWidth(), vh = canvas.getHeight(); if (vw <= 0 || vh <= 0) return;
        var iw = bmp.getWidth(), ih = bmp.getHeight();
        var scale = Math.min(vw / iw, vh / ih);
        var ox = (vw - iw * scale) / 2, oy = (vh - ih * scale) / 2;

        canvas.drawColor(Color.parseColor("#1F1F1F"));
        var p = new Paint(); p.setFilterBitmap(true);
        canvas.drawBitmap(bmp, null, new RectF(ox, oy, ox + iw * scale, oy + ih * scale), p);

        var aX = ox + cropState.rect.x * scale, aY = oy + cropState.rect.y * scale;
        var bX = ox + (cropState.rect.x + cropState.rect.w) * scale, bY = oy + (cropState.rect.y + cropState.rect.h) * scale;

        var dim = new Paint(); dim.setColor(Color.parseColor("#C8000000"));
        canvas.drawRect(new RectF(0, 0, vw, aY), dim); canvas.drawRect(new RectF(0, bY, vw, vh), dim);
        canvas.drawRect(new RectF(0, aY, aX, bY), dim); canvas.drawRect(new RectF(bX, aY, vw, bY), dim);

        var border = new Paint(); border.setStyle(Paint.Style.STROKE); border.setStrokeWidth(6); border.setColor(Color.parseColor("#D0BCFF"));
        canvas.drawRect(new RectF(aX, aY, bX, bY), border);

        var fill = new Paint(); fill.setColor(Color.parseColor("#D0BCFF")); var hs = cropState.handleSize / 2;
        canvas.drawRect(new RectF(aX - hs, aY - hs, aX + hs, aY + hs), fill);
        canvas.drawRect(new RectF(bX - hs, aY - hs, bX + hs, aY + hs), fill);
        canvas.drawRect(new RectF(aX - hs, bY - hs, aX + hs, bY + hs), fill);
        canvas.drawRect(new RectF(bX - hs, bY - hs, bX + hs, bY + hs), fill);
    } catch (e) {}
});

function clamp(v, lo, hi) { return Math.max(lo, Math.min(v, hi)); }
function near(x, y, cx, cy, tol) { return Math.abs(x - cx) <= tol && Math.abs(y - cy) <= tol; }

ui.cv.setOnTouchListener(function(view, event) {
    try {
        if (!cropState.srcImg) return true;
        var vw = view.getWidth(), vh = view.getHeight(); if (vw <= 0 || vh <= 0) return true;
        var iw = cropState.srcImg.getWidth(), ih = cropState.srcImg.getHeight();
        var scale = Math.min(vw / iw, vh / ih);
        var ox = (vw - iw * scale) / 2, oy = (vh - ih * scale) / 2;
        var px = (event.getX() - ox) / scale, py = (event.getY() - oy) / scale, action = event.getAction();
        var r = cropState.rect, tol = cropState.handleSize / scale, snap = { x: r.x, y: r.y, w: r.w, h: r.h };

        if (action == MotionEvent.ACTION_DOWN) {
            if (near(px, py, r.x, r.y, tol)) cropState.drag = { mode: "tl", sx: px, sy: py, r: snap };
            else if (near(px, py, r.x + r.w, r.y, tol)) cropState.drag = { mode: "tr", sx: px, sy: py, r: snap };
            else if (near(px, py, r.x, r.y + r.h, tol)) cropState.drag = { mode: "bl", sx: px, sy: py, r: snap };
            else if (near(px, py, r.x + r.w, r.y + r.h, tol)) cropState.drag = { mode: "br", sx: px, sy: py, r: snap };
            else if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) cropState.drag = { mode: "move", sx: px, sy: py, r: snap };
            else cropState.drag = null;
        } else if (action == MotionEvent.ACTION_MOVE && cropState.drag) {
            var dx = px - cropState.drag.sx, dy = py - cropState.drag.sy, d = cropState.drag, minW = 20, minH = 20;
            if (d.mode === "move") { r.x = clamp(d.r.x + dx, 0, iw - r.w); r.y = clamp(d.r.y + dy, 0, ih - r.h); }
            else if (d.mode === "tl") { var nL = clamp(px, 0, d.r.x + d.r.w - minW), nT = clamp(py, 0, d.r.y + d.r.h - minH); r.x = nL; r.y = nT; r.w = d.r.x + d.r.w - nL; r.h = d.r.y + d.r.h - nT; }
            else if (d.mode === "tr") { var nR = clamp(px, d.r.x + minW, iw), nT2 = clamp(py, 0, d.r.y + d.r.h - minH); r.y = nT2; r.w = nR - d.r.x; r.h = d.r.y + d.r.h - nT2; }
            else if (d.mode === "bl") { var nL2 = clamp(px, 0, d.r.x + d.r.w - minW), nB = clamp(py, d.r.y + minH, ih); r.x = nL2; r.w = d.r.x + d.r.w - nL2; r.h = nB - d.r.y; }
            else if (d.mode === "br") { var nR2 = clamp(px, d.r.x + minW, iw), nB2 = clamp(py, d.r.y + minH, ih); r.w = nR2 - d.r.x; r.h = nB2 - d.r.y; }
            ui.cv.invalidate();
        } else if (action == MotionEvent.ACTION_UP) cropState.drag = null;
    } catch (e) {} return true;
});

function detectLandscape() {
    if (CONFIG.landscape === true || CONFIG.landscape === false) return CONFIG.landscape;
    try {
        var dm = context.getResources().getDisplayMetrics();
        return dm.widthPixels >= dm.heightPixels;
    } catch (e) { return true; }
}

function ensureScreenCapture() {
    if (screenCaptureReady) return true;
    for (var i = 0; i < 3; i++) {
        try {
            if (requestScreenCapture(detectLandscape())) { screenCaptureReady = true; return true; }
        } catch (e) {}
        sleep(400);
    }
    return false;
}

function checkPermissions() {
    if (auto.service == null) {
        toast("请先开启本应用的无障碍服务，否则无法点击");
        try { app.startActivity({ action: "android.settings.ACCESSIBILITY_SETTINGS" }); } catch (e) {}
        return false;
    }
    if (!floaty.checkPermission()) {
        toast("请先授予悬浮窗权限");
        try { app.startActivity({ action: "android.settings.action.MANAGE_OVERLAY_PERMISSION", data: "package:" + context.getPackageName() }); } catch (e) {}
        return false;
    }
    return true;
}

var pendingPicks = {};
var pickSeq = 1000;
var lastTempFile = null;

ui.emitter.on("activity_result", function (req, res, data) {
    var cb = pendingPicks[req];
    if (cb == null) return;
    delete pendingPicks[req];
    if (res !== Activity.RESULT_OK || data == null) { cb(null); return; }
    threads.start(function () { var path = uriToLocalPath(data.getData()); ui.run(function () { cb(path); }); });
});

function pickImage(callback) {
    pickSeq++;
    pendingPicks[pickSeq] = callback;
    ui.run(function () { activity.startActivityForResult(new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI), pickSeq); });
}

function uriToLocalPath(uri) {
    var path = null;
    try {
        var cursor = context.getContentResolver().query(uri, ["_data"], null, null, null);
        if (cursor != null) { if (cursor.moveToFirst()) { var idx = cursor.getColumnIndex("_data"); if (idx >= 0) path = cursor.getString(idx); } cursor.close(); }
    } catch (e) { }
    if (path == null || !files.exists(path)) {
        try {
            files.ensureDir(CONFIG.workDir); path = files.join(CONFIG.workDir, "tmp_" + Date.now() + ".png");
            var is = context.getContentResolver().openInputStream(uri); files.writeBytes(path, inputStreamToBytes(is));
            lastTempFile = path;
        } catch (e) { return null; }
    }
    return path;
}

function cleanTmpFiles() {
    try {
        if (!files.exists(CONFIG.workDir)) return;
        var names = files.listDir(CONFIG.workDir, function (n) { return /tmp_.*\.png$/.test(n); });
        for (var i = 0; i < names.length; i++) {
            var full = ("" + names[i]).indexOf("/") >= 0 ? names[i] : files.join(CONFIG.workDir, names[i]);
            try { files.remove(full); } catch (e) {}
        }
    } catch (e) {}
}

function loadCropImage(path) {
    try {
        var img = images.read(path);
        if (img == null) { toast("图片读取失败，请换一张截图"); return null; }
        return img;
    } catch (e) {
        toast("图片读取失败：" + e);
        return null;
    }
}

function warnImageMismatch(img) {
    try {
        var dm = context.getResources().getDisplayMetrics();
        var sw = dm.widthPixels, sh = dm.heightPixels;
        var iw = img.getWidth(), ih = img.getHeight();
        if ((iw > ih) !== (sw > sh)) { toast("提示：该截图方向与当前屏幕不一致，坐标可能偏移"); return; }
        var kx = sw / iw, ky = sh / ih;
        if (Math.abs(kx - ky) / kx > 0.03) toast("提示：该截图疑似裁剪过，坐标可能偏移，建议用整屏截图");
    } catch (e) {}
}

function inputStreamToBytes(is) { var baos = new ByteArrayOutputStream(), buf = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 4096), n; while ((n = is.read(buf)) !== -1) { baos.write(buf, 0, n); } is.close(); return baos.toByteArray(); }
function doClick(x, y) { try { click(x, y); } catch (e) { gesture(80, [x, y]); } }

var SENS_PRESETS = {
    low:  { satMin: 0.45, valMin: 75, minChroma: 70, hueTol: 14, cohMin: 0.34, minSpanRatio: 0.18, minHits: 10,
            dropRatio: 0.18, backRatio: 0.55, dropMs: 300, backMs: 320, calMs: 900, calMsShort: 420, bufMax: 3 },
    mid:  { satMin: 0.36, valMin: 62, minChroma: 55, hueTol: 20, cohMin: 0.26, minSpanRatio: 0.14, minHits: 7,
            dropRatio: 0.24, backRatio: 0.60, dropMs: 220, backMs: 260, calMs: 800, calMsShort: 360, bufMax: 3 },
    high: { satMin: 0.28, valMin: 50, minChroma: 42, hueTol: 22, cohMin: 0.18, minSpanRatio: 0.10, minHits: 5,
            dropRatio: 0.34, backRatio: 0.65, dropMs: 150, backMs: 200, calMs: 700, calMsShort: 320, bufMax: 3 }
};

function getDetectOpts(level) { return SENS_PRESETS[level] || SENS_PRESETS.mid; }
function sensName(level) { return level === "low" ? "低" : (level === "high" ? "高" : "中"); }

function redWeightRGB(r, g, b, o) {
    var mx = (r >= g) ? ((r >= b) ? r : b) : ((g >= b) ? g : b);
    if (r < mx) return 0;
    if (mx < o.valMin) return 0;
    var mn = (r <= g) ? ((r <= b) ? r : b) : ((g <= b) ? g : b);
    var chroma = mx - mn;
    if (chroma < o.minChroma) return 0;
    var sat = chroma / mx;
    if (sat < o.satMin) return 0;
    var dev = 60 * (g - b) / chroma;
    if (dev > o.hueTol) return 0;
    if (dev < -o.hueTol) return 0;
    return sat;
}

function redPixelWeight(c, o) {
    return redWeightRGB((c >> 16) & 0xff, (c >> 8) & 0xff, c & 0xff, o);
}

function analyzeRedRegion(px, rw, rh, o, cache, mask) {
    var cols = (cache && cache.cols && cache.cols.length >= rw) ? cache.cols : new Array(rw);
    var i;
    for (i = 0; i < rw; i++) cols[i] = 0;

    var score = 0, hits = 0, rowSpan = 0, lumaSum = 0, lumaN = 0;
    var hasMask = (mask != null);
    var mx0 = hasMask ? mask.x0 : 0, mx1 = hasMask ? mask.x1 : -1;
    var my0 = hasMask ? mask.y0 : 0, my1 = hasMask ? mask.y1 : -1;

    for (var y = 0; y < rh; y++) {
        var rowOff = y * rw, rowUsed = 0;
        var inMaskRow = hasMask && (y >= my0) && (y <= my1);
        for (var x = 0; x < rw; x++) {
            if (inMaskRow && x >= mx0 && x <= mx1) continue;
            var c = px[rowOff + x];
            var r = (c >> 16) & 0xff, g = (c >> 8) & 0xff, b = c & 0xff;
            lumaSum += (r + r + r + g + g + g + b + b) >> 3;
            lumaN++;
            var w = redWeightRGB(r, g, b, o);
            if (w > 0) { score += w; hits++; cols[x]++; rowUsed++; }
        }
        if (rowUsed > 0) rowSpan++;
    }

    var maxCol = 0, bestPair = 0;
    for (i = 0; i < rw; i++) {
        if (cols[i] > maxCol) maxCol = cols[i];
        var pair = cols[i] + ((i + 1 < rw) ? cols[i + 1] : 0);
        if (pair > bestPair) bestPair = pair;
    }
    return {
        score: score, hits: hits, maxCol: maxCol, rowSpan: rowSpan,
        coherence: hits > 0 ? bestPair / hits : 0, rw: rw, rh: rh,
        mean: lumaN > 0 ? lumaSum / lumaN : 0, pixels: lumaN
    };
}

function lineScoreOf(res, o) {
    if (!res) return 0;
    if (res.hits < o.minHits) return 0;
    if (res.rowSpan < Math.max(3, Math.round(res.rh * o.minSpanRatio))) return 0;
    if (res.coherence < o.cohMin) return 0;
    return res.score;
}

function medianOf(arr) {
    var n = arr.length; if (n === 0) return 0;
    var t = arr.slice(0), i, j, v;
    for (i = 1; i < n; i++) { v = t[i]; j = i - 1; while (j >= 0 && t[j] > v) { t[j + 1] = t[j]; j--; } t[j + 1] = v; }
    return (n % 2) ? t[(n - 1) / 2] : (t[n / 2 - 1] + t[n / 2]) / 2;
}

function percentile(arr, q) {
    var n = arr.length; if (n === 0) return 0;
    var t = arr.slice(0), i, j, v;
    for (i = 1; i < n; i++) { v = t[i]; j = i - 1; while (j >= 0 && t[j] > v) { t[j + 1] = t[j]; j--; } t[j + 1] = v; }
    var k = Math.round(q * (n - 1));
    if (k < 0) k = 0; if (k > n - 1) k = n - 1;
    return t[k];
}

function createDetector(o, regionH) {
    return {
        opts: o, buf: [], base: 0, stage: "CAL", calStart: 0, calMs: o.calMs,
        calSamples: [], markKind: "", markMs: 0, lastRaw: 0, lastScore: 0, latch: false, backLatch: false,
        minBase: Math.max(4, Math.round((regionH || 40) * 0.05))
    };
}

function detectorStartCal(det, now, ms) {
    det.stage = "CAL";
    det.calStart = now;
    det.calMs = ms || det.opts.calMs;
    det.calSamples = [];
    det.buf = [];
    det.markKind = "";
    det.markMs = 0;
    det.latch = false;
    det.backLatch = false;
}

function detectorStep(det, rawScore, now, phase) {
    var o = det.opts;
    det.lastRaw = rawScore;
    det.buf.push(rawScore);
    while (det.buf.length > o.bufMax) det.buf.shift();
    var s = medianOf(det.buf);
    det.lastScore = s;

    if (det.stage === "CAL") {
        if (det.calStart === 0) det.calStart = now;
        if (s > 0) det.calSamples.push(s);
        if (now - det.calStart < det.calMs) return { action: "calibrating", score: s, base: 0, ratio: 0 };
        if (det.calSamples.length < 2) return { action: "cal_failed", score: s, base: 0, ratio: 0, reason: "no_line" };
        var b = percentile(det.calSamples, 0.75);
        if (b < det.minBase) return { action: "cal_failed", score: s, base: b, ratio: 0, reason: "weak_line" };
        det.base = b;
        det.stage = "ARMED";
        return { action: "cal_done", score: s, base: b, ratio: 1 };
    }

    var ratio = det.base > 0 ? s / det.base : 0;

    if (phase === "BITE") {
        if (det.latch) {
            if (s >= det.base * o.backRatio) det.latch = false;
            return { action: "none", score: s, base: det.base, ratio: ratio };
        }
        if (s < det.base * o.dropRatio) {
            if (det.markKind !== "gone") { det.markKind = "gone"; det.markMs = now; }
            else if (now - det.markMs >= o.dropMs) {
                det.markKind = ""; det.markMs = 0; det.latch = true;
                return { action: "bite", score: s, base: det.base, ratio: ratio };
            }
        } else {
            det.markKind = ""; det.markMs = 0;
            if (s >= det.base * o.backRatio) det.base = det.base * 0.9 + s * 0.1;
        }
    } else {
        if (det.backLatch) {
            if (s < det.base * o.dropRatio) det.backLatch = false;
            return { action: "none", score: s, base: det.base, ratio: ratio };
        }
        if (s >= det.base * o.backRatio) {
            if (det.markKind !== "back") { det.markKind = "back"; det.markMs = now; }
            else if (now - det.markMs >= o.backMs) {
                det.markKind = ""; det.markMs = 0; det.backLatch = true;
                return { action: "line_back", score: s, base: det.base, ratio: ratio };
            }
        } else { det.markKind = ""; det.markMs = 0; }
    }
    return { action: "none", score: s, base: det.base, ratio: ratio };
}

var detectOpts = getDetectOpts(storage.get("sensLevel", "mid"));

var pixStore = { buf: null, len: 0, cols: null };

function grabLineStats(screen, region, mask) {
    var bmp = screen.getBitmap(); if (bmp == null) return null;
    var bw = bmp.getWidth(), bh = bmp.getHeight();
    var rx = Math.max(0, Math.min(region[0] | 0, bw - 1));
    var ry = Math.max(0, Math.min(region[1] | 0, bh - 1));
    var rw = Math.max(1, Math.min(region[2] | 0, bw - rx));
    var rh = Math.max(1, Math.min(region[3] | 0, bh - ry));
    var n = rw * rh;
    if (pixStore.buf == null || pixStore.len < n) {
        pixStore.buf = java.lang.reflect.Array.newInstance(java.lang.Integer.TYPE, n);
        pixStore.len = n;
    }
    bmp.getPixels(pixStore.buf, 0, rw, rx, ry, rw, rh);
    if (pixStore.cols == null || pixStore.cols.length < rw) pixStore.cols = new Array(rw);
    var out = analyzeRedRegion(pixStore.buf, rw, rh, detectOpts, pixStore, mask);
    var sig = 0, n2 = rw * rh;
    for (var k = 0; k < 32; k++) sig = (sig * 31 + pixStore.buf[((k * 977) % n2) | 0]) | 0;
    out.sig = sig;
    return out;
}

function computeScale(srcKey) {
    try {
        var raw = storage.get(srcKey);
        if (raw == null) return null;
        var a = JSON.parse(raw), iw = a[0], ih = a[1];
        if (!(iw > 0 && ih > 0)) return null;
        var dm = context.getResources().getDisplayMetrics();
        var sw = dm.widthPixels, sh = dm.heightPixels;
        if (iw === sw && ih === sh) return null;
        if ((iw > ih) !== (sw > sh)) return null;
        var kx = sw / iw, ky = sh / ih;
        if (Math.abs(kx - ky) / kx > 0.02) return null;
        return { kx: kx, ky: ky };
    } catch (e) {}
    return null;
}

function scaleNoteOf(srcKey) {
    var sc = computeScale(srcKey);
    return sc ? ("按原图等比映射 x" + sc.kx.toFixed(3)) : "按原始像素（未缩放）";
}

function mapRegionToScreen(region, srcKey) {
    var sc = computeScale(srcKey);
    if (sc) region = [Math.round(region[0] * sc.kx), Math.round(region[1] * sc.ky), Math.round(region[2] * sc.kx), Math.round(region[3] * sc.ky)];
    var dm = context.getResources().getDisplayMetrics();
    var sw = dm.widthPixels, sh = dm.heightPixels;
    var x = Math.max(0, Math.min(region[0], sw - 8));
    var y = Math.max(0, Math.min(region[1], sh - 8));
    var w = Math.max(8, Math.min(region[2], sw - x));
    var h = Math.max(8, Math.min(region[3], sh - y));
    return [x, y, w, h];
}

function mapPointToScreen(x, y, srcKey) {
    var sc = computeScale(srcKey);
    if (!sc) return [x, y];
    return [Math.round(x * sc.kx), Math.round(y * sc.ky)];
}

function doClickKey(x, y, srcKey) {
    var pt = mapPointToScreen(x, y, srcKey);
    doClick(pt[0], pt[1]);
}

function rectOverlapRatio(fr, region) {
    if (!fr) return 0;
    var x1 = Math.max(fr[0], region[0]), y1 = Math.max(fr[1], region[1]);
    var x2 = Math.min(fr[0] + fr[2], region[0] + region[2]), y2 = Math.min(fr[1] + fr[3], region[1] + region[3]);
    if (x2 <= x1 || y2 <= y1) return 0;
    return ((x2 - x1) * (y2 - y1)) / Math.max(1, region[2] * region[3]);
}

function localMask(fr, region) {
    if (!fr) return null;
    var x0 = Math.max(0, fr[0] - region[0]), y0 = Math.max(0, fr[1] - region[1]);
    var x1 = Math.min(region[2] - 1, fr[0] + fr[2] - region[0] - 1);
    var y1 = Math.min(region[3] - 1, fr[1] + fr[3] - region[1] - 1);
    if (x1 < x0 || y1 < y0) return null;
    return { x0: x0, y0: y0, x1: x1, y1: y1 };
}

function sleepAlive(ms) {
    var t = 0;
    while (t < ms && serviceAlive) {
        var d = Math.min(200, ms - t);
        sleep(d); t += d;
    }
    return serviceAlive;
}

function startSystem() {
    var fx = storage.get("fishX"), fy = storage.get("fishY"), mx = storage.get("magX"), my = storage.get("magY"), rawReg = storage.get("lineRegion");
    if (fx == null || mx == null || rawReg == null) { toast("请先完成前面的配置"); return; }
    if (!checkPermissions()) return;
    if (!ensureScreenCapture()) { toast("屏幕截取权限获取失败"); return; }

    var region = mapRegionToScreen(JSON.parse(rawReg), "lineRegionSrc");
    ui.run(function () {
        home();
        serviceAlive = true; isListening = false;
        launchFloatAndLoop(fx, fy, mx, my, region);
    });
}

function launchFloatAndLoop(fx, fy, mx, my, region) {
    var isDark = isDarkMode();
    var c = isDark ? THEME.dark : THEME.light;

    var floatWin = floaty.window(
        <frame id="floatRoot" w="wrap_content" h="wrap_content">
            <card id="floatBg" w="wrap_content" h="wrap_content" cardCornerRadius="20dp" cardElevation="4dp" alpha="1.0">

                <horizontal id="viewExpanded" padding="10" w="wrap_content" gravity="center_vertical">
                    <vertical w="wrap_content">
                        <card id="btnToggle" w="110dp" h="40dp" cardCornerRadius="14dp" cardElevation="0dp" foreground="?selectableItemBackground">
                            <text id="txtToggle" text="开启检测" textSize="14sp" textStyle="bold" gravity="center" w="*" h="*" />
                        </card>
                        <card id="statusIndicator" w="110dp" h="36dp" marginTop="8" cardCornerRadius="12dp" cardElevation="0dp">
                            <text id="txtStatus" text="已暂停" textSize="13sp" textStyle="bold" gravity="center" w="*" h="*" />
                        </card>
                        <card id="btnStop" w="110dp" h="36dp" marginTop="8" cardCornerRadius="12dp" cardElevation="0dp" foreground="?selectableItemBackground">
                            <text id="txtStop" text="彻底退出" textSize="13sp" textStyle="bold" gravity="center" w="*" h="*" />
                        </card>
                    </vertical>
                    <card id="btnCollapse" w="28dp" h="128dp" marginLeft="8" cardCornerRadius="14dp" cardElevation="0dp" foreground="?selectableItemBackground">
                        <text id="txtCollapse" text="◀" textSize="14sp" textStyle="bold" gravity="center" w="*" h="*" />
                    </card>
                </horizontal>

                <horizontal id="viewCollapsed" padding="10" w="wrap_content" visibility="gone" gravity="center_vertical">
                    <card id="btnCollapsedMain" w="110dp" h="44dp" cardCornerRadius="14dp" cardElevation="0dp" foreground="?selectableItemBackground">
                        <text id="txtCollapsedMain" text="开启" textSize="14sp" textStyle="bold" gravity="center" w="*" h="*" />
                    </card>
                    <card id="btnExpand" w="36dp" h="44dp" marginLeft="8" cardCornerRadius="14dp" cardElevation="0dp" foreground="?selectableItemBackground">
                        <text id="txtExpand" text="▶" textSize="14sp" textStyle="bold" gravity="center" w="*" h="*" />
                    </card>
                </horizontal>

            </card>
        </frame>
    );

    ui.run(function(){
        var lt = new LayoutTransition();
        lt.enableTransitionType(LayoutTransition.CHANGING);
        floatWin.floatBg.setLayoutTransition(lt);

        floatWin.floatBg.setCardBackgroundColor(Color.parseColor(c.floatBg));
        floatWin.btnToggle.setCardBackgroundColor(Color.parseColor(c.primary));
        floatWin.txtToggle.setTextColor(Color.parseColor(c.onPrimary));
        floatWin.statusIndicator.setCardBackgroundColor(Color.parseColor(c.surfaceVariant));
        floatWin.txtStatus.setTextColor(Color.parseColor(c.onSurfaceVariant));
        floatWin.btnStop.setCardBackgroundColor(Color.parseColor(c.error));
        floatWin.txtStop.setTextColor(Color.parseColor(c.onError));
        floatWin.btnCollapse.setCardBackgroundColor(Color.parseColor(c.primaryContainer));
        floatWin.txtCollapse.setTextColor(Color.parseColor(c.onPrimaryContainer));
        floatWin.btnExpand.setCardBackgroundColor(Color.parseColor(c.primaryContainer));
        floatWin.txtExpand.setTextColor(Color.parseColor(c.onPrimaryContainer));
        floatWin.btnCollapsedMain.setCardBackgroundColor(Color.parseColor(c.primary));
        floatWin.txtCollapsedMain.setTextColor(Color.parseColor(c.onPrimary));
    });

    var floatPos = { x: 30, y: 400, w: 0, h: 0 };
    setTimeout(function() {
        try { floatWin.setPosition(floatPos.x, floatPos.y); } catch(e) {}
    }, 300);
    setTimeout(function() {
        ui.run(function() {
            try {
                var fw = floatWin.floatRoot.getWidth(), fh = floatWin.floatRoot.getHeight();
                if (fw > 0 && fh > 0) { floatPos.w = fw; floatPos.h = fh; }
            } catch(e) {}
        });
    }, 800);

    var det = createDetector(detectOpts, region[3]);
    var lineSince = Date.now();
    var recastTries = 0;
    var lastStatMs = 0;
    var logLines = [];
    var logWritten = 0;
    var offGameCount = 0;
    var guardBlocked = false;
    var fgPkg = null;

    function floatRect() {
        if (!floatPos.w || !floatPos.h) return null;
        return [floatPos.x, floatPos.y, floatPos.w, floatPos.h];
    }

    function dlog(msg) {
        if (!isDebugOn()) return;
        try {
            var d = new Date();
            function p2(n) { return n < 10 ? "0" + n : "" + n; }
            logLines.push("[" + p2(d.getHours()) + ":" + p2(d.getMinutes()) + ":" + p2(d.getSeconds()) + "] " + msg);
            if (logLines.length > 1500) {
                logLines.splice(0, 400);
                logWritten -= 400;
                if (logWritten < 0) logWritten = 0;
            }
        } catch (e) {}
    }

    function flushLog(force) {
        if (!force && !isDebugOn()) return;
        if (logLines.length === 0) return;
        var f = files.join(CONFIG.workDir, "detect_log.txt");
        try {
            files.ensureDir(CONFIG.workDir);
            if (logWritten === 0) files.write(f, "");
            var pending = logLines.slice(logWritten);
            if (pending.length === 0) return;
            files.append(f, pending.join("\n") + "\n");
            logWritten = logLines.length;
        } catch (e) {
            try { files.write(f, logLines.join("\n") + "\n"); logWritten = logLines.length; } catch (e2) {}
        }
    }
    logFlushHook = function () { flushLog(true); };

    var state = "WAIT_BITE";
    var alphaTimer = null;

    function wakeUpFloat() {
        ui.run(function(){ floatWin.floatBg.setAlpha(1.0); });
        if(alphaTimer) clearTimeout(alphaTimer);
        alphaTimer = setTimeout(function(){
            ui.run(function(){ floatWin.floatBg.setAlpha(0.4); });
        }, 3000);
    }
    wakeUpFloat();

    var wx = 0, wy = 0, tx = 0, ty = 0;
    floatWin.floatRoot.setOnTouchListener(function(view, event) {
        wakeUpFloat();
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                wx = event.getRawX();
                wy = event.getRawY();
                tx = floatWin.getX();
                ty = floatWin.getY();
                return true;
            case MotionEvent.ACTION_MOVE:
                var nx = tx + (event.getRawX() - wx), ny = ty + (event.getRawY() - wy);
                floatPos.x = nx; floatPos.y = ny;
                floatWin.setPosition(nx, ny);
                return true;
        }
        return true;
    });

    function updateStatus(text, bgKey, fgKey) {
        if (!isListening) return;
        var c = isDarkMode() ? THEME.dark : THEME.light;
        var bg = (bgKey && c[bgKey]) ? c[bgKey] : null;
        var fg = (fgKey && c[fgKey]) ? c[fgKey] : null;
        ui.run(function() {
            floatWin.txtStatus.setText(text);
            if (bg) floatWin.statusIndicator.setCardBackgroundColor(Color.parseColor(bg));
            if (fg) floatWin.txtStatus.setTextColor(Color.parseColor(fg));

            floatWin.txtCollapsedMain.setText(text);
            if (bg) floatWin.btnCollapsedMain.setCardBackgroundColor(Color.parseColor(bg));
            if (fg) floatWin.txtCollapsedMain.setTextColor(Color.parseColor(fg));
        });
    }

    function toggleListen() {
        var curIsDark = isDarkMode();
        var clr = curIsDark ? THEME.dark : THEME.light;

        if (isListening) {
            isListening = false;
            ui.run(function(){
                floatWin.txtToggle.setText("开启检测");
                floatWin.btnToggle.setCardBackgroundColor(Color.parseColor(clr.primary));
                floatWin.txtToggle.setTextColor(Color.parseColor(clr.onPrimary));

                floatWin.txtStatus.setText("已暂停");
                floatWin.statusIndicator.setCardBackgroundColor(Color.parseColor(clr.surfaceVariant));
                floatWin.txtStatus.setTextColor(Color.parseColor(clr.onSurfaceVariant));

                floatWin.txtCollapsedMain.setText("开启");
                floatWin.btnCollapsedMain.setCardBackgroundColor(Color.parseColor(clr.primary));
                floatWin.txtCollapsedMain.setTextColor(Color.parseColor(clr.onPrimary));
            });
            toast("检测已暂停");
        } else {
            isListening = true;
            detectorStartCal(det, Date.now());
            recastTries = 0;
            lineSince = Date.now();
            state = "WAIT_BITE";
            offGameCount = 0;
            guardBlocked = false;
            targetPkg = detectTargetPkg();
            ui.run(function(){
                floatWin.txtToggle.setText("暂停检测");
                floatWin.btnToggle.setCardBackgroundColor(Color.parseColor(clr.alert));
                floatWin.txtToggle.setTextColor(Color.parseColor(clr.onAlert));
            });
            updateStatus("检测红线...", "warning", "onWarning");
            toast("开始检测红线...");
        }
    }

    floatWin.btnToggle.click(function () {
        wakeUpFloat();
        toggleListen();
    });

    floatWin.btnCollapsedMain.click(function () {
        wakeUpFloat();
        if (!isListening) {
            toggleListen();
        }
    });

    floatWin.btnCollapse.click(function() {
        wakeUpFloat();
        ui.run(function() {
            floatWin.viewExpanded.setVisibility(View.GONE);
            floatWin.viewCollapsed.setVisibility(View.VISIBLE);
        });
    });

    floatWin.btnExpand.click(function() {
        wakeUpFloat();
        ui.run(function() {
            floatWin.viewCollapsed.setVisibility(View.GONE);
            floatWin.viewExpanded.setVisibility(View.VISIBLE);
        });
    });

    floatWin.btnStop.click(function () {
        serviceAlive = false; isListening = false;
        floatWin.close(); toast("脚本已退出");
    });

    function applyConfigTick(now) {
        try {
            var rawReg = storage.get("lineRegion");
            if (rawReg != null) {
                var nr = mapRegionToScreen(JSON.parse(rawReg), "lineRegionSrc");
                if (nr.join(",") !== region.join(",")) {
                    region = nr;
                    lineSince = now;
                    detectorStartCal(det, now);
                    dlog("区域热更新 -> [" + region.join(",") + "]");
                }
            }
            var nfx = storage.get("fishX"), nfy = storage.get("fishY"), nmx = storage.get("magX"), nmy = storage.get("magY");
            if (nfx != null) { fx = nfx; fy = nfy; mx = nmx; my = nmy; }

            var pkg = null;
            try { pkg = currentPackage(); } catch (e) {}
            if (pkg) {
                fgPkg = pkg;
                if (targetPkg == null) targetPkg = detectTargetPkg();
                if (targetPkg != null) {
                    if (pkg !== targetPkg) offGameCount++; else offGameCount = 0;
                    var wasBlocked = guardBlocked;
                    guardBlocked = (offGameCount >= CONFIG.offGameFrames);
                    if (!wasBlocked && guardBlocked) dlog("已切出目标应用(" + pkg + " 应为 " + targetPkg + ")，暂停检测与点击");
                    if (wasBlocked && !guardBlocked) {
                        state = "WAIT_BITE";
                        lineSince = now;
                        recastTries = 0;
                        detectorStartCal(det, now);
                        dlog("回到目标应用，重新标定");
                    }
                }
            }
        } catch (e) {}
    }

    threads.start(function () {
        var dm0 = context.getResources().getDisplayMetrics();
        dlog("=== 识别引擎 v2 启动 ===");
        dlog("屏幕 " + dm0.widthPixels + "x" + dm0.heightPixels + " 区域[" + region.join(",") + "] 灵敏度 " + sensName(storage.get("sensLevel", "mid")) +
             " | 区域" + scaleNoteOf("lineRegionSrc") + " | 按键" + scaleNoteOf("fishSrc"));
        if (isDebugOn()) flushLog(true);

        var lastFlush = 0;
        var lastCfgMs = 0;
        var lastGuardMs = 0;
        var blackCount = 0;
        var nullCount = 0;
        var lastSig = 0;
        var staticCount = 0;

        while (serviceAlive) {
            try {
                if (!isListening) { sleep(80); continue; }

                var now = Date.now();

                if (now - lastCfgMs >= CONFIG.guardTickMs) {
                    lastCfgMs = now;
                    applyConfigTick(now);
                }

                if (guardBlocked) {
                    if (now - lastGuardMs > 800) {
                        lastGuardMs = now;
                        updateStatus("已切出游戏，暂停", "solid", "onSolid");
                    }
                    sleep(400);
                    continue;
                }

                if (det.opts !== detectOpts) {
                    det.opts = detectOpts;
                    detectorStartCal(det, Date.now());
                    dlog("灵敏度热切换 -> " + sensName(storage.get("sensLevel", "mid")));
                }

                var fr = floatRect();
                var ov = rectOverlapRatio(fr, region);
                if (ov > CONFIG.floatGuard) {
                    if (now - lastGuardMs > 500) {
                        lastGuardMs = now;
                        updateStatus("悬浮窗遮住红线区\n请拖开", "alert", "onAlert");
                    }
                    sleep(250);
                    continue;
                }

                var screen = captureScreen();
                if (screen == null) {
                    nullCount++;
                    if (nullCount >= CONFIG.nullFrames) {
                        nullCount = 0;
                        screenCaptureReady = false;
                        dlog("连续 " + CONFIG.nullFrames + " 帧截图失败，自动暂停");
                        toast("截图失效（可能权限被回收），已暂停，请重新开启检测");
                        if (isListening) {
                            toggleListen();
                            ui.run(function(){ floatWin.txtStatus.setText("截图失效"); });
                        }
                    }
                    sleep(CONFIG.pollMs);
                    continue;
                }
                nullCount = 0;

                var res = grabLineStats(screen, region, (ov > 0.02) ? localMask(fr, region) : null);
                screen.recycle();
                if (res == null) { sleep(CONFIG.pollMs); continue; }

                if (res.mean < 8) {
                    blackCount++;
                    if (blackCount >= CONFIG.blackFrames) {
                        blackCount = 0;
                        dlog("画面全黑 mean=" + res.mean.toFixed(1) + "，判定息屏或截图失效，自动暂停");
                        toast("画面全黑（息屏或截图失效），已暂停");
                        if (isListening) {
                            toggleListen();
                            ui.run(function(){ floatWin.txtStatus.setText("画面全黑"); });
                        }
                    }
                    sleep(CONFIG.pollMs);
                    continue;
                }
                blackCount = 0;

                if (res.sig === lastSig) staticCount++; else { staticCount = 0; lastSig = res.sig; }
                if (staticCount >= CONFIG.staticFrames) {
                    if (now - lastGuardMs > 800) {
                        lastGuardMs = now;
                        updateStatus("画面静止，暂停点击", "solid", "onSolid");
                    }
                    sleep(200);
                    continue;
                }

                det.minBase = Math.max(4, Math.round(res.rh * 0.05));
                var score = lineScoreOf(res, det.opts);
                var r = detectorStep(det, score, now, (state === "WAIT_BITE") ? "BITE" : "LINE");

                if (isDebugOn() && det.stage === "ARMED" && state === "WAIT_BITE" && now - lastStatMs > 400) {
                    lastStatMs = now;
                    updateStatus("红线判定 " + Math.round((r.ratio || 0) * 100) + "%", "warning", "onWarning");
                }

                if (r.action === "cal_done") {
                    dlog("标定完成 base=" + r.base.toFixed(1) + " (下限 " + det.minBase + ")");
                    updateStatus("检测红线...", "warning", "onWarning");

                } else if (r.action === "cal_failed") {
                    dlog("标定失败(" + r.reason + ") 分=" + r.base.toFixed(1) + " 下限=" + det.minBase +
                         " hits=" + res.hits + " coh=" + res.coherence.toFixed(2) + " span=" + res.rowSpan + "/" + res.rh +
                         " mean=" + res.mean.toFixed(1));
                    toast("未检测到红线：请确认框选区域正确、截图未裁剪、悬浮窗未遮挡");
                    if (isListening) {
                        toggleListen();
                        ui.run(function(){ floatWin.txtStatus.setText("未检测到红线"); });
                    }

                } else if (r.action === "bite") {
                    dlog("判定咬钩 score=" + r.score.toFixed(1) + " ratio=" + r.ratio.toFixed(2) + " base=" + r.base.toFixed(1));
                    updateStatus("收杆中...", "alert", "onAlert");

                    doClickKey(fx, fy, "fishSrc");

                    var waitDelay = storage.get("fishDelay", 10000);
                    if (!sleepAlive(waitDelay)) break;

                    doClickKey(fx, fy, "fishSrc");
                    if (!sleepAlive(1000)) break;
                    doClickKey(mx, my, "magSrc");
                    if (!sleepAlive(1000)) break;

                    state = "WAIT_LINE";
                    lineSince = Date.now();
                    det.buf = []; det.markKind = ""; det.markMs = 0;
                    updateStatus("等待刷新", "solid", "onSolid");

                } else if (r.action === "line_back") {
                    dlog("红线回归 score=" + r.score.toFixed(1) + " ratio=" + r.ratio.toFixed(2));
                    state = "WAIT_BITE";
                    recastTries = 0;
                    detectorStartCal(det, Date.now(), det.opts.calMsShort);
                    updateStatus("标定中...", "solid", "onSolid");

                } else if (state === "WAIT_LINE" && now - lineSince > CONFIG.waitLineMs) {
                    recastTries++;
                    dlog("WAIT_LINE 超时，重抛第 " + recastTries + " 次");
                    if (recastTries > CONFIG.maxRecast) {
                        toast("连续 " + CONFIG.maxRecast + " 次未出现红线，已自动暂停");
                        if (isListening) {
                            toggleListen();
                            ui.run(function(){ floatWin.txtStatus.setText("红线未出现"); });
                        }
                    } else {
                        updateStatus("未出现红线，重抛...", "warning", "onWarning");
                        doClickKey(fx, fy, "fishSrc");
                        lineSince = Date.now();
                    }
                }

                if (now - lastFlush > 3000) {
                    lastFlush = now;
                    dlog("state=" + state + " stage=" + det.stage + " raw=" + score.toFixed(1) + " med=" + det.lastScore.toFixed(1) +
                         " base=" + det.base.toFixed(1) + " ratio=" + (det.base > 0 ? (det.lastScore / det.base).toFixed(2) : "-") +
                         " hits=" + res.hits + " coh=" + res.coherence.toFixed(2) + " span=" + res.rowSpan + "/" + res.rh +
                         " mean=" + res.mean.toFixed(1));
                    flushLog();
                }
            } catch (e) {
                dlog("ERR " + e);
            }
            sleep(det.markKind === "gone" ? CONFIG.pollFastMs : CONFIG.pollMs);
        }
        flushLog();
    });
}

cleanTmpFiles();

events.on("exit", function () { serviceAlive = false; isListening = false; });